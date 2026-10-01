<?php

namespace App\Http\Middleware;

use App\Services\Admission;
use App\Services\FormService;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $student = $user && ! $user->isAdmin() ? $user : null;

        return [
            ...parent::share($request),
            'auth' => [
                'user' => fn () => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'photo_url' => $user->photoUrl(),
                    'isAdmin' => $user->isAdmin(),
                    'jenjang' => $user->jenjang?->shortLabel(),
                    'jenjang_kode' => $user->jenjang?->value,
                    // Students do not see a result before it is announced.
                    'status' => ($student ? app(Admission::class)->visibleStatus($student) : $user->status)->value,
                ] : null,
            ],
            'sekolah' => fn () => [
                ...config('ppdb.sekolah'),
                'logo' => config('ppdb.sekolah.logo') ? asset(config('ppdb.sekolah.logo')) : null,
                'tahun' => config('ppdb.tahun'),
                'login_url' => route('login'),
            ],
            'studentMenus' => fn () => $student ? app(FormService::class)->progress($student) : [],
            'studentNav' => fn () => $student ? app(Admission::class)->navigation($student) : null,
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
