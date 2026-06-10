const placesService = require('../services/places.service')
const { asyncHandler, createError } = require('../middleware/error.middleware')

// GET /places/geocode?q=destination
const geocode = asyncHandler(async (req, res) => {
  const { q } = req.query
  if (!q) throw createError('Query parameter "q" is required', 400)
  const result = await placesService.geocodeDestination(q)
  if (!result) {
    return res.status(404).json({ error: 'Location not found', query: q })
  }
  res.json({ result })
})

// GET /places/reverse?lat=&lon=
const reverseGeocode = asyncHandler(async (req, res) => {
  const { lat, lon } = req.query
  if (!lat || !lon) throw createError('lat and lon are required', 400)
  const result = await placesService.reverseGeocode(parseFloat(lat), parseFloat(lon))
  res.json({ result })
})

// GET /places/nearby?lat=&lon=&radius=&types=cafe,restaurant
const nearby = asyncHandler(async (req, res) => {
  const { lat, lon, radius = 2000, types } = req.query
  if (!lat || !lon) throw createError('lat and lon are required', 400)
  const categories = types ? types.split(',').map(t => t.trim()) : []
  const places = await placesService.fetchNearbyPlaces(
    parseFloat(lat), parseFloat(lon), parseInt(radius), categories
  )
  res.json({ places, count: places.length })
})

// GET /places/cafes?lat=&lon=&radius=
const nearbyCafes = asyncHandler(async (req, res) => {
  const { lat, lon, radius = 1500 } = req.query
  if (!lat || !lon) throw createError('lat and lon are required', 400)
  const places = await placesService.fetchNearbyCafes(parseFloat(lat), parseFloat(lon), parseInt(radius))
  res.json({ places, count: places.length })
})

// GET /places/hotels?lat=&lon=&radius=
const nearbyHotels = asyncHandler(async (req, res) => {
  const { lat, lon, radius = 3000 } = req.query
  if (!lat || !lon) throw createError('lat and lon are required', 400)
  const places = await placesService.fetchNearbyHotels(parseFloat(lat), parseFloat(lon), parseInt(radius))
  res.json({ places, count: places.length })
})

// GET /places/attractions?lat=&lon=&radius=
const nearbyAttractions = asyncHandler(async (req, res) => {
  const { lat, lon, radius = 3000 } = req.query
  if (!lat || !lon) throw createError('lat and lon are required', 400)
  const places = await placesService.fetchNearbyAttractions(parseFloat(lat), parseFloat(lon), parseInt(radius))
  res.json({ places, count: places.length })
})

// POST /places/route  body: { waypoints: [{lat, lon}], profile: 'car' }
const getRoute = asyncHandler(async (req, res) => {
  const { waypoints, profile = 'car' } = req.body
  if (!waypoints || !Array.isArray(waypoints) || waypoints.length < 2) {
    throw createError('At least 2 waypoints are required', 400)
  }
  const route = await placesService.calculateRoute(waypoints, profile)
  res.json({ route })
})

module.exports = { geocode, reverseGeocode, nearby, nearbyCafes, nearbyHotels, nearbyAttractions, getRoute }
