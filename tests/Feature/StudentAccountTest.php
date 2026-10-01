<?php

namespace Tests\Feature;

use App\Enums\Jenjang;
use App\Enums\PaymentStatus;
use App\Models\AdmissionSetting;
use App\Models\Payment;
use App\Models\RegistrationPeriod;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class StudentAccountTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->travelTo(Carbon::parse('2027-03-15 10:00'));
        $this->admin = User::factory()->admin()->create();
    }

    public function test_admin_registers_a_student_and_sees_the_login_card_once(): void
    {
        AdmissionSetting::for(Jenjang::MA)->fill(['fee' => 250000])->save();
        $period = RegistrationPeriod::create(['name' => 'Gelombang 1', 'jenjang' => Jenjang::MA, 'opens_at' => '2027-03-01', 'closes_at' => '2027-03-31']);

        $response = $this->actingAs($this->admin)->post('/admin/siswa', [
            'jenjang' => 'ma',
            'name' => 'Siti Aminah Zahra',
            'no_hp' => '081234567890',
            'paid_cash' => true,
        ]);

        $student = User::where('name', 'Siti Aminah Zahra')->firstOrFail();
        $response->assertRedirect("/admin/siswa/{$student->id}/kartu-login");

        $this->assertSame('siti_aminah_zahra', $student->username);
        $this->assertSame(Jenjang::MA, $student->jenjang);
        $this->assertSame($period->id, $student->registration_period_id);
        $this->assertSame(PaymentStatus::Diterima, $student->payment->status);
        $this->assertSame(Payment::METHOD_CASH, $student->payment->method);
        $this->assertSame(250000, $student->payment->amount);

        $password = null;
        $this->actingAs($this->admin)->get("/admin/siswa/{$student->id}/kartu-login")
            ->assertInertia(function (Assert $page) use (&$password) {
                $page->component('Admin/Students/LoginCard')->where('student.username', 'siti_aminah_zahra');
                $password = $page->toArray()['props']['password'];
            });

        $this->assertMatchesRegularExpression('/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{10}$/', $password);
        $this->assertTrue(Hash::check($password, $student->password));

        // The password is not shown again.
        $this->actingAs($this->admin)->get("/admin/siswa/{$student->id}/kartu-login")
            ->assertInertia(fn (Assert $page) => $page->where('password', null));
    }

    public function test_usernames_made_from_names_are_unique(): void
    {
        User::factory()->create(['username' => 'ahmad_fauzi']);

        $this->actingAs($this->admin)->post('/admin/siswa', ['jenjang' => 'mi', 'name' => 'Ahmad Fauzi']);
        $this->actingAs($this->admin)->post('/admin/siswa', ['jenjang' => 'mi', 'name' => 'Ahmad Fauzi']);

        $this->assertSame(['ahmad_fauzi2', 'ahmad_fauzi3'], User::where('name', 'Ahmad Fauzi')->orderBy('id')->pluck('username')->all());
    }

    public function test_period_must_belong_to_the_jenjang(): void
    {
        $period = RegistrationPeriod::create(['name' => 'Gelombang MTs', 'jenjang' => Jenjang::MTs, 'opens_at' => '2027-03-01', 'closes_at' => '2027-03-31']);

        $this->actingAs($this->admin)->post('/admin/siswa', ['jenjang' => 'ma', 'name' => 'Budi', 'registration_period_id' => $period->id])
            ->assertSessionHasErrors('registration_period_id');
    }

    public function test_new_password_replaces_the_old_one(): void
    {
        $student = User::factory()->create(['jenjang' => Jenjang::MTs]);
        $old = $student->password;

        $this->actingAs($this->admin)->post("/admin/siswa/{$student->id}/kartu-login")
            ->assertRedirect("/admin/siswa/{$student->id}/kartu-login")
            ->assertSessionHas('loginCard');

        $this->assertNotSame($old, $student->fresh()->password);
        $password = session('loginCard')['password'];

        $this->post('/logout');
        $this->post('/login', ['username' => $student->username, 'password' => $password])->assertRedirect('/dashboard');
    }

    public function test_students_cannot_open_admin_account_pages(): void
    {
        $student = User::factory()->create();

        $this->actingAs($student)->get('/admin/siswa/baru')->assertRedirect('/dashboard');
        $this->actingAs($student)->post("/admin/siswa/{$student->id}/kartu-login")->assertRedirect('/dashboard');
    }
}
