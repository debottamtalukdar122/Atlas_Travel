-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: atlas_travel
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
INSERT INTO `cache` VALUES ('atlas_cache5c785c036466adea360111aa28563bfd556b5fba','i:1;',1793512789),('atlas_cache5c785c036466adea360111aa28563bfd556b5fba:timer','i:1793512789;',1793512789),('atlas_cachecustomer-otp|kkundu249@gmail.com|127.0.0.1','i:1;',1793512799),('atlas_cachecustomer-otp|kkundu249@gmail.com|127.0.0.1:timer','i:1793512799;',1793512799),('atlas_cachecustomer-otp|unknown_guest@example.com|127.0.0.1','i:2;',1793512201),('atlas_cachecustomer-otp|unknown_guest@example.com|127.0.0.1:timer','i:1793512201;',1793512201),('atlas_cacheforgot-password|127.0.0.1','i:1;',1793474092),('atlas_cacheforgot-password|127.0.0.1:timer','i:1793474092;',1793474092);
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `crm_records`
--

DROP TABLE IF EXISTS `crm_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `crm_records` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `module` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` json NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `crm_records_module_created_at_index` (`module`,`created_at`),
  KEY `crm_records_module_index` (`module`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `crm_records`
--

LOCK TABLES `crm_records` WRITE;
/*!40000 ALTER TABLE `crm_records` DISABLE KEYS */;
INSERT INTO `crm_records` VALUES (3,'enquiries','{\"name\": \"Kiran Kundu\", \"email\": \"kkundu249@gmail.com\", \"mobile\": \"09641243721\", \"source\": \"website\", \"status\": \"inactive\", \"message\": \"hiiii\", \"booking_id\": 5, \"package_id\": null, \"travellers\": \"2\", \"customer_id\": 6, \"travel_date\": \"2027-08-22\"}','2026-10-31 13:47:16','2026-10-31 13:48:07'),(4,'bookings','{\"email\": \"kkundu249@gmail.com\", \"adults\": 2, \"mobile\": \"09641243721\", \"status\": \"pending\", \"children\": 0, \"package_id\": null, \"customer_id\": null, \"travel_date\": \"2027-08-22\", \"customer_name\": \"Kiran Kundu\", \"payment_status\": \"unpaid\", \"special_requests\": \"hiiii\", \"source_enquiry_id\": 3}','2026-10-31 13:47:42','2026-10-31 13:47:42'),(5,'bookings','{\"email\": \"kkundu249@gmail.com\", \"adults\": 2, \"mobile\": \"09641243721\", \"status\": \"pending\", \"children\": 0, \"package_id\": null, \"customer_id\": null, \"travel_date\": \"2027-08-22\", \"customer_name\": \"Kiran Kundu\", \"payment_status\": \"unpaid\", \"special_requests\": \"hiiii\", \"source_enquiry_id\": 3}','2026-10-31 13:47:47','2026-10-31 13:47:47'),(6,'customers','{\"name\": \"Kiran Kundu\", \"email\": \"kkundu249@gmail.com\", \"notes\": \"\", \"mobile\": \"09641243721\", \"status\": \"active\", \"source_enquiry_id\": 3}','2026-10-31 13:47:50','2026-10-31 13:47:50'),(7,'settings','{\"email\": \"hello@atlasandisle.com\", \"phone\": \"+91 96412 43721\", \"address\": \"Fort Kochi, Kerala, India\", \"currency\": \"INR\", \"tax_rate\": 5, \"whatsapp\": \"+91 96412 43721\", \"company_name\": \"Atlas & Isle Travel Co.\", \"invoice_prefix\": \"INV\", \"currency_symbol\": \"₹\"}','2026-10-31 23:59:29','2026-10-31 23:59:29'),(8,'destinations','{\"name\": \"Amalfi & Positano\", \"image\": \"https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80\", \"region\": \"Campania\", \"status\": \"published\", \"country\": \"Italy\", \"best_time\": \"May to October\", \"attractions\": \"Positano harbour, Ravello gardens, Path of the Gods, Capri day sail\", \"description\": \"Sun-drenched cliffs, fragrant lemon groves, and azure waters along Italy’s most dramatic coastline.\", \"travel_info\": \"Scenic coastal drives and boat connections between cliffside villages.\"}','2026-10-31 23:59:29','2026-10-31 23:59:29'),(9,'destinations','{\"name\": \"Kyoto & Nara\", \"image\": \"https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80\", \"region\": \"Kansai\", \"status\": \"published\", \"country\": \"Japan\", \"best_time\": \"March to May & October to November\", \"attractions\": \"Arashiyama bamboo grove, Fushimi Inari, Gion teahouses, Nara deer park\", \"description\": \"Ancient cedar forests, moss gardens, morning temple bells, and serene tea ceremonies.\", \"travel_info\": \"Seamless high-speed rail and charming walking paths.\"}','2026-10-31 23:59:29','2026-10-31 23:59:29'),(10,'destinations','{\"name\": \"Serengeti & Ngorongoro\", \"image\": \"https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80\", \"region\": \"East Africa\", \"status\": \"published\", \"country\": \"Tanzania\", \"best_time\": \"June to October & January to March\", \"attractions\": \"Serengeti plains, Ngorongoro crater, Olduvai gorge, Maasai cultural visits\", \"description\": \"Vast golden plains under endless skies, home to the Great Migration and untamed wilderness.\", \"travel_info\": \"Bush flights and custom open-roof 4x4 expedition vehicles.\"}','2026-10-31 23:59:29','2026-10-31 23:59:29'),(11,'destinations','{\"name\": \"Dolomites & South Tyrol\", \"image\": \"https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80\", \"region\": \"Alps\", \"status\": \"published\", \"country\": \"Italy\", \"best_time\": \"June to September for hiking; December to March for winter\", \"attractions\": \"Tre Cime di Lavaredo, Val di Funes, Lago di Braies, alpine rifugios\", \"description\": \"Pale jagged peaks, alpine wildflower meadows, and quiet refuge nights under a canopy of stars.\", \"travel_info\": \"Scenic cableways and quiet mountain passes.\"}','2026-10-31 23:59:29','2026-10-31 23:59:29'),(12,'packages','{\"slug\": \"coastal-amalfi-hidden-bays\", \"image\": \"https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80\", \"price\": 195000, \"terms\": \"Deposit of 25% due upon confirmation; balance due 30 days before departure.\", \"title\": \"Coastal Amalfi & Hidden Bays\", \"status\": \"published\", \"category\": \"Coastal\", \"duration\": \"7 days\", \"itinerary\": \"Day 1: Arrival in Naples & scenic transfer to Positano\\nDay 2: Morning walk through cliffside alleys & coastal sail\\nDay 3: Ravello gardens & mountaintop wine tasting\\nDay 4: Capri day expedition by private wooden boat\\nDay 5: Artisan ceramics & slow lunch in Amalfi town\\nDay 6: Path of the Gods trail & farewell feast\\nDay 7: Farewell breakfast and departure\", \"exclusions\": \"International flights, personal expenses, travel insurance\", \"highlights\": \"Private boat to Capri\'s secluded coves\\nHandmade pasta masterclass in Ravello\\nWalk the Path of the Gods with local naturalist\", \"inclusions\": \"Boutique cliffside hotel stays, daily artisan breakfasts, private boat charters, expert local guide, all transfers\", \"description\": \"Private wooden gozzo sails, cliffside lemon orchards, and sunset dinners overlooking the Tyrrhenian Sea.\", \"destination\": \"Campania, Italy\", \"max_travellers\": 10, \"cancellation_policy\": \"Full refund up to 45 days prior to travel; 50% refund between 44 and 20 days.\"}','2026-10-31 23:59:29','2026-10-31 23:59:29'),(13,'packages','{\"slug\": \"kyoto-mornings-forest-sanctuaries\", \"image\": \"https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80\", \"price\": 245000, \"terms\": \"Small group guaranteed with maximum 8 guests.\", \"title\": \"Kyoto Mornings & Forest Sanctuaries\", \"status\": \"published\", \"category\": \"Cultural\", \"duration\": \"9 days\", \"itinerary\": \"Day 1: Arrival in Kyoto & peaceful ryokan check-in\\nDay 2: Dawn walk in Arashiyama & Tenryu-ji gardens\\nDay 3: Tea ceremony and traditional matcha tasting\\nDay 4: Traditional paper-making workshop & Gion walk\\nDay 5: Day journey to ancient cedar forest in Yoshino\\nDay 6: Zen meditation with temple monk & temple vegetarian feast\\nDay 7: Private culinary tour through Nishiki Market\\nDay 8: Philosophy\'s Path walk & artisan craft studios\\nDay 9: Final morning tea and departure transfer\", \"exclusions\": \"International flights, alcoholic beverages, personal laundry\", \"highlights\": \"Private tea ceremony with a third-generation master\\nMorning meditation in Daitoku-ji temple\\nBespoke kaiseki dining in Gion\", \"inclusions\": \"Ryokan stays with private onsen, daily breakfast & multi-course kaiseki dinners, private guide, bullet train passes\", \"description\": \"Early dawn walks in bamboo groves, quiet wooden ryokan stays, and private zen garden meditations.\", \"destination\": \"Kyoto, Japan\", \"max_travellers\": 8, \"cancellation_policy\": \"Flexible cancellation up to 30 days before departure.\"}','2026-10-31 23:59:29','2026-10-31 23:59:29'),(14,'packages','{\"slug\": \"wild-at-heart-serengeti-expedition\", \"image\": \"https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80\", \"price\": 320000, \"terms\": \"All park permits and conservancy fees fully included.\", \"title\": \"Wild at Heart: Serengeti Expedition\", \"status\": \"published\", \"category\": \"Wildlife\", \"duration\": \"8 days\", \"itinerary\": \"Day 1: Arusha arrival & welcome camp briefing\\nDay 2: Scenic flight to northern Serengeti & afternoon safari\\nDay 3: Full-day migration tracking along the Mara River\\nDay 4: Dawn balloon flight & champagne bush breakfast\\nDay 5: Transit to central Serengeti & kopje exploration\\nDay 6: Ngorongoro Crater floor safari with picnic\\nDay 7: Conservation ranger walk & campfire storytelling\\nDay 8: Morning birdsong walk & scenic return flight\", \"exclusions\": \"International airfare, Tanzanian visa, guide gratuities\", \"highlights\": \"Sunrise hot air balloon safari over the plains\\nTracking big cats with master safari guides\\nPrivate bush dinners under the Milky Way\", \"inclusions\": \"Luxury tented suite accommodation, all meals & drinks, park fees, private safari vehicle, bush flights\", \"description\": \"Unrushed dawn game drives, luxury canvas under the southern stars, and intimate encounters with the Great Migration.\", \"destination\": \"Serengeti, Tanzania\", \"max_travellers\": 6, \"cancellation_policy\": \"Full refund minus permit fees up to 60 days before travel.\"}','2026-10-31 23:59:29','2026-10-31 23:59:29'),(15,'packages','{\"slug\": \"dolomite-high-trails-alpine-refuges\", \"image\": \"https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80\", \"price\": 175000, \"terms\": \"Moderate fitness required; daypack carrying only.\", \"title\": \"Dolomite High Trails & Alpine Refuges\", \"status\": \"published\", \"category\": \"Alpine\", \"duration\": \"6 days\", \"itinerary\": \"Day 1: Bolzano rendezvous & alpine valley transfer\\nDay 2: Val di Funes meadows & Odle peaks panoramic trail\\nDay 3: High ridge traverse into the heart of the Dolomites\\nDay 4: Tre Cime circular hike & sunset over rock spires\\nDay 5: Lago di Braies morning stillness & farewell dinner\\nDay 6: Farewell breakfast & transfer to Venice airport\", \"exclusions\": \"Flights, trail snacks, personal hiking equipment\", \"highlights\": \"Hike around Tre Cime di Lavaredo\\nComfortable night at an authentic mountain rifugio\\nFarm-to-table Ladin alpine dinners and local wines\", \"inclusions\": \"Charming alpine hotel & high refuge stays, all dinners and breakfasts, luggage transfers, mountain guide\", \"description\": \"Trek beneath towering limestone pinnacles, wake to sunrise over pale peaks, and savor hearty mountain hospitality.\", \"destination\": \"South Tyrol, Italy\", \"max_travellers\": 10, \"cancellation_policy\": \"Refundable up to 30 days prior to departure.\"}','2026-10-31 23:59:29','2026-10-31 23:59:29'),(16,'blogs','{\"slug\": \"in-praise-of-taking-the-slow-ferry\", \"tags\": \"Coastal, Slow Travel, Italy, Island Life\", \"image\": \"https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80\", \"title\": \"In Praise of Taking the Slow Ferry\", \"author\": \"Elena Rostova\", \"status\": \"published\", \"content\": \"There is an unspoken urge in modern travel to arrive before we have even begun. We check schedules, optimize connections, and calculate the quickest line between point A and point B.\\n\\nYet some of the finest journeys on earth refuse to be optimized. On the coast of Campania, between the citrus-strewn terraces of Sorrento and the pastel cliffs of Positano, there are two ways to travel. The first is a pressurized jet of diesel that deposits you on a crowded pier in twenty minutes. The second is the old morning wooden post boat.\\n\\nOn the slow ferry, salt spray coats your forearms. Fishermen mend their nets on the lower deck, their fingers moving with the rhythmic certainty of church bells. You watch the rock face shift from chalk white to burnt sienna as the morning sun climbs over the ridge.\\n\\nTravel, at its most restorative, is not about accumulation; it is about attention. When you take the longer way, you grant the destination time to meet you halfway.\", \"excerpt\": \"Why the thirty-minute hydrofoil misses everything the old morning wooden ferry was built to show you.\", \"category\": \"Field Notes\", \"featured\": true, \"read_time\": \"6 min read\", \"published_at\": \"2026-09-14\"}','2026-10-31 23:59:29','2026-10-31 23:59:29'),(17,'blogs','{\"slug\": \"architecture-of-silence-kyoto-dry-gardens\", \"tags\": \"Japan, Culture, Zen, Architecture\", \"image\": \"https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80\", \"title\": \"The Architecture of Silence: Kyoto’s Dry Gardens\", \"author\": \"Kenji Takahashi\", \"status\": \"published\", \"content\": \"At Ryoan-ji in north-western Kyoto, fifteen stones rest on a sea of raked white gravel. From whatever vantage point on the veranda you choose to sit, one stone is always obscured from sight.\\n\\nThis is not an accident of geometry; it is a philosophy rendered in quartz and moss. The designers understood that completeness is an illusion. The mind must supply what the eye cannot see.\\n\\nEarly morning is the only hour to visit. Before the tour coaches arrive, the veranda is cool cedar beneath bare feet. The only sound is water dripping from a bamboo spout into a stone basin.\\n\\nIn our hurried lives, silence is often treated as empty space waiting to be filled. Here, silence is the substance itself. It holds the garden together like mortar.\", \"excerpt\": \"Fifteen stones on raked white gravel. Understanding how Japanese master gardeners built spaces where thoughts quiet down.\", \"category\": \"Guides\", \"featured\": true, \"read_time\": \"8 min read\", \"published_at\": \"2026-08-22\"}','2026-10-31 23:59:29','2026-10-31 23:59:29'),(18,'blogs','{\"slug\": \"under-a-canopy-of-giants-nights-in-serengeti\", \"tags\": \"Wildlife, Africa, Photography, Stargazing\", \"image\": \"https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80\", \"title\": \"Under a Canopy of Giants: Nights in the Serengeti\", \"author\": \"Marcus Vance\", \"status\": \"published\", \"content\": \"City nights are loud with machines. Serengeti nights are loud with life.\\n\\nAs our campfire burned down to glowing embers of wild olive wood, our guide Peter signaled for silence. Two miles to the east, a low vibration rolled across the grass—the guttural sawing rasp of a territorial lion.\\n\\nAbove us, the Milky Way was so dense and bright it cast faint shadows on the canvas of our tents. There are no power grids for hundreds of miles. The constellations look three-dimensional, as if you could reach up and scoop a handful of diamonds from the ether.\\n\\nTo sleep in the African wilderness is to remember our species\' ancient lineage. We are guests here, temporary and fragile, surrounded by the eternal rhythms of the earth.\", \"excerpt\": \"When dusk settles across the acacia plains, the daytime world retreats and the true rulers of the savanna awaken.\", \"category\": \"Photo Stories\", \"featured\": false, \"read_time\": \"5 min read\", \"published_at\": \"2026-07-18\"}','2026-10-31 23:59:29','2026-10-31 23:59:29'),(19,'blogs','{\"slug\": \"finding-your-feet-in-high-dolomites\", \"tags\": \"Hiking, Alps, Italy, Mountain Life\", \"image\": \"https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80\", \"title\": \"Finding Your Feet in the High Dolomites\", \"author\": \"Clara Lindqvist\", \"status\": \"published\", \"content\": \"High above the timberline in South Tyrol, the light in September has a peculiar golden clarity. The crowds of midsummer have vanished, the mornings are crisp with frost, and the larch trees are turning from deep emerald to vibrant saffron.\\n\\nWalking from rifugio to rifugio transforms your relationship with distance. You carry only what fits in a thirty-liter pack: a wool layer, spare socks, a waterproof shell, and a book for the evening.\\n\\nEvery evening culminates in a timbered dining room smelling of cedar smoke and polenta. Strangers share tables, swap trail stories in three languages, and watch the legendary Enrosadira—the alpine glow that paints the pale limestone walls in shades of coral and rose before night falls.\", \"excerpt\": \"A practical guide to hut-to-hut trekking, packing light, and savoring Ladin mountain dinners.\", \"category\": \"Guides\", \"featured\": false, \"read_time\": \"7 min read\", \"published_at\": \"2026-06-30\"}','2026-10-31 23:59:29','2026-10-31 23:59:29'),(20,'blogs','{\"slug\": \"kitchens-of-oaxaca-study-in-patience\", \"tags\": \"Culinary, Mexico, Culture, Traditions\", \"image\": \"https://images.unsplash.com/photo-1512813195386-6cf811ad3542?auto=format&fit=crop&w=1200&q=80\", \"title\": \"The Kitchens of Oaxaca: A Study in Patience\", \"author\": \"Elena Rostova\", \"status\": \"published\", \"content\": \"Doña Rosa does not own a timer. She measures the readiness of chilhuacle chiles by their scent as they toast over charcoal on the circular clay comal.\\n\\nTo make a true mole negro takes three days. Seeds of coriander, cloves, cinnamon, dried plantain, and dark chocolate are ground together on volcanic metates until a fragrant paste forms.\\n\\nIn our world of instant gratification and fast casual dining, observing this process is a lesson in devotion. Food prepared with this degree of intention does not merely nourish; it connects you directly to ancestors who ground the same seeds five hundred years ago.\", \"excerpt\": \"Thirty ingredients toasted one by one on a clay comal. Why authentic mole negro cannot be rushed.\", \"category\": \"Slow Travel\", \"featured\": false, \"read_time\": \"6 min read\", \"published_at\": \"2026-05-12\"}','2026-10-31 23:59:29','2026-10-31 23:59:29'),(21,'blogs','{\"slug\": \"draft-secrets-scottish-highlands\", \"tags\": \"Scotland, Wilderness, Drafting\", \"image\": \"https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80\", \"title\": \"Draft: Secrets of the Scottish Highlands\", \"author\": \"Atlas Editorial\", \"status\": \"draft\", \"content\": \"This is an internal draft that should not be visible on the public website until published.\", \"excerpt\": \"Internal draft notes for upcoming Isle of Skye journey guide.\", \"category\": \"Field Notes\", \"featured\": false, \"read_time\": \"3 min read\", \"published_at\": null}','2026-10-31 23:59:29','2026-10-31 23:59:29');
/*!40000 ALTER TABLE `crm_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1),(2,'2025_01_01_000001_create_crm_tables',1),(3,'2026_01_01_000002_create_cache_tables',1),(4,'2026_01_01_000003_add_mobile_to_users_table',2);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notifiable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notifiable_id` bigint unsigned NOT NULL,
  `data` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_notifiable_type_notifiable_id_index` (`notifiable_type`,`notifiable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
INSERT INTO `password_reset_tokens` VALUES ('admin@atlas-isle.local','$2y$12$AnDJuRzUD89k6NXcXC3x4OgvhQHixDWRwzMOLBg9RCu9gxF6uusdW','2026-10-31 13:43:52');
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES (20,'App\\Models\\User',2,'customer-portal','8c116f04c418732096118a980724bb3ea57cfaf4b063e68b76afeeca7733edc3','[\"customer\"]','2026-11-01 00:42:49','2026-11-08 00:25:07','2026-11-01 00:25:07','2026-11-01 00:42:49'),(21,'App\\Models\\User',1,'admin','0f9dc13522ae15259c97f884621e70df60136bb9039ffcef6eae85a10e82563a','[\"admin\"]','2026-11-01 00:42:53','2026-11-01 12:28:50','2026-11-01 00:28:50','2026-11-01 00:42:53');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('iRNH9lJSo8OKVKeGjM1VTTPYEyBcKTc8NnmErmRq',1,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoib3ljZmpkUkRrZnBLem9HWjJIdVhaNzRZTzdocE11OXoxN2Z2RVlYZyI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NjQ6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9hcGkvYWRtaW4vZGFzaGJvYXJkP3BhZ2U9MSZzZWFyY2g9JnN0YXR1cz0iO3M6NToicm91dGUiO047fX0=',1793513573),('PSI37WDQ5tm9vBJzAPSvfUHBsJ1S0RL2xbczx986',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Antigravity/2.28.2 Chrome/152.0.7977.130 Electron/44.5.1 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiRDhNTmpSMG52WmtRSDRwSkc4eUJyazZwRk1ZOE5ZVlpCdTZOdkNUeiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9hcGkvcHVibGljL3BhY2thZ2VzIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1793512385),('SY9vGDzuUVQyWeatCF5tBbH5wra5O5HV6oy64LLd',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiOFZJZldLVWc1dTF2YmpGekxZNVZCaVhXdDR3N0poWGh0TVdsVm1VYSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9hcGkvcHVibGljL3BhY2thZ2VzIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1793509988),('tp7m0Slvv7QnbxuonJ4bWK1jjfR1mtnlqvilYjO1',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Antigravity/2.28.2 Chrome/152.0.7977.130 Electron/44.5.1 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoicGlqUHBCdkgzR3VHOHJKSE90UkxESm1iTlVPdDVkNnlBS0RFU0tucyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9hcGkvcHVibGljL3BhY2thZ2VzIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1793512385),('VInz0aITimQhHiGPEG6KalV89dEx4AJB4eJWuknN',NULL,'127.0.0.1','node','YTozOntzOjY6Il90b2tlbiI7czo0MDoiZzh3THFZTzhiV1N4TDFKNVlyc0JBR2xEVlBwMzJHMDZLRk5CQ2oydCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9zYW5jdHVtL2NzcmYtY29va2llIjtzOjU6InJvdXRlIjtzOjE5OiJzYW5jdHVtLmNzcmYtY29va2llIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1793512029),('wgVp0UVEWT7UESce3ccW2nYPe1wUgFDzaq8ydts4',NULL,'127.0.0.1','node','YTozOntzOjY6Il90b2tlbiI7czo0MDoiNDBXM3dZWnlYWjlOT2RUcXduSkhjUlVMVlFSeFJ0dHJ0a3Z1YXpLbiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9zYW5jdHVtL2NzcmYtY29va2llIjtzOjU6InJvdXRlIjtzOjE5OiJzYW5jdHVtLmNzcmYtY29va2llIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1793511901);
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mobile` varchar(25) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_admin` tinyint(1) NOT NULL DEFAULT '0',
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_mobile_unique` (`mobile`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Atlas Administrator','admin@atlas-isle.local',NULL,NULL,'$2y$12$HJcJLiUAtYW3rSrEWc45/.l7cmojBO0ZSfW/ixzZjwe.eAc0vqNEu',1,'j37uiRCs4uPyzniqW8c6PxY2bATRiYd6tlUm7rpo9Un07AhvzVcQsz8i2i56','2026-10-30 05:09:08','2026-10-31 13:17:33'),(2,'Kiran Kundu','kkundu249@gmail.com','09641243721',NULL,'$2y$12$ilwofH1uzWdCVuwhqG0ewe/oIjQGwr7LZkTAhA6kGYOOSMD7pl/5K',0,NULL,'2026-11-01 00:15:02','2026-11-01 00:15:02');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-05 13:23:40
