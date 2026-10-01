<?php

namespace Tests\Feature;

use App\Enums\Jenjang;
use App\Enums\StatusPendaftaran;
use App\Models\ActivityLog;
use App\Models\FormAnswer;
use App\Models\FormField;
use App\Models\User;
use Database\Seeders\MenuSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;
use OpenSpout\Reader\XLSX\Reader;
use Tests\TestCase;

class AdminToolsTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->travelTo(Carbon::parse('2027-03-15 10:00'));
        $this->seed(MenuSeeder::class);
        $this->admin = User::factory()->admin()->create(['name' => 'Bu Siti']);
    }

    private function student(Jenjang $jenjang, string $name, array $answers = [], string $created = '2027-03-01'): User
    {
        $student = User::factory()->create(['jenjang' => $jenjang, 'name' => $name, 'created_at' => $created]);

        foreach ($answers as $key => $value) {
            $field = FormField::where('key', $key)->whereHas('menu', fn ($query) => $query->where('jenjang', $jenjang))->firstOrFail();
            FormAnswer::create(['user_id' => $student->id, 'form_field_id' => $field->id, 'value' => $value]);
        }

        return $student;
    }

    /**
     * @return array<string, list<list<mixed>>> rows per sheet name
     */
    private function readWorkbook(string $path): array
    {
        $reader = new Reader;
        $reader->open($path);
        $sheets = [];

        foreach ($reader->getSheetIterator() as $sheet) {
            foreach ($sheet->getRowIterator() as $row) {
                $sheets[$sheet->getName()][] = $row->toArray();
            }
        }

        $reader->close();

        return $sheets;
    }

    public function test_export_has_a_sheet_per_jenjang_with_every_form_field(): void
    {
        $this->student(Jenjang::MA, 'Siti Aminah', ['nisn' => '0081234567', 'nama_sekolah' => 'MTs Negeri 1', 'tanggal_lahir' => '2008-05-17']);
        $this->student(Jenjang::MTs, 'Budi Santoso', ['nama_sekolah' => 'SD Negeri 3']);

        $response = $this->actingAs($this->admin)->get('/admin/siswa/unduh');

        $response->assertOk()->assertDownload();
        $sheets = $this->readWorkbook($response->baseResponse->getFile()->getPathname());

        $this->assertSame(['MTs', 'MA'], array_keys($sheets));
        [$header, $siti] = $sheets['MA'];
        $this->assertSame(['No. Pendaftaran', 'No. Peserta', 'Nama', 'Username'], array_slice($header, 0, 4));
        $this->assertContains('NISN', $header);
        $this->assertSame('Siti Aminah', $siti[2]);
        $this->assertSame('0081234567', $siti[array_search('NISN', $header)]);
        $this->assertSame('MTs Negeri 1', $siti[array_search('Asal Sekolah', $header)]);
        $this->assertSame('2008-05-17', $siti[array_search('Tanggal Lahir', $header)]->format('Y-m-d'));
        $this->assertSame('Budi Santoso', $sheets['MTs'][1][2]);

        $this->assertDatabaseHas('activity_logs', ['action' => 'data.unduh', 'causer_id' => $this->admin->id, 'description' => 'Mengunduh data siswa (2 siswa)']);
    }

    public function test_export_follows_the_list_filters(): void
    {
        $this->student(Jenjang::MA, 'Siti Aminah');
        $this->student(Jenjang::MA, 'Lama', created: '2026-03-01');
        $this->student(Jenjang::MTs, 'Budi Santoso');

        $response = $this->actingAs($this->admin)->get('/admin/siswa/unduh?jenjang=ma&tahun=2027');
        $sheets = $this->readWorkbook($response->baseResponse->getFile()->getPathname());

        $this->assertSame(['MA'], array_keys($sheets));
        $this->assertCount(2, $sheets['MA']);
        $this->assertStringContainsString('data-siswa-ma-2027-', $response->headers->get('content-disposition'));

        // Students cannot download it.
        $this->actingAs(User::factory()->create())->get('/admin/siswa/unduh')->assertRedirect('/dashboard');
    }

    public function test_year_filter_on_dashboard_and_lists(): void
    {
        $this->student(Jenjang::MA, 'Tahun Ini');
        $this->student(Jenjang::MA, 'Tahun Lalu', created: '2026-03-01');

        $this->actingAs($this->admin)->get('/admin')->assertInertia(fn (Assert $page) => $page
            ->where('tahun', '2027')
            ->where('total', 1)
            ->where('tahunOptions', [['value' => '2027', 'label' => '2027'], ['value' => '2026', 'label' => '2026']]));
        $this->actingAs($this->admin)->get('/admin?tahun=semua')->assertInertia(fn (Assert $page) => $page->where('total', 2));
        $this->actingAs($this->admin)->get('/admin?tahun=2026')->assertInertia(fn (Assert $page) => $page->where('total', 1));

        $this->actingAs($this->admin)->get('/admin/siswa')->assertInertia(fn (Assert $page) => $page->has('students.data', 2));
        $this->actingAs($this->admin)->get('/admin/siswa?tahun=2026')->assertInertia(fn (Assert $page) => $page
            ->has('students.data', 1)
            ->where('students.data.0.name', 'Tahun Lalu')
            ->where('filters.tahun', '2026'));
    }

    public function test_actions_are_logged_with_who_did_them(): void
    {
        $this->post('/register', [
            'jenjang' => 'mts', 'name' => 'Rina Wati', 'username' => 'rina_wati', 'no_hp' => '0812',
            'password' => 'rahasia123', 'password_confirmation' => 'rahasia123',
        ]);
        $rina = User::where('username', 'rina_wati')->firstOrFail();
        $this->post('/logout');

        $this->actingAs($this->admin)->post("/admin/siswa/{$rina->id}/status", ['status' => 'perlu_perbaikan', 'catatan_admin' => 'Foto KK buram.']);

        $logs = ActivityLog::orderBy('id')->get();
        $this->assertSame(['akun.daftar', 'status.ubah'], $logs->pluck('action')->all());
        $this->assertSame($rina->id, $logs[0]->causer_id);
        $this->assertSame($this->admin->id, $logs[1]->causer_id);
        $this->assertSame($rina->id, $logs[1]->subject_id);
        $this->assertSame('Mengubah status Rina Wati dari Pengisian Data menjadi Perlu Perbaikan', $logs[1]->description);
        $this->assertSame('Foto KK buram.', $logs[1]->properties['catatan']);

        $this->actingAs($this->admin)->get('/admin/log?oleh=panitia')->assertInertia(fn (Assert $page) => $page
            ->component('Admin/ActivityLogs/Index')
            ->has('logs.data', 1)
            ->where('logs.data.0.causer.name', 'Bu Siti')
            ->where('logs.data.0.subject.name', 'Rina Wati'));
        $this->actingAs($this->admin)->get('/admin/log?q=Rina')->assertInertia(fn (Assert $page) => $page->has('logs.data', 2));

        $this->actingAs($this->admin)->get("/admin/siswa/{$rina->id}")->assertInertia(fn (Assert $page) => $page
            ->has('activity', 2)
            ->where('activity.0.action', 'status.ubah'));
    }

    public function test_admin_accounts_are_managed_from_the_panel(): void
    {
        $this->actingAs($this->admin)->post('/admin/panitia', [
            'name' => 'Pak Ahmad', 'username' => 'ahmad_tu', 'email' => 'ahmad@example.com',
            'password' => 'rahasia123', 'password_confirmation' => 'rahasia123',
        ])->assertSessionHas('success');

        $ahmad = User::where('username', 'ahmad_tu')->firstOrFail();
        $this->assertTrue($ahmad->isAdmin());
        $this->assertNull($ahmad->jenjang);

        $this->actingAs($this->admin)->get('/admin/panitia')->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Admins/Index')
            ->has('admins', 2));

        $this->actingAs($this->admin)->post("/admin/panitia/{$ahmad->id}/password", ['password' => 'baru12345', 'password_confirmation' => 'baru12345'])
            ->assertSessionHas('success');
        $this->post('/logout');
        $this->post('/login', ['username' => 'ahmad_tu', 'password' => 'baru12345'])->assertRedirect('/admin');

        // Nobody deletes their own account, so there is always an admin left.
        $this->actingAs($ahmad)->delete("/admin/panitia/{$ahmad->id}")->assertSessionHas('error');
        $this->actingAs($ahmad)->delete("/admin/panitia/{$this->admin->id}")->assertSessionHas('success');
        $this->assertNull($this->admin->fresh());
        $this->assertDatabaseHas('activity_logs', ['action' => 'panitia.hapus', 'causer_id' => $ahmad->id]);

        // Student accounts are not handled here.
        $student = User::factory()->create();
        $this->actingAs($ahmad)->post("/admin/panitia/{$student->id}/password", ['password' => 'baru12345', 'password_confirmation' => 'baru12345'])
            ->assertNotFound();
        $this->actingAs($student)->get('/admin/panitia')->assertRedirect('/dashboard');
    }

    public function test_status_changes_without_a_change_are_not_logged(): void
    {
        $student = $this->student(Jenjang::MA, 'Siti');
        $student->forceFill(['status' => StatusPendaftaran::MenungguVerifikasi])->save();

        $this->actingAs($this->admin)->post("/admin/siswa/{$student->id}/status", ['status' => 'menunggu_verifikasi']);

        $this->assertDatabaseCount('activity_logs', 0);
    }
}
