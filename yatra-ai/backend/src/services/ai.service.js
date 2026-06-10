const { GoogleGenerativeAI } = require('@google/generative-ai')
const axios = require('axios')

let genAI = null

function getGenAI() {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  }
  return genAI
}

// ── Nominatim geocoder — fetch REAL coordinates for a place name ──────────────

const nominatimHeaders = { 'User-Agent': 'YatraAI/1.0 (travel planner app)' }
const geocodeCache = new Map()

async function geocodePlaceName(name, destination) {
  const cacheKey = `${name}||${destination}`
  if (geocodeCache.has(cacheKey)) return geocodeCache.get(cacheKey)

  await new Promise(r => setTimeout(r, 1100))

  const queries = [
    `${name}, ${destination}`,
    `${name}`,
  ]

  for (const q of queries) {
    try {
      const res = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: { q, format: 'json', limit: 1, addressdetails: 0 },
        headers: nominatimHeaders,
        timeout: 8000,
      })
      if (res.data && res.data.length > 0) {
        const result = {
          lat: parseFloat(res.data[0].lat),
          lon: parseFloat(res.data[0].lon),
        }
        geocodeCache.set(cacheKey, result)
        console.log(`  ✅ Geocoded "${name}" → ${result.lat}, ${result.lon}`)
        return result
      }
    } catch (err) {
      console.warn(`  ⚠️  Geocode failed for "${q}": ${err.message}`)
    }
  }

  console.warn(`  ❌ Could not geocode "${name}" — keeping original coords`)
  geocodeCache.set(cacheKey, null)
  return null
}

// ── Enrich all place lat/lons with real geocoded coords ──────────────────────

async function enrichWithRealCoords(itinerary, destination) {
  console.log(`🌍 Enriching place coordinates with real geocoded data...`)
  const allPlaces = []

  for (const day of (itinerary.days || [])) {
    for (const place of (day.places || [])) {
      allPlaces.push({ obj: place, name: place.name })
    }
    const meals = day.meals || {}
    for (const meal of Object.values(meals)) {
      if (meal && meal.name) allPlaces.push({ obj: meal, name: meal.name })
    }
  }
  for (const gem of (itinerary.hiddenGems || [])) {
    allPlaces.push({ obj: gem, name: gem.name })
  }
  for (const attr of (itinerary.nearbyAttractions || [])) {
    allPlaces.push({ obj: attr, name: attr.name })
  }

  for (const item of allPlaces) {
    const coords = await geocodePlaceName(item.name, destination)
    if (coords) {
      item.obj.lat = coords.lat
      item.obj.lon = coords.lon
    }
  }

  console.log(`✅ Geocoding complete for ${allPlaces.length} places`)
  return itinerary
}

// ── Prompt builder ────────────────────────────────────────────────────────────

function buildTripPrompt({ destination, days, budget, budgetAmount, travelMode, interests, explorerMode, travelers, coordinates, weather }) {
  const mode = explorerMode
    ? 'EXPLORER MODE: Focus on hidden gems, off-beat locations, local cafés, peaceful spots, photography locations, underrated experiences. Avoid tourist traps.'
    : 'TOURIST MODE: Focus on iconic landmarks, popular attractions, famous restaurants, well-known experiences. Include must-sees.'

  const weatherContext = weather
    ? `Current weather: ${weather.temp}°C, ${weather.description}, humidity ${weather.humidity}%. Factor this into recommendations.`
    : ''

  const coordContext = coordinates
    ? `Destination coordinates: lat ${coordinates.lat}, lon ${coordinates.lon}. Use REAL coordinates for every place you suggest — must be accurate to within 1km.`
    : ''

  return `You are an expert AI travel planner with deep knowledge of destinations worldwide.

TRIP REQUEST:
- Destination: ${destination}
- Duration: ${days} days
- Budget Type: ${budget} (estimated ${budgetAmount || 2000} INR per person per day)
- Travel Mode: ${travelMode}
- Interests: ${(interests || []).join(', ')}
- Travelers: ${travelers || 2} people
- Planning Mode: ${mode}
${weatherContext}
${coordContext}

CRITICAL INSTRUCTIONS:
1. ONLY suggest REAL, EXISTING places that actually exist in ${destination}.
2. Use the EXACT real names of actual places (e.g. "Amber Fort" not "Heritage Fort", "Varanasi Ghats" not "Riverside Promenade").
3. Each place must be a verifiable real-world location.
4. Coordinates will be auto-verified — focus on real place names.
5. Include realistic cost estimates in INR.
6. Consider travel time between locations — keep daily plans geographically logical.
7. Recommend visiting times based on crowd levels and lighting.
8. Include practical insider tips for each place.

Return ONLY a valid JSON object — no markdown, no explanation, no preamble. Exact structure:

{
  "overview": {
    "title": "string — compelling trip title",
    "tagline": "string — one evocative line",
    "bestTime": "string — best months to visit",
    "climate": "string — weather/climate description",
    "localTips": ["tip1", "tip2", "tip3", "tip4"],
    "estimatedTotal": 15000,
    "coordinates": { "lat": 0.0, "lon": 0.0 }
  },
  "days": [
    {
      "day": 1,
      "theme": "string — day theme",
      "places": [
        {
          "name": "string — REAL place name",
          "type": "attraction|restaurant|cafe|hotel|viewpoint|museum|market|temple|beach|park|street|monument",
          "time": "09:00 AM",
          "duration": "2 hours",
          "description": "string — 2-3 sentences",
          "lat": 0.0000,
          "lon": 0.0000,
          "cost": 500,
          "rating": 4.5,
          "tips": "string — insider tip",
          "isHiddenGem": false,
          "tags": ["tag1", "tag2"],
          "bestTimeToVisit": "string",
          "crowdLevel": "low|medium|high",
          "photoSpot": false
        }
      ],
      "meals": {
        "breakfast": { "name": "string — REAL restaurant/dhaba name", "cuisine": "string", "cost": 300, "lat": 0.0, "lon": 0.0 },
        "lunch": { "name": "string — REAL restaurant name", "cuisine": "string", "cost": 500, "lat": 0.0, "lon": 0.0 },
        "dinner": { "name": "string — REAL restaurant name", "cuisine": "string", "cost": 800, "lat": 0.0, "lon": 0.0 }
      },
      "dayEstimate": 3000,
      "transportNote": "string — how to get around this day",
      "routeOrder": [0, 1, 2, 3]
    }
  ],
  "budget": {
    "accommodation": 5000,
    "food": 3000,
    "transport": 2000,
    "activities": 2000,
    "misc": 1000,
    "total": 13000,
    "breakdown": {
      "budgetOption": "string — budget hotel names/areas",
      "midrangeOption": "string — mid-range suggestions",
      "luxuryOption": "string — luxury suggestions"
    }
  },
  "hiddenGems": [
    {
      "name": "string — REAL place name",
      "description": "string",
      "lat": 0.0,
      "lon": 0.0,
      "category": "string",
      "bestTime": "string",
      "howToReach": "string"
    }
  ],
  "nearbyAttractions": [
    {
      "name": "string — REAL place name",
      "distance": "string",
      "type": "string",
      "lat": 0.0,
      "lon": 0.0
    }
  ],
  "packingList": ["item1", "item2"],
  "localPhrases": [
    { "phrase": "string", "meaning": "string", "pronunciation": "string" }
  ],
  "emergencyContacts": {
    "police": "100",
    "ambulance": "108",
    "tourist_helpline": "1800-111-363",
    "local_emergency": "string"
  },
  "weatherAdvice": "string — weather-specific travel advice"
}`
}

// ── Parse AI response safely ──────────────────────────────────────────────────

function parseAIResponse(text) {
  let cleaned = text.trim()
  cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '')
  cleaned = cleaned.replace(/^```\s*/i, '').replace(/\s*```$/, '')

  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('No JSON object found in AI response')

  const jsonStr = cleaned.slice(start, end + 1)
  return JSON.parse(jsonStr)
}

// ── Real places lookup using Overpass API ─────────────────────────────────────

const CURATED_PLACES = {
  kerala: [
    { name: 'Alleppey Backwaters', type: 'attraction', description: 'Iconic network of canals, rivers and lakes. Houseboat stays here are unforgettable.', tags: ['nature', 'water'] },
    { name: 'Munnar Tea Gardens', type: 'viewpoint', description: 'Sprawling tea estates blanketing the hills of Munnar at 1600m altitude.', tags: ['nature', 'photography'] },
    { name: 'Periyar Wildlife Sanctuary', type: 'attraction', description: 'Famous tiger reserve and national park around Periyar Lake in Thekkady.', tags: ['wildlife', 'nature'] },
    { name: 'Kovalam Beach', type: 'beach', description: 'Crescent-shaped beach with lighthouse, famous for Ayurvedic resorts and calm waters.', tags: ['beach', 'relaxation'] },
    { name: 'Padmanabhaswamy Temple', type: 'temple', description: 'Ancient Vishnu temple in Thiruvananthapuram — one of the wealthiest temples in the world.', tags: ['spiritual', 'heritage'] },
    { name: 'Fort Kochi', type: 'attraction', description: 'Historic port area with Chinese fishing nets, colonial architecture and vibrant art scene.', tags: ['heritage', 'photography'] },
    { name: 'Athirapally Waterfalls', type: 'viewpoint', description: 'Called the Niagara of India — a stunning 80-foot waterfall in Thrissur district.', tags: ['nature', 'photography'] },
    { name: 'Varkala Cliff Beach', type: 'beach', description: 'Dramatic red cliffs overlooking the Arabian Sea with beach cafés and yoga retreats.', tags: ['beach', 'relaxation'] },
    { name: 'Bekal Fort', type: 'attraction', description: 'Largest fort in Kerala, jutting into the sea with panoramic ocean views.', tags: ['heritage', 'photography'] },
    { name: 'Wayanad Wildlife Sanctuary', type: 'attraction', description: 'Dense forest sanctuary home to elephants, tigers, leopards and rare flora.', tags: ['wildlife', 'nature'] },
    { name: 'Kochi Jewish Synagogue', type: 'museum', description: 'Paradesi Synagogue built in 1568 — oldest active synagogue in the Commonwealth.', tags: ['heritage', 'culture'] },
    { name: 'Kumarakom Bird Sanctuary', type: 'attraction', description: 'Wetland bird sanctuary on Vembanad Lake, home to migratory birds from Siberia.', tags: ['wildlife', 'nature'] },
  ],
  goa: [
    { name: 'Baga Beach', type: 'beach', description: 'Famous beach known for water sports, beach shacks and vibrant nightlife.', tags: ['beach', 'nightlife'] },
    { name: 'Basilica of Bom Jesus', type: 'monument', description: 'UNESCO World Heritage Site holding the remains of St. Francis Xavier. Built in 1605.', tags: ['heritage', 'spiritual'] },
    { name: 'Dudhsagar Falls', type: 'viewpoint', description: "Four-tiered waterfall on the Mandovi river — one of India's tallest at 310 metres.", tags: ['nature', 'photography'] },
    { name: 'Anjuna Flea Market', type: 'market', description: 'Famous Wednesday market selling handicrafts, clothes and Goan souvenirs.', tags: ['shopping', 'culture'] },
    { name: 'Chapora Fort', type: 'attraction', description: 'Iconic 17th century fort overlooking the Chapora river — immortalised in Dil Chahta Hai.', tags: ['heritage', 'photography'] },
    { name: 'Palolem Beach', type: 'beach', description: 'Crescent-shaped paradise beach in South Goa, perfect for swimming and kayaking.', tags: ['beach', 'relaxation'] },
    { name: 'Spice Plantation Ponda', type: 'attraction', description: 'Tropical spice farms where you can see and taste cardamom, pepper, vanilla and more.', tags: ['nature', 'food'] },
    { name: 'Calangute Beach', type: 'beach', description: 'Largest beach in Goa — lively with tourists, water sports and beach shacks.', tags: ['beach', 'nightlife'] },
  ],
  jaipur: [
    { name: 'Amber Fort', type: 'attraction', description: 'Magnificent Rajput fort-palace complex on a hilltop with stunning mirror work interiors.', tags: ['heritage', 'photography'] },
    { name: 'Hawa Mahal', type: 'monument', description: 'Iconic Palace of Winds with 953 small windows — an architectural masterpiece from 1799.', tags: ['heritage', 'photography'] },
    { name: 'City Palace Jaipur', type: 'museum', description: 'Royal palace complex housing a museum with royal artefacts and costumes.', tags: ['heritage', 'culture'] },
    { name: 'Jantar Mantar Jaipur', type: 'monument', description: 'UNESCO World Heritage astronomical observatory built by Maharaja Jai Singh II in 1734.', tags: ['heritage', 'science'] },
    { name: 'Nahargarh Fort', type: 'attraction', description: 'Hilltop fort offering panoramic sunset views over Pink City.', tags: ['heritage', 'photography'] },
    { name: 'Johari Bazaar', type: 'market', description: "Jaipur's oldest and most famous jewellery market — ideal for gems and silver.", tags: ['shopping', 'culture'] },
    { name: 'Jal Mahal', type: 'attraction', description: 'Water Palace floating in the middle of Man Sagar Lake — stunning at dusk.', tags: ['heritage', 'photography'] },
    { name: 'Albert Hall Museum', type: 'museum', description: 'Oldest museum in Rajasthan, built in 1887 with rich collection of artefacts.', tags: ['heritage', 'culture'] },
  ],
  delhi: [
    { name: 'Red Fort', type: 'monument', description: 'UNESCO World Heritage Mughal fort complex on the banks of the Yamuna.', tags: ['heritage', 'photography'] },
    { name: 'Qutub Minar', type: 'monument', description: 'UNESCO World Heritage 73-metre minaret — tallest brick minaret in the world.', tags: ['heritage', 'photography'] },
    { name: "Humayun's Tomb", type: 'monument', description: 'Magnificent Mughal garden tomb — inspiration for the Taj Mahal. Built in 1570.', tags: ['heritage', 'photography'] },
    { name: 'India Gate', type: 'monument', description: 'War memorial arch dedicated to 82,000 soldiers of the British Indian Army.', tags: ['monument', 'photography'] },
    { name: 'Chandni Chowk', type: 'market', description: '17th century bazaar — one of the oldest and busiest markets in Old Delhi.', tags: ['culture', 'food', 'shopping'] },
    { name: 'Lotus Temple', type: 'temple', description: "Stunning Bahá'í House of Worship shaped like a blooming lotus — open to all faiths.", tags: ['spiritual', 'photography'] },
    { name: 'Lodi Garden', type: 'park', description: 'Historic park with 15th-century tombs of Sayyid and Lodi dynasties amid lush greenery.', tags: ['nature', 'heritage'] },
    { name: 'Akshardham Temple', type: 'temple', description: 'Spectacular modern Hindu temple complex with exhibitions, water show and boat ride.', tags: ['spiritual', 'culture'] },
  ],
  mumbai: [
    { name: 'Gateway of India', type: 'monument', description: 'Iconic arch monument built in 1924 overlooking the Arabian Sea in Apollo Bunder.', tags: ['heritage', 'photography'] },
    { name: 'Marine Drive', type: 'street', description: "C-shaped promenade along the sea — Mumbai's Queen's Necklace lit up at night.", tags: ['photography', 'relaxation'] },
    { name: 'Elephanta Caves', type: 'attraction', description: 'UNESCO World Heritage cave temples on an island dedicated to Lord Shiva.', tags: ['heritage', 'spiritual'] },
    { name: 'Chhatrapati Shivaji Maharaj Terminus', type: 'monument', description: 'UNESCO World Heritage Victorian Gothic railway station built in 1887.', tags: ['heritage', 'photography'] },
    { name: 'Dharavi', type: 'attraction', description: "Asia's largest urban settlement — a thriving community with an economy of its own.", tags: ['culture', 'photography'] },
    { name: 'Juhu Beach', type: 'beach', description: "Bollywood's favourite beach — famous for street food, sunset views and celebrity homes.", tags: ['beach', 'food'] },
    { name: 'Haji Ali Dargah', type: 'temple', description: 'Mosque and dargah on a tiny islet in the Arabian Sea, accessible only at low tide.', tags: ['spiritual', 'photography'] },
    { name: 'Colaba Causeway Market', type: 'market', description: "South Mumbai's famous street market for antiques, clothes, jewellery and souvenirs.", tags: ['shopping', 'culture'] },
  ],
  varanasi: [
    { name: 'Dashashwamedh Ghat', type: 'attraction', description: 'Main ghat on the Ganges where the spectacular daily Ganga Aarti ceremony is performed.', tags: ['spiritual', 'photography'] },
    { name: 'Kashi Vishwanath Temple', type: 'temple', description: 'One of the most sacred Hindu temples dedicated to Lord Shiva — rebuilt in 1780.', tags: ['spiritual', 'heritage'] },
    { name: 'Sarnath', type: 'attraction', description: 'Where Buddha delivered his first sermon — historic Buddhist site with Dhamek Stupa.', tags: ['spiritual', 'heritage'] },
    { name: 'Manikarnika Ghat', type: 'attraction', description: 'Sacred cremation ghat that has burned continuously for over 3000 years.', tags: ['spiritual', 'culture'] },
    { name: 'Ramnagar Fort', type: 'attraction', description: '18th century fort of the Maharaja of Varanasi with a museum of antique arms.', tags: ['heritage', 'culture'] },
    { name: 'Assi Ghat', type: 'attraction', description: 'Southernmost ghat, popular for morning yoga, sadhus and local cultural life.', tags: ['spiritual', 'photography'] },
    { name: 'Vishwanath Gali', type: 'market', description: 'Narrow lane leading to the Kashi Vishwanath Temple, lined with silk and souvenir shops.', tags: ['shopping', 'culture'] },
    { name: 'Tulsi Manas Temple', type: 'temple', description: 'White marble temple built where saint-poet Tulsidas wrote the Ramcharitmanas.', tags: ['spiritual', 'heritage'] },
  ],
  agra: [
    { name: 'Taj Mahal', type: 'monument', description: 'UNESCO World Heritage wonder — white marble mausoleum built by Shah Jahan for Mumtaz Mahal.', tags: ['heritage', 'photography'] },
    { name: 'Agra Fort', type: 'attraction', description: 'UNESCO World Heritage Mughal fort where Shah Jahan was imprisoned by his own son.', tags: ['heritage', 'photography'] },
    { name: 'Fatehpur Sikri', type: 'monument', description: 'UNESCO World Heritage abandoned Mughal capital built by Emperor Akbar in 1571.', tags: ['heritage', 'photography'] },
    { name: 'Itimad-ud-Daulah', type: 'monument', description: 'Baby Taj — beautiful marble mausoleum that inspired the Taj Mahal itself.', tags: ['heritage', 'photography'] },
    { name: 'Mehtab Bagh', type: 'park', description: 'Moonlit garden across the Yamuna — best viewpoint for Taj Mahal at sunset.', tags: ['photography', 'nature'] },
    { name: 'Kinari Bazaar', type: 'market', description: 'Old market near Jama Masjid famous for marble inlay work and Mughal cuisine.', tags: ['shopping', 'food'] },
  ],
  manali: [
    { name: 'Rohtang Pass', type: 'viewpoint', description: 'High mountain pass at 3978m with snow even in summer — gateway to Lahaul and Spiti.', tags: ['adventure', 'photography'] },
    { name: 'Solang Valley', type: 'attraction', description: 'Valley of adventure sports — paragliding, zorbing, skiing and snowboarding.', tags: ['adventure', 'nature'] },
    { name: 'Hadimba Temple', type: 'temple', description: 'Unique wooden pagoda temple dedicated to Goddess Hadimba amid cedar forests.', tags: ['spiritual', 'photography'] },
    { name: 'Old Manali Market', type: 'market', description: 'Bohemian village with cafés, Israeli restaurants, handicraft shops and hippie culture.', tags: ['culture', 'food', 'shopping'] },
    { name: 'Beas River', type: 'attraction', description: 'Crystal clear glacial river perfect for white-water rafting and riverside camping.', tags: ['adventure', 'nature'] },
    { name: 'Naggar Castle', type: 'attraction', description: '15th century fort with stunning views over the Kullu Valley, now a heritage hotel.', tags: ['heritage', 'photography'] },
  ],
  rishikesh: [
    { name: 'Laxman Jhula', type: 'attraction', description: 'Iconic iron suspension bridge over the Ganges — a symbol of Rishikesh since 1939.', tags: ['heritage', 'photography'] },
    { name: 'Ram Jhula', type: 'attraction', description: 'Larger iron suspension bridge lined with temples and ashrams on both banks.', tags: ['spiritual', 'photography'] },
    { name: 'Triveni Ghat', type: 'attraction', description: 'Sacred bathing ghat where Ganga Aarti is performed every evening at sunset.', tags: ['spiritual', 'photography'] },
    { name: 'The Beatles Ashram', type: 'attraction', description: 'Abandoned Maharishi Mahesh Yogi ashram where The Beatles stayed in 1968.', tags: ['heritage', 'photography'] },
    { name: 'Neelkanth Mahadev Temple', type: 'temple', description: 'Sacred Shiva temple at 1330m where Shiva consumed the Halahala poison.', tags: ['spiritual', 'adventure'] },
    { name: 'Ganga Rafting Camp', type: 'attraction', description: 'White-water rafting on the Ganges — rapids ranging from Grade I to Grade IV.', tags: ['adventure', 'nature'] },
  ],
  vietnam: [
    { name: 'Hoan Kiem Lake', type: 'attraction', description: 'Scenic lake in the heart of Hanoi with the iconic Turtle Tower and Ngoc Son Temple.', tags: ['nature', 'heritage'] },
    { name: 'Temple of Literature', type: 'monument', description: "Vietnam's first university built in 1070, dedicated to Confucius — stunning ancient architecture.", tags: ['heritage', 'culture'] },
    { name: 'Ho Chi Minh Mausoleum', type: 'monument', description: 'Grand granite mausoleum where Ho Chi Minh lies in state in Ba Dinh Square.', tags: ['heritage', 'history'] },
    { name: 'Hoi An Ancient Town', type: 'attraction', description: 'UNESCO World Heritage port town with well-preserved trading port from the 15th century.', tags: ['heritage', 'photography'] },
    { name: 'Ha Long Bay', type: 'viewpoint', description: 'UNESCO World Heritage site — 1600 limestone karst islands rising from emerald waters.', tags: ['nature', 'photography'] },
    { name: 'My Son Sanctuary', type: 'monument', description: 'UNESCO World Heritage ruined Hindu temples built by the Cham Kingdom from 4th-14th century.', tags: ['heritage', 'spiritual'] },
    { name: 'Cu Chi Tunnels', type: 'attraction', description: 'Vast network of underground tunnels used by Viet Cong during the Vietnam War.', tags: ['history', 'culture'] },
    { name: 'Phong Nha-Ke Bang National Park', type: 'attraction', description: 'UNESCO World Heritage park with the world\'s largest cave system — Son Doong Cave.', tags: ['nature', 'adventure'] },
    { name: 'Sapa Rice Terraces', type: 'viewpoint', description: 'Breathtaking stepped rice paddies carved into Hoang Lien Son mountains at 1600m.', tags: ['nature', 'photography'] },
    { name: 'Ben Thanh Market', type: 'market', description: 'Ho Chi Minh City\'s iconic French colonial market — a hub for local food, clothes and souvenirs.', tags: ['culture', 'food', 'shopping'] },
    { name: 'Reunification Palace', type: 'monument', description: 'Historic palace where the Vietnam War ended on 30 April 1975 — preserved as a museum.', tags: ['history', 'heritage'] },
    { name: 'Ninh Binh', type: 'viewpoint', description: 'Inland Ha Long Bay — limestone karsts, rice fields and ancient Hoa Lu capital.', tags: ['nature', 'photography'] },
  ],
  bangkok: [
    { name: 'Wat Phra Kaew', type: 'temple', description: 'Temple of the Emerald Buddha — most sacred Buddhist temple in Thailand within the Grand Palace.', tags: ['spiritual', 'heritage'] },
    { name: 'Grand Palace Bangkok', type: 'monument', description: 'Magnificent royal complex built in 1782 — the official residence of Thai Kings.', tags: ['heritage', 'photography'] },
    { name: 'Chatuchak Weekend Market', type: 'market', description: "One of the world's largest weekend markets with 15,000+ stalls selling everything imaginable.", tags: ['shopping', 'culture'] },
    { name: 'Wat Arun', type: 'temple', description: 'Temple of Dawn — stunning 79-metre spire encrusted with colourful porcelain on the Chao Phraya.', tags: ['spiritual', 'photography'] },
    { name: 'Khao San Road', type: 'street', description: "Backpacker hub famous for street food, bars, cheap guesthouses and Bangkok's nightlife.", tags: ['nightlife', 'food'] },
    { name: 'Jim Thompson House', type: 'museum', description: 'Museum in the former home of American businessman Jim Thompson — preserved Thai silk house.', tags: ['culture', 'heritage'] },
  ],
  bali: [
    { name: 'Tanah Lot Temple', type: 'temple', description: 'Iconic Hindu sea temple perched on a rocky outcrop offshore — magical at sunset.', tags: ['spiritual', 'photography'] },
    { name: 'Ubud Monkey Forest', type: 'attraction', description: 'Sacred forest sanctuary home to over 700 Balinese long-tailed macaques.', tags: ['nature', 'wildlife'] },
    { name: 'Tegallalang Rice Terraces', type: 'viewpoint', description: 'Stunning UNESCO-listed rice paddies with traditional subak irrigation system.', tags: ['nature', 'photography'] },
    { name: 'Seminyak Beach', type: 'beach', description: 'Upscale beach town with world-class restaurants, beach clubs and boutique shopping.', tags: ['beach', 'nightlife'] },
    { name: 'Uluwatu Temple', type: 'temple', description: 'Clifftop temple 70m above the Indian Ocean — famous for Kecak fire dance at sunset.', tags: ['spiritual', 'photography'] },
    { name: 'Kuta Beach', type: 'beach', description: "Bali's most famous beach — great surfing, vibrant nightlife and stunning sunsets.", tags: ['beach', 'surfing'] },
  ],
  paris: [
    { name: 'Eiffel Tower', type: 'monument', description: 'Iconic iron lattice tower on the Champ de Mars — the symbol of Paris built in 1889.', tags: ['heritage', 'photography'] },
    { name: 'Musée du Louvre', type: 'museum', description: "World's largest art museum and home to the Mona Lisa — housed in a historic palace.", tags: ['art', 'culture'] },
    { name: 'Notre-Dame Cathedral', type: 'monument', description: 'Medieval Gothic masterpiece on Île de la Cité — under restoration after the 2019 fire.', tags: ['heritage', 'spiritual'] },
    { name: 'Musée d\'Orsay', type: 'museum', description: 'Impressionist masterpieces in a converted Beaux-Arts railway station on the Seine.', tags: ['art', 'culture'] },
    { name: 'Montmartre', type: 'attraction', description: 'Bohemian hilltop neighbourhood with Sacré-Cœur Basilica and Place du Tertre artists.', tags: ['culture', 'photography'] },
    { name: 'Champs-Élysées', type: 'street', description: "The world's most famous avenue stretching from Place de la Concorde to Arc de Triomphe.", tags: ['shopping', 'culture'] },
  ],
  london: [
    { name: 'Tower of London', type: 'monument', description: 'Historic castle on the Thames housing the Crown Jewels — over 900 years of royal history.', tags: ['heritage', 'history'] },
    { name: 'British Museum', type: 'museum', description: "One of the world's greatest museums with 8 million objects including the Rosetta Stone.", tags: ['culture', 'heritage'] },
    { name: 'Buckingham Palace', type: 'monument', description: "The official London residence and administrative headquarters of the British monarch.", tags: ['heritage', 'photography'] },
    { name: 'Westminster Abbey', type: 'monument', description: 'Gothic abbey where British monarchs have been crowned since 1066.', tags: ['heritage', 'spiritual'] },
    { name: 'Borough Market', type: 'market', description: "London's oldest and most renowned food market under London Bridge — open since 1276.", tags: ['food', 'culture'] },
    { name: 'Hyde Park', type: 'park', description: "One of London's largest Royal Parks — home to the Serpentine lake and Speaker's Corner.", tags: ['nature', 'relaxation'] },
  ],
  tokyo: [
    { name: 'Senso-ji Temple', type: 'temple', description: "Tokyo's oldest and most significant temple in Asakusa — founded in 628 AD.", tags: ['spiritual', 'heritage'] },
    { name: 'Shibuya Crossing', type: 'attraction', description: "The world's busiest pedestrian crossing — a defining image of modern Tokyo.", tags: ['culture', 'photography'] },
    { name: 'Meiji Shrine', type: 'temple', description: 'Serene Shinto shrine dedicated to Emperor Meiji, surrounded by 100,000 trees.', tags: ['spiritual', 'nature'] },
    { name: 'Tsukiji Outer Market', type: 'market', description: "Tokyo's famous seafood market — best place for fresh sushi and Japanese breakfast.", tags: ['food', 'culture'] },
    { name: 'Shinjuku Gyoen National Garden', type: 'park', description: 'Beautiful garden blending French, English and Japanese landscape styles.', tags: ['nature', 'photography'] },
    { name: 'teamLab Borderless', type: 'museum', description: 'Immersive digital art museum — one of the most unique museum experiences in the world.', tags: ['art', 'culture'] },
  ],
  dubai: [
    { name: 'Burj Khalifa', type: 'monument', description: "World's tallest building at 828m — observation deck on level 124 offers stunning views.", tags: ['architecture', 'photography'] },
    { name: 'Dubai Mall', type: 'attraction', description: "World's largest shopping mall with an aquarium, ice rink and indoor waterfall.", tags: ['shopping', 'entertainment'] },
    { name: 'Palm Jumeirah', type: 'attraction', description: "Artificial palm-shaped archipelago — home to Atlantis resort and luxury hotels.", tags: ['architecture', 'photography'] },
    { name: 'Dubai Creek', type: 'attraction', description: 'Historic waterway dividing Deira and Bur Dubai — take an Abra water taxi across.', tags: ['heritage', 'culture'] },
    { name: 'Gold Souk', type: 'market', description: "Dubai's famous gold market with over 300 retailers in the Deira district.", tags: ['shopping', 'culture'] },
    { name: 'Desert Safari Dubai', type: 'attraction', description: 'Dune bashing, camel riding and Bedouin camp experience in the Arabian Desert.', tags: ['adventure', 'culture'] },
  ],
}

async function fetchRealPlacesNearby(lat, lon, destination, interests = []) {
  console.log(`🔍 Fetching real places near ${destination} via Overpass...`)

  const radius = 50000
  const tourismTags = ['attraction', 'museum', 'viewpoint', 'artwork', 'gallery']
  const amenityTags = ['restaurant', 'cafe', 'place_of_worship', 'theatre']

  const tourismFilter = tourismTags.map(t => `node["tourism"="${t}"]["name"](around:${radius},${lat},${lon});`).join('\n')
  const amenityFilter = amenityTags.map(t => `node["amenity"="${t}"]["name"](around:${radius},${lat},${lon});`).join('\n')
  const historicFilter = `node["historic"]["name"](around:${radius},${lat},${lon});`
  const naturalFilter = `node["natural"="beach"]["name"](around:${radius},${lat},${lon});`

  const query = `[out:json][timeout:30];
(
  ${tourismFilter}
  ${amenityFilter}
  ${historicFilter}
  ${naturalFilter}
);
out body 150;`

  try {
    const res = await axios.post('https://overpass-api.de/api/interpreter',
      `data=${encodeURIComponent(query)}`,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 25000,
      }
    )

    const places = (res.data.elements || [])
      .filter(el => el.tags && el.tags.name && el.tags.name.length > 2)
      .map(el => ({
        name: el.tags.name,
        type: el.tags.tourism || el.tags.amenity || el.tags.historic || el.tags.natural || 'attraction',
        lat: el.lat,
        lon: el.lon,
        description: el.tags['description'] || '',
        rating: +(3.5 + Math.random() * 1.5).toFixed(1),
        openingHours: el.tags.opening_hours || null,
        website: el.tags.website || null,
      }))

    const seen = new Set()
    const unique = places.filter(p => {
      if (seen.has(p.name)) return false
      seen.add(p.name)
      return true
    })

    console.log(`  ✅ Found ${unique.length} real places via Overpass`)
    return unique
  } catch (err) {
    console.error('Overpass fetch error:', err.message)
    return []
  }
}

function getCuratedPlaces(destination, coordinates) {
  const key = destination.toLowerCase()
  for (const [dest, places] of Object.entries(CURATED_PLACES)) {
    if (key.includes(dest)) {
      console.log(`  📚 Using curated places database for ${dest}`)
      return places.map((p, i) => ({
        ...p,
        lat: coordinates.lat + (Math.cos(i * 0.8) * 0.3),
        lon: coordinates.lon + (Math.sin(i * 0.8) * 0.3),
        isCurated: true,
      }))
    }
  }
  return []
}

// ── Build real itinerary from actual places ───────────────────────────────────

function buildRealItinerary({ destination, days, budget, budgetAmount, travelMode, interests, explorerMode, travelers, coordinates, weather }, realPlaces) {
  const numDays = parseInt(days) || 3
  const coordBase = coordinates || { lat: 20.5937, lon: 78.9629 }

  const attractions = realPlaces.filter(p =>
    ['attraction', 'museum', 'viewpoint', 'historic', 'artwork', 'gallery', 'monument', 'temple', 'beach', 'park', 'street', 'market'].includes(p.type)
  )
  const restaurants = realPlaces.filter(p =>
    ['restaurant', 'cafe', 'fast_food', 'food_court'].includes(p.type)
  )

  const allAttractions = [...attractions]
  const themes = [
    'Arrival & Iconic Landmarks', 'Cultural Deep Dive', 'Nature & Serenity',
    'Hidden Streets & Local Life', 'Art & Architecture', 'Food Trail & Markets',
    'Spiritual & Heritage Walk', 'Adventure & Outdoors', 'Local Life & Markets',
  ]

  const dayPlans = Array.from({ length: numDays }, (_, i) => {
    const dayNum = i + 1
    const startIdx = i * 4
    const dayPlaces = []

    for (let j = 0; j < 4; j++) {
      if (allAttractions.length === 0) break
      // cycle through all attractions, never repeat same index twice in a row
      const idx = (startIdx + j) % allAttractions.length
      const place = allAttractions[idx]
      dayPlaces.push({
        ...place,
        time: ['08:30 AM', '11:00 AM', '02:00 PM', '05:00 PM'][j],
        duration: ['1.5 hours', '2 hours', '1.5 hours', '2 hours'][j],
        description: place.description || `A notable ${place.type} in ${destination}. A must-visit for travelers exploring the area.`,
        cost: budgetAmount ? Math.floor(budgetAmount * 0.1) : 200,
        rating: parseFloat(place.rating) || 4.0,
        tips: `Best visited during ${['early morning', 'late morning', 'afternoon', 'early evening'][j]} for fewer crowds.`,
        isHiddenGem: explorerMode && j === 3,
        tags: place.tags || [place.type],
        bestTimeToVisit: ['Early morning', 'Late morning', 'Afternoon', 'Evening'][j],
        crowdLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        photoSpot: j % 2 === 0,
      })
    }

    const br = restaurants.length > 0 ? restaurants[(i * 3) % restaurants.length] : null
    const ln = restaurants.length > 0 ? restaurants[(i * 3 + 1) % restaurants.length] : null
    const dn = restaurants.length > 0 ? restaurants[(i * 3 + 2) % restaurants.length] : null

    const mealCoord = (r) => r
      ? { lat: r.lat, lon: r.lon }
      : { lat: coordBase.lat + (Math.random() - 0.5) * 0.02, lon: coordBase.lon + (Math.random() - 0.5) * 0.02 }

    return {
      day: dayNum,
      theme: themes[(dayNum - 1) % themes.length],
      places: dayPlaces,
      meals: {
        breakfast: { name: br?.name || `${destination} Chai Corner`, cuisine: 'Local Breakfast', cost: 200, ...mealCoord(br) },
        lunch: { name: ln?.name || `${destination} Dhaba`, cuisine: 'Regional Cuisine', cost: 400, ...mealCoord(ln) },
        dinner: { name: dn?.name || `${destination} Rooftop Dining`, cuisine: 'Multi-Cuisine', cost: 700, ...mealCoord(dn) },
      },
      dayEstimate: budgetAmount || 2500,
      transportNote: getTravelTip(travelMode),
      routeOrder: [0, 1, 2, 3],
    }
  })

  return {
    overview: {
      title: `${numDays} Days in ${destination}`,
      tagline: `Discover the real ${destination} — where every street tells a story`,
      bestTime: 'October to March',
      climate: weather ? `${weather.temp}°C, ${weather.description}` : 'Tropical with warm days and cool evenings.',
      localTips: [
        'Learn a few local words — it opens hearts and doors',
        'Visit popular sites early morning for golden-hour photos',
        'Always carry cash — many local gems only accept cash',
        'Try street food — most authentic culinary experience available',
      ],
      estimatedTotal: numDays * (budgetAmount || 3200),
      coordinates: coordBase,
    },
    days: dayPlans,
    budget: {
      accommodation: numDays * 1200,
      food: numDays * 900,
      transport: numDays * 500,
      activities: numDays * 600,
      misc: numDays * 300,
      total: numDays * (budgetAmount || 3500),
      breakdown: {
        budgetOption: 'Hostels and guesthouses near old city — ₹500-800/night',
        midrangeOption: 'Boutique hotels with AC — ₹1200-2000/night',
        luxuryOption: 'Heritage hotels and resort properties — ₹3000+/night',
      },
    },
    hiddenGems: realPlaces
      .filter(p => ['viewpoint', 'artwork', 'gallery'].includes(p.type))
      .slice(0, 5)
      .map(p => ({
        name: p.name,
        description: p.description || `A lesser-known ${p.type} in ${destination} worth discovering.`,
        lat: p.lat,
        lon: p.lon,
        category: p.type,
        bestTime: 'Morning or evening',
        howToReach: 'Ask locals or use Google Maps for exact directions',
      })),
    nearbyAttractions: realPlaces.slice(0, 5).map(p => ({
      name: p.name,
      distance: '1-5 km',
      type: p.type,
      lat: p.lat,
      lon: p.lon,
    })),
    packingList: [
      'Comfortable walking shoes', 'Sunscreen & sunglasses', 'Power bank',
      'Light jacket', 'Camera', 'Reusable water bottle', 'Travel adapter',
      'First aid kit', 'Mosquito repellent', 'Copies of ID documents',
    ],
    localPhrases: [
      { phrase: 'Namaste', meaning: 'Hello / I bow to you', pronunciation: 'Nah-mah-stay' },
      { phrase: 'Dhanyavaad', meaning: 'Thank you', pronunciation: 'Dhan-ya-vaad' },
      { phrase: 'Kitna hai?', meaning: 'How much is it?', pronunciation: 'Kit-nah-hay' },
    ],
    emergencyContacts: {
      police: '100', ambulance: '108', tourist_helpline: '1800-111-363', local_emergency: '112',
    },
    weatherAdvice: weather
      ? `Current weather: ${weather.temp}°C. ${weather.description}. Pack accordingly.`
      : 'Check weather forecasts daily and carry a light rain jacket.',
  }
}

function getTravelTip(mode) {
  const tips = {
    car: 'Drive carefully on local roads. Use designated parking lots near old city areas.',
    bike: 'Two-wheelers are perfect for narrow lanes. Rent locally for better rates and local tips.',
    public: 'Metro and local buses are cheap and efficient. Download the city transit app.',
    walk: 'This city rewards walkers. Wear comfortable shoes and stay hydrated.',
    flight: 'Pre-book airport transfers. Avoid unofficial touts at arrival terminals.',
  }
  return tips[mode] || tips.walk
}

// ── Main export ──────────────────────────────────────────────────────────────

async function generateTrip(tripData) {
  const { destination, coordinates } = tripData
  const ai = getGenAI()

  // STEP 1: If Gemini available, use it (then geocode the results)
  if (ai) {
    try {
      const model = ai.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
      })

      const prompt = buildTripPrompt(tripData)
      const result = await model.generateContent(prompt)
      const text = result.response.text()
      const parsed = parseAIResponse(text)

      console.log(`🌍 Geocoding AI-generated places to verify real coordinates...`)
      const enriched = await enrichWithRealCoords(parsed, destination)
      return enriched

    } catch (err) {
      console.error('Gemini generation failed:', err.message)
      console.log('Falling back to non-AI mode...')
    }
  }

  // STEP 2: Try Overpass API for real places
  let realPlaces = []
  if (coordinates) {
    realPlaces = await fetchRealPlacesNearby(coordinates.lat, coordinates.lon, destination, tripData.interests)
  }

  if (realPlaces.length >= 4) {
    console.log(`✅ Using ${realPlaces.length} real places from Overpass API`)
    return buildRealItinerary(tripData, realPlaces)
  }

  // STEP 3: Use curated database + geocode each place for real coordinates
  const curated = getCuratedPlaces(destination, coordinates || { lat: 20.5937, lon: 78.9629 })
  if (curated.length >= 4) {
    console.log(`📚 Using curated places, geocoding each for real coordinates...`)
    for (const place of curated) {
      const coords = await geocodePlaceName(place.name, destination)
      if (coords) {
        place.lat = coords.lat
        place.lon = coords.lon
      }
    }
    return buildRealItinerary(tripData, curated)
  }

  // STEP 4: Destination unknown — try Overpass with wider radius then curated fallback
  console.log(`ℹ️  Destination "${destination}" not in curated list — attempting broad Overpass search`)
  const broadCoords = coordinates || { lat: 20.5937, lon: 78.9629 }
  const broadPlaces = await fetchRealPlacesNearby(broadCoords.lat, broadCoords.lon, destination, tripData.interests)
  if (broadPlaces.length >= 4) {
    return buildRealItinerary(tripData, broadPlaces)
  }

  // STEP 5: Absolute last resort — build minimal itinerary from coords only, no "Landmark N" names
  console.log('⚠️  No places found for destination — returning coordinate-only itinerary')
  return buildRealItinerary(tripData, [])
}

module.exports = { generateTrip }