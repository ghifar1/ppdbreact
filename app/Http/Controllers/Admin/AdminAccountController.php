<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The committee's accounts (akun panitia), as ppdb2020's AkunController.
 */
class AdminAccountController extends Controller
{
    public function index(Request $request): Response
    {
        $lastActive = ActivityLog::whereNotNull('causer_id')->selectRaw('causer_id, max(created_at) as last')->groupBy('causer_id')->pluck('last', 'causer_id');

        return Inertia::render('Admin/Admins/Index', [
            'admins' => User::where('role', User::ROLE_ADMIN)->orderBy('name')->get()->map(fn (User $admin) => [
                'id' => $admin->id,
                'name' => $admin->name,
                'username' => $admin->username,
                'email' => $admin->email,
                'photo_url' => $admin->photoUrl(),
                'created_at' => $admin->created_at?->translatedFormat('j M Y'),
                'last_active' => isset($lastActive[$admin->id]) ? Carbon::parse($lastActive[$admin->id])->diffForHumans() : null,
                'is_me' => $admin->id === $request->user()->id,
            ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'alpha_dash', 'min:4', 'max:30', 'unique:users'],
            'email' => ['nullable', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $admin = new User($data);
        $admin->forceFill(['role' => User::ROLE_ADMIN, 'jenjang' => null])->save();
        ActivityLog::record('panitia.buat', "Membuat akun panitia {$admin->name} (@{$admin->username})");

        return back()->with('success', "Akun panitia {$admin->name} dibuat.");
    }

    public function resetPassword(Request $request, User $admin): RedirectResponse
    {
        $this->ensureAdmin($admin);

        $data = $request->validate(['password' => ['required', 'string', 'min:8', 'confirmed']]);

        $admin->forceFill(['password' => $data['password']])->save();
        ActivityLog::record('panitia.reset_password', "Mengatur ulang password akun panitia {$admin->name}");

        return back()->with('success', "Password {$admin->name} diganti.");
    }

    public function destroy(Request $request, User $admin): RedirectResponse
    {
        $this->ensureAdmin($admin);

        // This also keeps at least one admin: the one deleting.
        if ($admin->is($request->user())) {
            return back()->with('error', 'Akunmu sendiri tidak bisa dihapus.');
        }

        $admin->delete();
        ActivityLog::record('panitia.hapus', "Menghapus akun panitia {$admin->name} (@{$admin->username})");

        return back()->with('success', "Akun panitia {$admin->name} dihapus.");
    }

    private function ensureAdmin(User $admin): void
    {
        abort_unless($admin->isAdmin(), 404);
    }
}
