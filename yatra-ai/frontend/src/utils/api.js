import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'https://yatra-ai-8fc5.onrender.com'
const OPENWEATHER_KEY = import.meta.env.VITE_OPENWEATHER_KEY || ''

// ── Axios instance ────────────────────────────────────────────────────────────
const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('yatra_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('yatra_token')
      localStorage.removeItem('yatra_user')
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  async register(name, email, password) {
    const { data } = await apiClient.post('/auth/register', { name, email, password })
    if (data.token) localStorage.setItem('yatra_token', data.token)
    return data
  },
  async login(email, password) {
    const { data } = await apiClient.post('/auth/login', { email, password })
    if (data.token) localStorage.setItem('yatra_token', data.token)
    return data
  },
  async googleLogin(googlePayload) {
    const { data } = await apiClient.post('/auth/google', googlePayload)
    if (data.token) localStorage.setItem('yatra_token', data.token)
    return data
  },
  async getProfile() {
    const { data } = await apiClient.get('/auth/profile')
    return data.user
  },
  async updateProfile(updates) {
    const { data } = await apiClient.patch('/auth/profile', updates)
    return data.user
  },
  logout() {
    localStorage.removeItem('yatra_token')
    localStorage.removeItem('yatra_user')
  },
}

// ── Geocoding ─────────────────────────────────────────────────────────────────
export async function geocodeDestination(destination) {
  try {
    const { data } = await apiClient.get('/places/geocode', { params: { q: destination } })
    return data.result
  } catch {
    try {
      const res = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: { q: destination, format: 'json', limit: 1 },
        headers: { 'User-Agent': 'YatraAI/1.0' },
      })
      if (res.data?.[0]) {
        return { lat: parseFloat(res.data[0].lat), lon: parseFloat(res.data[0].lon), displayName: res.data[0].display_name }
      }
    } catch {}
    return null
  }
}

// ── Weather ───────────────────────────────────────────────────────────────────
export async function fetchWeather(lat, lon) {
  try {
    const { data } = await apiClient.get('/weather', { params: { lat, lon } })
    return data.current
  } catch {
    if (OPENWEATHER_KEY) {
      try {
        const res = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
          params: { lat, lon, appid: OPENWEATHER_KEY, units: 'metric' },
        })
        return { temp: Math.round(res.data.main.temp), feels_like: Math.round(res.data.main.feels_like), humidity: res.data.main.humidity, description: res.data.weather[0].description, icon: res.data.weather[0].icon, wind_speed: res.data.wind.speed }
      } catch {}
    }
    return getMockWeather()
  }
}

function getMockWeather() {
  const conditions = ['clear sky', 'few clouds', 'scattered clouds', 'light rain', 'sunny']
  return { temp: Math.round(20 + Math.random() * 15), feels_like: Math.round(18 + Math.random() * 15), humidity: Math.round(40 + Math.random() * 40), description: conditions[Math.floor(Math.random() * conditions.length)], icon: '01d', wind_speed: +(Math.random() * 5 + 1).toFixed(1) }
}

// ── AI Trip Generation ────────────────────────────────────────────────────────
export async function generateTripWithAI(tripData) {
  // Map frontend budget keys → backend accepted values
  const budgetMap = { budget: 'budget', mid: 'mid-range', luxury: 'luxury' }
  const budget = budgetMap[tripData.budget] || tripData.budget || 'mid-range'

  try {
    const { data } = await apiClient.post('/generate-trip', {
      destination: tripData.destination,
      days: parseInt(tripData.days),
      budget,
      budgetAmount: tripData.budgetAmount,
      travelMode: tripData.travelMode,
      interests: tripData.interests,
      explorerMode: tripData.explorerMode,
      travelers: tripData.travelers || 2,
    })
    return { ...data.itinerary, _meta: data.metadata }
  } catch (err) {
    console.error('Backend trip generation failed:', err.message)
    return generateMockTrip(tripData)
  }
}

// ── Trip CRUD ─────────────────────────────────────────────────────────────────
export const api = {
  async saveTrip(generatedItinerary, tripData) {
    try {
      const { data } = await apiClient.post('/trips/save', { tripData, generatedItinerary, title: generatedItinerary?.overview?.title })
      return { success: true, id: data.trip?.id || generatedItinerary.id }
    } catch (err) {
      return { success: false, error: err.message }
    }
  },
  async getTrips() {
    try {
      const { data } = await apiClient.get('/trips')
      return data.trips || []
    } catch { return [] }
  },
  async getTripById(id) {
    try {
      const { data } = await apiClient.get(`/trips/${id}`)
      return data.trip
    } catch { return null }
  },
  async deleteTrip(tripId) {
    try {
      const { data } = await apiClient.delete(`/trips/${tripId}`)
      return data
    } catch (err) {
      return { success: false, error: err.message }
    }
  },
  async getTripStats() {
    try {
      const { data } = await apiClient.get('/trips/stats')
      return data.stats
    } catch { return {} }
  },
  async getSharedTrip(shareToken) {
    try {
      const { data } = await apiClient.get(`/trips/share/${shareToken}`)
      return data.trip
    } catch { return null }
  },
  async getNearbyPlaces(lat, lon, types = '') {
    try {
      const { data } = await apiClient.get('/places/nearby', { params: { lat, lon, types } })
      return data.places || []
    } catch { return [] }
  },
  async calculateRoute(waypoints, profile = 'car') {
    try {
      const { data } = await apiClient.post('/places/route', { waypoints, profile })
      return data.route
    } catch { return null }
  },
}

// ── Mock fallback ─────────────────────────────────────────────────────────────
function generateMockTrip(tripData) {
  const dest = tripData.destination
  const days = parseInt(tripData.days)
  const isExplorer = tripData.explorerMode
  const coordBase = getDestCoords(dest)
  const themes = ['Arrival & Iconic Landmarks','Cultural Deep Dive','Nature & Serenity','Hidden Streets & Local Life','Art & Architecture','Food Trail & Markets','Spiritual & Heritage Walk']
  const dayPlans = Array.from({ length: days }, (_, i) => ({
    day: i + 1,
    theme: themes[i % themes.length],
    places: generatePlacesForDay(i + 1, isExplorer, coordBase),
    meals: {
      breakfast: { name: 'Chai Corner', cuisine: 'Local Breakfast', cost: 250 },
      lunch: { name: 'Dhaba 55', cuisine: 'Regional Cuisine', cost: 450 },
      dinner: { name: 'Rooftop Terrace Dining', cuisine: 'Multi-Cuisine', cost: 700 },
    },
    dayEstimate: 2500 + Math.floor(Math.random() * 1500),
    transportNote: getTravelTip(tripData.travelMode),
  }))
  return {
    id: 'trip_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
    createdAt: new Date().toISOString(),
    tripData,
    overview: { title: `${days} Days in ${dest}`, tagline: `Discover the soul of ${dest}`, bestTime: 'October to March', climate: 'Tropical with warm days and cool evenings.', localTips: ['Learn local words','Visit early morning','Carry cash','Try street food'], estimatedTotal: days * 3000, coordinates: coordBase },
    days: dayPlans,
    budget: { accommodation: days * 1200, food: days * 900, transport: days * 500, activities: days * 600, misc: days * 300, total: days * 3500 },
    hiddenGems: [
      { name: 'The Secret Garden', description: 'Forgotten garden known only to locals', lat: coordBase.lat + 0.03, lon: coordBase.lon + 0.03, category: 'Nature' },
      { name: 'Old Quarter Chai Shop', description: '100-year-old tea shop', lat: coordBase.lat - 0.02, lon: coordBase.lon + 0.02, category: 'Food' },
      { name: 'Rooftop Library Café', description: 'Books, coffee and city views', lat: coordBase.lat + 0.01, lon: coordBase.lon - 0.03, category: 'Café' },
    ],
    packingList: ['Comfortable walking shoes','Sunscreen','Power bank','Light jacket','Camera','Water bottle'],
    emergencyContacts: { police: '100', ambulance: '108', tourist_helpline: '1800-111-363' },
    weather: { temp: 24 + Math.floor(Math.random() * 12), description: 'Partly cloudy', humidity: 55 },
  }
}

function generatePlacesForDay(day, isExplorer, coordBase) {
  const spots = [
    { name: 'Heritage Fort', type: 'attraction', description: 'Centuries-old fortress with panoramic views.', tip: 'Visit at sunset', tags: ['history'] },
    { name: 'Sacred Temple Complex', type: 'temple', description: 'Ancient temple with intricate carvings.', tip: 'Dress modestly', tags: ['spiritual'] },
    { name: 'Old City Market', type: 'market', description: 'Vibrant bazaar with spices and crafts.', tip: 'Bargaining expected', tags: ['culture'] },
    { name: 'Riverside Promenade', type: 'park', description: 'Peaceful riverside walk.', tip: 'Morning is magical', tags: ['nature'] },
    { name: 'Hidden Courtyard Café', type: 'cafe', description: 'Tucked-away café loved by artists.', tip: 'Try masala chai', tags: ['food'] },
    { name: 'Palace Museum', type: 'museum', description: 'Royal residence turned museum.', tip: 'Audio guide worth it', tags: ['history'] },
    { name: 'Night Food Street', type: 'restaurant', description: 'Best local food after dark.', tip: 'Come hungry', tags: ['food'] },
    { name: 'Scenic Viewpoint', type: 'viewpoint', description: 'Breathtaking city panorama.', tip: 'Arrive before sunset', tags: ['photography'] },
  ]
  return Array.from({ length: 4 }, (_, i) => {
    const spot = spots[(day * 4 + i) % spots.length]
    return { ...spot, time: ['08:00 AM','10:30 AM','01:00 PM','04:00 PM'][i], duration: ['1.5 hours','2 hours','1 hour','2 hours'][i], lat: coordBase.lat + (Math.random() - 0.5) * 0.08, lon: coordBase.lon + (Math.random() - 0.5) * 0.08, cost: 200 + Math.floor(Math.random() * 600), rating: +(3.8 + Math.random() * 1.2).toFixed(1), isHiddenGem: isExplorer && i === 3 }
  })
}

function getDestCoords(dest) {
  const c = { delhi: { lat: 28.6139, lon: 77.2090 }, mumbai: { lat: 19.0760, lon: 72.8777 }, goa: { lat: 15.2993, lon: 74.1240 }, jaipur: { lat: 26.9124, lon: 75.7873 }, kerala: { lat: 10.8505, lon: 76.2711 }, agra: { lat: 27.1767, lon: 78.0081 }, varanasi: { lat: 25.3176, lon: 82.9739 }, udaipur: { lat: 24.5854, lon: 73.7125 }, manali: { lat: 32.2396, lon: 77.1887 }, rishikesh: { lat: 30.0869, lon: 78.2676 }, bangalore: { lat: 12.9716, lon: 77.5946 }, hyderabad: { lat: 17.3850, lon: 78.4867 }, paris: { lat: 48.8566, lon: 2.3522 }, london: { lat: 51.5074, lon: -0.1278 }, tokyo: { lat: 35.6762, lon: 139.6503 }, bali: { lat: -8.3405, lon: 115.0920 }, dubai: { lat: 25.2048, lon: 55.2708 }, singapore: { lat: 1.3521, lon: 103.8198 } }
  const key = dest.toLowerCase()
  for (const [k, v] of Object.entries(c)) { if (key.includes(k)) return v }
  return { lat: 20.5937, lon: 78.9629 }
}

function getTravelTip(mode) {
  const t = { car: 'Drive carefully. Use designated parking.', bike: 'Two-wheelers perfect for narrow lanes.', public: 'Metro and buses are cheap and efficient.', walk: 'Wear comfortable shoes and stay hydrated.', flight: 'Pre-book airport transfers.' }
  return t[mode] || t.walk
}