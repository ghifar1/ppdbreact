<?php

namespace Tests\Feature;

use App\Enums\Jenjang;
use App\Enums\StatusPendaftaran;
use App\Models\AdmissionSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Concerns\AdmissionStudents;
use Tests\TestCase;

class AdmissionScheduleTest extends TestCase
{
    use AdmissionStudents, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->travelTo(Carbon::parse('2027-06-15 10:00'));
    }

    private function settings(array $values, Jenjang $jenjang = Jenjang::MA): void
    {
        AdmissionSetting::for($jenjang)->fill($values)->save();
    }

    public function test_admin_saves_settings_per_jenjang(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->put('/admin/pengaturan/ma', [
            'fee' => 'Rp 250.000',
            'account_number' => '7146444673',
            'finalization_opens_at' => '2027-06-01T00:00',
            'finalization_closes_at' => '2027-07-08T23:59',
            'announcement_at' => '2027-07-15T08:00',
            'headmaster_name' => 'Siti Marina, S.Pd',
        ])->assertSessionHas('success');

        $settings = AdmissionSetting::for(Jenjang::MA);
        $this->assertSame(250000, $settings->fee);
        $this->assertSame('2027-07-08 23:59', $settings->finalization_closes_at->format('Y-m-d H:i'));
        $this->assertFalse(AdmissionSetting::for(Jenjang::MI)->exists);

        $this->actingAs($admin)->get('/admin/pengaturan?jenjang=ma')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Settings/Index')
                ->where('tab', 'ma')
                ->where('settings.ma.fee', 250000)
                ->where('settings.ma.finalization_closes_at', '2027-07-08T23:59')
                ->where('settings.mi.fee', ''));
    }

    public function test_closing_time_must_be_after_opening_time(): void
    {
        $this->actingAs(User::factory()->admin()->create())->put('/admin/pengaturan/ma', [
            'card_opens_at' => '2027-07-10T08:00',
            'card_closes_at' => '2027-07-01T08:00',
        ])->assertSessionHasErrors('card_closes_at');

        $this->actingAs(User::factory()->create())->put('/admin/pengaturan/ma', ['fee' => 1])->assertRedirect('/dashboard');
        $this->assertNull(AdmissionSetting::for(Jenjang::MA)->fee);
    }

    public function test_finalization_only_within_its_window(): void
    {
        $student = $this->completeStudent();

        $this->settings(['finalization_opens_at' => '2027-06-20 00:00', 'finalization_closes_at' => '2027-07-08 23:59']);
        $this->actingAs($student->fresh())->post('/finalisasi')
            ->assertSessionHas('error', 'Finalisasi data dibuka mulai 20 Juni 2027, 00.00.');

        $this->settings(['finalization_opens_at' => '2027-06-01 00:00', 'finalization_closes_at' => '2027-06-10 23:59']);
        $this->actingAs($student->fresh())->post('/finalisasi')
            ->assertSessionHas('error', 'Masa finalisasi data sudah berakhir pada 10 Juni 2027, 23.59.');
        $this->assertSame(StatusPendaftaran::PengisianData, $student->fresh()->status);

        $this->settings(['finalization_closes_at' => '2027-06-30 23:59']);
        $this->actingAs($student->fresh())->post('/finalisasi')->assertSessionHas('success');
    }

    public function test_requested_corrections_can_be_sent_after_finalization_closed(): void
    {
        $this->settings(['finalization_closes_at' => '2027-06-10 23:59']);
        $student = $this->completeStudent(StatusPendaftaran::PerluPerbaikan);

        $this->actingAs($student)->post('/finalisasi')->assertSessionHas('success');
        $this->assertSame(StatusPendaftaran::MenungguVerifikasi, $student->fresh()->status);
    }

    public function test_exam_card_only_within_its_window(): void
    {
        $student = $this->completeStudent(StatusPendaftaran::Terverifikasi);

        $this->settings(['card_opens_at' => '2027-06-20 08:00']);
        $this->actingAs($student->fresh())->get('/kartu')
            ->assertRedirect('/dashboard')
            ->assertSessionHas('error', 'Kartu ujian bisa diunduh mulai 20 Juni 2027, 08.00.');
        $this->actingAs($student->fresh())->get('/dashboard')
            ->assertInertia(fn (Assert $page) => $page->where('kartu.available', false)->where('studentNav.card', false));

        $this->travelTo(Carbon::parse('2027-06-20 08:00'));
        $this->actingAs($student->fresh())->get('/kartu')->assertOk();
    }

    public function test_results_stay_hidden_until_the_announcement(): void
    {
        $this->settings(['announcement_at' => '2027-07-15 08:00', 'reregistration_info' => "Daftar ulang 17 Juli 2027.\n1. Membawa surat ini"]);
        $student = $this->completeStudent(StatusPendaftaran::Lulus);

        $this->actingAs($student->fresh())->get('/dashboard')
            ->assertInertia(fn (Assert $page) => $page
                ->where('profil.status', 'terverifikasi')
                ->where('auth.user.status', 'terverifikasi')
                ->where('studentNav.letter', false)
                ->where('pengumuman', 'Kamis, 15 Juli 2027, 08.00'));
        $this->actingAs($student->fresh())->get('/kelulusan')->assertRedirect('/dashboard');

        $this->travelTo(Carbon::parse('2027-07-15 08:00'));
        $this->actingAs($student->fresh())->get('/dashboard')
            ->assertInertia(fn (Assert $page) => $page->where('profil.status', 'lulus')->where('studentNav.letter', true));
        $this->actingAs($student->fresh())->get('/kelulusan')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('User/Kelulusan')
                ->where('surat.lulus', true)
                ->where('surat.asal_sekolah', 'MTs Negeri 1')
                ->where('surat.tanggal', '15 Juli 2027')
                ->where('surat.daftar_ulang', "Daftar ulang 17 Juli 2027.\n1. Membawa surat ini"));

        // Admins always see the real status.
        $this->actingAs(User::factory()->admin()->create())->get("/admin/siswa/{$student->id}")
            ->assertInertia(fn (Assert $page) => $page->where('student.status', 'lulus'));
    }

    public function test_result_letter_is_shown_for_students_who_did_not_pass(): void
    {
        $student = $this->completeStudent(StatusPendaftaran::TidakLulus);

        $this->actingAs($student)->get('/kelulusan')
            ->assertInertia(fn (Assert $page) => $page->where('surat.lulus', false));
        $this->actingAs($this->completeStudent(StatusPendaftaran::Terverifikasi))->get('/kelulusan')->assertRedirect('/dashboard');
    }

    public function test_timeline_shows_the_dates_of_the_students_jenjang(): void
    {
        $this->settings([
            'finalization_opens_at' => '2027-06-01 00:00',
            'finalization_closes_at' => '2027-07-08 23:59',
            'card_closes_at' => '2027-07-12 23:59',
            'announcement_at' => '2027-07-15 08:00',
        ]);

        $this->actingAs($this->completeStudent())->get('/dashboard')
            ->assertInertia(fn (Assert $page) => $page
                ->where('jadwal.finalisasi', '1 Jun 2027 – 8 Jul 2027')
                ->where('jadwal.kartu', 'Sampai 12 Jul 2027')
                ->where('jadwal.seleksi', 'Pengumuman 15 Jul 2027')
                ->where('finalisasi.window.closes_label', '8 Juli 2027, 23.59'));

        $this->get('/')->assertInertia(fn (Assert $page) => $page
            ->where('jadwal.ma.finalisasi', '1 Jun 2027 – 8 Jul 2027')
            ->where('jadwal.mi.finalisasi', null));
    }

    public function test_student_without_jenjang_is_not_restricted(): void
    {
        $this->settings(['finalization_closes_at' => '2027-06-10 23:59', 'fee' => 250000]);
        $student = User::factory()->create(['jenjang' => null]);
        $student->forceFill(['status' => StatusPendaftaran::Terverifikasi])->save();

        $this->actingAs($student)->get('/dashboard')->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('pembayaran', null)->where('kartu.available', true));
        $this->actingAs($student)->get('/kartu')->assertOk()
            ->assertInertia(fn (Assert $page) => $page->has('kartu.jadwal', 0));
    }
}
