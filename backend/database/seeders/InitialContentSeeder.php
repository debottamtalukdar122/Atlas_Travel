<?php

namespace Database\Seeders;

use App\Models\CrmRecord;
use Illuminate\Database\Seeder;

class InitialContentSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Settings
        if (CrmRecord::where('module', 'settings')->count() === 0) {
            CrmRecord::create([
                'module' => 'settings',
                'payload' => [
                    'company_name' => 'Atlas & Isle Travel Co.',
                    'email' => 'hello@atlasandisle.com',
                    'phone' => '+91 96412 43721',
                    'address' => 'Fort Kochi, Kerala, India',
                    'whatsapp' => '+91 96412 43721',
                    'tax_rate' => 5,
                    'invoice_prefix' => 'INV',
                    'currency' => 'INR',
                    'currency_symbol' => '₹',
                ],
            ]);
        }

        // 2. Destinations
        if (CrmRecord::where('module', 'destinations')->count() === 0) {
            $destinations = [
                [
                    'name' => 'Amalfi & Positano',
                    'country' => 'Italy',
                    'region' => 'Campania',
                    'description' => 'Sun-drenched cliffs, fragrant lemon groves, and azure waters along Italy’s most dramatic coastline.',
                    'image' => 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
                    'attractions' => 'Positano harbour, Ravello gardens, Path of the Gods, Capri day sail',
                    'best_time' => 'May to October',
                    'travel_info' => 'Scenic coastal drives and boat connections between cliffside villages.',
                    'status' => 'published',
                ],
                [
                    'name' => 'Kyoto & Nara',
                    'country' => 'Japan',
                    'region' => 'Kansai',
                    'description' => 'Ancient cedar forests, moss gardens, morning temple bells, and serene tea ceremonies.',
                    'image' => 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
                    'attractions' => 'Arashiyama bamboo grove, Fushimi Inari, Gion teahouses, Nara deer park',
                    'best_time' => 'March to May & October to November',
                    'travel_info' => 'Seamless high-speed rail and charming walking paths.',
                    'status' => 'published',
                ],
                [
                    'name' => 'Serengeti & Ngorongoro',
                    'country' => 'Tanzania',
                    'region' => 'East Africa',
                    'description' => 'Vast golden plains under endless skies, home to the Great Migration and untamed wilderness.',
                    'image' => 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
                    'attractions' => 'Serengeti plains, Ngorongoro crater, Olduvai gorge, Maasai cultural visits',
                    'best_time' => 'June to October & January to March',
                    'travel_info' => 'Bush flights and custom open-roof 4x4 expedition vehicles.',
                    'status' => 'published',
                ],
                [
                    'name' => 'Dolomites & South Tyrol',
                    'country' => 'Italy',
                    'region' => 'Alps',
                    'description' => 'Pale jagged peaks, alpine wildflower meadows, and quiet refuge nights under a canopy of stars.',
                    'image' => 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
                    'attractions' => 'Tre Cime di Lavaredo, Val di Funes, Lago di Braies, alpine rifugios',
                    'best_time' => 'June to September for hiking; December to March for winter',
                    'travel_info' => 'Scenic cableways and quiet mountain passes.',
                    'status' => 'published',
                ],
            ];

            foreach ($destinations as $d) {
                CrmRecord::create(['module' => 'destinations', 'payload' => $d]);
            }
        }

        // 3. Tour Packages
        if (CrmRecord::where('module', 'packages')->count() === 0) {
            $packages = [
                [
                    'title' => 'Coastal Amalfi & Hidden Bays',
                    'slug' => 'coastal-amalfi-hidden-bays',
                    'destination' => 'Campania, Italy',
                    'category' => 'Coastal',
                    'duration' => '7 days',
                    'price' => 195000,
                    'max_travellers' => 10,
                    'image' => 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
                    'description' => 'Private wooden gozzo sails, cliffside lemon orchards, and sunset dinners overlooking the Tyrrhenian Sea.',
                    'highlights' => "Private boat to Capri's secluded coves\nHandmade pasta masterclass in Ravello\nWalk the Path of the Gods with local naturalist",
                    'itinerary' => "Day 1: Arrival in Naples & scenic transfer to Positano\nDay 2: Morning walk through cliffside alleys & coastal sail\nDay 3: Ravello gardens & mountaintop wine tasting\nDay 4: Capri day expedition by private wooden boat\nDay 5: Artisan ceramics & slow lunch in Amalfi town\nDay 6: Path of the Gods trail & farewell feast\nDay 7: Farewell breakfast and departure",
                    'inclusions' => 'Boutique cliffside hotel stays, daily artisan breakfasts, private boat charters, expert local guide, all transfers',
                    'exclusions' => 'International flights, personal expenses, travel insurance',
                    'terms' => 'Deposit of 25% due upon confirmation; balance due 30 days before departure.',
                    'cancellation_policy' => 'Full refund up to 45 days prior to travel; 50% refund between 44 and 20 days.',
                    'status' => 'published',
                ],
                [
                    'title' => 'Kyoto Mornings & Forest Sanctuaries',
                    'slug' => 'kyoto-mornings-forest-sanctuaries',
                    'destination' => 'Kyoto, Japan',
                    'category' => 'Cultural',
                    'duration' => '9 days',
                    'price' => 245000,
                    'max_travellers' => 8,
                    'image' => 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
                    'description' => 'Early dawn walks in bamboo groves, quiet wooden ryokan stays, and private zen garden meditations.',
                    'highlights' => "Private tea ceremony with a third-generation master\nMorning meditation in Daitoku-ji temple\nBespoke kaiseki dining in Gion",
                    'itinerary' => "Day 1: Arrival in Kyoto & peaceful ryokan check-in\nDay 2: Dawn walk in Arashiyama & Tenryu-ji gardens\nDay 3: Tea ceremony and traditional matcha tasting\nDay 4: Traditional paper-making workshop & Gion walk\nDay 5: Day journey to ancient cedar forest in Yoshino\nDay 6: Zen meditation with temple monk & temple vegetarian feast\nDay 7: Private culinary tour through Nishiki Market\nDay 8: Philosophy's Path walk & artisan craft studios\nDay 9: Final morning tea and departure transfer",
                    'inclusions' => 'Ryokan stays with private onsen, daily breakfast & multi-course kaiseki dinners, private guide, bullet train passes',
                    'exclusions' => 'International flights, alcoholic beverages, personal laundry',
                    'terms' => 'Small group guaranteed with maximum 8 guests.',
                    'cancellation_policy' => 'Flexible cancellation up to 30 days before departure.',
                    'status' => 'published',
                ],
                [
                    'title' => 'Wild at Heart: Serengeti Expedition',
                    'slug' => 'wild-at-heart-serengeti-expedition',
                    'destination' => 'Serengeti, Tanzania',
                    'category' => 'Wildlife',
                    'duration' => '8 days',
                    'price' => 320000,
                    'max_travellers' => 6,
                    'image' => 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
                    'description' => 'Unrushed dawn game drives, luxury canvas under the southern stars, and intimate encounters with the Great Migration.',
                    'highlights' => "Sunrise hot air balloon safari over the plains\nTracking big cats with master safari guides\nPrivate bush dinners under the Milky Way",
                    'itinerary' => "Day 1: Arusha arrival & welcome camp briefing\nDay 2: Scenic flight to northern Serengeti & afternoon safari\nDay 3: Full-day migration tracking along the Mara River\nDay 4: Dawn balloon flight & champagne bush breakfast\nDay 5: Transit to central Serengeti & kopje exploration\nDay 6: Ngorongoro Crater floor safari with picnic\nDay 7: Conservation ranger walk & campfire storytelling\nDay 8: Morning birdsong walk & scenic return flight",
                    'inclusions' => 'Luxury tented suite accommodation, all meals & drinks, park fees, private safari vehicle, bush flights',
                    'exclusions' => 'International airfare, Tanzanian visa, guide gratuities',
                    'terms' => 'All park permits and conservancy fees fully included.',
                    'cancellation_policy' => 'Full refund minus permit fees up to 60 days before travel.',
                    'status' => 'published',
                ],
                [
                    'title' => 'Dolomite High Trails & Alpine Refuges',
                    'slug' => 'dolomite-high-trails-alpine-refuges',
                    'destination' => 'South Tyrol, Italy',
                    'category' => 'Alpine',
                    'duration' => '6 days',
                    'price' => 175000,
                    'max_travellers' => 10,
                    'image' => 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
                    'description' => 'Trek beneath towering limestone pinnacles, wake to sunrise over pale peaks, and savor hearty mountain hospitality.',
                    'highlights' => "Hike around Tre Cime di Lavaredo\nComfortable night at an authentic mountain rifugio\nFarm-to-table Ladin alpine dinners and local wines",
                    'itinerary' => "Day 1: Bolzano rendezvous & alpine valley transfer\nDay 2: Val di Funes meadows & Odle peaks panoramic trail\nDay 3: High ridge traverse into the heart of the Dolomites\nDay 4: Tre Cime circular hike & sunset over rock spires\nDay 5: Lago di Braies morning stillness & farewell dinner\nDay 6: Farewell breakfast & transfer to Venice airport",
                    'inclusions' => 'Charming alpine hotel & high refuge stays, all dinners and breakfasts, luggage transfers, mountain guide',
                    'exclusions' => 'Flights, trail snacks, personal hiking equipment',
                    'terms' => 'Moderate fitness required; daypack carrying only.',
                    'cancellation_policy' => 'Refundable up to 30 days prior to departure.',
                    'status' => 'published',
                ],
            ];

            foreach ($packages as $p) {
                CrmRecord::create(['module' => 'packages', 'payload' => $p]);
            }
        }

        // 4. Blog / Journal Articles
        if (CrmRecord::where('module', 'blogs')->count() === 0) {
            $blogs = [
                [
                    'title' => 'In Praise of Taking the Slow Ferry',
                    'slug' => 'in-praise-of-taking-the-slow-ferry',
                    'category' => 'Field Notes',
                    'tags' => 'Coastal, Slow Travel, Italy, Island Life',
                    'image' => 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
                    'excerpt' => 'Why the thirty-minute hydrofoil misses everything the old morning wooden ferry was built to show you.',
                    'content' => "There is an unspoken urge in modern travel to arrive before we have even begun. We check schedules, optimize connections, and calculate the quickest line between point A and point B.\n\nYet some of the finest journeys on earth refuse to be optimized. On the coast of Campania, between the citrus-strewn terraces of Sorrento and the pastel cliffs of Positano, there are two ways to travel. The first is a pressurized jet of diesel that deposits you on a crowded pier in twenty minutes. The second is the old morning wooden post boat.\n\nOn the slow ferry, salt spray coats your forearms. Fishermen mend their nets on the lower deck, their fingers moving with the rhythmic certainty of church bells. You watch the rock face shift from chalk white to burnt sienna as the morning sun climbs over the ridge.\n\nTravel, at its most restorative, is not about accumulation; it is about attention. When you take the longer way, you grant the destination time to meet you halfway.",
                    'author' => 'Elena Rostova',
                    'read_time' => '6 min read',
                    'published_at' => '2026-09-14',
                    'featured' => true,
                    'status' => 'published',
                ],
                [
                    'title' => 'The Architecture of Silence: Kyoto’s Dry Gardens',
                    'slug' => 'architecture-of-silence-kyoto-dry-gardens',
                    'category' => 'Guides',
                    'tags' => 'Japan, Culture, Zen, Architecture',
                    'image' => 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
                    'excerpt' => 'Fifteen stones on raked white gravel. Understanding how Japanese master gardeners built spaces where thoughts quiet down.',
                    'content' => "At Ryoan-ji in north-western Kyoto, fifteen stones rest on a sea of raked white gravel. From whatever vantage point on the veranda you choose to sit, one stone is always obscured from sight.\n\nThis is not an accident of geometry; it is a philosophy rendered in quartz and moss. The designers understood that completeness is an illusion. The mind must supply what the eye cannot see.\n\nEarly morning is the only hour to visit. Before the tour coaches arrive, the veranda is cool cedar beneath bare feet. The only sound is water dripping from a bamboo spout into a stone basin.\n\nIn our hurried lives, silence is often treated as empty space waiting to be filled. Here, silence is the substance itself. It holds the garden together like mortar.",
                    'author' => 'Kenji Takahashi',
                    'read_time' => '8 min read',
                    'published_at' => '2026-08-22',
                    'featured' => true,
                    'status' => 'published',
                ],
                [
                    'title' => 'Under a Canopy of Giants: Nights in the Serengeti',
                    'slug' => 'under-a-canopy-of-giants-nights-in-serengeti',
                    'category' => 'Photo Stories',
                    'tags' => 'Wildlife, Africa, Photography, Stargazing',
                    'image' => 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
                    'excerpt' => 'When dusk settles across the acacia plains, the daytime world retreats and the true rulers of the savanna awaken.',
                    'content' => "City nights are loud with machines. Serengeti nights are loud with life.\n\nAs our campfire burned down to glowing embers of wild olive wood, our guide Peter signaled for silence. Two miles to the east, a low vibration rolled across the grass—the guttural sawing rasp of a territorial lion.\n\nAbove us, the Milky Way was so dense and bright it cast faint shadows on the canvas of our tents. There are no power grids for hundreds of miles. The constellations look three-dimensional, as if you could reach up and scoop a handful of diamonds from the ether.\n\nTo sleep in the African wilderness is to remember our species' ancient lineage. We are guests here, temporary and fragile, surrounded by the eternal rhythms of the earth.",
                    'author' => 'Marcus Vance',
                    'read_time' => '5 min read',
                    'published_at' => '2026-07-18',
                    'featured' => false,
                    'status' => 'published',
                ],
                [
                    'title' => 'Finding Your Feet in the High Dolomites',
                    'slug' => 'finding-your-feet-in-high-dolomites',
                    'category' => 'Guides',
                    'tags' => 'Hiking, Alps, Italy, Mountain Life',
                    'image' => 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
                    'excerpt' => 'A practical guide to hut-to-hut trekking, packing light, and savoring Ladin mountain dinners.',
                    'content' => "High above the timberline in South Tyrol, the light in September has a peculiar golden clarity. The crowds of midsummer have vanished, the mornings are crisp with frost, and the larch trees are turning from deep emerald to vibrant saffron.\n\nWalking from rifugio to rifugio transforms your relationship with distance. You carry only what fits in a thirty-liter pack: a wool layer, spare socks, a waterproof shell, and a book for the evening.\n\nEvery evening culminates in a timbered dining room smelling of cedar smoke and polenta. Strangers share tables, swap trail stories in three languages, and watch the legendary Enrosadira—the alpine glow that paints the pale limestone walls in shades of coral and rose before night falls.",
                    'author' => 'Clara Lindqvist',
                    'read_time' => '7 min read',
                    'published_at' => '2026-06-30',
                    'featured' => false,
                    'status' => 'published',
                ],
                [
                    'title' => 'The Kitchens of Oaxaca: A Study in Patience',
                    'slug' => 'kitchens-of-oaxaca-study-in-patience',
                    'category' => 'Slow Travel',
                    'tags' => 'Culinary, Mexico, Culture, Traditions',
                    'image' => 'https://images.unsplash.com/photo-1512813195386-6cf811ad3542?auto=format&fit=crop&w=1200&q=80',
                    'excerpt' => 'Thirty ingredients toasted one by one on a clay comal. Why authentic mole negro cannot be rushed.',
                    'content' => "Doña Rosa does not own a timer. She measures the readiness of chilhuacle chiles by their scent as they toast over charcoal on the circular clay comal.\n\nTo make a true mole negro takes three days. Seeds of coriander, cloves, cinnamon, dried plantain, and dark chocolate are ground together on volcanic metates until a fragrant paste forms.\n\nIn our world of instant gratification and fast casual dining, observing this process is a lesson in devotion. Food prepared with this degree of intention does not merely nourish; it connects you directly to ancestors who ground the same seeds five hundred years ago.",
                    'author' => 'Elena Rostova',
                    'read_time' => '6 min read',
                    'published_at' => '2026-05-12',
                    'featured' => false,
                    'status' => 'published',
                ],
                [
                    'title' => 'Draft: Secrets of the Scottish Highlands',
                    'slug' => 'draft-secrets-scottish-highlands',
                    'category' => 'Field Notes',
                    'tags' => 'Scotland, Wilderness, Drafting',
                    'image' => 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
                    'excerpt' => 'Internal draft notes for upcoming Isle of Skye journey guide.',
                    'content' => "This is an internal draft that should not be visible on the public website until published.",
                    'author' => 'Atlas Editorial',
                    'read_time' => '3 min read',
                    'published_at' => null,
                    'featured' => false,
                    'status' => 'draft',
                ],
            ];

            foreach ($blogs as $b) {
                CrmRecord::create(['module' => 'blogs', 'payload' => $b]);
            }
        }
    }
}
