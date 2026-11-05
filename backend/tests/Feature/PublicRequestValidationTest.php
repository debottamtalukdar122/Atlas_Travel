<?php
namespace Tests\Feature;
use Tests\TestCase;
class PublicRequestValidationTest extends TestCase
{
    public function test_enquiry_requires_contact_fields(): void
    {
        $this->postJson('/api/public/enquiries',[])->assertUnprocessable()->assertJsonValidationErrors(['name','email','mobile']);
    }
    public function test_booking_requires_a_package_and_valid_travel_date(): void
    {
        $this->postJson('/api/public/bookings',[])->assertUnprocessable()->assertJsonValidationErrors(['name','email','mobile','package_id','travel_date','travellers']);
    }
    public function test_newsletter_subscription_requires_a_valid_email(): void
    {
        $this->postJson('/api/public/subscribers',['email'=>'not-an-email'])->assertUnprocessable()->assertJsonValidationErrors('email');
    }
}
