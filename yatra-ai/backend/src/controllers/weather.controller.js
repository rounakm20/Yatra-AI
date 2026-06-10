const weatherService = require('../services/weather.service')
const { asyncHandler, createError } = require('../middleware/error.middleware')

// GET /weather?lat=&lon=
const getWeatherByCoords = asyncHandler(async (req, res) => {
  const { lat, lon } = req.query
  if (!lat || !lon) throw createError('lat and lon are required', 400)
  const data = await weatherService.fetchWeatherByCoords(parseFloat(lat), parseFloat(lon))
  res.json(data)
})

// GET /weather/city?q=delhi
const getWeatherByCity = asyncHandler(async (req, res) => {
  const { q } = req.query
  if (!q) throw createError('Query parameter "q" is required', 400)
  const data = await weatherService.fetchWeatherByCity(q)
  res.json(data)
})

module.exports = { getWeatherByCoords, getWeatherByCity }
