<?php

namespace App\Http\Controllers;

use App\Models\CrmRecord;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CustomerPortalController extends Controller
{
    /**
     * Request a one-time verification code (OTP) for customer portal login.
     * Searches existing bookings or customer records by email or mobile.
     */
    public function requestOtp(Request $request): JsonResponse
    {
        $request->validate([
            'identifier' => 'required|string|max:190',
        ]);

        $identifier = trim($request->string('identifier'));
        $throttleKey = 'customer-otp|' . Str::transliterate(Str::lower($identifier) . '|' . $request->ip());

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            return response()->json([
                'message' => "Too many verification requests. Please try again in {$seconds} seconds.",
                'seconds_remaining' => $seconds,
            ], 429);
        }

        RateLimiter::hit($throttleKey, 300);

        // Check if any booking or customer record exists with this email or mobile
        $hasCustomer = CrmRecord::where('module', 'customers')
            ->where(function ($q) use ($identifier) {
                $q->where('payload->email', $identifier)
                  ->orWhere('payload->mobile', $identifier);
            })->exists();

        $hasBooking = CrmRecord::where('module', 'bookings')
            ->where(function ($q) use ($identifier) {
                $q->where('payload->email', $identifier)
                  ->orWhere('payload->mobile', $identifier);
            })->exists();

        if (!$hasCustomer && !$hasBooking) {
            return response()->json([
                'message' => 'No bookings or customer profile found matching that email or mobile number. Please check the details you entered or contact our travel team.',
            ], 404);
        }

        // Generate secure 6-digit OTP
        $otp = (string) random_int(100000, 999999);
        $cacheKey = 'cust_otp_' . md5(strtolower($identifier));

        Cache::put($cacheKey, [
            'otp' => $otp,
            'identifier' => $identifier,
            'attempts' => 0,
        ], now()->addMinutes(10));

        // Log OTP delivery for local environment (MAIL_MAILER=log)
        Log::info("Atlas & Isle Customer Portal OTP for [{$identifier}]: {$otp}");

        $response = [
            'message' => "A 6-digit verification code has been sent to {$identifier}. It is valid for 10 minutes.",
            'expires_in' => 600,
        ];

        // If local debug mode is active, include dev hint for easy testing
        if (config('app.debug')) {
            $response['dev_otp'] = $otp;
        }

        return response()->json($response);
    }

    /**
     * Verify OTP and issue customer-scoped Sanctum access token.
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        $request->validate([
            'identifier' => 'required|string|max:190',
            'otp' => 'required|string|min:6|max:6',
        ]);

        $identifier = trim($request->string('identifier'));
        $otp = trim($request->string('otp'));
        $cacheKey = 'cust_otp_' . md5(strtolower($identifier));

        $cached = Cache::get($cacheKey);

        if (!$cached) {
            return response()->json([
                'message' => 'The verification code has expired or was not requested. Please request a new code.',
            ], 422);
        }

        if ($cached['attempts'] >= 5) {
            Cache::forget($cacheKey);
            return response()->json([
                'message' => 'Too many incorrect attempts. Please request a new verification code.',
            ], 429);
        }

        if (!hash_equals($cached['otp'], $otp)) {
            $cached['attempts']++;
            Cache::put($cacheKey, $cached, now()->addMinutes(10));
            return response()->json([
                'message' => 'Invalid verification code. Please check the code and try again.',
            ], 422);
        }

        // OTP verified - clear cache
        Cache::forget($cacheKey);

        // Find customer details from CRM records
        $customerRecord = CrmRecord::where('module', 'customers')
            ->where(function ($q) use ($identifier) {
                $q->where('payload->email', $identifier)
                  ->orWhere('payload->mobile', $identifier);
            })->first();

        $bookingRecord = CrmRecord::where('module', 'bookings')
            ->where(function ($q) use ($identifier) {
                $q->where('payload->email', $identifier)
                  ->orWhere('payload->mobile', $identifier);
            })->latest()->first();

        $email = $customerRecord->payload['email'] ?? $bookingRecord->payload['email'] ?? (str_contains($identifier, '@') ? $identifier : null);
        $mobile = $customerRecord->payload['mobile'] ?? $bookingRecord->payload['mobile'] ?? (!str_contains($identifier, '@') ? $identifier : null);
        $name = $customerRecord->payload['name'] ?? $bookingRecord->payload['customer_name'] ?? 'Atlas Traveller';

        if (!$email) {
            $email = 'traveller_' . substr(md5($identifier), 0, 8) . '@atlas-isle.guest';
        }

        // Find or create non-admin customer User
        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'mobile' => $mobile,
                'password' => Hash::make(Str::random(32)),
                'is_admin' => false, // Customers are NEVER admins!
            ]
        );

        // Update mobile and name if available
        if ($mobile && empty($user->mobile)) {
            $user->mobile = $mobile;
            $user->save();
        }
        if ($name && $user->name === 'Atlas Traveller') {
            $user->name = $name;
            $user->save();
        }

        // Revoke prior customer tokens for clean session
        $user->tokens()->where('name', 'customer-portal')->delete();

        // Issue dedicated customer token
        $token = $user->createToken('customer-portal', ['customer'], now()->addDays(7));

        return response()->json([
            'token' => $token->plainTextToken,
            'customer' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'mobile' => $user->mobile,
            ],
            'message' => 'Signed in to Customer Portal successfully.',
        ]);
    }

    /**
     * Terminate the customer session.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();
        return response()->json(['message' => 'Signed out of Customer Portal successfully.']);
    }

    /**
     * Return authenticated customer profile.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        return response()->json([
            'customer' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'mobile' => $user->mobile,
            ],
        ]);
    }

    /**
     * Customer Dashboard summary.
     */
    public function dashboard(Request $request): JsonResponse
    {
        $user = $request->user();
        $bookings = $this->getCustomerBookings($user);

        $total = $bookings->count();
        $pending = $bookings->where('payload.status', 'pending')->count();
        $confirmed = $bookings->where('payload.status', 'confirmed')->count();
        $completed = $bookings->where('payload.status', 'completed')->count();

        $today = now()->toDateString();
        $upcoming = $bookings->filter(function ($b) use ($today) {
            $date = $b->payload['travel_date'] ?? null;
            $status = $b->payload['status'] ?? '';
            return $date && $date >= $today && $status !== 'cancelled';
        })->count();

        $recent = $bookings->take(3)->map(fn($b) => $this->presentBooking($b))->values();

        return response()->json([
            'customer_name' => $user->name,
            'customer_email' => $user->email,
            'customer_mobile' => $user->mobile,
            'stats' => [
                'total_bookings' => $total,
                'upcoming_trips' => $upcoming,
                'pending_bookings' => $pending,
                'confirmed_bookings' => $confirmed,
                'completed_trips' => $completed,
            ],
            'recent_bookings' => $recent,
        ]);
    }

    /**
     * List all bookings belonging to the authenticated customer.
     */
    public function bookings(Request $request): JsonResponse
    {
        $user = $request->user();
        $bookings = $this->getCustomerBookings($user)->map(fn($b) => $this->presentBooking($b))->values();

        return response()->json([
            'data' => $bookings,
            'total' => $bookings->count(),
        ]);
    }

    /**
     * View complete details for a single customer booking.
     * Enforces strict customer ownership authorization.
     */
    public function showBooking(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $booking = CrmRecord::where('module', 'bookings')->findOrFail($id);

        // Strict authorization check
        $this->authorizeCustomerBooking($user, $booking);

        $p = $booking->payload;
        $packageId = $p['package_id'] ?? null;

        // Fetch package details if available
        $package = null;
        if ($packageId) {
            $pkgRecord = CrmRecord::where('module', 'packages')->find($packageId);
            if ($pkgRecord) {
                $package = array_merge(['id' => $pkgRecord->id], $pkgRecord->payload);
            }
        }

        // Fetch itineraries linked to this booking or package
        $itineraries = CrmRecord::where('module', 'itineraries')
            ->where(function ($q) use ($id, $packageId) {
                $q->where('payload->booking_id', $id);
                if ($packageId) {
                    $q->orWhere('payload->package_id', $packageId);
                }
            })
            ->get()
            ->map(fn($r) => array_merge(['id' => $r->id], $r->payload))
            ->sortBy('day_number')
            ->values();

        // Fetch payment records for this booking
        $payments = CrmRecord::where('module', 'payments')
            ->where('payload->booking_id', $id)
            ->latest()
            ->get()
            ->map(fn($r) => array_merge(['id' => $r->id, 'created_at' => $r->created_at], $r->payload))
            ->values();

        // Fetch invoices for this booking
        $invoices = CrmRecord::where('module', 'invoices')
            ->where('payload->booking_id', $id)
            ->latest()
            ->get()
            ->map(fn($r) => array_merge(['id' => $r->id, 'created_at' => $r->created_at], $r->payload))
            ->values();

        // Fetch travel documents for this booking
        $documents = CrmRecord::where('module', 'documents')
            ->where('payload->booking_id', $id)
            ->get()
            ->map(fn($r) => [
                'id' => $r->id,
                'type' => $r->payload['type'] ?? 'Travel Document',
                'original_name' => $r->payload['original_name'] ?? 'document.pdf',
                'size' => $r->payload['size'] ?? 0,
                'notes' => $r->payload['notes'] ?? '',
                'created_at' => $r->created_at,
            ])
            ->values();

        // Generate timeline/status updates
        $status = $p['status'] ?? 'pending';
        $updates = [
            [
                'title' => 'Booking Request Submitted',
                'date' => $booking->created_at->format('M d, Y'),
                'description' => 'Your booking request was received by the Atlas & Isle concierge.',
                'completed' => true,
            ],
            [
                'title' => 'Confirmation & Deposit',
                'date' => in_array($status, ['confirmed', 'completed']) ? 'Confirmed' : 'Pending Review',
                'description' => in_array($status, ['confirmed', 'completed'])
                    ? 'Your journey has been confirmed and reserved.'
                    : 'Our travel team is preparing your itinerary confirmation.',
                'completed' => in_array($status, ['confirmed', 'completed']),
            ],
            [
                'title' => 'Travel Documents & Final Itinerary',
                'date' => $documents->count() > 0 ? 'Available' : 'Preparing',
                'description' => $documents->count() > 0
                    ? 'Your vouchers and travel notes are ready to download.'
                    : 'Travel documents will be issued prior to departure.',
                'completed' => $documents->count() > 0,
            ],
            [
                'title' => 'Departure Day',
                'date' => !empty($p['travel_date']) ? date('M d, Y', strtotime($p['travel_date'])) : 'TBD',
                'description' => 'Your adventure begins!',
                'completed' => !empty($p['travel_date']) && $p['travel_date'] < now()->toDateString(),
            ],
        ];

        return response()->json([
            'booking' => $this->presentBooking($booking),
            'package' => $package,
            'itineraries' => $itineraries,
            'payments' => $payments,
            'invoices' => $invoices,
            'documents' => $documents,
            'updates' => $updates,
        ]);
    }

    /**
     * Notifications for the authenticated customer.
     */
    public function notifications(Request $request): JsonResponse
    {
        $user = $request->user();
        $bookings = $this->getCustomerBookings($user);
        $notifications = [];

        foreach ($bookings as $b) {
            $p = $b->payload;
            $id = $b->id;
            $title = $p['package_name'] ?? $p['package'] ?? "Booking #{$id}";
            $status = $p['status'] ?? 'pending';
            $payStatus = $p['payment_status'] ?? 'unpaid';

            if ($status === 'confirmed') {
                $notifications[] = [
                    'id' => "conf_{$id}",
                    'type' => 'confirmation',
                    'title' => 'Booking Confirmed',
                    'message' => "Your journey to {$title} has been confirmed. Get ready for an unforgettable trip!",
                    'date' => $b->updated_at->format('M d, Y'),
                    'booking_id' => $id,
                ];
            }

            if ($payStatus === 'paid') {
                $notifications[] = [
                    'id' => "pay_{$id}",
                    'type' => 'payment',
                    'title' => 'Payment Received',
                    'message' => "Payment for {$title} has been successfully recorded.",
                    'date' => $b->updated_at->format('M d, Y'),
                    'booking_id' => $id,
                ];
            } elseif ($payStatus === 'partial' || ((float)($p['due_amount'] ?? 0) > 0)) {
                $notifications[] = [
                    'id' => "due_{$id}",
                    'type' => 'reminder',
                    'title' => 'Payment Reminder',
                    'message' => "A remaining balance is due for your upcoming journey to {$title}.",
                    'date' => $b->updated_at->format('M d, Y'),
                    'booking_id' => $id,
                ];
            }

            if (!empty($p['travel_date'])) {
                $days = (int) now()->diffInDays(\Carbon\Carbon::parse($p['travel_date']), false);
                if ($days > 0 && $days <= 30) {
                    $notifications[] = [
                        'id' => "remind_{$id}",
                        'type' => 'travel_reminder',
                        'title' => 'Travel Reminder',
                        'message' => "Your departure for {$title} is in {$days} days. Please check your travel checklist.",
                        'date' => now()->format('M d, Y'),
                        'booking_id' => $id,
                    ];
                }
            }

            if ($status === 'cancelled') {
                $notifications[] = [
                    'id' => "canc_{$id}",
                    'type' => 'cancellation',
                    'title' => 'Booking Update',
                    'message' => "Booking #{$id} ({$title}) has been updated to cancelled status.",
                    'date' => $b->updated_at->format('M d, Y'),
                    'booking_id' => $id,
                ];
            }
        }

        return response()->json([
            'data' => $notifications,
            'count' => count($notifications),
        ]);
    }

    /**
     * Download travel document for customer's own booking.
     */
    public function downloadDocument(Request $request, int $id): StreamedResponse|JsonResponse
    {
        $user = $request->user();
        $doc = CrmRecord::where('module', 'documents')->findOrFail($id);

        $bookingId = $doc->payload['booking_id'] ?? null;
        if ($bookingId) {
            $booking = CrmRecord::where('module', 'bookings')->find($bookingId);
            if ($booking) {
                $this->authorizeCustomerBooking($user, $booking);
            }
        }

        $path = $doc->payload['path'] ?? '';
        if (!$path || !Storage::disk('local')->exists($path)) {
            return response()->json(['message' => 'Document file not found on server.'], 404);
        }

        return Storage::disk('local')->download($path, $doc->payload['original_name'] ?? 'travel-document.pdf');
    }

    /**
     * Helper: retrieve bookings belonging strictly to the customer.
     */
    private function getCustomerBookings(User $user)
    {
        $email = $user->email;
        $mobile = $user->mobile;

        return CrmRecord::where('module', 'bookings')
            ->where(function ($q) use ($email, $mobile) {
                if ($email) {
                    $q->where('payload->email', $email);
                }
                if ($mobile) {
                    $q->orWhere('payload->mobile', $mobile);
                }
            })
            ->latest()
            ->get();
    }

    /**
     * Helper: format a booking record with package title and destination name.
     */
    private function presentBooking(CrmRecord $b): array
    {
        $p = $b->payload;
        $packageId = $p['package_id'] ?? null;
        $packageName = $p['package_name'] ?? $p['package'] ?? null;
        $destination = $p['destination'] ?? null;
        $image = null;

        if ($packageId) {
            $pkg = CrmRecord::where('module', 'packages')->find($packageId);
            if ($pkg) {
                $packageName = $packageName ?: ($pkg->payload['title'] ?? null);
                $destination = $destination ?: ($pkg->payload['destination'] ?? null);
                $image = $pkg->payload['image'] ?? null;
            }
        }

        $total = (float)($p['total_amount'] ?? 0);
        $paid = (float)($p['paid_amount'] ?? 0);
        $due = (float)($p['due_amount'] ?? max(0, $total - $paid));

        return [
            'id' => $b->id,
            'booking_id' => 'ATLAS-' . str_pad((string)$b->id, 5, '0', STR_PAD_LEFT),
            'customer_name' => $p['customer_name'] ?? $p['name'] ?? 'Guest',
            'email' => $p['email'] ?? null,
            'mobile' => $p['mobile'] ?? null,
            'package_id' => $packageId,
            'package_title' => $packageName ?: 'Custom Curated Journey',
            'destination' => $destination ?: 'Private Destination',
            'image' => $image,
            'travel_date' => $p['travel_date'] ?? null,
            'return_date' => $p['return_date'] ?? null,
            'travellers' => (int)($p['adults'] ?? $p['travellers'] ?? 1) + (int)($p['children'] ?? 0),
            'adults' => (int)($p['adults'] ?? $p['travellers'] ?? 1),
            'children' => (int)($p['children'] ?? 0),
            'status' => $p['status'] ?? 'pending',
            'payment_status' => $p['payment_status'] ?? ($paid >= $total && $total > 0 ? 'paid' : ($paid > 0 ? 'partial' : 'unpaid')),
            'total_amount' => $total,
            'paid_amount' => $paid,
            'due_amount' => $due,
            'special_requests' => $p['special_requests'] ?? $p['message'] ?? '',
            'created_at' => $b->created_at->format('M d, Y'),
        ];
    }

    /**
     * Authorize that the given booking belongs strictly to the authenticated customer.
     */
    private function authorizeCustomerBooking(User $user, CrmRecord $booking): void
    {
        $p = $booking->payload;
        $bEmail = $p['email'] ?? null;
        $bMobile = $p['mobile'] ?? null;

        $matchEmail = $user->email && $bEmail && strtolower($user->email) === strtolower($bEmail);
        $matchMobile = $user->mobile && $bMobile && preg_replace('/\D/', '', $user->mobile) === preg_replace('/\D/', '', $bMobile);

        abort_unless($matchEmail || $matchMobile, 403, 'You are not authorized to access this booking record.');
    }
}
