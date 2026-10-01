<?php

namespace Tests\Concerns;

use App\Enums\FieldType;
use App\Enums\Jenjang;
use App\Enums\StatusPendaftaran;
use App\Models\FormAnswer;
use App\Models\Menu;
use App\Models\User;

/**
 * Students of one jenjang whose forms are a single required field.
 */
trait AdmissionStudents
{
    protected function studentMenu(Jenjang $jenjang = Jenjang::MA): Menu
    {
        $menu = Menu::firstOrCreate(['jenjang' => $jenjang, 'title' => 'Data Pribadi'], ['sort_order' => 1]);
        $menu->fields()->firstOrCreate(['key' => 'nama_sekolah'], [
            'label' => 'Asal Sekolah', 'type' => FieldType::Text, 'is_required' => true, 'sort_order' => 1,
        ]);

        return $menu;
    }

    /**
     * A student with every required field filled in.
     */
    protected function completeStudent(
        StatusPendaftaran $status = StatusPendaftaran::PengisianData,
        Jenjang $jenjang = Jenjang::MA,
        array $attributes = [],
    ): User {
        $menu = $this->studentMenu($jenjang);
        $student = User::factory()->create(['jenjang' => $jenjang] + $attributes);
        $student->forceFill(['status' => $status])->save();

        FormAnswer::create(['user_id' => $student->id, 'form_field_id' => $menu->fields->first()->id, 'value' => 'MTs Negeri 1']);

        return $student;
    }
}
