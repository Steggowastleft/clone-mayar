<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $test = User::where('email', 'test@example.com')->first();
        if (! $test) {
            User::factory()->create([
                'id' => (string) Str::uuid(),
                'name' => 'Test User',
                'email' => 'test@example.com',
            ]);
        }

        // Roles and sample verifications
        $this->call(\Database\Seeders\RoleAndVerificationSeeder::class);
    }
}
