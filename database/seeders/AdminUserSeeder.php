<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
  public function run(): void
{
    $email = 'admin@gmail.com';

    $role = Role::firstOrCreate([
        'name' => 'admin',
        'guard_name' => 'web',
    ]);

    $user = User::where('email', $email)->first();

    if (! $user) {
        $user = User::create([
            'id' => (string) Str::uuid(),
            'name' => 'Administrator',
            'email' => $email,
            'password' => Hash::make('password'),
        ]);
    }

    DB::table('model_has_roles')->updateOrInsert([
        'role_id' => $role->id,
        'model_type' => User::class,
        'model_id' => $user->id,
    ]);
}
}
?>
