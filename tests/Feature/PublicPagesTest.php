<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PublicPagesTest extends TestCase
{
    use RefreshDatabase;

    public function test_landing_page_lists_jenjang_schedule_and_school_identity(): void
    {
        config([
            'ppdb.sekolah.nama' => 'Madrasah Contoh',
            'ppdb.sekolah.logo' => 'images/logo.png',
            'ppdb.tahun' => '2027/2028',
        ]);

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Welcome')
                ->has('jenjangOptions', 3)
                ->has('jadwal.pengisian')
                ->where('sekolah.nama', 'Madrasah Contoh')
                ->where('sekolah.tahun', '2027/2028')
                ->where('sekolah.logo', asset('images/logo.png')));
    }

    public function test_school_logo_is_null_when_not_configured(): void
    {
        config(['ppdb.sekolah.logo' => null]);

        $this->get('/help')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Guess/Help')
                ->has('jadwal')
                ->where('sekolah.logo', null));
    }
}
