<?php

namespace Tests\Feature;

use App\Enums\Jenjang;
use App\Models\RegistrationPeriod;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class RegistrationPeriodTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->travelTo(Carbon::parse('2027-03-15 10:00'));
    }

    private function period(array $attributes = []): RegistrationPeriod
    {
        return RegistrationPeriod::create($attributes + [
            'name' => 'Gelombang 1',
            'jenjang' => Jenjang::MA,
            'opens_at' => '2027-03-01 00:00',
            'closes_at' => '2027-03-31 23:59',
        ]);
    }

    private function register(string $jenjang = 'ma', string $username = 'siswa_baru')
    {
        return $this->post('/register', [
            'jenjang' => $jenjang,
            'name' => 'Siswa Baru',
            'username' => $username,
            'no_hp' => '081234567890',
            'password' => 'rahasia123',
            'password_confirmation' => 'rahasia123',
        ]);
    }

    public function test_registration_is_open_when_no_periods_exist(): void
    {
        $this->register()->assertRedirect('/dashboard');

        $this->assertNull(User::where('username', 'siswa_baru')->value('registration_period_id'));
    }

    public function test_registration_during_an_open_period_is_linked_to_it(): void
    {
        $period = $this->period();

        $this->register()->assertRedirect('/dashboard');

        $this->assertSame($period->id, User::where('username', 'siswa_baru')->value('registration_period_id'));
    }

    public function test_registration_is_closed_outside_the_periods_of_that_jenjang(): void
    {
        $this->period(['opens_at' => '2027-04-01 00:00', 'closes_at' => '2027-04-30 23:59']);

        $this->register('ma')->assertSessionHasErrors(['jenjang' => 'Pendaftaran Madrasah Aliyah sedang ditutup.']);
        $this->assertGuest();

        // MI has no periods of its own, so it stays open.
        $this->register('mi', 'siswa_mi')->assertRedirect('/dashboard');
    }

    public function test_period_closes_at_its_closing_time(): void
    {
        $this->period(['closes_at' => '2027-03-15 09:59']);

        $this->register()->assertSessionHasErrors('jenjang');
    }

    public function test_a_period_for_every_jenjang_applies_to_all(): void
    {
        $this->period(['jenjang' => null, 'opens_at' => '2027-05-01 00:00', 'closes_at' => '2027-05-31 23:59']);

        $this->register('mi')->assertSessionHasErrors('jenjang');
        $this->register('mts', 'siswa_mts')->assertSessionHasErrors('jenjang');
    }

    public function test_register_and_landing_pages_show_the_schedule(): void
    {
        $this->period(['name' => 'Gelombang Lama', 'opens_at' => '2026-12-01 00:00', 'closes_at' => '2027-01-15 23:59']);
        $this->period(['name' => 'Gelombang 2', 'opens_at' => '2027-04-01 07:00', 'closes_at' => '2027-04-30 23:59']);

        $this->get('/register')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Auth/Register')
            ->where('pendaftaran.jenjang.ma.open', false)
            ->where('pendaftaran.jenjang.ma.restricted', true)
            ->where('pendaftaran.jenjang.ma.next.name', 'Gelombang 2')
            ->where('pendaftaran.jenjang.ma.next.opens_label', '1 April 2027, 07.00')
            ->where('pendaftaran.jenjang.mi.open', true)
            ->where('pendaftaran.jenjang.mi.restricted', false));

        // Periods closed more than 30 days ago are no longer listed.
        $this->get('/')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Welcome')
            ->has('pendaftaran.periods', 1)
            ->where('pendaftaran.periods.0.name', 'Gelombang 2')
            ->where('pendaftaran.periods.0.status', 'upcoming'));
    }

    public function test_student_dashboard_shows_their_period(): void
    {
        $period = $this->period();
        $student = User::factory()->create(['jenjang' => Jenjang::MA]);
        $student->forceFill(['registration_period_id' => $period->id])->save();

        $this->actingAs($student)->get('/dashboard')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('profil.gelombang', 'Gelombang 1')
            ->where('jadwal.pengisian', '1 Mar 2027 – 31 Mar 2027'));
    }

    public function test_admin_manages_periods(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->post('/admin/gelombang', [
            'name' => 'Gelombang 1',
            'jenjang' => 'semua',
            'opens_at' => '2027-03-01T08:00',
            'closes_at' => '2027-03-31T23:59',
            'description' => 'Biaya pendaftaran Rp 250.000',
        ])->assertSessionHasNoErrors()->assertSessionHas('success');

        $period = RegistrationPeriod::firstOrFail();
        $this->assertNull($period->jenjang);
        $this->assertSame('2027-03-01 08:00', $period->opens_at->format('Y-m-d H:i'));

        $this->actingAs($admin)->put("/admin/gelombang/{$period->id}", [
            'name' => 'Gelombang 1 MA',
            'jenjang' => 'ma',
            'opens_at' => '2027-03-01T08:00',
            'closes_at' => '2027-04-05T23:59',
        ])->assertSessionHasNoErrors();
        $this->assertSame(Jenjang::MA, $period->fresh()->jenjang);

        $student = User::factory()->create();
        $student->forceFill(['registration_period_id' => $period->id])->save();

        $this->actingAs($admin)->get('/admin/gelombang')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Periods/Index')
            ->where('periods.0.users_count', 1)
            ->where('summary.ma.current.name', 'Gelombang 1 MA'));

        $this->actingAs($admin)->get("/admin/siswa?gelombang={$period->id}")->assertOk()
            ->assertInertia(fn (Assert $page) => $page->has('students.data', 1)->has('periodOptions', 1));

        $this->actingAs($admin)->delete("/admin/gelombang/{$period->id}")->assertSessionHas('success');
        $this->assertDatabaseCount('registration_periods', 0);
        $this->assertNull($student->fresh()->registration_period_id);
    }

    public function test_period_validation(): void
    {
        $admin = User::factory()->admin()->create();
        $this->period(['name' => 'Gelombang 1', 'jenjang' => Jenjang::MA]);
        $this->period(['name' => 'Gelombang Umum', 'jenjang' => null, 'opens_at' => '2027-06-01 00:00', 'closes_at' => '2027-06-30 23:59']);

        $store = fn (array $data) => $this->actingAs($admin)->post('/admin/gelombang', $data + ['name' => 'Baru', 'jenjang' => 'ma']);

        $store(['opens_at' => '2027-05-10T00:00', 'closes_at' => '2027-05-01T00:00'])
            ->assertSessionHasErrors(['closes_at' => 'waktu ditutup harus setelah waktu dibuka.']);

        $store(['opens_at' => '2027-03-20T00:00', 'closes_at' => '2027-04-10T00:00'])
            ->assertSessionHasErrors(['opens_at' => 'Waktunya bertabrakan dengan Gelombang 1 (MA, 1 Mar 2027 – 31 Mar 2027).']);

        // A period for every jenjang overlaps with all of them.
        $store(['jenjang' => 'mi', 'opens_at' => '2027-06-10T00:00', 'closes_at' => '2027-07-10T00:00'])
            ->assertSessionHasErrors('opens_at');

        // Other jenjang may run at the same time.
        $store(['jenjang' => 'mi', 'opens_at' => '2027-03-20T00:00', 'closes_at' => '2027-04-10T00:00'])
            ->assertSessionHasNoErrors();

        $store(['name' => '', 'opens_at' => '', 'closes_at' => ''])
            ->assertSessionHasErrors(['name' => 'nama gelombang wajib diisi.']);
    }

    public function test_students_cannot_manage_periods(): void
    {
        $student = User::factory()->create();

        $this->actingAs($student)->get('/admin/gelombang')->assertRedirect('/dashboard');
        $this->actingAs($student)->post('/admin/gelombang', [])->assertRedirect('/dashboard');
    }
}
