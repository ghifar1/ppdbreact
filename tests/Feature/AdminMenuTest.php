<?php

namespace Tests\Feature;

use App\Enums\FieldType;
use App\Enums\Jenjang;
use App\Models\FormAnswer;
use App\Models\FormField;
use App\Models\Menu;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminMenuTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->admin()->create();
    }

    public function test_menus_are_listed_per_jenjang(): void
    {
        Menu::create(['jenjang' => Jenjang::MI, 'title' => 'Data MI', 'sort_order' => 1]);
        Menu::create(['jenjang' => Jenjang::MA, 'title' => 'Data MA', 'sort_order' => 1]);

        $this->actingAs($this->admin)->get('/admin/menu?jenjang=ma')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Menus/Index')
                ->where('jenjang', 'ma')
                ->has('menus', 1)
                ->where('menus.0.title', 'Data MA'));
    }

    public function test_admin_can_create_rename_hide_and_delete_a_menu(): void
    {
        $this->actingAs($this->admin)
            ->post('/admin/menu', ['jenjang' => 'mts', 'title' => 'Data Kesehatan'])
            ->assertRedirect();

        $menu = Menu::where('title', 'Data Kesehatan')->firstOrFail();
        $this->assertSame(Jenjang::MTs, $menu->jenjang);
        $this->assertTrue($menu->is_active);

        $this->actingAs($this->admin)
            ->put("/admin/menu/{$menu->id}", ['title' => 'Kesehatan', 'description' => 'Riwayat kesehatan', 'is_active' => true])
            ->assertSessionHas('success');
        $this->actingAs($this->admin)
            ->put("/admin/menu/{$menu->id}", ['is_active' => false])
            ->assertSessionHas('success', 'Menu "Kesehatan" disembunyikan dari siswa.');

        $menu->refresh();
        $this->assertSame('Kesehatan', $menu->title);
        $this->assertFalse($menu->is_active);

        $this->actingAs($this->admin)->delete("/admin/menu/{$menu->id}")
            ->assertRedirect('/admin/menu?jenjang=mts');
        $this->assertModelMissing($menu);
    }

    public function test_menus_can_be_reordered(): void
    {
        $first = Menu::create(['jenjang' => Jenjang::MI, 'title' => 'A', 'sort_order' => 1]);
        $second = Menu::create(['jenjang' => Jenjang::MI, 'title' => 'B', 'sort_order' => 2]);
        $otherJenjang = Menu::create(['jenjang' => Jenjang::MA, 'title' => 'C', 'sort_order' => 1]);

        $this->actingAs($this->admin)->post("/admin/menu/{$second->id}/move", ['direction' => 'up']);

        $this->assertSame(['B', 'A'], Menu::forJenjang(Jenjang::MI)->ordered()->pluck('title')->all());
        $this->assertSame(1, $otherJenjang->fresh()->sort_order);
    }

    public function test_admin_can_add_edit_reorder_and_delete_fields(): void
    {
        $menu = Menu::create(['jenjang' => Jenjang::MI, 'title' => 'Data Pribadi', 'sort_order' => 1]);

        $this->actingAs($this->admin)->post("/admin/menu/{$menu->id}/isian", [
            'label' => 'Nama Lengkap',
            'type' => 'text',
            'is_required' => true,
        ])->assertSessionHasNoErrors();

        $this->actingAs($this->admin)->post("/admin/menu/{$menu->id}/isian", [
            'label' => 'Agama',
            'type' => 'select',
            'options' => "Islam\n  Kristen \n\nIslam\nHindu",
        ])->assertSessionHasNoErrors();

        [$nama, $agama] = $menu->fields()->get()->all();
        $this->assertTrue($nama->is_required);
        $this->assertSame(FieldType::Select, $agama->type);
        $this->assertSame(['Islam', 'Kristen', 'Hindu'], $agama->options);

        $this->actingAs($this->admin)->put("/admin/isian/{$agama->id}", [
            'label' => 'Agama',
            'type' => 'text',
            'options' => "Islam\nKristen",
            'help_text' => 'Sesuai KK',
        ])->assertSessionHasNoErrors();
        $agama->refresh();
        $this->assertSame(FieldType::Text, $agama->type);
        $this->assertNull($agama->options);
        $this->assertSame('Sesuai KK', $agama->help_text);

        $this->actingAs($this->admin)->post("/admin/isian/{$agama->id}/move", ['direction' => 'up']);
        $this->assertSame(['Agama', 'Nama Lengkap'], $menu->fields()->pluck('label')->all());

        $this->actingAs($this->admin)->delete("/admin/isian/{$nama->id}");
        $this->assertModelMissing($nama);
    }

    public function test_choice_fields_need_options(): void
    {
        $menu = Menu::create(['jenjang' => Jenjang::MI, 'title' => 'Data', 'sort_order' => 1]);

        $this->actingAs($this->admin)->post("/admin/menu/{$menu->id}/isian", [
            'label' => 'Hobi',
            'type' => 'checkbox',
            'options' => "  \n ",
        ])->assertSessionHasErrors('options');

        $this->actingAs($this->admin)->post("/admin/menu/{$menu->id}/isian", [
            'label' => '',
            'type' => 'unknown',
        ])->assertSessionHasErrors(['label', 'type']);

        $this->assertSame(0, $menu->fields()->count());
    }

    public function test_switching_away_from_checkbox_clears_answers_that_no_longer_fit(): void
    {
        $menu = Menu::create(['jenjang' => Jenjang::MTs, 'title' => 'Data', 'sort_order' => 1]);
        $field = $menu->fields()->create(['label' => 'Hobi', 'type' => FieldType::Checkbox, 'options' => ['Membaca', 'Olahraga']]);
        $student = User::factory()->create();
        FormAnswer::create(['user_id' => $student->id, 'form_field_id' => $field->id, 'value' => '["Membaca"]']);

        $this->actingAs($this->admin)->put("/admin/isian/{$field->id}", ['label' => 'Hobi', 'type' => 'text']);

        $this->assertSame(0, FormAnswer::count());
    }

    public function test_students_cannot_change_menus(): void
    {
        $student = User::factory()->create();
        $menu = Menu::create(['jenjang' => Jenjang::MI, 'title' => 'Data', 'sort_order' => 1]);

        $this->actingAs($student)->post('/admin/menu', ['jenjang' => 'mi', 'title' => 'X'])->assertRedirect('/dashboard');
        $this->actingAs($student)->delete("/admin/menu/{$menu->id}")->assertRedirect('/dashboard');
        $this->actingAs($student)->post("/admin/menu/{$menu->id}/isian", ['label' => 'X', 'type' => 'text'])->assertRedirect('/dashboard');

        $this->assertSame(1, Menu::count());
        $this->assertSame(0, FormField::count());
    }
}
