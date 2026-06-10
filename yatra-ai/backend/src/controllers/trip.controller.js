const { v4: uuidv4 } = require('uuid')
const aiService = require('../services/ai.service')
const tripService = require('../services/trip.service')
const placesService = require('../services/places.service')
const weatherService = require('../services/weather.service')
const { asyncHandler, createError } = require('../middleware/error.middleware')

// POST /generate-trip
const generateTrip = asyncHandler(async (req, res) => {
  const {
    destination, days, budget, budgetAmount,
    travelMode, interests, explorerMode, travelers,
  } = req.body

  if (!destination) throw createError('Destination is required', 400)
  const parsedDays = parseInt(days)
  if (!days || isNaN(parsedDays) || parsedDays < 1 || parsedDays > 30) throw createError('Days must be between 1 and 30', 400)

  // 1. Geocode the destination
  console.log(`🗺️  Geocoding: ${destination}`)
  const coords = await placesService.geocodeDestination(destination)

  // 2. Fetch weather
  let weather = null
  if (coords) {
    console.log(`🌤️  Fetching weather for ${destination}`)
    const weatherData = await weatherService.fetchWeatherByCoords(coords.lat, coords.lon)
    weather = weatherData?.current || null
  }

  // 3. Generate AI itinerary
  console.log(`🤖 Generating AI itinerary for ${destination} (${days} days)`)
  const itinerary = await aiService.generateTrip({
    destination,
    days: parseInt(days),
    budget: budget || 'mid-range',
    budgetAmount: budgetAmount || 2000,
    travelMode: travelMode || 'public',
    interests: interests || [],
    explorerMode: explorerMode || false,
    travelers: travelers || 2,
    coordinates: coords,
    weather,
  })

  // 4. Attach geocoded coordinates and weather if not already in itinerary
  if (coords && !itinerary.overview?.coordinates) {
    itinerary.overview = itinerary.overview || {}
    itinerary.overview.coordinates = { lat: coords.lat, lon: coords.lon }
  }
  if (weather && !itinerary.weather) {
    itinerary.weather = weather
  }

  // 5. Tag with a unique id
  if (!itinerary.id) {
    itinerary.id = `trip_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  }
  itinerary.createdAt = new Date().toISOString()
  itinerary.tripData = {
    destination, days: parseInt(days), budget, budgetAmount,
    travelMode, interests, explorerMode, travelers,
  }

  res.json({
    success: true,
    itinerary,
    metadata: {
      destination,
      coordinates: coords,
      weather: weather ? { temp: weather.temp, description: weather.description } : null,
      generatedAt: itinerary.createdAt,
      aiMode: process.env.GEMINI_API_KEY ? 'gemini' : 'mock',
    },
  })
})

// POST /trips — save a trip
const saveTrip = asyncHandler(async (req, res) => {
  const userId = req.user?.id || 'anonymous'
  const { tripData, generatedItinerary, title, thumbnail } = req.body
  if (!generatedItinerary) throw createError('generatedItinerary is required', 400)

  const saved = await tripService.saveTrip({ userId, tripData, generatedItinerary, title, thumbnail })
  res.status(201).json({ success: true, trip: saved })
})

// GET /trips — list user trips
const getTrips = asyncHandler(async (req, res) => {
  const userId = req.user.id
  const { limit, offset, sortBy, order } = req.query
  const result = await tripService.getTrips(userId, {
    limit: parseInt(limit) || 20,
    offset: parseInt(offset) || 0,
    sortBy: sortBy || 'created_at',
    order: order || 'desc',
  })
  res.json(result)
})

// GET /trips/:id — get one trip
const getTripById = asyncHandler(async (req, res) => {
  const { id } = req.params
  const userId = req.user?.id || null
  const trip = await tripService.getTripById(id, userId)
  res.json({ trip })
})

// GET /trips/share/:token — get shared trip (public)
const getSharedTrip = asyncHandler(async (req, res) => {
  const { token } = req.params
  const trip = await tripService.getTripByShareToken(token)
  res.json({ trip })
})

// PATCH /trips/:id — update trip
const updateTrip = asyncHandler(async (req, res) => {
  const { id } = req.params
  const userId = req.user.id
  const updated = await tripService.updateTrip(id, userId, req.body)
  res.json({ success: true, trip: updated })
})

// DELETE /trips/:id — delete trip
const deleteTrip = asyncHandler(async (req, res) => {
  const { id } = req.params
  const userId = req.user.id
  const result = await tripService.deleteTrip(id, userId)
  res.json(result)
})

// GET /trips/stats — user stats
const getTripStats = asyncHandler(async (req, res) => {
  const userId = req.user.id
  const stats = await tripService.getTripStats(userId)
  res.json({ stats })
})

module.exports = {
  generateTrip,
  saveTrip,
  getTrips,
  getTripById,
  getSharedTrip,
  updateTrip,
  deleteTrip,
  getTripStats,
}
