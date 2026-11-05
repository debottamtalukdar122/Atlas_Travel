<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Schema;
use Laravel\Sanctum\PersonalAccessToken;
use Tests\TestCase;

class AdminAuthTest extends TestCase
{
    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        if (!Schema::hasTable('users')) {
            Artisan::call('migrate', ['--force' => true]);
        }

        DB::table('personal_access_tokens')->delete();
        DB::table('users')->delete();
        DB::table('password_reset_tokens')->delete();

        RateLimiter::clear('admin@atlas-isle.local|127.0.0.1');
        RateLimiter::clear('+18005550192|127.0.0.1');

        $this->admin = User::create([
            'name' => 'Atlas Administrator',
            'email' => 'admin@atlas-isle.local',
            'mobile' => '+18005550192',
            'password' => Hash::make('StrongAdminPassword123!'),
            'is_admin' => true,
        ]);
    }

    /** 1. Correct Admin email and password allow login */
    public function test_1_correct_admin_email_and_password_allow_login(): void
    {
        $response = $this->postJson('/api/admin/login', [
            'email' => 'admin@atlas-isle.local',
            'password' => 'StrongAdminPassword123!',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['token', 'expires_at', 'remember', 'user']);

        $this->assertDatabaseHas('personal_access_tokens', [
            'tokenable_id' => $this->admin->id,
            'name' => 'admin',
        ]);
    }

    /** Extra: Correct Admin mobile and password allow login */
    public function test_extra_correct_admin_mobile_and_password_allow_login(): void
    {
        $response = $this->postJson('/api/admin/login', [
            'identifier' => '+18005550192',
            'password' => 'StrongAdminPassword123!',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['token', 'expires_at', 'remember', 'user']);
    }

    /** 2. Incorrect password is rejected */
    public function test_2_incorrect_password_is_rejected(): void
    {
        $response = $this->postJson('/api/admin/login', [
            'email' => 'admin@atlas-isle.local',
            'password' => 'WrongPassword999!',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    }

    /** 3. Unauthenticated users cannot access CRM routes */
    public function test_3_unauthenticated_users_cannot_access_crm_routes(): void
    {
        $response = $this->getJson('/api/admin/dashboard');
        $response->assertUnauthorized();

        $responseModule = $this->getJson('/api/admin/enquiries');
        $responseModule->assertUnauthorized();
    }

    /** 4. Remember Me works correctly (12 hours normal vs 30 days remember) */
    public function test_4_remember_me_controls_session_lifetime(): void
    {
        // Normal login: 12-hour session
        $resNormal = $this->postJson('/api/admin/login', [
            'email' => 'admin@atlas-isle.local',
            'password' => 'StrongAdminPassword123!',
            'remember' => false,
        ]);
        $resNormal->assertOk();
        $normalExpiry = Carbon::parse($resNormal->json('expires_at'));
        $hours = abs(now()->diffInHours($normalExpiry));
        $this->assertTrue($hours >= 11 && $hours <= 13, "Expected ~12h session, got {$hours}h");

        // Remember Me: 30-day session
        $resRemember = $this->postJson('/api/admin/login', [
            'email' => 'admin@atlas-isle.local',
            'password' => 'StrongAdminPassword123!',
            'remember' => true,
        ]);
        $resRemember->assertOk();
        $rememberExpiry = Carbon::parse($resRemember->json('expires_at'));
        $days = abs(now()->diffInDays($rememberExpiry));
        $this->assertTrue($days >= 29 && $days <= 31, "Expected ~30d session, got {$days}d");
    }

    /** 5. Forgot Password generates a valid reset process */
    public function test_5_forgot_password_generates_valid_reset_process(): void
    {
        Notification::fake();

        $response = $this->postJson('/api/admin/forgot-password', [
            'email' => 'admin@atlas-isle.local',
        ]);

        $response->assertOk()
            ->assertJson(['message' => 'If that email address is registered, a password reset link has been sent.']);

        Notification::assertSentTo($this->admin, \App\Notifications\AdminResetPasswordNotification::class);
    }

    /** 6. Expired reset tokens are rejected */
    public function test_6_expired_reset_tokens_are_rejected(): void
    {
        $token = Password::broker()->createToken($this->admin);

        // Fast forward 65 minutes past the 60-minute token expiration
        $this->travel(65)->minutes();

        $response = $this->postJson('/api/admin/reset-password', [
            'token' => $token,
            'email' => 'admin@atlas-isle.local',
            'password' => 'NewStrongPassword456!',
            'password_confirmation' => 'NewStrongPassword456!',
        ]);

        $response->assertStatus(422)
            ->assertJson(['message' => 'This password reset token is invalid or has expired.']);
    }

    /** 7, 8, 9. Password reset updates password, old password fails, new password works */
    public function test_7_8_9_password_reset_updates_database_and_allows_login(): void
    {
        $token = Password::broker()->createToken($this->admin);

        $response = $this->postJson('/api/admin/reset-password', [
            'token' => $token,
            'email' => 'admin@atlas-isle.local',
            'password' => 'NewBrandPassword789!',
            'password_confirmation' => 'NewBrandPassword789!',
        ]);

        $response->assertOk();

        // 7. Verify password updated in DB
        $this->admin->refresh();
        $this->assertTrue(Hash::check('NewBrandPassword789!', $this->admin->password));

        // 8. Old password no longer works
        $oldLogin = $this->postJson('/api/admin/login', [
            'email' => 'admin@atlas-isle.local',
            'password' => 'StrongAdminPassword123!',
        ]);
        $oldLogin->assertUnprocessable();

        // 9. New password works
        $newLogin = $this->postJson('/api/admin/login', [
            'email' => 'admin@atlas-isle.local',
            'password' => 'NewBrandPassword789!',
        ]);
        $newLogin->assertOk();
    }

    /** 10. Five failed login attempts trigger rate limiting */
    public function test_10_five_failed_login_attempts_trigger_rate_limiting(): void
    {
        $throttleKey = 'admin@atlas-isle.local|127.0.0.1';
        RateLimiter::clear($throttleKey);

        for ($i = 0; $i < 5; $i++) {
            $res = $this->postJson('/api/admin/login', [
                'email' => 'admin@atlas-isle.local',
                'password' => 'WrongGuess' . $i,
            ]);
            $res->assertUnprocessable();
        }

        // 6th attempt must be blocked by rate limiter with 429
        $sixth = $this->postJson('/api/admin/login', [
            'email' => 'admin@atlas-isle.local',
            'password' => 'WrongGuessFinal',
        ]);

        $sixth->assertStatus(429)
            ->assertJsonStructure(['message', 'seconds_remaining']);
    }

    /** 11. Logout invalidates the authentication session/token */
    public function test_11_logout_invalidates_the_authentication_token(): void
    {
        $loginRes = $this->postJson('/api/admin/login', [
            'email' => 'admin@atlas-isle.local',
            'password' => 'StrongAdminPassword123!',
        ]);
        $token = $loginRes->json('token');

        // Access dashboard before logout
        $dashRes = $this->withHeader('Authorization', "Bearer {$token}")->getJson('/api/admin/dashboard');
        $dashRes->assertOk();

        // Perform logout
        $logoutRes = $this->withHeader('Authorization', "Bearer {$token}")->postJson('/api/admin/logout');
        $logoutRes->assertNoContent();

        // Verify token deleted from database
        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $this->admin->id,
        ]);

        // Access dashboard after logout must fail
        auth()->forgetGuards();
        $dashAfter = $this->withHeader('Authorization', "Bearer {$token}")->getJson('/api/admin/dashboard');
        $dashAfter->assertUnauthorized();
    }

    /** 12. Expired sessions cannot access protected pages */
    public function test_12_expired_sessions_cannot_access_protected_pages(): void
    {
        $loginRes = $this->postJson('/api/admin/login', [
            'email' => 'admin@atlas-isle.local',
            'password' => 'StrongAdminPassword123!',
            'remember' => false,
        ]);
        $token = $loginRes->json('token');

        // Fast forward 13 hours (past 12-hour session)
        $this->travel(13)->hours();

        auth()->forgetGuards();
        $response = $this->withHeader('Authorization', "Bearer {$token}")->getJson('/api/admin/dashboard');
        $response->assertUnauthorized();
    }

    /** 13. No second Admin account can be created through public registration */
    public function test_13_no_public_admin_registration_endpoint(): void
    {
        $res1 = $this->postJson('/api/register', [
            'name' => 'Hacker Admin',
            'email' => 'hacker@example.com',
            'password' => 'HackedPassword123!',
        ]);
        $res1->assertNotFound();

        $res2 = $this->postJson('/api/admin/register', [
            'name' => 'Hacker Admin',
            'email' => 'hacker@example.com',
            'password' => 'HackedPassword123!',
        ]);
        // Protected admin prefix rejects unauthorized requests with 401
        $this->assertTrue(in_array($res2->status(), [401, 404]));

        $res3 = $this->postJson('/api/public/register', [
            'name' => 'Hacker Admin',
            'email' => 'hacker@example.com',
            'password' => 'HackedPassword123!',
        ]);
        $res3->assertNotFound();

        // Ensure database maintains exactly 1 admin user
        $this->assertEquals(1, User::where('is_admin', true)->count());
    }
}
