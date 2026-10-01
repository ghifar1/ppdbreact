<?php

namespace Tests\Feature;

use App\Enums\Jenjang;
use App\Enums\PaymentStatus;
use App\Enums\StatusPendaftaran;
use App\Models\AdmissionSetting;
use App\Models\Payment;
use App\Models\RegistrationPeriod;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
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
        $this->admin = User::factory()->admin()->create();
        AdmissionSetting::for(Jenjang::MA)->fill([
            'fee' => 250000,
            'bank_name' => 'Bank Syariah Indonesia',
            'account_number' => '7146444673',
            'account_name' => 'MA Al-Hikmah',
        ])->save();
    }

    private function upload(User $student, string $file = 'bukti.jpg')
    {
        return $this->actingAs($student->fresh())->post('/pembayaran', [
            'sender_name' => 'Ahmad Fauzi',
            'proof' => UploadedFile::fake()->image($file),
        ]);
    }

    public function test_student_sees_fee_and_bank_account(): void
    {
        $student = $this->completeStudent();

        $this->actingAs($student->fresh())->get('/pembayaran')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('User/Payment')
                ->where('summary.fee_label', 'Rp 250.000')
                ->where('summary.status', 'belum')
                ->where('rekening.nomor', '7146444673')
                ->where('canUpload', true));

        $this->actingAs($student->fresh())->get('/dashboard')
            ->assertInertia(fn (Assert $page) => $page
                ->where('pembayaran.status', 'belum')
                ->where('studentNav.payment', 'belum'));
    }

    public function test_jenjang_without_fee_has_no_payment_step(): void
    {
        $student = $this->completeStudent(jenjang: Jenjang::MTs);

        $this->actingAs($student->fresh())->get('/pembayaran')->assertRedirect('/dashboard');
        $this->actingAs($student->fresh())->get('/dashboard')
            ->assertInertia(fn (Assert $page) => $page->where('pembayaran', null)->where('studentNav.payment', null));
        $this->actingAs($student->fresh())->post('/finalisasi')->assertSessionHas('success');
    }

    public function test_uploading_a_proof_waits_for_confirmation_and_replaces_the_old_one(): void
    {
        $student = $this->completeStudent();

        $this->upload($student, 'pertama.jpg')->assertRedirect('/pembayaran');
        $first = $student->payment()->first();
        $this->assertSame(PaymentStatus::Menunggu, $first->status);
        $this->assertSame(250000, $first->amount);
        $this->assertSame('Ahmad Fauzi', $first->sender_name);
        Storage::disk('local')->assertExists($first->proof_path);

        $this->upload($student, 'kedua.png');
        $second = $student->payment()->first();
        $this->assertSame($first->id, $second->id);
        $this->assertSame('kedua.png', $second->proof_name);
        Storage::disk('local')->assertMissing($first->proof_path);
        Storage::disk('local')->assertExists($second->proof_path);
    }

    public function test_proof_must_be_an_image_or_pdf(): void
    {
        $student = $this->completeStudent();

        $this->actingAs($student->fresh())->post('/pembayaran', [
            'sender_name' => 'Ahmad',
            'proof' => UploadedFile::fake()->create('bukti.docx', 10),
        ])->assertSessionHasErrors('proof');

        $this->assertNull($student->payment()->first());
    }

    public function test_proof_is_only_visible_to_the_student_and_admins(): void
    {
        $student = $this->completeStudent();
        $this->upload($student);
        $payment = $student->payment()->first();

        $this->actingAs($student->fresh())->get("/bukti-pembayaran/{$payment->id}")->assertOk();
        $this->actingAs($this->admin)->get("/bukti-pembayaran/{$payment->id}")->assertOk();
        $this->actingAs(User::factory()->create())->get("/bukti-pembayaran/{$payment->id}")->assertForbidden();
    }

    public function test_finalization_needs_a_proof_and_verification_needs_a_confirmed_payment(): void
    {
        $student = $this->completeStudent();

        $this->actingAs($student->fresh())->post('/finalisasi')
            ->assertSessionHas('error', 'Unggah bukti pembayaran biaya pendaftaran sebelum finalisasi.');

        $this->upload($student);
        $this->actingAs($student->fresh())->post('/finalisasi')->assertSessionHas('success');
        $this->assertSame(StatusPendaftaran::MenungguVerifikasi, $student->fresh()->status);

        $this->actingAs($this->admin)->post("/admin/siswa/{$student->id}/status", ['status' => 'terverifikasi'])
            ->assertSessionHasErrors('status');
        $this->assertSame(StatusPendaftaran::MenungguVerifikasi, $student->fresh()->status);

        $payment = $student->payment()->first();
        $this->actingAs($this->admin)->post("/admin/pembayaran/{$payment->id}/terima")->assertSessionHas('success');
        $this->assertSame(PaymentStatus::Diterima, $payment->fresh()->status);
        $this->assertSame($this->admin->id, $payment->fresh()->reviewed_by);

        $this->actingAs($this->admin)->post("/admin/siswa/{$student->id}/status", ['status' => 'terverifikasi'])
            ->assertSessionHas('success');
        $this->assertSame(StatusPendaftaran::Terverifikasi, $student->fresh()->status);
    }

    public function test_rejected_payment_needs_a_reason_and_a_new_upload(): void
    {
        $student = $this->completeStudent();
        $this->upload($student);
        $payment = $student->payment()->first();

        $this->actingAs($this->admin)->post("/admin/pembayaran/{$payment->id}/tolak", ['note' => ''])
            ->assertSessionHasErrors('note');
        $this->actingAs($this->admin)->post("/admin/pembayaran/{$payment->id}/tolak", ['note' => 'Nominal kurang Rp 50.000.'])
            ->assertSessionHas('success');

        $this->actingAs($student->fresh())->get('/dashboard')
            ->assertInertia(fn (Assert $page) => $page
                ->where('pembayaran.status', 'ditolak')
                ->where('pembayaran.note', 'Nominal kurang Rp 50.000.'));
        $this->actingAs($student->fresh())->post('/finalisasi')->assertSessionHas('error');

        $this->upload($student);
        $this->assertSame(PaymentStatus::Menunggu, $payment->fresh()->status);
        $this->assertNull($payment->fresh()->note);
    }

    public function test_confirmed_payment_cannot_be_replaced_by_the_student(): void
    {
        $student = $this->completeStudent();
        $this->upload($student);
        $payment = $student->payment()->first();
        $this->actingAs($this->admin)->post("/admin/pembayaran/{$payment->id}/terima");

        $this->upload($student)->assertSessionHas('error');
        $this->assertSame(PaymentStatus::Diterima, $payment->fresh()->status);
    }

    public function test_admin_records_a_cash_payment(): void
    {
        $student = $this->completeStudent();

        $this->actingAs($this->admin)->post("/admin/siswa/{$student->id}/pembayaran", ['amount' => 250000, 'note' => 'Kuitansi 12'])
            ->assertSessionHas('success');

        $payment = $student->payment()->first();
        $this->assertSame(PaymentStatus::Diterima, $payment->status);
        $this->assertSame(Payment::METHOD_CASH, $payment->method);
        $this->assertSame(250000, $payment->amount);
    }

    public function test_period_fee_replaces_the_jenjang_fee(): void
    {
        $this->travelTo('2027-03-15 10:00');
        $period = RegistrationPeriod::create([
            'name' => 'Gelombang 1', 'jenjang' => Jenjang::MA, 'opens_at' => '2027-03-01', 'closes_at' => '2027-03-31 23:59', 'fee' => 150000,
        ]);

        $this->get('/register')->assertInertia(fn (Assert $page) => $page
            ->where('pendaftaran.jenjang.ma.fee_label', 'Rp 150.000')
            ->where('pendaftaran.jenjang.mts.fee_label', null)
            ->where('pendaftaran.anyFee', true));

        $student = $this->completeStudent(attributes: ['registration_period_id' => $period->id]);
        $this->actingAs($student->fresh())->get('/pembayaran')
            ->assertInertia(fn (Assert $page) => $page->where('summary.fee_label', 'Rp 150.000'));

        $period->update(['fee' => 0]);
        $this->actingAs($student->fresh())->get('/pembayaran')->assertRedirect('/dashboard');
    }

    public function test_admin_lists_payments_waiting_for_confirmation_first(): void
    {
        $first = $this->completeStudent();
        $second = $this->completeStudent();
        $this->upload($first);
        $this->travel(5)->minutes();
        $this->upload($second);
        $paid = $this->completeStudent();
        $this->actingAs($this->admin)->post("/admin/siswa/{$paid->id}/pembayaran", ['amount' => 250000]);

        $this->actingAs($this->admin)->get('/admin/pembayaran')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Payments/Index')
                ->has('payments.data', 2)
                ->where('payments.data.0.student.id', $first->id)
                ->where('counts.menunggu', 2)
                ->where('counts.diterima', 1));

        $this->actingAs($this->admin)->get('/admin')
            ->assertInertia(fn (Assert $page) => $page->where('pembayaranMenunggu', 2));
    }
}
