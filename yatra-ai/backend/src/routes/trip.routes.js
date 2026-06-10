const express = require('express')
const { body, param, query } = require('express-validator')
const router = express.Router()

const ctrl = require('../controllers/trip.controller')
const { authenticate, optionalAuth } = require('../middleware/auth.middleware')
const { validate } = require('../middleware/validate.middleware')

// POST /generate-trip  (public — auth optional, but required to save)
router.post('/',
  optionalAuth,
  [
    body('destination').trim().notEmpty().withMessage('Destination is required'),
    body('days').isInt({ min: 1, max: 30 }).withMessage('Days must be 1-30'),
    body('budget').optional().isIn(['budget', 'mid-range', 'luxury']),
    body('travelMode').optional().isIn(['car', 'bike', 'public', 'walk', 'flight']),
    body('interests').optional().isArray(),
    body('explorerMode').optional().isBoolean(),
    body('travelers').optional().isInt({ min: 1, max: 20 }),
  ],
  validate,
  ctrl.generateTrip
)

// ── Protected trip CRUD ───────────────────────────────────────────────────────

// POST /trips
router.post('/save', authenticate, ctrl.saveTrip)

// GET /trips/stats
router.get('/stats', authenticate, ctrl.getTripStats)

// GET /trips
router.get('/', authenticate, ctrl.getTrips)

// GET /trips/share/:token  (public — no auth needed)
router.get('/share/:token', ctrl.getSharedTrip)

// GET /trips/:id
router.get('/:id', optionalAuth, ctrl.getTripById)

// PATCH /trips/:id
router.patch('/:id', authenticate, ctrl.updateTrip)

// DELETE /trips/:id
router.delete('/:id', authenticate, ctrl.deleteTrip)

module.exports = router
