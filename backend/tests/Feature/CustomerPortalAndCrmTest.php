<?php

namespace Tests\Feature;

use App\Models\CrmRecord;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CustomerPortalAndCrmTest extends TestCase
{
    private User $admin;
    private User $customerUser;
    private CrmRecord $customerA;
    private CrmRecord $bookingA;
    private CrmRecord $customerB;
    private CrmRecord $bookingB;

    protected function setUp(): void
    {
        parent::setUp();

        // Ensure database tables exist
        if (!\Illuminate\Support\Facades\Schema::hasTable('users')) {
            \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
        }

        // Clean up prior test records
        User::query()->delete();
        CrmRecord::query()->delete();

        // 1. Single Admin
        $this->admin = User::create([
            'name' => 'Atlas Administrator',
            'email' => 'admin@atlas-isle.local',
            'mobile' => '9876543210',
            'password' => Hash::make('Admin@123'),
            'is_admin' => true,
        ]);

        // 2. Customer A
        $this->customerA = CrmRecord::create([
            'module' => 'customers',
            'payload' => [
                'name' => 'Alice Walker',
                'email' => 'alice@example.com',
                'mobile' => '9988776655',
                'status' => 'active',
            ],
        ]);

        $this->bookingA = CrmRecord::create([
            'module' => 'bookings',
            'payload' => [
                'customer_id' => $this->customerA->id,
                'customer_name' => 'Alice Walker',
                'email' => 'alice@example.com',
                'mobile' => '9988776655',
                'destination' => 'Amalfi & Positano',
                'package_name' => 'Coastal Amalfi & Hidden Bays',
                'travel_date' => now()->addDays(20)->toDateString(),
                'status' => 'confirmed',
                'payment_status' => 'paid',
                'total_amount' => 195000,
                'paid_amount' => 195000,
                'due_amount' => 0,
            ],
        ]);

        // 3. Customer B
        $this->customerB = CrmRecord::create([
            'module' => 'customers',
            'payload' => [
                'name' => 'Bob Davis',
                'email' => 'bob@example.com',
                'mobile' => '9911223344',
                'status' => 'active',
            ],
        ]);

        $this->bookingB = CrmRecord::create([
            'module' => 'bookings',
            'payload' => [
                'customer_id' => $this->customerB->id,
                'customer_name' => 'Bob Davis',
                'email' => 'bob@example.com',
                'mobile' => '9911223344',
                'destination' => 'Kyoto & Nara',
                'package_name' => 'Kyoto Mornings & Forest Sanctuaries',
                'travel_date' => now()->addDays(40)->toDateString(),
                'status' => 'pending',
                'payment_status' => 'unpaid',
                'total_amount' => 245000,
                'paid_amount' => 0,
                'due_amount' => 245000,
            ],
        ]);
    }

    public function test_customer_otp_request_rejects_unregistered_identifier(): void
    {
        $response = $this->postJson('/api/customer/auth/request-otp', [
            'identifier' => 'unknown@nowhere.com',
        ]);

        $response->assertStatus(404);
        $this->assertStringContainsString('No bookings or customer profile found', $response->json('message'));
    }

    public function test_customer_otp_request_and_verification_flow(): void
    {
        $response = $this->postJson('/api/customer/auth/request-otp', [
            'identifier' => 'alice@example.com',
        ]);

        $response->assertStatus(200);
        $otp = $response->json('dev_otp');
        $this->assertNotEmpty($otp);

        // Verification with invalid OTP
        $badResp = $this->postJson('/api/customer/auth/verify-otp', [
            'identifier' => 'alice@example.com',
            'otp' => '000000',
        ]);
        $badResp->assertStatus(422);

        // Verification with valid OTP
        $validResp = $this->postJson('/api/customer/auth/verify-otp', [
            'identifier' => 'alice@example.com',
            'otp' => $otp,
        ]);
        $validResp->assertStatus(200);
        $this->assertNotEmpty($validResp->json('token'));
        $this->assertEquals('alice@example.com', $validResp->json('customer.email'));

        // Verify the user created has is_admin = false
        $user = User::where('email', 'alice@example.com')->first();
        $this->assertNotNull($user);
        $this->assertFalse($user->is_admin);
    }

    public function test_customer_token_cannot_access_admin_crm(): void
    {
        $customerUser = User::create([
            'name' => 'Alice Walker',
            'email' => 'alice@example.com',
            'password' => Hash::make('secret'),
            'is_admin' => false,
        ]);

        $token = $customerUser->createToken('customer-portal', ['customer'])->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/admin/dashboard');

        // Must be rejected by EnsureSingleAdmin (403 Forbidden)
        $response->assertStatus(403);
    }

    public function test_customer_cannot_view_another_customers_booking(): void
    {
        $customerUser = User::create([
            'name' => 'Alice Walker',
            'email' => 'alice@example.com',
            'password' => Hash::make('secret'),
            'is_admin' => false,
        ]);

        $token = $customerUser->createToken('customer-portal', ['customer'])->plainTextToken;

        // Alice views her own booking (bookingA) -> 200 OK
        $ownResp = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/customer/bookings/{$this->bookingA->id}");
        $ownResp->assertStatus(200);
        $this->assertEquals($this->bookingA->id, $ownResp->json('booking.id'));

        // Alice tries to view Bob's booking (bookingB) -> 403 Forbidden!
        $otherResp = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/customer/bookings/{$this->bookingB->id}");
        $otherResp->assertStatus(403);
        $this->assertStringContainsString('not authorized', $otherResp->json('message'));
    }

    public function test_customer_dashboard_returns_only_own_stats_and_bookings(): void
    {
        $customerUser = User::create([
            'name' => 'Alice Walker',
            'email' => 'alice@example.com',
            'password' => Hash::make('secret'),
            'is_admin' => false,
        ]);

        $token = $customerUser->createToken('customer-portal', ['customer'])->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/customer/dashboard');

        $response->assertStatus(200);
        $this->assertEquals(1, $response->json('stats.total_bookings'));
        $this->assertEquals(1, $response->json('stats.confirmed_bookings'));
        $this->assertEquals(0, $response->json('stats.pending_bookings')); // Bob has pending, Alice has 0
    }

    public function test_global_search_requires_authentication(): void
    {
        auth()->forgetGuards();
        $unauth = $this->flushHeaders()->getJson('/api/admin/search?q=Alice');
        $unauth->assertStatus(401);
    }

    public function test_global_search_returns_categorized_results(): void
    {
        $adminToken = $this->admin->createToken('admin', ['admin'])->plainTextToken;

        $resp = $this->withHeader('Authorization', "Bearer {$adminToken}")
            ->getJson('/api/admin/search?q=Alice');

        $resp->assertStatus(200);
        $this->assertGreaterThanOrEqual(1, $resp->json('total'));
        $this->assertArrayHasKey('customers', $resp->json('categories'));
    }

    public function test_public_blogs_strictly_excludes_draft_articles(): void
    {
        // Published article
        CrmRecord::create([
            'module' => 'blogs',
            'payload' => [
                'title' => 'Published Story',
                'slug' => 'published-story',
                'category' => 'Field Notes',
                'content' => 'Full public content',
                'status' => 'published',
            ],
        ]);

        // Draft article
        CrmRecord::create([
            'module' => 'blogs',
            'payload' => [
                'title' => 'Secret Draft Story',
                'slug' => 'secret-draft-story',
                'category' => 'Field Notes',
                'content' => 'Internal secret draft',
                'status' => 'draft',
            ],
        ]);

        $listResp = $this->getJson('/api/public/blogs');
        $listResp->assertStatus(200);

        $titles = collect($listResp->json('data'))->pluck('title')->all();
        $this->assertContains('Published Story', $titles);
        $this->assertNotContains('Secret Draft Story', $titles);

        // Direct lookup of published story
        $detailResp = $this->getJson('/api/public/blogs/published-story');
        $detailResp->assertStatus(200);

        // Direct lookup of draft story must fail (404)
        $draftResp = $this->getJson('/api/public/blogs/secret-draft-story');
        $draftResp->assertStatus(404);
    }
}
