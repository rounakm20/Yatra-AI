const express = require('express')
const router = express.Router()

const ctrl = require('../controllers/place.controller')

// GET /places/geocode?q=
router.get('/geocode', ctrl.geocode)

// GET /places/reverse?lat=&lon=
router.get('/reverse', ctrl.reverseGeocode)

// GET /places/nearby?lat=&lon=&radius=&types=
router.get('/nearby', ctrl.nearby)

// GET /places/cafes?lat=&lon=&radius=
router.get('/cafes', ctrl.nearbyCafes)

// GET /places/hotels?lat=&lon=&radius=
router.get('/hotels', ctrl.nearbyHotels)

// GET /places/attractions?lat=&lon=&radius=
router.get('/attractions', ctrl.nearbyAttractions)

// POST /places/route
router.post('/route', ctrl.getRoute)

module.exports = router
