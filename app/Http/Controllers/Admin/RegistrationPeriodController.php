<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Jenjang;
use App\Http\Controllers\Controller;
use App\Http\Requests\RegistrationPeriodRequest;
use App\Models\RegistrationPeriod;
use App\Models\User;
use App\Services\RegistrationSchedule;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class RegistrationPeriodController extends Controller
{
    public function index(RegistrationSchedule $schedule): Response
    {
        return Inertia::render('Admin/Periods/Index', [
            'periods' => RegistrationPeriod::withCount('users')->orderByDesc('opens_at')->get()
                ->map(fn (RegistrationPeriod $period) => $period->present() + ['users_count' => $period->users_count]),
            'summary' => $schedule->summary()['jenjang'],
            'jenjangOptions' => Jenjang::options(),
        ]);
    }

    public function store(RegistrationPeriodRequest $request): RedirectResponse
    {
        $period = RegistrationPeriod::create($request->periodData());

        return back()->with('success', "{$period->name} ditambahkan.");
    }

    public function update(RegistrationPeriodRequest $request, RegistrationPeriod $period): RedirectResponse
    {
        $period->update($request->periodData());

        return back()->with('success', "{$period->name} disimpan.");
    }

    public function destroy(RegistrationPeriod $period): RedirectResponse
    {
        User::where('registration_period_id', $period->id)->update(['registration_period_id' => null]);
        $period->delete();

        return back()->with('success', "{$period->name} dihapus.");
    }
}
