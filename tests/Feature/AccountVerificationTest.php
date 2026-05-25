<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use App\Models\User;
use App\Models\AccountVerification;
use App\Models\AccountVerificationDocument;
use Spatie\Permission\Models\Role;

class AccountVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_submit_verification()
    {
        Storage::fake('private');

        $user = User::factory()->create();
        $this->actingAs($user);

        $file = UploadedFile::fake()->create('id.pdf', 100, 'application/pdf');

        $response = $this->post('/account/verification', [
            'verification_type' => 'Individu',
            'legal_name' => 'Test User',
            'id_number' => '12345',
            'documents' => ['id_card' => $file],
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('account_verifications', [
            'user_id' => $user->id,
            'legal_name' => 'Test User',
            'status' => 'pending',
        ]);

        $verification = AccountVerification::where('user_id', $user->id)->first();
        $this->assertNotNull($verification);

        $doc = AccountVerificationDocument::where('verification_id', $verification->id)->first();
        $this->assertNotNull($doc);

        Storage::disk('private')->assertExists($doc->file_path);
    }

    public function test_admin_can_approve_and_decline()
    {
        // create role and admin
        if (!class_exists(Role::class)) {
            $this->markTestSkipped('Spatie role model not available');
        }

        Role::create(['name' => 'admin']);
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $this->actingAs($admin);

        $user = User::factory()->create();
        $verification = AccountVerification::create([
            'user_id' => $user->id,
            'verification_type' => 'Individu',
            'legal_name' => 'Creator',
            'status' => 'pending',
            'submitted_at' => now(),
        ]);

        $resp = $this->post("/admin/verifications/{$verification->id}/approve");
        $resp->assertStatus(200);
        $this->assertDatabaseHas('account_verifications', [
            'id' => $verification->id,
            'status' => 'approved',
            'reviewed_by' => $admin->id,
        ]);

        // create another pending for decline
        $verification2 = AccountVerification::create([
            'user_id' => $user->id,
            'verification_type' => 'Individu',
            'legal_name' => 'Creator 2',
            'status' => 'pending',
            'submitted_at' => now(),
        ]);

        $resp2 = $this->postJson("/admin/verifications/{$verification2->id}/decline", ['reason' => 'Dokumen tidak valid']);
        $resp2->assertStatus(200);
        $this->assertDatabaseHas('account_verifications', [
            'id' => $verification2->id,
            'status' => 'declined',
            'decline_reason' => 'Dokumen tidak valid',
            'reviewed_by' => $admin->id,
        ]);
    }
}
