<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Account settings for students and admins (ppdb2020's "ubah akun"): name,
 * contact details, password and profile photo.
 */
class AccountController extends Controller
{
    public function edit(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Account', [
            'account' => [
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email ?? '',
                'no_hp' => $user->no_hp ?? '',
                'photo_url' => $user->photoUrl(),
                'is_admin' => $user->isAdmin(),
                'can_change_name' => $this->canChangeName($user),
                'can_change_photo' => $this->canChangePhoto($user),
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => [Rule::requiredIf($this->canChangeName($user)), 'nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'no_hp' => [Rule::requiredIf(! $user->isAdmin()), 'nullable', 'string', 'max:30', 'regex:/^[0-9+\-\s()]+$/'],
        ], [], ['no_hp' => 'nomor HP']);

        $user->fill([
            'email' => $data['email'] ?? null,
            'no_hp' => $data['no_hp'] ?? $user->no_hp,
        ]);

        if ($this->canChangeName($user)) {
            $user->name = $data['name'];
        }

        if ($user->isDirty()) {
            $changes = array_keys($user->getDirty());
            $user->save();
            ActivityLog::record('akun.ubah', 'Mengubah data akun ('.implode(', ', $this->labels($changes)).')', $user->isAdmin() ? null : $user);
        }

        return back()->with('success', 'Data akun disimpan.');
    }

    public function updatePassword(Request $request): RedirectResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'string', 'min:8', 'confirmed', 'different:current_password'],
        ], [
            'current_password.current_password' => 'Password lama salah.',
            'password.different' => 'Password baru harus berbeda dari password lama.',
        ], ['current_password' => 'password lama', 'password' => 'password baru']);

        $user->forceFill(['password' => $data['password']])->save();
        // The first password, shown on the registration status page, no longer works.
        Payment::where('user_id', $user->id)->update(['account_password' => null]);
        ActivityLog::record('akun.password', 'Mengganti password', $user->isAdmin() ? null : $user);

        return back()->with('success', 'Password diganti. Gunakan password baru saat masuk berikutnya.');
    }

    public function updatePhoto(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (! $this->canChangePhoto($user)) {
            return back()->with('error', 'Foto tidak bisa diganti setelah data diajukan. Hubungi panitia jika perlu diganti.');
        }

        $data = $request->validate(['photo' => ['required', 'image', 'mimes:jpg,jpeg,png', 'max:2048']], [], ['photo' => 'foto']);

        $old = $user->photo_path;
        $user->forceFill(['photo_path' => $data['photo']->store("ppdb/{$user->id}/foto", 'local')])->save();

        if ($old) {
            Storage::disk('local')->delete($old);
        }

        ActivityLog::record('akun.foto', 'Mengganti foto profil', $user->isAdmin() ? null : $user);

        return back()->with('success', 'Foto profil disimpan.');
    }

    public function destroyPhoto(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (! $user->photo_path) {
            return back();
        }

        if (! $user->isAdmin() && ! $user->status->canEdit()) {
            return back()->with('error', 'Foto tidak bisa dihapus setelah data diajukan.');
        }

        Storage::disk('local')->delete($user->photo_path);
        $user->forceFill(['photo_path' => null])->save();
        ActivityLog::record('akun.foto', 'Menghapus foto profil', $user->isAdmin() ? null : $user);

        return back()->with('success', 'Foto profil dihapus.');
    }

    /**
     * A profile photo. Students see their own; admins see everyone's.
     */
    public function photo(Request $request, User $user): StreamedResponse
    {
        abort_unless($request->user()->isAdmin() || $request->user()->is($user), 403);
        abort_unless($user->photo_path && Storage::disk('local')->exists($user->photo_path), 404);

        return Storage::disk('local')->response($user->photo_path, headers: ['Cache-Control' => 'private, max-age=86400']);
    }

    /**
     * The name is printed on the exam card and letter, so it is fixed once
     * the student's data has been submitted.
     */
    private function canChangeName(User $user): bool
    {
        return $user->isAdmin() || $user->status->canEdit();
    }

    /**
     * Likewise the photo (shown on the exam card), though one can still be added.
     */
    private function canChangePhoto(User $user): bool
    {
        return $user->isAdmin() || $user->status->canEdit() || ! $user->photo_path;
    }

    /**
     * @param  list<string>  $columns
     * @return list<string>
     */
    private function labels(array $columns): array
    {
        return array_map(fn (string $column) => ['name' => 'nama', 'email' => 'email', 'no_hp' => 'nomor HP'][$column] ?? $column, $columns);
    }
}
