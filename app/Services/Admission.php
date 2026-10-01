<?php

namespace App\Services;

use App\Enums\Jenjang;
use App\Enums\PaymentStatus;
use App\Enums\StatusPendaftaran;
use App\Models\AdmissionSetting;
use App\Models\ExamSchedule;
use App\Models\Payment;
use App\Models\RegistrationPeriod;
use App\Models\User;
use App\Support\DateWindow;
use Illuminate\Support\Collection;

/**
 * The admission rules around the forms: the registration fee, when students
 * may submit for finalization and download the exam card, and when results
 * are announced. All of it comes from the jenjang's AdmissionSetting; what
 * an admin leaves empty does not restrict anything.
 *
 * It remembers the settings it has read, so resolve it per request (method
 * injection), not in a controller constructor: controllers can outlive a request.
 */
final class Admission
{
    /** @var array<string, AdmissionSetting> */
    private array $settings = [];

    /**
     * The jenjang's settings; empty ones (nothing restricted) without a jenjang.
     */
    public function settings(?Jenjang $jenjang): AdmissionSetting
    {
        return $jenjang ? $this->settings[$jenjang->value] ??= AdmissionSetting::for($jenjang) : new AdmissionSetting;
    }

    /**
     * The fee for a student: their registration period's fee when it has
     * one, otherwise their jenjang's.
     */
    public function fee(User $user): int
    {
        return (int) ($user->registrationPeriod?->fee ?? $this->settings($user->jenjang)->fee ?? 0);
    }

    /**
     * The fee for someone registering now.
     */
    public function feeForNewRegistrant(Jenjang $jenjang, ?RegistrationPeriod $period): int
    {
        return (int) ($period?->fee ?? $this->settings($jenjang)->fee ?? 0);
    }

    public function paymentRequired(User $user): bool
    {
        return $this->fee($user) > 0;
    }

    /**
     * Paid, or there is nothing to pay.
     */
    public function isPaid(User $user): bool
    {
        return ! $this->paymentRequired($user) || $user->payment?->status === PaymentStatus::Diterima;
    }

    /**
     * Where to pay the jenjang's fee, as shown to applicants and students.
     *
     * @return array{bank: ?string, nomor: ?string, nama: ?string, catatan: ?string}
     */
    public function bankAccount(?Jenjang $jenjang): array
    {
        $settings = $this->settings($jenjang);

        return [
            'bank' => $settings->bank_name,
            'nomor' => $settings->account_number,
            'nama' => $settings->account_name,
            'catatan' => $settings->payment_notes,
        ];
    }

    /**
     * Why the student cannot submit for finalization now, or null when they can.
     */
    public function finalizationBlocker(User $user, bool $complete): ?string
    {
        if (! $user->status->canEdit()) {
            return 'Data sudah diajukan untuk finalisasi.';
        }

        if (! $complete) {
            return 'Lengkapi semua isian wajib (*) di setiap menu sebelum finalisasi.';
        }

        if (! $this->isPaid($user)) {
            return 'Biaya pendaftaran belum lunas. Selesaikan pembayaran di sekolah atau hubungi panitia PPDB.';
        }

        // Corrections the committee asked for can be sent back at any time.
        if ($user->status === StatusPendaftaran::PerluPerbaikan) {
            return null;
        }

        $window = $this->settings($user->jenjang)->finalizationWindow();

        return match ($window->status()) {
            DateWindow::UPCOMING => "Finalisasi data dibuka mulai {$window->opensLabel()}.",
            DateWindow::CLOSED => "Masa finalisasi data sudah berakhir pada {$window->closesLabel()}.",
            default => null,
        };
    }

    /**
     * The status as the student sees it: a result stays hidden until it is announced.
     */
    public function visibleStatus(User $user): StatusPendaftaran
    {
        $isResult = in_array($user->status, [StatusPendaftaran::Lulus, StatusPendaftaran::TidakLulus], true);

        return $isResult && ! $this->settings($user->jenjang)->resultsAnnounced()
            ? StatusPendaftaran::Terverifikasi
            : $user->status;
    }

    /**
     * Why the student cannot open the exam card now, or null when they can.
     */
    public function cardBlocker(User $user): ?string
    {
        if (! $this->visibleStatus($user)->hasExamCard()) {
            return 'Kartu ujian tersedia setelah data diverifikasi panitia.';
        }

        $window = $this->settings($user->jenjang)->cardWindow();

        return match ($window->status()) {
            DateWindow::UPCOMING => "Kartu ujian bisa diunduh mulai {$window->opensLabel()}.",
            DateWindow::CLOSED => "Masa unduh kartu ujian sudah berakhir pada {$window->closesLabel()}.",
            default => null,
        };
    }

    /**
     * Whether the student can open their result letter.
     */
    public function hasLetter(User $user): bool
    {
        return in_array($this->visibleStatus($user), [StatusPendaftaran::Lulus, StatusPendaftaran::TidakLulus], true);
    }

    /**
     * What the student's navigation shows.
     *
     * @return array{payment: ?string, card: bool, letter: bool}
     */
    public function navigation(User $user): array
    {
        return [
            'payment' => $this->paymentRequired($user) ? ($user->payment?->status->value ?? 'belum') : null,
            'card' => $this->cardBlocker($user) === null,
            'letter' => $this->hasLetter($user),
        ];
    }

    /**
     * Payment details for the student's dashboard and payment page, or null
     * when there is nothing to pay.
     *
     * @return array<string, mixed>|null
     */
    public function paymentSummary(User $user): ?array
    {
        if (! $this->paymentRequired($user)) {
            return null;
        }

        $payment = $user->payment;

        return [
            'fee_label' => Payment::rupiah($this->fee($user)),
            'status' => $payment?->status->value ?? 'belum',
            'status_label' => $payment?->status->label() ?? 'Belum dibayar',
            'note' => $payment?->status === PaymentStatus::Ditolak ? $payment->note : null,
        ];
    }

    /**
     * Dates for each step of the admission timeline, keyed like the steps
     * in resources/js/lib/ppdb.js. Missing dates are null.
     *
     * @return array<string, ?string>
     */
    public function timeline(?Jenjang $jenjang, ?RegistrationPeriod $period): array
    {
        $settings = $this->settings($jenjang);
        $exams = ExamSchedule::applicable($jenjang, $period?->id)->ordered()->get();

        return [
            'pengisian' => $period?->present()['range_label'],
            'finalisasi' => $settings->finalizationWindow()->label(),
            'verifikasi' => null,
            'kartu' => $settings->cardWindow()->label(),
            'seleksi' => collect([
                $this->examDates($exams),
                $settings->announcement_at ? 'Pengumuman '.$settings->announcement_at->translatedFormat('j M Y') : null,
            ])->filter()->implode(' · ') ?: null,
        ];
    }

    /**
     * @param  Collection<int, ExamSchedule>  $exams
     */
    private function examDates(Collection $exams): ?string
    {
        if ($exams->isEmpty()) {
            return null;
        }

        $first = $exams->min('date');
        $last = $exams->max('date');

        return 'Ujian '.match (true) {
            $first->isSameDay($last) => $first->translatedFormat('j M Y'),
            $first->isSameMonth($last) => $first->format('j').' – '.$last->translatedFormat('j M Y'),
            default => $first->translatedFormat('j M').' – '.$last->translatedFormat('j M Y'),
        };
    }
}
