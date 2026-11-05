<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $email = env('ADMIN_EMAIL');
        $password = env('ADMIN_PASSWORD');

        if (!$email || !$password) {
            $this->command?->warn('Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env, then rerun db:seed. No default administrator was created.');
            return;
        }

        $data = [
            'name' => env('ADMIN_NAME', 'Company Administrator'),
            'email' => $email,
            'password' => Hash::make($password),
            'is_admin' => true,
        ];

        if (Schema::hasColumn('users', 'mobile')) {
            $data['mobile'] = env('ADMIN_MOBILE') ?: null;
        }

        User::updateOrCreate(['is_admin' => true], $data);
        User::where('is_admin', true)->where('email', '!=', $email)->delete();
    }
}
