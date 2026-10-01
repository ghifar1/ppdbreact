<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'oleh' => ['nullable', Rule::in(['panitia', 'siswa', 'pendaftar'])],
            'tanggal' => ['nullable', 'date_format:Y-m-d'],
        ]);

        $logs = ActivityLog::query()
            ->with(['causer', 'subject'])
            ->when($filters['oleh'] ?? null, fn (Builder $query, string $role) => match ($role) {
                'panitia' => $query->whereHas('causer', fn (Builder $query) => $query->where('role', User::ROLE_ADMIN)),
                'siswa' => $query->whereHas('causer', fn (Builder $query) => $query->where('role', User::ROLE_STUDENT)),
                // Applicants without an account (and the import) have no causer.
                'pendaftar' => $query->whereNull('causer_id'),
            })
            ->when($filters['tanggal'] ?? null, fn (Builder $query, string $date) => $query->whereDate('created_at', $date))
            ->when($filters['q'] ?? null, fn (Builder $query, string $search) => $query->where(fn (Builder $query) => $query
                ->where('description', 'like', "%{$search}%")
                ->orWhereHas('causer', fn (Builder $query) => $query->where('name', 'like', "%{$search}%"))
                ->orWhereHas('subject', fn (Builder $query) => $query->where('name', 'like', "%{$search}%"))))
            ->latest('id')
            ->paginate(50)
            ->withQueryString()
            ->through(fn (ActivityLog $log) => $log->present());

        return Inertia::render('Admin/ActivityLogs/Index', [
            'logs' => $logs,
            'filters' => ['q' => $filters['q'] ?? '', 'oleh' => $filters['oleh'] ?? '', 'tanggal' => $filters['tanggal'] ?? ''],
        ]);
    }
}
