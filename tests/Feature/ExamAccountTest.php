<?php

namespace Tests\Feature;

use App\Enums\Jenjang;
use App\Models\FormAnswer;
use App\Models\FormField;
use App\Models\User;
use Database\Seeders\MenuSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ExamAccountTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(MenuSeeder::class);
        $this->admin = User::factory()->admin()->create();
    }

    private function student(?string $nisn = null, string $status = 'menunggu_verifikasi'): User
    {
        $student = User::factory()->create(['jenjang' => Jenjang::MA]);
        $student->forceFill(['status' => $status])->save();

        if ($nisn !== null) {
            $field = FormField::where('key', 'nisn')->whereHas('menu', fn ($q) => $q->where('jenjang', 'ma'))->firstOrFail();
            FormAnswer::create(['user_id' => $student->id, 'form_field_id' => $field->id, 'value' => $nisn]);
        }

        return $student;
    }

    private function verify(User $student)
    {
        return $this->actingAs($this->admin)->post("/admin/siswa/{$student->id}/status", ['status' => 'terverifikasi']);
    }

    public function test_verifying_a_student_creates_an_exam_account_with_their_nisn(): void
    {
        $student = $this->student('0081234567');

        $this->verify($student)->assertSessionHas('success');

        $student->refresh();
        $this->assertSame('0081234567', $student->exam_username);
        $this->assertMatchesRegularExpression('/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{10}$/', $student->exam_password);

        // Readable in the app, encrypted in the database.
        $stored = DB::table('users')->where('id', $student->id)->value('exam_password');
        $this->assertNotSame($student->exam_password, $stored);
        $this->assertArrayNotHasKey('exam_password', $student->toArray());

        // Changing the status again keeps the account.
        $password = $student->exam_password;
        $this->actingAs($this->admin)->post("/admin/siswa/{$student->id}/status", ['status' => 'lulus']);
        $this->assertSame($password, $student->fresh()->exam_password);
    }

    public function test_username_falls_back_to_the_registration_number(): void
    {
        $withoutNisn = $this->student();
        $this->student('0081234567', 'terverifikasi')->forceFill(['exam_username' => '0081234567', 'exam_password' => 'X'])->save();
        $duplicate = $this->student('0081234567');

        $this->verify($withoutNisn);
        $this->verify($duplicate);

        $this->assertSame($withoutNisn->nomorPendaftaran(), $withoutNisn->fresh()->exam_username);
        $this->assertSame($duplicate->nomorPendaftaran(), $duplicate->fresh()->exam_username);
    }

    public function test_exam_card_shows_the_account_and_creates_missing_ones(): void
    {
        $student = $this->student('0081234567', 'terverifikasi');

        $this->actingAs($student)->get('/kartu')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('User/Kartu')
            ->where('kartu.exam_username', '0081234567')
            ->where('kartu.exam_password', fn ($password) => strlen($password) === 10));
    }

    public function test_admin_can_reset_a_password_and_create_missing_accounts(): void
    {
        $verified = $this->student('0081111111', 'terverifikasi');
        $passed = $this->student('0082222222', 'lulus');
        $waiting = $this->student('0083333333');

        $this->actingAs($this->admin)->get('/admin/akun-ujian')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Admin/ExamAccounts/Index')
            ->where('missing', 2)
            ->has('students.data', 2));

        $this->actingAs($this->admin)->post('/admin/akun-ujian')->assertSessionHas('success', '2 akun ujian dibuat.');
        $this->assertNotNull($verified->fresh()->exam_username);
        $this->assertNotNull($passed->fresh()->exam_username);
        $this->assertNull($waiting->fresh()->exam_username);

        $old = $verified->fresh()->exam_password;
        $this->actingAs($this->admin)->post("/admin/siswa/{$verified->id}/akun-ujian")
            ->assertSessionHas('success', "Password akun ujian {$verified->name} diganti.");
        $this->assertNotSame($old, $verified->fresh()->exam_password);
        $this->assertSame('0081111111', $verified->fresh()->exam_username);

        $this->actingAs($this->admin)->post("/admin/siswa/{$waiting->id}/akun-ujian")->assertSessionHas('error');
        $this->assertNull($waiting->fresh()->exam_username);
    }

    public function test_export_lists_accounts_for_the_exam_system(): void
    {
        $student = $this->student('0081234567');
        $fields = FormField::whereHas('menu', fn ($q) => $q->where('jenjang', 'ma'))->pluck('id', 'key');
        foreach (['jenis_kelamin' => 'Perempuan', 'tempat_lahir' => 'Bogor', 'tanggal_lahir' => '2009-05-17', 'nama_sekolah' => 'MTs Nurul Huda'] as $key => $value) {
            FormAnswer::create(['user_id' => $student->id, 'form_field_id' => $fields[$key], 'value' => $value]);
        }
        $this->verify($student);
        $student->refresh();

        $csv = $this->actingAs($this->admin)->get('/admin/akun-ujian/unduh?jenjang=ma')->assertOk()->streamedContent();
        $rows = array_map(fn (string $line) => str_getcsv($line, escape: ''), array_values(array_filter(explode("\n", $csv))));

        $this->assertSame(['no_pendaftaran', 'username', 'password', 'nama', 'jenjang', 'nisn', 'asal_sekolah', 'jenis_kelamin', 'tempat_lahir', 'tanggal_lahir'], $rows[0]);
        $this->assertSame([
            $student->nomorPendaftaran(), '0081234567', $student->exam_password, $student->name, 'MA',
            '0081234567', 'MTs Nurul Huda', 'P', 'Bogor', '17-05-2009',
        ], $rows[1]);
    }

    public function test_student_detail_shows_the_account(): void
    {
        $student = $this->student('0081234567');
        $this->verify($student);

        $this->actingAs($this->admin)->get("/admin/siswa/{$student->id}")->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('student.exam_username', '0081234567')
            ->where('student.exam_eligible', true));
    }

    public function test_students_cannot_see_exam_accounts(): void
    {
        $student = $this->student();

        $this->actingAs($student)->get('/admin/akun-ujian')->assertRedirect('/dashboard');
        $this->actingAs($student)->get('/admin/akun-ujian/unduh')->assertRedirect('/dashboard');
    }
}
