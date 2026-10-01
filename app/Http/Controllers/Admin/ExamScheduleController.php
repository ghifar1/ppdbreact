<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Jenjang;
use App\Http\Controllers\Controller;
use App\Http\Requests\ExamScheduleRequest;
use App\Models\ActivityLog;
use App\Models\ExamSchedule;
use App\Models\RegistrationPeriod;
use App\Services\ExamAccounts;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ExamScheduleController extends Controller
{
    public function index(Request $request, ExamAccounts $examAccounts): Response
    {
        $filters = $request->validate(['jenjang' => ['nullable', Rule::enum(Jenjang::class)]]);
        $jenjang = Jenjang::tryFrom($filters['jenjang'] ?? '');

        $items = ExamSchedule::with('registrationPeriod')
            ->when($jenjang, fn ($query) => $query->where(fn ($query) => $query->whereNull('jenjang')->orWhere('jenjang', $jenjang)))
            ->ordered()
            ->get();

        // How many verified students each item applies to, to plan rooms.
        $students = $examAccounts->eligible()->get(['id', 'jenjang', 'registration_period_id', 'exam_number', 'exam_year']);

        return Inertia::render('Admin/ExamSchedules/Index', [
            'items' => $items->map(fn (ExamSchedule $item) => $item->present() + [
                'participants' => $students->filter(fn ($student) => ($item->jenjang === null || $student->jenjang === $item->jenjang)
                    && ($item->registration_period_id === null || $student->registration_period_id === $item->registration_period_id)
                    && ($student->exam_year === null || $student->exam_year === $item->date->year)
                    && ($item->number_from === null || ($student->exam_number >= $item->number_from && $student->exam_number <= $item->number_to)))
                    ->count(),
            ]),
            'filters' => ['jenjang' => $jenjang?->value ?? ''],
            'jenjangOptions' => Jenjang::options(),
            'periodOptions' => RegistrationPeriod::orderByDesc('opens_at')->get()->map(fn (RegistrationPeriod $period) => [
                'value' => (string) $period->id,
                'label' => $period->name.' · '.($period->jenjang?->shortLabel() ?? 'Semua jenjang'),
            ]),
        ]);
    }

    public function store(ExamScheduleRequest $request): RedirectResponse
    {
        $item = ExamSchedule::create($request->scheduleData());

        ActivityLog::record('jadwal_ujian.buat', "Menambah jadwal ujian {$item->title} ({$item->present()['date_label']}, {$item->timeLabel()})");

        return back()->with('success', "{$item->title} ditambahkan ke jadwal ujian.");
    }

    public function update(ExamScheduleRequest $request, ExamSchedule $schedule): RedirectResponse
    {
        $schedule->update($request->scheduleData());

        ActivityLog::record('jadwal_ujian.ubah', "Mengubah jadwal ujian {$schedule->title} ({$schedule->present()['date_label']}, {$schedule->timeLabel()})");

        return back()->with('success', "{$schedule->title} disimpan.");
    }

    public function destroy(ExamSchedule $schedule): RedirectResponse
    {
        $schedule->delete();

        ActivityLog::record('jadwal_ujian.hapus', "Menghapus jadwal ujian {$schedule->title}");

        return back()->with('success', "{$schedule->title} dihapus dari jadwal ujian.");
    }
}
