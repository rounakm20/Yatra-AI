const express = require('express')
const router = express.Router()

const ctrl = require('../controllers/weather.controller')

// GET /weather?lat=&lon=
router.get('/', ctrl.getWeatherByCoords)

// GET /weather/city?q=delhi
router.get('/city', ctrl.getWeatherByCity)

module.exports = router
