<?php

namespace Tests\Feature;

use App\Enums\Jenjang;
use App\Enums\StatusPendaftaran;
use App\Models\ExamSchedule;
use App\Models\RegistrationPeriod;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Concerns\AdmissionStudents;
use Tests\TestCase;

class ExamScheduleTest extends TestCase
{
    use AdmissionStudents, RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->travelTo(Carbon::parse('2027-06-15 10:00'));
        $this->admin = User::factory()->admin()->create();
    }

    private function verify(User $student)
    {
        return $this->actingAs($this->admin)->post("/admin/siswa/{$student->id}/status", ['status' => 'terverifikasi']);
    }

    private function item(array $attributes = []): ExamSchedule
    {
        return ExamSchedule::create($attributes + [
            'title' => 'Tes Tulis',
            'date' => '2027-07-04',
            'starts_at' => '07:30',
            'ends_at' => '09:00',
        ]);
    }

    public function test_participant_numbers_count_per_jenjang_and_year(): void
    {
        $first = $this->completeStudent(StatusPendaftaran::MenungguVerifikasi);
        $second = $this->completeStudent(StatusPendaftaran::MenungguVerifikasi);
        $mts = $this->completeStudent(StatusPendaftaran::MenungguVerifikasi, Jenjang::MTs);
        $lastYear = $this->completeStudent(StatusPendaftaran::MenungguVerifikasi, attributes: ['created_at' => '2026-05-01']);

        foreach ([$second, $first, $mts, $lastYear] as $student) {
            $this->verify($student)->assertSessionHas('success');
        }

        $this->assertSame([1, 2027], [$second->fresh()->exam_number, $second->fresh()->exam_year]);
        $this->assertSame('002', $first->fresh()->nomorPeserta());
        $this->assertSame(1, $mts->fresh()->exam_number);
        $this->assertSame([1, 2026], [$lastYear->fresh()->exam_number, $lastYear->fresh()->exam_year]);

        // Verifying again keeps the number.
        $this->actingAs($this->admin)->post("/admin/siswa/{$first->id}/status", ['status' => 'lulus']);
        $this->assertSame(2, $first->fresh()->exam_number);
    }

    public function test_students_verified_earlier_get_a_number_with_their_exam_card(): void
    {
        $student = $this->completeStudent(StatusPendaftaran::Terverifikasi);

        $this->actingAs($student)->get('/kartu')
            ->assertInertia(fn (Assert $page) => $page->where('kartu.nomor_peserta', '001'));
    }

    public function test_exam_card_shows_the_students_sessions(): void
    {
        $period = RegistrationPeriod::create(['name' => 'Gelombang 1', 'jenjang' => Jenjang::MA, 'opens_at' => '2027-06-01', 'closes_at' => '2027-06-30']);
        $other = RegistrationPeriod::create(['name' => 'Gelombang 2', 'jenjang' => Jenjang::MA, 'opens_at' => '2027-07-01', 'closes_at' => '2027-07-30']);

        $this->item(['title' => 'Tes Tulis', 'location' => 'Online']);
        $this->item(['title' => 'Tes Al-Qur\'an Sesi 1', 'date' => '2027-07-05', 'starts_at' => '08:00', 'number_from' => 1, 'number_to' => 60]);
        $this->item(['title' => 'Tes Al-Qur\'an Sesi 2', 'date' => '2027-07-05', 'starts_at' => '10:30', 'number_from' => 61, 'number_to' => 105]);
        $this->item(['title' => 'Khusus MTs', 'jenjang' => Jenjang::MTs]);
        $this->item(['title' => 'Wawancara Gelombang 1', 'registration_period_id' => $period->id, 'date' => '2027-07-06', 'ends_at' => null]);
        $this->item(['title' => 'Wawancara Gelombang 2', 'registration_period_id' => $other->id]);

        $student = $this->completeStudent(StatusPendaftaran::Terverifikasi, attributes: ['registration_period_id' => $period->id]);
        $student->forceFill(['exam_number' => 61, 'exam_year' => 2027])->save();

        $this->actingAs($student)->get('/kartu')
            ->assertInertia(fn (Assert $page) => $page
                ->component('User/Kartu')
                ->where('kartu.nomor_peserta', '061')
                ->where('kartu.asal_sekolah', 'MTs Negeri 1')
                ->has('kartu.jadwal', 3)
                ->where('kartu.jadwal.0.title', 'Tes Tulis')
                ->where('kartu.jadwal.0.date_label', 'Minggu, 4 Juli 2027')
                ->where('kartu.jadwal.0.time_label', '07.30 – 09.00')
                ->where('kartu.jadwal.1.title', 'Tes Al-Qur\'an Sesi 2')
                ->where('kartu.jadwal.1.range_label', 'No. peserta 061 – 105')
                ->where('kartu.jadwal.2.title', 'Wawancara Gelombang 1')
                ->where('kartu.jadwal.2.time_label', '07.30 – selesai'));

        $this->actingAs($student)->get('/dashboard')
            ->assertInertia(fn (Assert $page) => $page->where('jadwal.seleksi', 'Ujian 4 – 6 Jul 2027'));
    }

    public function test_admin_manages_the_exam_schedule(): void
    {
        $this->actingAs($this->admin)->post('/admin/jadwal-ujian', [
            'title' => 'Tes Al-Qur\'an',
            'jenjang' => 'ma',
            'registration_period_id' => 'semua',
            'date' => '2027-07-05',
            'starts_at' => '08:00',
            'ends_at' => '10:00',
            'location' => 'Ruang 1',
            'number_from' => 1,
            'number_to' => 60,
        ])->assertSessionHas('success');

        $item = ExamSchedule::firstOrFail();
        $this->assertSame(Jenjang::MA, $item->jenjang);
        $this->assertNull($item->registration_period_id);

        $verified = $this->completeStudent(StatusPendaftaran::Terverifikasi);
        $verified->forceFill(['exam_number' => 5, 'exam_year' => 2027])->save();
        $this->completeStudent(StatusPendaftaran::MenungguVerifikasi);

        $this->actingAs($this->admin)->get('/admin/jadwal-ujian')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/ExamSchedules/Index')
                ->has('items', 1)
                ->where('items.0.participants', 1));

        $this->actingAs($this->admin)->put("/admin/jadwal-ujian/{$item->id}", [
            'title' => 'Tes Al-Qur\'an Sesi 1', 'date' => '2027-07-05', 'starts_at' => '08:00', 'jenjang' => 'semua',
        ])->assertSessionHas('success');
        $this->assertNull($item->fresh()->jenjang);
        $this->assertNull($item->fresh()->number_from);

        $this->actingAs($this->admin)->delete("/admin/jadwal-ujian/{$item->id}")->assertSessionHas('success');
        $this->assertDatabaseCount('exam_schedules', 0);
    }

    public function test_exam_schedule_validation(): void
    {
        $this->actingAs($this->admin)->post('/admin/jadwal-ujian', [
            'title' => 'Tes',
            'date' => '2027-07-05',
            'starts_at' => '10:00',
            'ends_at' => '09:00',
            'number_from' => 60,
            'number_to' => 1,
        ])->assertSessionHasErrors(['ends_at', 'number_to']);

        $this->actingAs($this->admin)->post('/admin/jadwal-ujian', [
            'title' => 'Tes', 'date' => '2027-07-05', 'starts_at' => '10:00', 'number_from' => 1,
        ])->assertSessionHasErrors('number_to');
    }
}
