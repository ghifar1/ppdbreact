<?php

namespace App\Services\Ppdb2020;

/**
 * Counters and notes collected while importing, printed by the command.
 */
final class ImportReport
{
    public int $created = 0;

    public int $updated = 0;

    public int $skippedExisting = 0;

    public int $skippedAdmins = 0;

    public int $skippedYear = 0;

    public int $answers = 0;

    public int $filesCopied = 0;

    public int $filesMissing = 0;

    public int $filesSkipped = 0;

    public int $examAccounts = 0;

    /** @var list<string> */
    public array $periodsCreated = [];

    /** @var array<string, int> legacy year => students seen */
    public array $years = [];

    /** @var array<string, int> status value => students imported */
    public array $statuses = [];

    /** @var list<string> */
    public array $menusCreated = [];

    /** @var list<string> "Menu › Label" */
    public array $fieldsCreated = [];

    /** @var array<string, list<string>> field label => option values added */
    public array $optionsAdded = [];

    /** @var list<string> */
    public array $warnings = [];

    /** @var list<array{legacy_id: int, login: string, reason: string}> */
    public array $conflicts = [];

    /**
     * One row per imported account, written to a CSV so the committee can tell
     * students how to log in.
     *
     * @var list<array<string, string>>
     */
    public array $accounts = [];

    public function warn(string $message): void
    {
        $this->warnings[] = $message;
    }

    public function optionAdded(string $label, string $value): void
    {
        $this->optionsAdded[$label][] = $value;
    }
}
