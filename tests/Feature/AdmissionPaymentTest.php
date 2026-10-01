<?php

namespace Tests\Feature;

use App\Enums\Jenjang;
use App\Enums\PaymentStatus;
use App\Enums\StatusPendaftaran;
use App\Models\AdmissionSetting;
use App\Models\Payment;
use App\Models\RegistrationPeriod;
use App\Models\User;
use App\Services\Admission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Concerns\AdmissionStudents;
use Tests\TestCase;

class AdmissionPaymentTest extends TestCase
{
    use AdmissionStudents, RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('local');
        $this->travelTo(Carbon::parse('2027-03-15 10:00'));
        $this->admin = User::factory()->admin()->create();
        AdmissionSetting::for(Jenjang::MA)->fill([
            'fee' => 250000,
            'bank_name' => 'Bank Syariah Indonesia',
            'account_number' => '7146444673',
            'account_name' => 'MA Al-Hikmah',
        ])->save();
    }

    private function submit(array $data = [])
    {
        return $this->post('/pengajuan', $data + [
            'jenjang' => 'ma',
            'name' => 'Siti Aminah',
            'no_hp' => '081234567890',
            'email' => 'siti@example.com',
            'sender_name' => 'Ahmad Fauzi',
            'proof' => UploadedFile::fake()->image('bukti.jpg'),
        ]);
    }

    private function applicant(): Payment
    {
        $this->submit();

        return Payment::whereNull('user_id')->latest('id')->firstOrFail();
    }

    public function test_register_page_shows_the_fee_and_bank_account(): void
    {
        $this->get('/register?jenjang=ma')->assertInertia(fn (Assert $page) => $page
            ->where('pendaftaran.jenjang.ma.fee_label', 'Rp 250.000')
            ->where('pendaftaran.jenjang.mts.fee_label', null)
            ->where('pendaftaran.anyFee', true)
            ->where('rekening.ma.nomor', '7146444673'));
    }

    public function test_applicant_sends_a_proof_without_an_account(): void
    {
        $this->submit()->assertRedirect();

        $payment = Payment::firstOrFail();
        $this->assertNull($payment->user_id);
        $this->assertSame(PaymentStatus::Menunggu, $payment->status);
        $this->assertSame(Jenjang::MA, $payment->jenjang);
        $this->assertSame('Siti Aminah', $payment->applicant_name);
        $this->assertSame(250000, $payment->amount);
        $this->assertMatchesRegularExpression('/^[A-Z2-9]{10}$/', $payment->code);
        Storage::disk('local')->assertExists($payment->proof_path);
        $this->assertGuest();
        $this->assertSame(1, User::count());

        $this->get("/pengajuan/{$payment->code}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Auth/Pengajuan')
                ->where('pengajuan.code', $payment->codeLabel())
                ->where('pengajuan.status', 'menunggu')
                ->where('pengajuan.account', null)
                ->where('pengajuan.canUpload', true));

        $this->get('/pengajuan/TIDAKADA00')->assertNotFound();
    }

    public function test_applicant_finds_their_submission_by_code(): void
    {
        $payment = $this->applicant();

        $this->post('/cek-pendaftaran', ['code' => strtolower($payment->codeLabel())])
            ->assertRedirect("/pengajuan/{$payment->code}");
        $this->post('/cek-pendaftaran', ['code' => 'ABCDE-FGHJK'])->assertSessionHasErrors('code');
    }

    public function test_self_registration_is_closed_for_a_jenjang_with_a_fee(): void
    {
        $this->post('/register', [
            'jenjang' => 'ma', 'name' => 'Siti', 'username' => 'siti_aminah', 'no_hp' => '0812',
            'password' => 'rahasia123', 'password_confirmation' => 'rahasia123',
        ])->assertSessionHasErrors(['jenjang' => 'Pendaftaran Madrasah Aliyah dilakukan dengan mengirim bukti pembayaran.']);
        $this->assertGuest();

        // Without a fee, students register themselves and no proof is accepted.
        $this->submit(['jenjang' => 'mts'])->assertSessionHasErrors('jenjang');
        $this->post('/register', [
            'jenjang' => 'mts', 'name' => 'Budi', 'username' => 'budi_santoso', 'no_hp' => '0812',
            'password' => 'rahasia123', 'password_confirmation' => 'rahasia123',
        ])->assertRedirect('/dashboard');
    }

    public function test_submission_needs_an_open_registration_period(): void
    {
        RegistrationPeriod::create(['name' => 'Gelombang 2', 'jenjang' => Jenjang::MA, 'opens_at' => '2027-04-01', 'closes_at' => '2027-04-30']);

        $this->submit()->assertSessionHasErrors(['jenjang' => 'Pendaftaran Madrasah Aliyah sedang ditutup.']);
        $this->assertDatabaseCount('payments', 0);
    }

    public function test_proof_must_be_an_image_or_pdf(): void
    {
        $this->submit(['proof' => UploadedFile::fake()->create('bukti.docx', 10)])->assertSessionHasErrors('proof');
        $this->assertDatabaseCount('payments', 0);
    }

    public function test_period_fee_replaces_the_jenjang_fee(): void
    {
        $period = RegistrationPeriod::create([
            'name' => 'Gelombang 1', 'jenjang' => Jenjang::MA, 'opens_at' => '2027-03-01', 'closes_at' => '2027-03-31 23:59', 'fee' => 150000,
        ]);

        $this->get('/register')->assertInertia(fn (Assert $page) => $page->where('pendaftaran.jenjang.ma.fee_label', 'Rp 150.000'));

        $payment = $this->applicant();
        $this->assertSame(150000, $payment->amount);
        $this->assertSame($period->id, $payment->registration_period_id);
    }

    public function test_accepting_creates_the_account_and_shows_the_login_until_the_first_login(): void
    {
        $payment = $this->applicant();

        $this->actingAs($this->admin)->get('/admin/pembayaran')
            ->assertInertia(fn (Assert $page) => $page
                ->has('payments.data', 1)
                ->where('payments.data.0.student', null)
                ->where('payments.data.0.applicant.name', 'Siti Aminah'));

        $response = $this->actingAs($this->admin)->post("/admin/pembayaran/{$payment->id}/terima");

        $student = User::where('name', 'Siti Aminah')->firstOrFail();
        $response->assertRedirect("/admin/siswa/{$student->id}/kartu-login");
        $password = session('loginCard')['password'];

        $this->assertSame('siti_aminah', $student->username);
        $this->assertSame(Jenjang::MA, $student->jenjang);
        $this->assertSame('081234567890', $student->no_hp);
        $this->assertSame('siti@example.com', $student->email);
        $this->assertTrue(Hash::check($password, $student->password));
        $payment->refresh();
        $this->assertSame($student->id, $payment->user_id);
        $this->assertSame(PaymentStatus::Diterima, $payment->status);

        // The login card offers a WhatsApp message to the applicant's number.
        $this->actingAs($this->admin)->get("/admin/siswa/{$student->id}/kartu-login")
            ->assertInertia(fn (Assert $page) => $page->where('whatsapp', fn (string $url) => str_starts_with($url, 'https://wa.me/6281234567890?text=')
                && str_contains(urldecode($url), "Password: {$password}")));

        // A second click does not make a second account.
        $this->actingAs($this->admin)->post("/admin/pembayaran/{$payment->id}/terima");
        $this->assertSame(1, User::where('name', 'Siti Aminah')->count());

        $this->post('/logout');
        $this->get("/pengajuan/{$payment->code}")
            ->assertInertia(fn (Assert $page) => $page
                ->where('pengajuan.status', 'diterima')
                ->where('pengajuan.account.username', 'siti_aminah')
                ->where('pengajuan.account.password', $password)
                ->where('pengajuan.canUpload', false));

        $this->post('/login', ['username' => 'siti_aminah', 'password' => $password])->assertRedirect('/dashboard');
        $this->assertTrue($this->admission()->isPaid($student->fresh()));

        $this->get("/pengajuan/{$payment->code}")
            ->assertInertia(fn (Assert $page) => $page->where('pengajuan.account.password', null));
    }

    public function test_rejected_applicant_sends_a_new_proof_from_the_status_page(): void
    {
        $payment = $this->applicant();
        $old = $payment->proof_path;

        $this->actingAs($this->admin)->post("/admin/pembayaran/{$payment->id}/tolak", ['note' => ''])->assertSessionHasErrors('note');
        $this->actingAs($this->admin)->post("/admin/pembayaran/{$payment->id}/tolak", ['note' => 'Nominal kurang Rp 50.000.'])
            ->assertSessionHas('success');
        $this->post('/logout');

        $this->get("/pengajuan/{$payment->code}")
            ->assertInertia(fn (Assert $page) => $page
                ->where('pengajuan.status', 'ditolak')
                ->where('pengajuan.note', 'Nominal kurang Rp 50.000.')
                ->where('rekening.nomor', '7146444673'));

        $this->post("/pengajuan/{$payment->code}", [
            'sender_name' => 'Ahmad Fauzi',
            'proof' => UploadedFile::fake()->image('bukti-baru.png'),
        ])->assertSessionHas('success');

        $payment->refresh();
        $this->assertSame(PaymentStatus::Menunggu, $payment->status);
        $this->assertNull($payment->note);
        $this->assertSame('bukti-baru.png', $payment->proof_name);
        Storage::disk('local')->assertMissing($old);
    }

    public function test_accepted_payment_cannot_be_replaced(): void
    {
        $payment = $this->applicant();
        $this->actingAs($this->admin)->post("/admin/pembayaran/{$payment->id}/terima");
        $this->post('/logout');

        $this->post("/pengajuan/{$payment->code}", [
            'sender_name' => 'Ahmad', 'proof' => UploadedFile::fake()->image('lain.jpg'),
        ])->assertForbidden();
    }

    public function test_logged_in_students_cannot_upload_a_proof(): void
    {
        $student = $this->completeStudent();

        $this->actingAs($student)->post('/pembayaran', ['sender_name' => 'Ahmad', 'proof' => UploadedFile::fake()->image('b.jpg')])
            ->assertStatus(405);
        $this->actingAs($student)->post('/pengajuan', [])->assertRedirect('/dashboard');
    }

    public function test_proof_is_only_visible_to_the_student_and_admins(): void
    {
        $payment = $this->applicant();

        $this->actingAs($this->admin)->get("/bukti-pembayaran/{$payment->id}")->assertOk();
        $this->actingAs(User::factory()->create())->get("/bukti-pembayaran/{$payment->id}")->assertForbidden();
    }

    public function test_unpaid_students_cannot_finalize_or_be_verified_until_payment_is_recorded(): void
    {
        $student = $this->completeStudent();

        $this->actingAs($student)->get('/dashboard')
            ->assertInertia(fn (Assert $page) => $page->where('pembayaran.status', 'belum')->where('studentNav.payment', 'belum'));
        $this->actingAs($student)->get('/pembayaran')
            ->assertInertia(fn (Assert $page) => $page->component('User/Payment')->where('rekening.nomor', '7146444673'));
        $this->actingAs($student)->post('/finalisasi')
            ->assertSessionHas('error', 'Biaya pendaftaran belum lunas. Selesaikan pembayaran di sekolah atau hubungi panitia PPDB.');

        $student->forceFill(['status' => StatusPendaftaran::MenungguVerifikasi])->save();
        $this->actingAs($this->admin)->post("/admin/siswa/{$student->id}/status", ['status' => 'terverifikasi'])
            ->assertSessionHasErrors('status');

        $this->actingAs($this->admin)->post("/admin/siswa/{$student->id}/pembayaran", ['amount' => 250000, 'method' => 'transfer', 'note' => 'Bukti ditunjukkan di sekolah'])
            ->assertSessionHas('success');
        $payment = $student->payment()->first();
        $this->assertSame(PaymentStatus::Diterima, $payment->status);
        $this->assertSame(Payment::METHOD_TRANSFER, $payment->method);

        $this->actingAs($this->admin)->post("/admin/siswa/{$student->id}/status", ['status' => 'terverifikasi'])
            ->assertSessionHas('success');
    }

    public function test_jenjang_without_fee_has_no_payment_step(): void
    {
        $student = $this->completeStudent(jenjang: Jenjang::MTs);

        $this->actingAs($student)->get('/pembayaran')->assertRedirect('/dashboard');
        $this->actingAs($student)->get('/dashboard')
            ->assertInertia(fn (Assert $page) => $page->where('pembayaran', null)->where('studentNav.payment', null));
        $this->actingAs($student)->post('/finalisasi')->assertSessionHas('success');
    }

    public function test_admin_lists_payments_waiting_for_confirmation_first(): void
    {
        $first = $this->applicant();
        $this->travel(5)->minutes();
        $this->applicant();
        $paid = $this->completeStudent();
        $this->actingAs($this->admin)->post("/admin/siswa/{$paid->id}/pembayaran", ['amount' => 250000, 'method' => 'tunai']);

        $this->actingAs($this->admin)->get('/admin/pembayaran')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Payments/Index')
                ->has('payments.data', 2)
                ->where('payments.data.0.id', $first->id)
                ->where('counts.menunggu', 2)
                ->where('counts.diterima', 1));

        $this->actingAs($this->admin)->get('/admin/pembayaran?status=semua&q='.$first->codeLabel())
            ->assertInertia(fn (Assert $page) => $page->has('payments.data', 1));
        $this->actingAs($this->admin)->get('/admin/pembayaran?status=semua&jenjang=ma')
            ->assertInertia(fn (Assert $page) => $page->has('payments.data', 3));

        $this->actingAs($this->admin)->get('/admin')
            ->assertInertia(fn (Assert $page) => $page->where('pembayaranMenunggu', 2));
    }

    private function admission(): Admission
    {
        return app(Admission::class);
    }
}
