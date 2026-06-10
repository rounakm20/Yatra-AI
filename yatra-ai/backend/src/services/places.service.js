const axios = require('axios')

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org'
const OVERPASS_BASE = 'https://overpass-api.de/api/interpreter'

const headers = { 'User-Agent': 'YatraAI/1.0 (travel planner app)' }

// ── Geocoding ─────────────────────────────────────────────────────────────────

async function geocodeDestination(query) {
  try {
    const res = await axios.get(`${NOMINATIM_BASE}/search`, {
      params: { q: query, format: 'json', limit: 5, addressdetails: 1 },
      headers,
      timeout: 8000,
    })
    if (!res.data || res.data.length === 0) return null

    const best = res.data[0]
    return {
      lat: parseFloat(best.lat),
      lon: parseFloat(best.lon),
      displayName: best.display_name,
      type: best.type,
      importance: best.importance,
      boundingBox: best.boundingbox?.map(Number),
      country: best.address?.country,
      city: best.address?.city || best.address?.town || best.address?.village || query,
    }
  } catch (err) {
    console.error('Geocoding error:', err.message)
    return null
  }
}

async function reverseGeocode(lat, lon) {
  try {
    const res = await axios.get(`${NOMINATIM_BASE}/reverse`, {
      params: { lat, lon, format: 'json', addressdetails: 1 },
      headers,
      timeout: 8000,
    })
    return {
      displayName: res.data.display_name,
      address: res.data.address,
    }
  } catch (err) {
    console.error('Reverse geocode error:', err.message)
    return null
  }
}

// ── Nearby places via Overpass API ────────────────────────────────────────────

async function fetchNearbyPlaces(lat, lon, radius = 2000, categories = []) {
  const amenityTypes = categories.length
    ? categories
    : ['restaurant', 'cafe', 'hotel', 'museum', 'attraction', 'viewpoint']

  const amenityFilter = amenityTypes
    .map(a => `node["amenity"="${a}"](around:${radius},${lat},${lon});`)
    .join('\n  ')

  const tourismFilter = `
    node["tourism"="attraction"](around:${radius},${lat},${lon});
    node["tourism"="viewpoint"](around:${radius},${lat},${lon});
    node["tourism"="museum"](around:${radius},${lat},${lon});
    node["tourism"="hotel"](around:${radius},${lat},${lon});
    node["tourism"="hostel"](around:${radius},${lat},${lon});
  `

  const query = `
    [out:json][timeout:25];
    (
      ${amenityFilter}
      ${tourismFilter}
    );
    out body 50;
  `

  try {
    const res = await axios.post(OVERPASS_BASE, `data=${encodeURIComponent(query)}`, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 15000,
    })

    const places = (res.data.elements || [])
      .filter(el => el.tags && el.tags.name)
      .map(el => ({
        id: el.id,
        name: el.tags.name,
        type: el.tags.amenity || el.tags.tourism || 'place',
        lat: el.lat,
        lon: el.lon,
        rating: el.tags['stars'] ? parseFloat(el.tags['stars']) : null,
        cuisine: el.tags.cuisine || null,
        website: el.tags.website || null,
        phone: el.tags.phone || null,
        openingHours: el.tags.opening_hours || null,
        wikipedia: el.tags.wikipedia || null,
        distance: calculateDistance(lat, lon, el.lat, el.lon),
      }))
      .sort((a, b) => a.distance - b.distance)

    return places
  } catch (err) {
    console.error('Overpass API error:', err.message)
    return getMockNearbyPlaces(lat, lon, amenityTypes)
  }
}

async function fetchNearbyCafes(lat, lon, radius = 1500) {
  return fetchNearbyPlaces(lat, lon, radius, ['cafe', 'restaurant', 'bar', 'fast_food'])
}

async function fetchNearbyHotels(lat, lon, radius = 3000) {
  return fetchNearbyPlaces(lat, lon, radius, ['hotel', 'hostel', 'guest_house'])
}

async function fetchNearbyAttractions(lat, lon, radius = 3000) {
  return fetchNearbyPlaces(lat, lon, radius, ['museum', 'theatre', 'cinema', 'place_of_worship'])
}

// ── Route calculation via ORS ─────────────────────────────────────────────────

async function calculateRoute(waypoints, profile = 'driving-car') {
  const ORS_KEY = process.env.ORS_API_KEY
  if (!ORS_KEY) {
    return getMockRoute(waypoints)
  }

  const profileMap = {
    car: 'driving-car',
    bike: 'cycling-regular',
    walk: 'foot-walking',
    public: 'driving-car',
    flight: 'driving-car',
  }
  const orsProfile = profileMap[profile] || 'driving-car'

  try {
    const coordinates = waypoints.map(w => [w.lon, w.lat])
    const res = await axios.post(
      `https://api.openrouteservice.org/v2/directions/${orsProfile}/geojson`,
      { coordinates, instructions: false, elevation: false },
      {
        headers: {
          Authorization: ORS_KEY,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    )

    const route = res.data.features[0]
    const props = route.properties.summary
    return {
      geometry: route.geometry.coordinates.map(([lon, lat]) => ({ lat, lon })),
      distance: props.distance, // metres
      duration: props.duration, // seconds
      distanceKm: +(props.distance / 1000).toFixed(2),
      durationMin: Math.round(props.duration / 60),
    }
  } catch (err) {
    console.error('ORS route error:', err.message)
    return getMockRoute(waypoints)
  }
}

// ── Helper utilities ──────────────────────────────────────────────────────────

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000 // metres
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
  return Math.round(2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

function getMockNearbyPlaces(lat, lon, types) {
  const names = {
    restaurant: ['Spice Garden', 'The Local Kitchen', 'Heritage Dhaba', 'Mama\'s Kitchen'],
    cafe: ['Chai Stories', 'The Reading Room Café', 'Blue Tokai Coffee', 'Artisan Brews'],
    hotel: ['The Comfort Inn', 'Heritage Haveli', 'Backpackers Nest', 'City Grand Hotel'],
    museum: ['City Heritage Museum', 'Art & Craft Gallery', 'Freedom Museum'],
    default: ['Local Market', 'Town Square', 'Public Garden'],
  }
  return types.flatMap(type =>
    (names[type] || names.default).slice(0, 2).map((name, i) => ({
      id: Math.random() * 1e9,
      name,
      type,
      lat: lat + (Math.random() - 0.5) * 0.03,
      lon: lon + (Math.random() - 0.5) * 0.03,
      rating: +(3.5 + Math.random() * 1.5).toFixed(1),
      distance: 100 + Math.floor(Math.random() * 1900),
    }))
  )
}

function getMockRoute(waypoints) {
  // Return straight-line segments between waypoints as a simple path
  const geometry = waypoints.map(w => ({ lat: w.lat, lon: w.lon }))
  const totalDist = waypoints.reduce((sum, w, i) => {
    if (i === 0) return 0
    return sum + calculateDistance(waypoints[i - 1].lat, waypoints[i - 1].lon, w.lat, w.lon)
  }, 0)
  return {
    geometry,
    distance: totalDist,
    duration: Math.round(totalDist / 8), // ~8 m/s (30 km/h average)
    distanceKm: +(totalDist / 1000).toFixed(2),
    durationMin: Math.round(totalDist / 8 / 60),
  }
}

module.exports = {
  geocodeDestination,
  reverseGeocode,
  fetchNearbyPlaces,
  fetchNearbyCafes,
  fetchNearbyHotels,
  fetchNearbyAttractions,
  calculateRoute,
  calculateDistance,
}
