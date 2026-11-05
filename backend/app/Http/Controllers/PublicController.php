<?php

namespace App\Http\Controllers;

use App\Models\CrmRecord;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicController extends Controller
{
    /**
     * Publicly listed tour packages (published only).
     */
    public function packages(Request $request): JsonResponse
    {
        $q = CrmRecord::where('module', 'packages')->where('payload->status', 'published');

        if ($request->filled('search')) {
            $search = $request->string('search');
            $q->where(function ($sub) use ($search) {
                $sub->where('payload->title', 'like', "%{$search}%")
                    ->orWhere('payload->destination', 'like', "%{$search}%")
                    ->orWhere('payload->category', 'like', "%{$search}%")
                    ->orWhere('payload->description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('destination')) {
            $q->where('payload->destination', 'like', '%' . $request->string('destination') . '%');
        }

        if ($request->filled('category')) {
            $q->where('payload->category', $request->string('category'));
        }

        $page = $q->latest()->paginate(12);

        return response()->json([
            'data' => $page->getCollection()->map(fn($r) => array_merge(['id' => $r->id], $r->payload))->values(),
            'meta' => [
                'current_page' => $page->currentPage(),
                'last_page' => $page->lastPage(),
                'total' => $page->total(),
            ],
        ]);
    }

    /**
     * Public single package detail.
     */
    public function showPackage(string $slugOrId): JsonResponse
    {
        $pkg = CrmRecord::where('module', 'packages')
            ->where('payload->status', 'published')
            ->where(function ($q) use ($slugOrId) {
                if (is_numeric($slugOrId)) {
                    $q->where('id', (int)$slugOrId)->orWhere('payload->slug', $slugOrId);
                } else {
                    $q->where('payload->slug', $slugOrId);
                }
            })
            ->firstOrFail();

        $destRecord = null;
        $destId = $pkg->payload['destination_id'] ?? null;
        if ($destId) {
            $destRecord = CrmRecord::where('module', 'destinations')->find($destId);
        }

        return response()->json([
            'package' => array_merge(['id' => $pkg->id], $pkg->payload),
            'destination' => $destRecord ? array_merge(['id' => $destRecord->id], $destRecord->payload) : null,
        ]);
    }

    /**
     * Public destinations list.
     */
    public function destinations(): JsonResponse
    {
        $destinations = CrmRecord::where('module', 'destinations')
            ->where('payload->status', 'published')
            ->latest()
            ->get()
            ->map(fn($r) => array_merge(['id' => $r->id], $r->payload));

        return response()->json(['data' => $destinations]);
    }

    /**
     * Public Journal / Blog listing according to Section 3.7 of documentation.
     * Strictly filters for published status, supports search, category, tag,
     * and returns available categories and featured articles.
     */
    public function blogs(Request $request): JsonResponse
    {
        $base = CrmRecord::where('module', 'blogs')
            ->where('payload->status', 'published');

        // Extract all published categories and tags for frontend filter chips
        $allPublished = (clone $base)->get();
        $categories = $allPublished->pluck('payload.category')->filter()->unique()->values();
        $allTags = [];
        foreach ($allPublished as $item) {
            $tagStr = $item->payload['tags'] ?? '';
            foreach (explode(',', $tagStr) as $t) {
                $trimmed = trim($t);
                if ($trimmed !== '') {
                    $allTags[$trimmed] = ($allTags[$trimmed] ?? 0) + 1;
                }
            }
        }
        arsort($allTags);
        $topTags = array_slice(array_keys($allTags), 0, 10);

        // Featured stories
        $featured = $allPublished->filter(fn($r) => !empty($r->payload['featured']))->take(2)->map(
            fn($r) => array_merge(['id' => $r->id, 'created_at' => $r->created_at?->format('M d, Y')], $r->payload)
        )->values();

        // Main paginated query
        $q = clone $base;

        if ($request->filled('search')) {
            $search = $request->string('search');
            $q->where(function ($sub) use ($search) {
                $sub->where('payload->title', 'like', "%{$search}%")
                    ->orWhere('payload->excerpt', 'like', "%{$search}%")
                    ->orWhere('payload->content', 'like', "%{$search}%")
                    ->orWhere('payload->category', 'like', "%{$search}%")
                    ->orWhere('payload->tags', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category')) {
            $q->where('payload->category', $request->string('category'));
        }

        if ($request->filled('tag')) {
            $q->where('payload->tags', 'like', '%' . $request->string('tag') . '%');
        }

        $page = $q->latest()->paginate(9);

        return response()->json([
            'data' => $page->getCollection()->map(
                fn($r) => array_merge(['id' => $r->id, 'created_at' => $r->created_at?->format('M d, Y')], $r->payload)
            )->values(),
            'categories' => $categories,
            'tags' => $topTags,
            'featured' => $featured,
            'meta' => [
                'current_page' => $page->currentPage(),
                'last_page' => $page->lastPage(),
                'total' => $page->total(),
            ],
        ]);
    }

    /**
     * Individual Journal Article detail page with related articles.
     */
    public function showBlog(string $slugOrId): JsonResponse
    {
        $article = CrmRecord::where('module', 'blogs')
            ->where('payload->status', 'published')
            ->where(function ($q) use ($slugOrId) {
                if (is_numeric($slugOrId)) {
                    $q->where('id', (int)$slugOrId)->orWhere('payload->slug', $slugOrId);
                } else {
                    $q->where('payload->slug', $slugOrId);
                }
            })
            ->firstOrFail();

        $category = $article->payload['category'] ?? null;
        $id = $article->id;

        // Fetch related published articles
        $related = CrmRecord::where('module', 'blogs')
            ->where('payload->status', 'published')
            ->where('id', '!=', $id)
            ->when($category, fn($q) => $q->where('payload->category', $category))
            ->latest()
            ->take(3)
            ->get();

        // If fewer than 2 related by category, backfill with recent published
        if ($related->count() < 2) {
            $extra = CrmRecord::where('module', 'blogs')
                ->where('payload->status', 'published')
                ->where('id', '!=', $id)
                ->whereNotIn('id', $related->pluck('id'))
                ->latest()
                ->take(3 - $related->count())
                ->get();
            $related = $related->merge($extra);
        }

        return response()->json([
            'article' => array_merge(['id' => $article->id, 'created_at' => $article->created_at?->format('M d, Y')], $article->payload),
            'related' => $related->map(
                fn($r) => array_merge(['id' => $r->id, 'created_at' => $r->created_at?->format('M d, Y')], $r->payload)
            )->values(),
        ]);
    }

    /**
     * Public site settings & company details.
     */
    public function settings(): JsonResponse
    {
        $settings = CrmRecord::where('module', 'settings')->first();
        return response()->json([
            'settings' => $settings ? $settings->payload : [
                'company_name' => 'Atlas & Isle Travel Co.',
                'email' => 'hello@atlasandisle.com',
                'phone' => '+91 96412 43721',
                'currency' => 'INR',
                'currency_symbol' => '₹',
            ],
        ]);
    }

    /**
     * Submit an enquiry from website.
     */
    public function createEnquiry(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:120',
            'email' => 'required|email|max:190',
            'mobile' => 'required|string|max:40',
            'travellers' => 'nullable|integer|min:1|max:100',
            'travel_date' => 'nullable|date|after_or_equal:today',
            'message' => 'nullable|string|max:5000',
            'package_id' => 'nullable|integer',
        ]);
        $data['status'] = 'new';
        $data['source'] = 'website';
        $record = CrmRecord::create(['module' => 'enquiries', 'payload' => $data]);
        return response()->json(['message' => 'Enquiry received.', 'id' => $record->id], 201);
    }

    /**
     * Submit a booking request from website.
     */
    public function createBooking(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:120',
            'email' => 'required|email',
            'mobile' => 'required|string|max:40',
            'package_id' => 'required|integer',
            'travel_date' => 'required|date|after_or_equal:today',
            'travellers' => 'required|integer|min:1|max:100',
            'message' => 'nullable|string|max:5000',
        ]);

        // Find package price to calculate initial amounts
        $package = CrmRecord::where('module', 'packages')->find($data['package_id']);
        $price = (float)($package->payload['price'] ?? 0);
        $travellers = (int)$data['travellers'];
        $totalAmount = $price * $travellers;

        $data['customer_name'] = $data['name'];
        $data['package_name'] = $package->payload['title'] ?? 'Custom Tour';
        $data['destination'] = $package->payload['destination'] ?? 'Selected Destination';
        $data['adults'] = $travellers;
        $data['children'] = 0;
        $data['total_amount'] = $totalAmount;
        $data['paid_amount'] = 0;
        $data['due_amount'] = $totalAmount;
        $data['status'] = 'pending';
        $data['payment_status'] = 'unpaid';
        $data['source'] = 'website';

        $record = CrmRecord::create(['module' => 'bookings', 'payload' => $data]);
        return response()->json(['message' => 'Booking request received.', 'id' => $record->id], 201);
    }

    /**
     * Newsletter subscribe.
     */
    public function subscribe(Request $request): JsonResponse
    {
        $data = $request->validate(['email' => 'required|email|max:190']);
        $exists = CrmRecord::where('module', 'subscribers')->where('payload->email', $data['email'])->exists();
        if (!$exists) {
            CrmRecord::create(['module' => 'subscribers', 'payload' => ['email' => $data['email'], 'status' => 'subscribed', 'source' => 'website']]);
        }
        return response()->json(['message' => 'You are on the postcard list.']);
    }
}
