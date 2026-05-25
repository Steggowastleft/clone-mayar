<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\AccountVerification;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class RoleAndVerificationSeeder extends Seeder
{
    public function run()
    {
        // Ensure admin user
        $admin = User::where('email', 'admin@example.com')->first();
        if (! $admin) {
            $admin = User::create([
                'id' => (string) Str::uuid(),
                'name' => 'Admin',
                'email' => 'admin@example.com',
                'password' => Hash::make('password'),
            ]);
        }
        if (method_exists($admin, 'assignRole')) {
            if (! Role::where('name', 'admin')->exists()) {
                Role::create(['name' => 'admin']);
            }
            try {
                $admin->assignRole('admin');
            } catch (\Throwable $e) {
                // ignore role assignment errors during seeding in some environments
            }
        }

        // Sample creator with pending verification
        $creator = User::where('email', 'creator1@example.com')->first();
        if (! $creator) {
            $creator = User::create([
                'id' => (string) Str::uuid(),
                'name' => 'Creator One',
                'email' => 'creator1@example.com',
                'password' => Hash::make('password'),
            ]);
        }

        // Create a pending verification if none exists
        $exists = AccountVerification::where('user_id', $creator->id)->first();
        if (! $exists) {
            AccountVerification::create([
                'user_id' => $creator->id,
                'verification_type' => 'creator_personal',
                'legal_name' => 'Creator One',
                'id_number' => '1234567890',
                'business_name' => null,
                'business_description' => 'Contoh permintaan verifikasi',
                'status' => 'pending',
                'submitted_at' => now(),
            ]);
        }
    }
}
