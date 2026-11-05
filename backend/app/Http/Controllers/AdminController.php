<?php

namespace App\Http\Controllers;

use App\Models\CrmRecord;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminController extends Controller
{
    private array $modules = [
        'enquiries', 'bookings', 'customers', 'packages', 'destinations',
        'quotations', 'payments', 'invoices', 'documents', 'itineraries',
        'follow-ups', 'hotels', 'transport', 'communications', 'offers',
        'blogs', 'pages', 'testimonials', 'gallery', 'subscribers',
        'notifications', 'settings'
    ];

    /**
     * Complete CRM Dashboard data according to Section 5 of project documentation.
     * Computes all KPI statistics, multi-dimensional charts, and real-time recent activity feeds.
     */
    public function dashboard(): JsonResponse
    {
        $all = CrmRecord::all();
        $records = fn(string $module) => $all->where('module', $module);
        $count = fn(string $module, ?string $status = null) => $records($module)->filter(
            fn($r) => $status === null || ($r->payload['status'] ?? '') === $status
        )->count();

        // Financials
        $payments = $records('payments');
        $bookings = $records('bookings');
        $enquiries = $records('enquiries');
        $customers = $records('customers');

        $paid = $payments->sum(fn($r) => (float)($r->payload['amount'] ?? 0));
        $due = $bookings->sum(fn($r) => (float)($r->payload['due_amount'] ?? 0));
        $totalRevenue = $paid + $due;

        $pendingPaymentsCount = $bookings->filter(function ($r) {
            $due = (float)($r->payload['due_amount'] ?? 0);
            $payStatus = $r->payload['payment_status'] ?? 'unpaid';
            return $due > 0 || $payStatus === 'unpaid' || $payStatus === 'partial';
        })->count();

        $today = now()->toDateString();
        $upcomingDeparturesCount = $bookings->filter(
            fn($r) => !empty($r->payload['travel_date']) && $r->payload['travel_date'] >= $today && ($r->payload['status'] ?? '') !== 'cancelled'
        )->count();

        $completedToursCount = $bookings->filter(
            fn($r) => ($r->payload['status'] ?? '') === 'completed' || (!empty($r->payload['travel_date']) && $r->payload['travel_date'] < $today && ($r->payload['status'] ?? '') === 'confirmed')
        )->count();

        // Charts: 6-month monthly trends (enquiries, bookings, revenue)
        $chart = collect(range(5, 0))->map(function ($offset) use ($all) {
            $month = now()->subMonths($offset);
            $inMonth = $all->filter(fn($r) => $r->created_at && $r->created_at->format('Y-m') === $month->format('Y-m'));
            return [
                'month' => $month->format('M'),
                'enquiries' => $inMonth->where('module', 'enquiries')->count(),
                'bookings' => $inMonth->where('module', 'bookings')->count(),
                'revenue' => (float)$inMonth->where('module', 'payments')->sum(fn($r) => (float)($r->payload['amount'] ?? 0)),
            ];
        })->values();

        // Chart: Popular Destinations
        $destMap = [];
        foreach ($bookings as $b) {
            $dest = $b->payload['destination'] ?? $b->payload['package_name'] ?? 'Other';
            $destMap[$dest] = ($destMap[$dest] ?? 0) + 1;
        }
        foreach ($records('destinations') as $d) {
            $name = $d->payload['name'] ?? '';
            if ($name && !isset($destMap[$name])) {
                $destMap[$name] = 0;
            }
        }
        arsort($destMap);
        $popularDestinations = collect($destMap)->take(5)->map(fn($cnt, $name) => ['name' => $name, 'count' => $cnt])->values();

        // Chart: Tour Package Performance
        $pkgPerformance = $records('packages')->map(function ($p) use ($bookings, $payments) {
            $pId = $p->id;
            $pBookings = $bookings->filter(fn($b) => ($b->payload['package_id'] ?? null) == $pId);
            $pRevenue = $pBookings->sum(fn($b) => (float)($b->payload['paid_amount'] ?? 0));
            return [
                'id' => $pId,
                'title' => $p->payload['title'] ?? "Package #{$pId}",
                'bookings' => $pBookings->count(),
                'revenue' => $pRevenue,
            ];
        })->sortByDesc('bookings')->take(5)->values();

        // Chart: Payment Status Breakdown
        $paymentStatusCounts = [
            'paid' => $bookings->where('payload.payment_status', 'paid')->count(),
            'partial' => $bookings->where('payload.payment_status', 'partial')->count(),
            'unpaid' => $bookings->filter(fn($b) => in_array($b->payload['payment_status'] ?? 'unpaid', ['unpaid', 'pending']))->count(),
        ];

        // Recent Activity: Enquiries
        $recentEnquiries = $enquiries->sortByDesc('created_at')->take(5)->map(
            fn($r) => array_merge(['id' => $r->id, 'created_at' => $r->created_at?->format('M d, Y') ?? '—'], $r->payload)
        )->values();

        // Recent Activity: Bookings
        $recentBookings = $bookings->sortByDesc('created_at')->take(5)->map(
            fn($r) => array_merge(['id' => $r->id, 'created_at' => $r->created_at?->format('M d, Y') ?? '—'], $r->payload)
        )->values();

        // Recent Activity: Payments
        $recentPayments = $payments->sortByDesc('created_at')->take(5)->map(
            fn($r) => array_merge(['id' => $r->id, 'created_at' => $r->created_at?->format('M d, Y') ?? '—'], $r->payload)
        )->values();

        // Recent Activity: Upcoming Departures
        $upcomingDepartures = $bookings->filter(
            fn($r) => !empty($r->payload['travel_date']) && $r->payload['travel_date'] >= $today && ($r->payload['status'] ?? '') !== 'cancelled'
        )->sortBy('payload.travel_date')->take(5)->map(
            fn($r) => array_merge(['id' => $r->id], $r->payload)
        )->values();

        // Pending Actions: Items needing attention
        $pendingActions = [];
        $unconvertedEnquiries = $enquiries->filter(fn($e) => in_array($e->payload['status'] ?? 'new', ['new', 'pending']))->take(4);
        foreach ($unconvertedEnquiries as $e) {
            $pendingActions[] = [
                'type' => 'enquiry',
                'title' => 'New enquiry from ' . ($e->payload['name'] ?? 'Guest'),
                'subtitle' => $e->payload['message'] ?? $e->payload['email'] ?? 'Website enquiry',
                'record_id' => $e->id,
                'target_module' => 'enquiries',
                'action_label' => 'Review',
            ];
        }

        $pendingBookingRequests = $bookings->where('payload.status', 'pending')->take(4);
        foreach ($pendingBookingRequests as $b) {
            $pendingActions[] = [
                'type' => 'booking',
                'title' => 'Booking #' . $b->id . ' pending confirmation',
                'subtitle' => ($b->payload['customer_name'] ?? 'Guest') . ' · ' . ($b->payload['travel_date'] ?? 'No date'),
                'record_id' => $b->id,
                'target_module' => 'bookings',
                'action_label' => 'Confirm',
            ];
        }

        // Settings / Currency
        $settingsRecord = $records('settings')->first();
        $currency = $settingsRecord->payload['currency'] ?? 'INR';
        $currencySymbol = $settingsRecord->payload['currency_symbol'] ?? '₹';

        return response()->json([
            // Statistics
            'total_enquiries' => $count('enquiries'),
            'new_enquiries' => $count('enquiries', 'new'),
            'total_customers' => $count('customers'),
            'active_customers' => $customers->filter(fn($r) => ($r->payload['status'] ?? 'active') === 'active')->count(),
            'total_bookings' => $count('bookings'),
            'pending_bookings' => $count('bookings', 'pending'),
            'confirmed_bookings' => $count('bookings', 'confirmed'),
            'cancelled_bookings' => $count('bookings', 'cancelled'),
            'completed_tours' => $completedToursCount,
            'upcoming_tours' => $upcomingDeparturesCount,
            'total_revenue' => $totalRevenue,
            'pending_payments' => $pendingPaymentsCount,
            'paid_amount' => $paid,
            'outstanding_amount' => $due,
            'upcoming_departures' => $upcomingDeparturesCount,

            // Charts
            'chart' => $chart,
            'popular_destinations' => $popularDestinations,
            'package_performance' => $pkgPerformance,
            'payment_status_breakdown' => $paymentStatusCounts,

            // Recent Activity
            'recent_enquiries' => $recentEnquiries,
            'recent_bookings' => $recentBookings,
            'recent_payments' => $recentPayments,
            'upcoming_departures_list' => $upcomingDepartures,
            'pending_actions' => $pendingActions,

            // Configuration
            'currency' => $currency,
            'currency_symbol' => $currencySymbol,
            'notifications' => $count('notifications', 'unread'),
        ]);
    }

    /**
     * Global Search across CRM records according to Section 25 of documentation.
     * Categorizes and indexes Customer Name, Mobile, Email, Booking ID, Enquiry ID,
     * Invoice Number, Payment Reference, Tour Package, and Destination.
     */
    public function globalSearch(Request $request): JsonResponse
    {
        $term = trim((string)$request->query('q', ''));
        if (mb_strlen($term) < 2) {
            return response()->json([
                'query' => $term,
                'total' => 0,
                'categories' => [],
                'results' => [],
            ]);
        }

        $allMatching = CrmRecord::where('payload', 'like', "%{$term}%")
            ->orWhere('id', 'like', "%{$term}%")
            ->latest()
            ->limit(100)
            ->get();

        $categories = [
            'customers' => [],
            'bookings' => [],
            'enquiries' => [],
            'invoices' => [],
            'payments' => [],
            'packages' => [],
            'destinations' => [],
        ];

        $flatResults = [];

        foreach ($allMatching as $r) {
            $p = $r->payload;
            $module = $r->module;
            $id = $r->id;

            $item = null;

            switch ($module) {
                case 'customers':
                    $item = [
                        'id' => $id,
                        'module' => 'customers',
                        'title' => $p['name'] ?? "Customer #{$id}",
                        'subtitle' => trim(($p['email'] ?? '') . ' · ' . ($p['mobile'] ?? '')),
                        'badge' => $p['status'] ?? 'active',
                        'record' => array_merge(['id' => $id], $p),
                    ];
                    $categories['customers'][] = $item;
                    break;

                case 'bookings':
                    $item = [
                        'id' => $id,
                        'module' => 'bookings',
                        'title' => 'Booking #' . $id . ' — ' . ($p['customer_name'] ?? $p['email'] ?? 'Guest'),
                        'subtitle' => ($p['destination'] ?? $p['package_name'] ?? 'Tour') . ' · ' . ($p['travel_date'] ?? 'No date') . ' · ' . ($p['payment_status'] ?? 'unpaid'),
                        'badge' => $p['status'] ?? 'pending',
                        'record' => array_merge(['id' => $id], $p),
                    ];
                    $categories['bookings'][] = $item;
                    break;

                case 'enquiries':
                    $item = [
                        'id' => $id,
                        'module' => 'enquiries',
                        'title' => 'Enquiry #' . $id . ' — ' . ($p['name'] ?? 'Guest'),
                        'subtitle' => ($p['email'] ?? '') . ' · ' . Str::limit($p['message'] ?? '', 45),
                        'badge' => $p['status'] ?? 'new',
                        'record' => array_merge(['id' => $id], $p),
                    ];
                    $categories['enquiries'][] = $item;
                    break;

                case 'invoices':
                    $item = [
                        'id' => $id,
                        'module' => 'invoices',
                        'title' => $p['invoice_number'] ?? "Invoice #{$id}",
                        'subtitle' => 'Booking #' . ($p['booking_id'] ?? '—') . ' · Total: ₹' . number_format((float)($p['total_amount'] ?? 0)),
                        'badge' => $p['status'] ?? 'issued',
                        'record' => array_merge(['id' => $id], $p),
                    ];
                    $categories['invoices'][] = $item;
                    break;

                case 'payments':
                    $item = [
                        'id' => $id,
                        'module' => 'payments',
                        'title' => 'Payment — ' . ($p['reference'] ?? "Ref #{$id}"),
                        'subtitle' => ($p['method'] ?? 'Manual') . ' · Amount: ₹' . number_format((float)($p['amount'] ?? 0)) . ' · Booking #' . ($p['booking_id'] ?? '—'),
                        'badge' => $p['status'] ?? 'completed',
                        'record' => array_merge(['id' => $id], $p),
                    ];
                    $categories['payments'][] = $item;
                    break;

                case 'packages':
                    $item = [
                        'id' => $id,
                        'module' => 'packages',
                        'title' => $p['title'] ?? "Package #{$id}",
                        'subtitle' => ($p['destination'] ?? '') . ' · ' . ($p['duration'] ?? '') . ' · ₹' . number_format((float)($p['price'] ?? 0)),
                        'badge' => $p['status'] ?? 'published',
                        'record' => array_merge(['id' => $id], $p),
                    ];
                    $categories['packages'][] = $item;
                    break;

                case 'destinations':
                    $item = [
                        'id' => $id,
                        'module' => 'destinations',
                        'title' => $p['name'] ?? "Destination #{$id}",
                        'subtitle' => trim(($p['country'] ?? '') . ' · ' . ($p['region'] ?? '')),
                        'badge' => $p['status'] ?? 'published',
                        'record' => array_merge(['id' => $id], $p),
                    ];
                    $categories['destinations'][] = $item;
                    break;
            }

            if ($item) {
                $flatResults[] = $item;
            }
        }

        // Filter out empty category lists
        $activeCategories = array_filter($categories, fn($list) => count($list) > 0);

        return response()->json([
            'query' => $term,
            'total' => count($flatResults),
            'categories' => $activeCategories,
            'results' => array_slice($flatResults, 0, 30),
        ]);
    }

    public function reports(Request $request): JsonResponse
    {
        $from = $request->date('from')?->startOfDay() ?? now()->subMonths(11)->startOfMonth();
        $to = $request->date('to')?->endOfDay() ?? now()->endOfDay();
        $all = CrmRecord::whereBetween('created_at', [$from, $to])->get();
        $group = fn($module) => $all->where('module', $module);
        $bookings = $group('bookings');
        $enquiries = $group('enquiries');
        $payments = $group('payments');

        return response()->json([
            'data' => [
                'period' => ['from' => $from->toDateString(), 'to' => $to->toDateString()],
                'customers' => $group('customers')->count(),
                'enquiries' => $enquiries->count(),
                'converted_enquiries' => $enquiries->whereIn('payload.status', ['converted'])->count(),
                'conversion_rate' => $enquiries->count() ? round($enquiries->where('payload.status', 'converted')->count() * 100 / $enquiries->count(), 1) : 0,
                'bookings' => $bookings->count(),
                'confirmed_bookings' => $bookings->where('payload.status', 'confirmed')->count(),
                'cancelled_bookings' => $bookings->where('payload.status', 'cancelled')->count(),
                'completed_bookings' => $bookings->where('payload.status', 'completed')->count(),
                'revenue' => $payments->sum(fn($r) => (float)($r->payload['amount'] ?? 0)),
                'payments' => $payments->count(),
                'popular_packages' => $bookings->groupBy(fn($r) => $r->payload['package_id'] ?? 'unspecified')->map->count()->sortDesc()->take(10),
                'timeline' => $all->groupBy(fn($r) => $r->created_at->format('Y-m'))->map(
                    fn($rows, $month) => [
                        'month' => $month,
                        'enquiries' => $rows->where('module', 'enquiries')->count(),
                        'bookings' => $rows->where('module', 'bookings')->count(),
                        'revenue' => $rows->where('module', 'payments')->sum(fn($r) => (float)($r->payload['amount'] ?? 0)),
                    ]
                )->values(),
            ],
        ]);
    }

    public function index(Request $request, string $module): JsonResponse
    {
        $this->allow($module);
        $query = CrmRecord::where('module', $module);
        if ($request->filled('search')) {
            $query->where('payload', 'like', '%' . $request->string('search') . '%');
        }
        if ($request->filled('status')) {
            $query->where('payload->status', $request->string('status'));
        }
        if ($request->filled('destination')) {
            $query->where('payload->destination', 'like', '%' . $request->string('destination') . '%');
        }
        $page = $query->latest()->paginate(min((int)$request->query('per_page', 25), 100));
        return response()->json([
            'data' => $page->getCollection()->map(fn($r) => $this->present($r)),
            'meta' => [
                'current_page' => $page->currentPage(),
                'last_page' => $page->lastPage(),
                'per_page' => $page->perPage(),
                'total' => $page->total(),
            ],
        ]);
    }

    public function store(Request $request, string $module): JsonResponse
    {
        $this->allow($module);
        $this->validateRecord($request, $module);
        $payload = $request->except(['id', 'created_at', 'updated_at']);

        if ($module === 'invoices' && empty($payload['invoice_number'])) {
            $payload['invoice_number'] = 'INV-' . now()->format('ymd') . '-' . str_pad((string)(CrmRecord::where('module', 'invoices')->count() + 1), 4, '0', STR_PAD_LEFT);
        }
        if ($module === 'payments' && !empty($payload['booking_id'])) {
            $this->applyPayment((int)$payload['booking_id'], (float)$payload['amount']);
        }

        $record = CrmRecord::create(['module' => $module, 'payload' => $payload]);
        return response()->json(['data' => $this->present($record)], 201);
    }

    public function update(Request $request, string $module, int $id): JsonResponse
    {
        $this->allow($module);
        $record = CrmRecord::where('module', $module)->findOrFail($id);
        $this->validateRecord($request, $module);
        $record->update(['payload' => array_merge($record->payload ?? [], $request->except(['id', 'created_at', 'updated_at']))]);
        return response()->json(['data' => $this->present($record->fresh())]);
    }

    public function destroy(string $module, int $id): \Illuminate\Http\Response
    {
        $this->allow($module);
        $record = CrmRecord::where('module', $module)->findOrFail($id);
        if ($module === 'documents' && !empty($record->payload['path'])) {
            Storage::disk('local')->delete($record->payload['path']);
        }
        $record->delete();
        return response()->noContent();
    }

    public function convertEnquiry(Request $request, int $id): JsonResponse
    {
        $data = $request->validate(['target' => 'required|in:customer,booking']);
        $enquiry = CrmRecord::where('module', 'enquiries')->findOrFail($id);
        $source = $enquiry->payload;

        if ($data['target'] === 'customer') {
            $existing = CrmRecord::where('module', 'customers')->where('payload->email', $source['email'] ?? '')->first();
            $customer = $existing ?? CrmRecord::create([
                'module' => 'customers',
                'payload' => [
                    'name' => $source['name'],
                    'email' => $source['email'] ?? null,
                    'mobile' => $source['mobile'] ?? null,
                    'status' => 'active',
                    'source_enquiry_id' => $id,
                    'notes' => $source['notes'] ?? '',
                ],
            ]);
            $enquiry->update(['payload' => array_merge($source, ['status' => 'converted', 'customer_id' => $customer->id])]);
            return response()->json([
                'data' => [
                    'customer' => $this->present($customer),
                    'enquiry' => $this->present($enquiry->fresh()),
                ],
            ]);
        }

        $booking = CrmRecord::create([
            'module' => 'bookings',
            'payload' => [
                'customer_id' => $source['customer_id'] ?? null,
                'customer_name' => $source['name'],
                'email' => $source['email'] ?? null,
                'mobile' => $source['mobile'] ?? null,
                'package_id' => $source['package_id'] ?? null,
                'travel_date' => $source['travel_date'] ?? null,
                'adults' => (int)($source['travellers'] ?? 1),
                'children' => 0,
                'status' => 'pending',
                'payment_status' => 'unpaid',
                'special_requests' => $source['message'] ?? '',
                'source_enquiry_id' => $id,
            ],
        ]);
        $enquiry->update(['payload' => array_merge($source, ['status' => 'converted', 'booking_id' => $booking->id])]);
        return response()->json([
            'data' => [
                'booking' => $this->present($booking),
                'enquiry' => $this->present($enquiry->fresh()),
            ],
        ], 201);
    }

    public function convertQuotation(int $id): JsonResponse
    {
        $quotation = CrmRecord::where('module', 'quotations')->findOrFail($id);
        abort_unless(($quotation->payload['status'] ?? 'draft') === 'accepted', 422, 'Only accepted quotations can become bookings.');
        if (!empty($quotation->payload['booking_id'])) {
            return response()->json(['data' => $this->present(CrmRecord::where('module', 'bookings')->findOrFail($quotation->payload['booking_id']))]);
        }
        $p = $quotation->payload;
        $booking = CrmRecord::create([
            'module' => 'bookings',
            'payload' => [
                'customer_id' => $p['customer_id'] ?? null,
                'package_id' => $p['package_id'] ?? null,
                'travel_date' => $p['travel_date'] ?? null,
                'adults' => (int)($p['travellers'] ?? 1),
                'children' => 0,
                'total_amount' => (float)($p['total_amount'] ?? 0),
                'paid_amount' => 0,
                'due_amount' => (float)($p['total_amount'] ?? 0),
                'status' => 'pending',
                'payment_status' => 'unpaid',
                'quotation_id' => $id,
            ],
        ]);
        $quotation->update(['payload' => array_merge($p, ['booking_id' => $booking->id, 'status' => 'converted'])]);
        return response()->json(['data' => $this->present($booking)], 201);
    }

    public function createInvoice(int $bookingId): JsonResponse
    {
        $booking = CrmRecord::where('module', 'bookings')->findOrFail($bookingId);
        $p = $booking->payload;
        $existing = CrmRecord::where('module', 'invoices')->where('payload->booking_id', $bookingId)->first();
        if ($existing) {
            return response()->json(['data' => $this->present($existing)]);
        }
        $invoice = CrmRecord::create([
            'module' => 'invoices',
            'payload' => [
                'invoice_number' => 'INV-' . now()->format('ymd') . '-' . str_pad((string)(CrmRecord::where('module', 'invoices')->count() + 1), 4, '0', STR_PAD_LEFT),
                'booking_id' => $bookingId,
                'customer_id' => $p['customer_id'] ?? null,
                'package_id' => $p['package_id'] ?? null,
                'travel_date' => $p['travel_date'] ?? null,
                'total_amount' => (float)($p['total_amount'] ?? 0),
                'paid_amount' => (float)($p['paid_amount'] ?? 0),
                'due_amount' => (float)($p['due_amount'] ?? $p['total_amount'] ?? 0),
                'status' => 'issued',
                'terms' => $p['terms'] ?? '',
            ],
        ]);
        return response()->json(['data' => $this->present($invoice)], 201);
    }

    public function uploadDocument(Request $request): JsonResponse
    {
        $data = $request->validate([
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png,webp,doc,docx|max:10240',
            'customer_id' => 'nullable|integer',
            'booking_id' => 'nullable|integer',
            'type' => 'required|string|max:80',
            'notes' => 'nullable|string|max:500',
        ]);
        $file = $request->file('file');
        $path = $file->store('travel-documents', 'local');
        $record = CrmRecord::create([
            'module' => 'documents',
            'payload' => [
                'customer_id' => $data['customer_id'] ?? null,
                'booking_id' => $data['booking_id'] ?? null,
                'type' => $data['type'],
                'notes' => $data['notes'] ?? null,
                'path' => $path,
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
                'status' => 'stored',
            ],
        ]);
        return response()->json(['data' => $this->present($record)], 201);
    }

    public function downloadDocument(int $id): StreamedResponse
    {
        $record = CrmRecord::where('module', 'documents')->findOrFail($id);
        $path = $record->payload['path'] ?? '';
        abort_unless($path && Storage::disk('local')->exists($path), 404);
        return Storage::disk('local')->download($path, $record->payload['original_name'] ?? basename($path));
    }

    private function applyPayment(int $bookingId, float $amount): void
    {
        $booking = CrmRecord::where('module', 'bookings')->find($bookingId);
        if (!$booking) return;
        $p = $booking->payload;
        $paid = (float)($p['paid_amount'] ?? 0) + $amount;
        $total = (float)($p['total_amount'] ?? 0);
        $due = max(0, $total - $paid);
        $booking->update([
            'payload' => array_merge($p, [
                'paid_amount' => $paid,
                'due_amount' => $due,
                'payment_status' => $due <= 0 ? 'paid' : 'partial',
            ]),
        ]);
    }

    private function present(CrmRecord $r): array
    {
        return array_merge([
            'id' => $r->id,
            'created_at' => $r->created_at,
            'updated_at' => $r->updated_at,
        ], $r->payload ?? []);
    }

    private function allow(string $module): void
    {
        abort_unless(in_array($module, $this->modules, true), 404);
    }

    private function validateRecord(Request $request, string $module): void
    {
        $rules = match ($module) {
            'customers' => ['email' => 'nullable|email', 'name' => 'required|string|max:150', 'mobile' => 'nullable|string|max:40'],
            'enquiries' => ['email' => 'nullable|email', 'name' => 'required|string|max:150'],
            'packages' => ['title' => 'required|string|max:180', 'price' => 'nullable|numeric|min:0', 'duration' => 'nullable|string|max:80'],
            'destinations' => ['name' => 'required|string|max:150'],
            'bookings' => ['travel_date' => 'nullable|date', 'return_date' => 'nullable|date|after_or_equal:travel_date', 'total_amount' => 'nullable|numeric|min:0', 'adults' => 'nullable|integer|min:0', 'children' => 'nullable|integer|min:0'],
            'payments' => ['amount' => 'required|numeric|min:0', 'booking_id' => 'nullable|integer', 'method' => 'required|string|max:40'],
            'quotations' => ['total_amount' => 'nullable|numeric|min:0', 'valid_until' => 'nullable|date'],
            'offers' => ['discount_value' => 'required|numeric|min:0', 'starts_at' => 'nullable|date', 'ends_at' => 'nullable|date|after_or_equal:starts_at'],
            'blogs' => ['title' => 'required|string|max:180'],
            'invoices' => ['total_amount' => 'required|numeric|min:0'],
            'subscribers' => ['email' => 'required|email|max:190'],
            default => []
        };
        if ($request->isMethod('put')) {
            foreach ($rules as $field => $rule) {
                $rules[$field] = 'sometimes|' . $rule;
            }
        }
        $request->validate($rules);
    }
}
