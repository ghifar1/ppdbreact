<?php

namespace Tests\Feature;

use App\Enums\FieldType;
use App\Enums\Jenjang;
use App\Enums\StatusPendaftaran;
use App\Models\FormAnswer;
use App\Models\Menu;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class StudentFormTest extends TestCase
{
    use RefreshDatabase;

    private User $student;

    private Menu $pribadi;

    private Menu $berkas;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('local');

        $this->student = User::factory()->create(['jenjang' => Jenjang::MTs]);

        $this->pribadi = Menu::create(['jenjang' => Jenjang::MTs, 'title' => 'Data Pribadi', 'sort_order' => 1]);
        $this->pribadi->fields()->createMany([
            ['label' => 'Nama Lengkap', 'type' => FieldType::Text, 'is_required' => true, 'sort_order' => 1],
            ['label' => 'Jenis Kelamin', 'type' => FieldType::Select, 'options' => ['Laki-Laki', 'Perempuan'], 'is_required' => true, 'sort_order' => 2],
            ['label' => 'Tanggal Lahir', 'type' => FieldType::Date, 'sort_order' => 3],
            ['label' => 'Hobi', 'type' => FieldType::Checkbox, 'options' => ['Membaca', 'Olahraga', 'Musik'], 'sort_order' => 4],
        ]);

        $this->berkas = Menu::create(['jenjang' => Jenjang::MTs, 'title' => 'Berkas', 'sort_order' => 2]);
        $this->berkas->fields()->create(['label' => 'Kartu Keluarga', 'type' => FieldType::File, 'is_required' => true]);

        // Menus the student must never see.
        Menu::create(['jenjang' => Jenjang::MTs, 'title' => 'Tersembunyi', 'sort_order' => 3, 'is_active' => false]);
        Menu::create(['jenjang' => Jenjang::MA, 'title' => 'Khusus MA', 'sort_order' => 1]);
    }

    private function field(Menu $menu, string $label): int
    {
        return $menu->fields()->where('label', $label)->value('id');
    }

    private function fillPribadi(): void
    {
        $this->actingAs($this->student)->post("/formulir/{$this->pribadi->id}", ['answers' => [
            $this->field($this->pribadi, 'Nama Lengkap') => 'Siti Aminah',
            $this->field($this->pribadi, 'Jenis Kelamin') => 'Perempuan',
            $this->field($this->pribadi, 'Tanggal Lahir') => '2012-05-17',
            $this->field($this->pribadi, 'Hobi') => ['Membaca', 'Musik'],
        ]])->assertSessionHasNoErrors();
    }

    private function uploadKk(): void
    {
        $this->actingAs($this->student)->post("/formulir/{$this->berkas->id}", ['answers' => [
            $this->field($this->berkas, 'Kartu Keluarga') => UploadedFile::fake()->create('kk.pdf', 200, 'application/pdf'),
        ]])->assertSessionHasNoErrors();
    }

    public function test_sidebar_shows_only_active_menus_of_own_jenjang(): void
    {
        $this->actingAs($this->student)->get('/dashboard')
            ->assertInertia(fn (Assert $page) => $page
                ->component('User/Dashboard/Index')
                ->has('studentMenus', 2)
                ->where('studentMenus.0.title', 'Data Pribadi')
                ->where('studentMenus.0.complete', false)
                ->where('studentMenus.1.title', 'Berkas')
                ->where('dataLengkap', false));

        $hidden = Menu::where('title', 'Tersembunyi')->first();
        $otherJenjang = Menu::where('title', 'Khusus MA')->first();
        $this->actingAs($this->student)->get("/formulir/{$hidden->id}")->assertNotFound();
        $this->actingAs($this->student)->get("/formulir/{$otherJenjang->id}")->assertNotFound();
        $this->actingAs($this->student)->post("/formulir/{$otherJenjang->id}", ['answers' => []])->assertNotFound();
    }

    public function test_form_page_renders_the_admin_defined_fields(): void
    {
        $this->actingAs($this->student)->get("/formulir/{$this->pribadi->id}")
            ->assertInertia(fn (Assert $page) => $page
                ->component('User/Form')
                ->where('menu.title', 'Data Pribadi')
                ->has('fields', 4)
                ->where('fields.1.type', 'select')
                ->where('fields.1.options', ['Laki-Laki', 'Perempuan'])
                ->where('fields.0.required', true)
                ->where('canEdit', true));
    }

    public function test_answers_are_validated_with_field_labels(): void
    {
        $this->actingAs($this->student)->post("/formulir/{$this->pribadi->id}", ['answers' => [
            $this->field($this->pribadi, 'Nama Lengkap') => '',
            $this->field($this->pribadi, 'Jenis Kelamin') => 'Lainnya',
            $this->field($this->pribadi, 'Tanggal Lahir') => 'bukan tanggal',
            $this->field($this->pribadi, 'Hobi') => ['Menari'],
        ]])->assertSessionHasErrors([
            'answers.'.$this->field($this->pribadi, 'Nama Lengkap') => 'Nama Lengkap wajib diisi.',
            'answers.'.$this->field($this->pribadi, 'Jenis Kelamin') => 'Jenis Kelamin yang dipilih tidak valid.',
            'answers.'.$this->field($this->pribadi, 'Tanggal Lahir'),
            'answers.'.$this->field($this->pribadi, 'Hobi').'.0',
        ]);

        $this->assertSame(0, FormAnswer::count());
    }

    public function test_answers_are_saved_and_shown_again(): void
    {
        $this->fillPribadi();

        $this->actingAs($this->student)->get("/formulir/{$this->pribadi->id}")
            ->assertInertia(fn (Assert $page) => $page
                ->where('values.'.$this->field($this->pribadi, 'Nama Lengkap'), 'Siti Aminah')
                ->where('values.'.$this->field($this->pribadi, 'Hobi'), ['Membaca', 'Musik'])
                ->where('studentMenus.0.complete', true)
                ->where('studentMenus.1.complete', false));
    }

    public function test_files_are_stored_privately_and_only_visible_to_owner_and_admin(): void
    {
        $this->uploadKk();

        $answer = FormAnswer::firstOrFail();
        $path = json_decode($answer->value, true)['path'];
        Storage::disk('local')->assertExists($path);

        $this->actingAs($this->student)->get("/berkas/{$answer->id}")->assertOk();
        $this->actingAs(User::factory()->admin()->create())->get("/berkas/{$answer->id}")->assertOk();
        $this->actingAs(User::factory()->create())->get("/berkas/{$answer->id}")->assertForbidden();

        // Submitting again without a new file keeps the stored one.
        $this->actingAs($this->student)->post("/formulir/{$this->berkas->id}", ['answers' => []])->assertSessionHasNoErrors();
        Storage::disk('local')->assertExists($path);

        // Uploading a replacement removes the old file.
        $this->uploadKk();
        Storage::disk('local')->assertMissing($path);
    }

    public function test_files_must_be_images_or_pdf_up_to_2mb(): void
    {
        $id = $this->field($this->berkas, 'Kartu Keluarga');

        $this->actingAs($this->student)->post("/formulir/{$this->berkas->id}", ['answers' => [
            $id => UploadedFile::fake()->create('virus.exe', 10),
        ]])->assertSessionHasErrors("answers.{$id}");

        $this->actingAs($this->student)->post("/formulir/{$this->berkas->id}", ['answers' => [
            $id => UploadedFile::fake()->create('besar.pdf', 3000, 'application/pdf'),
        ]])->assertSessionHasErrors("answers.{$id}");
    }

    public function test_finalisasi_requires_every_required_field(): void
    {
        $this->fillPribadi();

        $this->actingAs($this->student)->post('/finalisasi')->assertSessionHas('error');
        $this->assertSame(StatusPendaftaran::PengisianData, $this->student->fresh()->status);

        $this->uploadKk();
        $this->actingAs($this->student)->post('/finalisasi')->assertSessionHas('success');

        $student = $this->student->fresh();
        $this->assertSame(StatusPendaftaran::MenungguVerifikasi, $student->status);
        $this->assertNotNull($student->finalized_at);
    }

    public function test_finalised_data_is_locked_until_admin_asks_for_fixes(): void
    {
        $this->fillPribadi();
        $this->uploadKk();
        $this->actingAs($this->student)->post('/finalisasi');
        $nama = $this->field($this->pribadi, 'Nama Lengkap');

        $this->actingAs($this->student)->post("/formulir/{$this->pribadi->id}", ['answers' => [$nama => 'Nama Lain']])
            ->assertSessionHas('error');
        $this->assertSame('Siti Aminah', FormAnswer::where('form_field_id', $nama)->value('value'));

        $admin = User::factory()->admin()->create();
        $this->actingAs($admin)->post("/admin/siswa/{$this->student->id}/status", ['status' => 'perlu_perbaikan'])
            ->assertSessionHasErrors('catatan_admin');
        $this->actingAs($admin)->post("/admin/siswa/{$this->student->id}/status", [
            'status' => 'perlu_perbaikan',
            'catatan_admin' => 'Nama belum sesuai akta.',
        ])->assertSessionHasNoErrors();

        $this->student->refresh();
        $this->actingAs($this->student)->get('/dashboard')
            ->assertInertia(fn (Assert $page) => $page
                ->where('profil.status', 'perlu_perbaikan')
                ->where('profil.catatan_admin', 'Nama belum sesuai akta.'));

        $this->actingAs($this->student)->post("/formulir/{$this->pribadi->id}", ['answers' => [
            $nama => 'Siti Aminah Putri',
            $this->field($this->pribadi, 'Jenis Kelamin') => 'Perempuan',
        ]])->assertSessionHas('success');
        $this->assertSame('Siti Aminah Putri', FormAnswer::where('form_field_id', $nama)->value('value'));
    }

    public function test_exam_card_is_available_after_verification(): void
    {
        $this->actingAs($this->student)->get('/kartu')->assertRedirect('/dashboard');

        $this->student->forceFill(['status' => StatusPendaftaran::Terverifikasi])->save();

        $this->actingAs($this->student)->get('/kartu')
            ->assertInertia(fn (Assert $page) => $page
                ->component('User/Kartu')
                ->where('kartu.nomor_pendaftaran', $this->student->nomorPendaftaran()));
    }

    public function test_admin_sees_student_answers_and_can_reset_password(): void
    {
        $this->fillPribadi();
        $this->uploadKk();
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->get("/admin/siswa/{$this->student->id}")
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Students/Show')
                ->where('student.username', $this->student->username)
                ->where('menus.0.complete', true)
                ->where('menus.0.fields.0.value', 'Siti Aminah')
                ->where('menus.0.fields.3.value', 'Membaca, Musik')
                ->where('menus.1.fields.0.file.name', 'kk.pdf'));

        $this->actingAs($admin)->get('/admin/siswa?jenjang=mts&q=Siti')->assertOk();
        $this->actingAs($admin)->get("/admin/siswa/{$admin->id}")->assertNotFound();

        $this->actingAs($admin)->post("/admin/siswa/{$this->student->id}/password", [
            'password' => 'passwordbaru',
            'password_confirmation' => 'passwordbaru',
        ])->assertSessionHasNoErrors();

        $this->post('/logout');
        $this->post('/login', ['username' => $this->student->username, 'password' => 'passwordbaru'])
            ->assertRedirect('/dashboard');
    }

    public function test_admin_dashboard_counts_students(): void
    {
        User::factory()->count(2)->create(['jenjang' => Jenjang::MI]);
        User::factory()->create(['jenjang' => Jenjang::MI, 'status' => StatusPendaftaran::MenungguVerifikasi]);

        $this->actingAs(User::factory()->admin()->create())->get('/admin')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Dashboard')
                ->where('total', 4)
                ->where('jenjang.0.total', 3)
                ->where('jenjang.0.menunggu', 1)
                ->where('jenjang.1.total', 1));
    }
}
