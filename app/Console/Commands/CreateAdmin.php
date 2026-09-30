<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;

#[Signature('ppdb:admin {username? : Username for logging in}')]
#[Description('Create an admin (panitia PPDB) account, or reset the password of an existing one')]
class CreateAdmin extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $username = $this->argument('username') ?? $this->ask('Username');
        $existing = User::where('username', $username)->first();

        if ($existing && ! $existing->isAdmin()) {
            $this->error("Username [{$username}] already belongs to a student.");

            return self::FAILURE;
        }

        $name = $existing?->name ?? $this->ask('Name', 'Panitia PPDB');
        $password = $this->secret('Password (min. 8 characters)');

        $validator = Validator::make(
            ['username' => $username, 'password' => $password],
            ['username' => ['required', 'alpha_dash', 'min:4', 'max:30'], 'password' => ['required', 'min:8']],
        );

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $error) {
                $this->error($error);
            }

            return self::FAILURE;
        }

        $admin = $existing ?? new User(['username' => $username]);
        $admin->forceFill([
            'name' => $name,
            'password' => $password,
            'role' => User::ROLE_ADMIN,
        ])->save();

        $this->info($existing ? "Password for admin [{$username}] updated." : "Admin [{$username}] created.");

        return self::SUCCESS;
    }
}
