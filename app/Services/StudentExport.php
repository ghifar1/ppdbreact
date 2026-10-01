<?php

namespace App\Services;

use App\Enums\FieldType;
use App\Enums\Jenjang;
use App\Models\FormAnswer;
use App\Models\FormField;
use App\Models\Menu;
use App\Models\Payment;
use App\Models\User;
use DateTimeImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Common\Entity\Style\Style;
use OpenSpout\Writer\AutoFilter;
use OpenSpout\Writer\XLSX\Entity\SheetView;
use OpenSpout\Writer\XLSX\Writer;

/**
 * Every registration with all its form answers as an Excel workbook, like
 * ppdb2020's "Unduh data siswa". Each jenjang has its own forms, so each
 * gets its own sheet with a column per form field.
 */
final class StudentExport
{
    private const COLUMNS = [
        'No. Pendaftaran', 'No. Peserta', 'Nama', 'Username', 'Email', 'No. HP', 'Gelombang',
        'Status', 'Pembayaran', 'Tanggal Daftar', 'Tanggal Finalisasi', 'Catatan Panitia',
    ];

    public function __construct(private FormService $forms, private Admission $admission) {}

    /**
     * Write the students of `$students` to an XLSX file at `$path`.
     *
     * @param  Builder<User>  $students
     * @return int the number of students written
     */
    public function write(Builder $students, string $path): int
    {
        $writer = new Writer;
        $writer->openToFile($path);
        $header = new Style(fontBold: true, fontColor: 'FFFFFF', backgroundColor: '0F5A41', shouldWrapText: true);
        $dateTime = new Style(format: 'dd/mm/yyyy hh:mm');
        $date = new Style(format: 'dd/mm/yyyy');
        $total = 0;
        $sheets = 0;

        foreach (Jenjang::cases() as $jenjang) {
            $query = $students->clone()->where('jenjang', $jenjang);

            if (! $query->exists()) {
                continue;
            }

            $fields = $this->fields($jenjang);
            $this->startSheet($writer, $sheets++, $jenjang->shortLabel(), $header, $fields);

            $query->with(['registrationPeriod', 'payment'])->chunkById(500, function (Collection $chunk) use ($writer, $fields, $dateTime, $date, &$total) {
                $answers = FormAnswer::whereIn('user_id', $chunk->pluck('id'))->get()->groupBy('user_id');

                foreach ($chunk as $student) {
                    $row = $this->studentValues($student);
                    $styles = [9 => $dateTime, 10 => $dateTime];
                    $mine = $answers->get($student->id, collect())->keyBy('form_field_id');

                    foreach ($fields as ['field' => $field]) {
                        $value = $this->answerValue($field, $mine->get($field->id));
                        if ($value instanceof DateTimeImmutable) {
                            $styles[count($row)] = $date;
                        }
                        $row[] = $value;
                    }

                    $writer->addRow(Row::fromValuesWithStyles($row, columnStyles: $styles));
                    $total++;
                }
            });
        }

        if ($sheets === 0) {
            $this->startSheet($writer, 0, 'Data Siswa', $header, collect());
        }

        $writer->close();

        return $total;
    }

    /**
     * The jenjang's form fields in the order students see them, each with
     * its column header: the label, plus the menu where two menus share it.
     *
     * @return Collection<int, array{field: FormField, header: string}>
     */
    private function fields(Jenjang $jenjang): Collection
    {
        $columns = Menu::forJenjang($jenjang)->ordered()->with('fields')->get()
            ->flatMap(fn (Menu $menu) => $menu->fields->map(fn (FormField $field) => ['field' => $field, 'menu' => $menu->title]));
        $counts = $columns->countBy(fn (array $column) => $column['field']->label);

        return $columns->map(fn (array $column) => [
            'field' => $column['field'],
            'header' => $counts[$column['field']->label] > 1 ? "{$column['field']->label} ({$column['menu']})" : $column['field']->label,
        ])->values();
    }

    /**
     * @param  Collection<int, array{field: FormField, header: string}>  $fields
     */
    private function startSheet(Writer $writer, int $index, string $name, Style $header, Collection $fields): void
    {
        if ($index > 0) {
            $writer->addNewSheetAndMakeItCurrent();
        }

        $columns = [...self::COLUMNS, ...$fields->pluck('header')];
        $sheet = $writer->getCurrentSheet();
        $sheet->setName($name);
        $sheet->setSheetView((new SheetView)->withFreezeRow(2)->withFreezeColumn('D'));
        $sheet->setAutoFilter(new AutoFilter(0, 1, count($columns) - 1, 1));
        $sheet->setColumnWidthForRange(18, 1, count($columns));
        $sheet->setColumnWidth(28, 3);
        $writer->addRow(Row::fromValuesWithStyle($columns, $header));
    }

    /**
     * @return list<mixed>
     */
    private function studentValues(User $student): array
    {
        return [
            $student->nomorPendaftaran(),
            $student->nomorPeserta(),
            $student->name,
            $student->username,
            $student->email,
            $student->no_hp,
            $student->registrationPeriod?->name,
            $student->status->label(),
            $this->paymentLabel($student),
            $student->created_at?->toDateTimeImmutable(),
            $student->finalized_at?->toDateTimeImmutable(),
            $student->catatan_admin,
        ];
    }

    private function paymentLabel(User $student): string
    {
        if (! $this->admission->paymentRequired($student)) {
            return $student->payment ? $student->payment->status->label() : 'Tanpa biaya';
        }

        $payment = $student->payment;

        return $payment
            ? $payment->status->label().($payment->amount !== null ? ' ('.Payment::rupiah($payment->amount).')' : '')
            : 'Belum bayar';
    }

    private function answerValue(FormField $field, ?FormAnswer $answer): mixed
    {
        if (! $this->forms->isFilled($answer)) {
            return null;
        }

        return match ($field->type) {
            FieldType::Checkbox => implode(', ', $this->forms->checkedOptions($answer)),
            // A link admins can open while logged in.
            FieldType::File => $this->forms->fileInfo($answer)['url'] ?? null,
            FieldType::Date => DateTimeImmutable::createFromFormat('!Y-m-d', $answer->value) ?: $answer->value,
            default => $answer->value,
        };
    }
}
