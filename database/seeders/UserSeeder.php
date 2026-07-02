<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Membuat / memperbarui akun untuk testing login dengan role admin dan user.
     *
     * Akun yang dibuat:
     *  - Admin  : admin@example.com  / 12345678
     *  - User   : user@example.com   / 12345678
     */
    public function run(): void
    {
        // -------------------------------------------------------
        // 1. Pastikan role tersedia
        // -------------------------------------------------------
        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $userRole  = Role::firstOrCreate(['name' => 'user',  'guard_name' => 'web']);

        // -------------------------------------------------------
        // 2. Akun Admin — updateOrCreate agar password selalu sinkron
        // -------------------------------------------------------
        $admin = User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name'     => 'Administrator',
                'password' => Hash::make('12345678'),
            ]
        );
        $admin->syncRoles([$adminRole]);

        // -------------------------------------------------------
        // 3. Akun User biasa — updateOrCreate agar password selalu sinkron
        // -------------------------------------------------------
        $user = User::updateOrCreate(
            ['email' => 'user@example.com'],
            [
                'name'     => 'User Biasa',
                'password' => Hash::make('12345678'),
            ]
        );
        $user->syncRoles([$userRole]);

        // -------------------------------------------------------
        // Output info ke console
        // -------------------------------------------------------
        $this->command->info('');
        $this->command->info('✅ Seeder selesai! Akun testing:');
        $this->command->table(
            ['Role', 'Email', 'Password'],
            [
                ['admin', 'admin@example.com', '12345678'],
                ['user',  'user@example.com',  '12345678'],
            ]
        );
    }
}
