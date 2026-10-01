<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Jenjang;
use App\Http\Controllers\Controller;
use App\Http\Requests\AdmissionSettingRequest;
use App\Models\ActivityLog;
use App\Models\AdmissionSetting;
use App\Models\RegistrationPeriod;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdmissionSettingController extends Controller
{
    private const DATES = ['finalization_opens_at', 'finalization_closes_at', 'card_opens_at', 'card_closes_at', 'announcement_at'];

    public function index(Request $request): Response
    {
        $periods = RegistrationPeriod::whereNotNull('fee')->orderBy('opens_at')->get();

        return Inertia::render('Admin/Settings/Index', [
            'tab' => Jenjang::tryFrom((string) $request->query('jenjang'))?->value ?? Jenjang::cases()[0]->value,
            'jenjangOptions' => Jenjang::options(),
            'settings' => collect(Jenjang::cases())->mapWithKeys(fn (Jenjang $jenjang) => [
                $jenjang->value => $this->formData(AdmissionSetting::for($jenjang)),
            ]),
            // Periods whose own fee replaces the jenjang's.
            'periodFees' => collect(Jenjang::cases())->mapWithKeys(fn (Jenjang $jenjang) => [
                $jenjang->value => $periods
                    ->filter(fn (RegistrationPeriod $period) => $period->appliesTo($jenjang))
                    ->map(fn (RegistrationPeriod $period) => ['name' => $period->name, 'fee_label' => $period->present()['fee_label']])
                    ->values(),
            ]),
        ]);
    }

    public function update(AdmissionSettingRequest $request, string $jenjang): RedirectResponse
    {
        $jenjang = Jenjang::tryFrom($jenjang) ?? abort(404);

        $settings = AdmissionSetting::for($jenjang)->fill($request->validated());

        if ($settings->isDirty()) {
            ActivityLog::record('pengaturan.simpan', "Menyimpan pengaturan seleksi {$jenjang->label()}", properties: ['diubah' => array_keys($settings->getDirty())]);
        }

        $settings->save();

        return back()->with('success', "Pengaturan {$jenjang->label()} disimpan.");
    }

    /**
     * @return array<string, mixed>
     */
    private function formData(AdmissionSetting $settings): array
    {
        $data = collect($settings->getFillable())->mapWithKeys(fn (string $key) => [$key => $settings->{$key} ?? ''])->all();

        foreach (self::DATES as $key) {
            $data[$key] = $settings->{$key}?->format('Y-m-d\TH:i') ?? '';
        }

        return $data;
    }
}
