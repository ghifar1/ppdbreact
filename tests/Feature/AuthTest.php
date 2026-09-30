<?php

namespace Tests\Feature;

use App\Enums\Jenjang;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_page_preselects_the_jenjang(): void
    {
        $this->get('/register?jenjang=ma')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Auth/Register')
                ->where('jenjang', 'ma')
                ->has('jenjangOptions', 3));
    }

    public function test_student_can_register_with_a_username(): void
    {
        $this->post('/register', [
            'jenjang' => 'mts',
            'name' => 'Budi Santoso',
            'username' => 'budi_s',
            'no_hp' => '081234567890',
            'password' => 'rahasia123',
            'password_confirmation' => 'rahasia123',
        ])->assertRedirect('/dashboard');

        $user = User::where('username', 'budi_s')->firstOrFail();
        $this->assertAuthenticatedAs($user);
        $this->assertSame(Jenjang::MTs, $user->jenjang);
        $this->assertFalse($user->isAdmin());
        $this->assertSame('pengisian_data', $user->status->value);
    }

    public function test_registration_validates_input_in_indonesian(): void
    {
        User::factory()->create(['username' => 'budi_s']);

        $this->from('/register')->post('/register', [
            'jenjang' => 'sd',
            'name' => '',
            'username' => 'budi_s',
            'no_hp' => 'abc',
            'password' => 'short',
            'password_confirmation' => 'other',
        ])->assertRedirect('/register')
            ->assertSessionHasErrors([
                'jenjang',
                'name' => 'nama lengkap wajib diisi.',
                'username' => 'username sudah digunakan.',
                'no_hp',
                'password',
            ]);

        $this->assertGuest();
    }

    public function test_student_logs_in_with_username_and_lands_on_dashboard(): void
    {
        $student = User::factory()->create(['username' => 'siti', 'password' => 'rahasia123']);

        $this->post('/login', ['username' => 'siti', 'password' => 'rahasia123'])
            ->assertRedirect('/dashboard');

        $this->assertAuthenticatedAs($student);
    }

    public function test_admin_lands_on_admin_dashboard(): void
    {
        $admin = User::factory()->admin()->create(['username' => 'panitia', 'password' => 'rahasia123']);

        $this->post('/login', ['username' => 'panitia', 'password' => 'rahasia123'])
            ->assertRedirect('/admin');

        $this->assertAuthenticatedAs($admin);
    }

    public function test_wrong_password_is_rejected(): void
    {
        User::factory()->create(['username' => 'siti', 'password' => 'rahasia123']);

        $this->from('/login')->post('/login', ['username' => 'siti', 'password' => 'salah'])
            ->assertRedirect('/login')
            ->assertSessionHasErrors(['username' => 'Username/email atau kata sandi salah.']);

        $this->assertGuest();
    }

    public function test_guests_are_sent_to_login(): void
    {
        $this->get('/dashboard')->assertRedirect('/login');
        $this->get('/admin')->assertRedirect('/login');
    }

    public function test_each_role_is_kept_in_its_own_area(): void
    {
        $student = User::factory()->create();
        $admin = User::factory()->admin()->create();

        $this->actingAs($student)->get('/admin')->assertRedirect('/dashboard');
        $this->actingAs($student)->get('/admin/menu')->assertRedirect('/dashboard');
        $this->actingAs($admin)->get('/dashboard')->assertRedirect('/admin');
        $this->actingAs($admin)->get('/login')->assertRedirect('/admin');
        $this->actingAs($admin)->get('/home')->assertRedirect('/admin');
    }

    public function test_admin_command_creates_an_admin(): void
    {
        $this->artisan('ppdb:admin', ['username' => 'panitia'])
            ->expectsQuestion('Name', 'Panitia PPDB')
            ->expectsQuestion('Password (min. 8 characters)', 'rahasia123')
            ->assertSuccessful();

        $this->assertTrue(User::where('username', 'panitia')->firstOrFail()->isAdmin());
    }
}
