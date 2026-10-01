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
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AccountSettingsTest extends TestCase
{
    use RefreshDatabase;

    private User $student;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('local');
        $this->student = User::factory()->create(['jenjang' => Jenjang::MTs, 'name' => 'Siti Aminah', 'password' => 'rahasia123']);
    }

    private function submitted(): void
    {
        $this->student->forceFill(['status' => StatusPendaftaran::MenungguVerifikasi])->save();
    }

    public function test_student_updates_contact_details_and_name(): void
    {
        $this->actingAs($this->student)->get('/akun')->assertInertia(fn (Assert $page) => $page
            ->component('Account')
            ->where('account.is_admin', false)
            ->where('account.can_change_name', true));

        $this->actingAs($this->student)->put('/akun', ['name' => 'Siti Aminah Zahra', 'no_hp' => '081299998888', 'email' => 'siti@example.com'])
            ->assertSessionHas('success');

        $this->student->refresh();
        $this->assertSame('Siti Aminah Zahra', $this->student->name);
        $this->assertSame('081299998888', $this->student->no_hp);
        $this->assertSame('siti@example.com', $this->student->email);
        $this->assertDatabaseHas('activity_logs', ['action' => 'akun.ubah', 'subject_id' => $this->student->id]);
    }

    public function test_name_is_fixed_once_data_is_submitted(): void
    {
        $this->submitted();

        $this->actingAs($this->student)->put('/akun', ['name' => 'Nama Lain', 'no_hp' => '081299998888'])->assertSessionHas('success');

        $this->assertSame('Siti Aminah', $this->student->fresh()->name);
        $this->assertSame('081299998888', $this->student->fresh()->no_hp);
    }

    public function test_email_must_be_unique(): void
    {
        User::factory()->create(['email' => 'dipakai@example.com']);

        $this->actingAs($this->student)->put('/akun', ['name' => 'Siti', 'no_hp' => '0812', 'email' => 'dipakai@example.com'])
            ->assertSessionHasErrors('email');
    }

    public function test_password_change_needs_the_current_password(): void
    {
        $this->actingAs($this->student)->put('/akun/password', [
            'current_password' => 'salah123', 'password' => 'barubaru1', 'password_confirmation' => 'barubaru1',
        ])->assertSessionHasErrors(['current_password' => 'Password lama salah.']);

        $payment = $this->student->payment()->create(['method' => 'transfer', 'status' => 'diterima', 'account_password' => 'KODELAMA12']);

        $this->actingAs($this->student)->put('/akun/password', [
            'current_password' => 'rahasia123', 'password' => 'barubaru1', 'password_confirmation' => 'barubaru1',
        ])->assertSessionHas('success');

        $this->assertTrue(Hash::check('barubaru1', $this->student->fresh()->password));
        $this->assertNull($payment->fresh()->account_password);
    }

    public function test_profile_photo_is_private_and_shown_on_the_exam_card(): void
    {
        $this->actingAs($this->student)->post('/akun/foto', ['photo' => UploadedFile::fake()->image('foto.jpg', 300, 400)])
            ->assertSessionHas('success');

        $this->student->refresh();
        Storage::disk('local')->assertExists($this->student->photo_path);
        $url = $this->student->photoUrl();

        $this->actingAs($this->student)->get($url)->assertOk();
        $this->actingAs(User::factory()->admin()->create())->get($url)->assertOk();
        $this->actingAs(User::factory()->create())->get($url)->assertForbidden();

        $this->student->forceFill(['status' => StatusPendaftaran::Terverifikasi])->save();
        $this->actingAs($this->student)->get('/kartu')->assertInertia(fn (Assert $page) => $page->where('kartu.photo_url', $url));
        $this->actingAs($this->student)->get('/dashboard')->assertInertia(fn (Assert $page) => $page
            ->where('profil.photo_url', $url)
            ->where('auth.user.photo_url', $url));
    }

    public function test_photo_can_be_added_but_not_replaced_after_submission(): void
    {
        $this->submitted();

        $this->actingAs($this->student)->post('/akun/foto', ['photo' => UploadedFile::fake()->image('foto.jpg')])->assertSessionHas('success');
        $first = $this->student->fresh()->photo_path;

        $this->actingAs($this->student)->post('/akun/foto', ['photo' => UploadedFile::fake()->image('lain.jpg')])->assertSessionHas('error');
        $this->actingAs($this->student)->delete('/akun/foto')->assertSessionHas('error');
        $this->assertSame($first, $this->student->fresh()->photo_path);
    }

    public function test_photo_must_be_an_image(): void
    {
        $this->actingAs($this->student)->post('/akun/foto', ['photo' => UploadedFile::fake()->create('foto.pdf', 10)])
            ->assertSessionHasErrors('photo');
    }

    public function test_photo_can_be_removed_while_editing(): void
    {
        $this->actingAs($this->student)->post('/akun/foto', ['photo' => UploadedFile::fake()->image('foto.jpg')]);
        $path = $this->student->fresh()->photo_path;

        $this->actingAs($this->student)->delete('/akun/foto')->assertSessionHas('success');

        $this->assertNull($this->student->fresh()->photo_path);
        Storage::disk('local')->assertMissing($path);
    }

    public function test_admins_use_the_same_page(): void
    {
        $admin = User::factory()->admin()->create(['password' => 'rahasia123']);

        $this->actingAs($admin)->get('/akun')->assertInertia(fn (Assert $page) => $page->where('account.is_admin', true));
        $this->actingAs($admin)->put('/akun', ['name' => 'Bu Siti', 'email' => ''])->assertSessionHas('success');
        $this->assertSame('Bu Siti', $admin->fresh()->name);
    }

    public function test_student_deletes_an_optional_file_but_not_a_required_one(): void
    {
        $menu = Menu::create(['jenjang' => Jenjang::MTs, 'title' => 'Berkas', 'sort_order' => 1]);
        $optional = $menu->fields()->create(['label' => 'Sertifikat', 'type' => FieldType::File]);
        $required = $menu->fields()->create(['label' => 'Kartu Keluarga', 'type' => FieldType::File, 'is_required' => true]);

        foreach ([$optional, $required] as $field) {
            Storage::disk('local')->put("ppdb/{$this->student->id}/{$field->id}.pdf", 'isi');
            FormAnswer::create(['user_id' => $this->student->id, 'form_field_id' => $field->id,
                'value' => json_encode(['path' => "ppdb/{$this->student->id}/{$field->id}.pdf", 'name' => 'berkas.pdf'])]);
        }

        $this->actingAs($this->student)->delete("/formulir/{$menu->id}/berkas/{$required->id}")->assertSessionHas('error');
        Storage::disk('local')->assertExists("ppdb/{$this->student->id}/{$required->id}.pdf");

        $this->actingAs($this->student)->delete("/formulir/{$menu->id}/berkas/{$optional->id}")->assertSessionHas('success');
        Storage::disk('local')->assertMissing("ppdb/{$this->student->id}/{$optional->id}.pdf");
        $this->assertNull(FormAnswer::where('form_field_id', $optional->id)->value('value'));
        $this->assertDatabaseHas('activity_logs', ['action' => 'berkas.hapus', 'subject_id' => $this->student->id]);

        // Locked once submitted.
        FormAnswer::where('form_field_id', $optional->id)->update(['value' => json_encode(['path' => 'x.pdf', 'name' => 'x.pdf'])]);
        $this->submitted();
        $this->actingAs($this->student)->delete("/formulir/{$menu->id}/berkas/{$optional->id}")->assertSessionHas('error');
    }
}
