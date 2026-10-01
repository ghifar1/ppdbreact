<?php

namespace App\Console\Commands;

use App\Enums\Jenjang;
use App\Enums\StatusPendaftaran;
use App\Services\Ppdb2020\Importer;
use App\Services\Ppdb2020\ImportReport;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Throwable;

#[Signature('ppdb:import-2020
    {--connection=ppdb2020 : Database connection of the old ppdb2020 app (see config/database.php)}
    {--files= : Path to ppdb2020\'s storage/app/public folder, which holds documents/ and profils/}
    {--jenjang=ma : School level the imported students register for (mi, mts or ma)}
    {--year=* : Only import students who registered in this year (repeatable)}
    {--admins : Also import admin accounts}
    {--update : Refresh students imported on an earlier run (status, answers and files)}
    {--dry-run : Show what would be imported without saving anything}')]
#[Description('Import students, answers, documents and results from the old ppdb2020 app')]
class ImportPpdb2020 extends Command
{
    private const LIST_LIMIT = 20;

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $jenjang = Jenjang::tryFrom(strtolower((string) $this->option('jenjang')));

        if ($jenjang === null) {
            $this->error('--jenjang must be one of: '.implode(', ', array_column(Jenjang::cases(), 'value')));

            return self::FAILURE;
        }

        $files = $this->option('files');

        if ($files !== null) {
            $files = realpath($files) ?: $files;

            if (! is_dir($files)) {
                $this->error("Folder [{$files}] not found. Pass ppdb2020's storage/app/public folder.");

                return self::FAILURE;
            }

            if (! is_dir("{$files}/documents") && ! is_dir("{$files}/profils")) {
                $this->warn("[{$files}] has no documents/ or profils/ folder; no files will be found.");
            }
        }

        try {
            $legacy = DB::connection($this->option('connection'));
            $legacy->getPdo();
        } catch (Throwable $e) {
            $this->error('Cannot connect to the ppdb2020 database: '.$e->getMessage());

            return self::FAILURE;
        }

        $dryRun = (bool) $this->option('dry-run');

        $this->info(($dryRun ? 'Dry run: nothing will be saved. ' : '')."Importing into {$jenjang->label()}…");

        try {
            $report = (new Importer(
                legacy: $legacy,
                jenjang: $jenjang,
                filesPath: $files,
                years: array_values(array_map('strval', $this->option('year'))),
                admins: (bool) $this->option('admins'),
                update: (bool) $this->option('update'),
                dryRun: $dryRun,
            ))->run();
        } catch (Throwable $e) {
            $this->error('Import stopped, nothing was saved: '.$e->getMessage());

            return self::FAILURE;
        }

        $this->printReport($report, $dryRun, $files !== null);

        return self::SUCCESS;
    }

    private function printReport(ImportReport $report, bool $dryRun, bool $withFiles): void
    {
        $this->newLine();
        $this->table(['Result', $dryRun ? 'Would be' : 'Count'], [
            ['Accounts created', $report->created],
            ['Accounts updated', $report->updated],
            ['Already imported (skipped, use --update to refresh)', $report->skippedExisting],
            ['Outside --year (skipped)', $report->skippedYear],
            ['Admin accounts (skipped, use --admins)', $report->skippedAdmins],
            ['Accounts that could not be imported', count($report->conflicts)],
            ['Answers', $report->answers],
            ['Exam (e-learning) accounts', $report->examAccounts],
            ['Files copied', $report->filesCopied],
            ['Files not found', $report->filesMissing],
            ['Files skipped (no --files given)', $report->filesSkipped],
        ]);

        if ($report->years) {
            ksort($report->years);
            $this->line('Students in ppdb2020 per registration year: '.collect($report->years)
                ->map(fn (int $count, string $year) => "{$year}: {$count}")->implode(', '));
        }

        if ($report->statuses) {
            $this->line('Imported students per status: '.collect($report->statuses)
                ->map(fn (int $count, string $status) => StatusPendaftaran::from($status)->label().": {$count}")->implode(', '));
        }

        if ($report->periodsCreated) {
            $this->line('Registration periods created: '.implode(', ', $report->periodsCreated));
        }

        if ($report->menusCreated) {
            $this->line('Menus created: '.implode(', ', $report->menusCreated));
        }

        if ($report->fieldsCreated) {
            $this->line(count($report->fieldsCreated).' fields created to match the ppdb2020 forms.');
            $this->printList($report->fieldsCreated);
        }

        if ($report->optionsAdded) {
            $this->warn('Values not in a field\'s choices were added as new choices:');
            $this->printList(collect($report->optionsAdded)
                ->map(fn (array $values, string $label) => "{$label}: ".implode(', ', array_unique($values)))
                ->values()->all());
        }

        if ($report->conflicts) {
            $this->warn('Accounts that could not be imported:');
            $this->printList(array_map(
                fn (array $conflict) => "#{$conflict['legacy_id']} {$conflict['login']}: {$conflict['reason']}",
                $report->conflicts,
            ));
        }

        if ($report->warnings) {
            $this->warn('Warnings:');
            $this->printList($report->warnings);
        }

        if ($report->accounts && ! $dryRun) {
            $path = 'ppdb-import/akun-ppdb2020-'.now()->format('Ymd-His').'.csv';
            Storage::disk('local')->put($path, $this->csv($report->accounts));
            $this->info('Login details for the imported accounts (no passwords): '.Storage::disk('local')->path($path));
        }

        if (! $withFiles && $report->filesSkipped > 0) {
            $this->warn('Documents were not copied. Run again with --update --files=/path/to/ppdb2020/storage/app/public.');
        }

        $this->newLine();
        $this->info($dryRun ? 'Dry run finished. Run again without --dry-run to import.' : 'Import finished.');
    }

    /**
     * @param  list<string>  $lines
     */
    private function printList(array $lines): void
    {
        foreach (array_slice($lines, 0, self::LIST_LIMIT) as $line) {
            $this->line("  - {$line}");
        }

        if (count($lines) > self::LIST_LIMIT) {
            $this->line('  … and '.(count($lines) - self::LIST_LIMIT).' more');
        }
    }

    /**
     * @param  list<array<string, string>>  $rows
     */
    private function csv(array $rows): string
    {
        $handle = fopen('php://temp', 'r+');
        fputcsv($handle, array_keys($rows[0]), escape: '');

        foreach ($rows as $row) {
            fputcsv($handle, array_values($row), escape: '');
        }

        rewind($handle);
        $csv = stream_get_contents($handle);
        fclose($handle);

        return $csv;
    }
}
