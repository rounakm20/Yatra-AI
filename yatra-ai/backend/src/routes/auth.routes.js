const express = require('express')
const { body } = require('express-validator')
const router = express.Router()

const ctrl = require('../controllers/auth.controller')
const { authenticate } = require('../middleware/auth.middleware')
const { validate } = require('../middleware/validate.middleware')

// POST /auth/register
router.post('/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 60 }),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  ctrl.register
)

// POST /auth/login
router.post('/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  ctrl.login
)

// POST /auth/google
router.post('/google',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('name').trim().notEmpty().withMessage('Name is required'),
  ],
  validate,
  ctrl.googleLogin
)

// GET /auth/profile  (protected)
router.get('/profile', authenticate, ctrl.getProfile)

// PATCH /auth/profile  (protected)
router.patch('/profile',
  authenticate,
  [
    body('name').optional().trim().isLength({ min: 2, max: 60 }),
    body('bio').optional().trim().isLength({ max: 300 }),
  ],
  validate,
  ctrl.updateProfile
)

// POST /auth/change-password  (protected)
router.post('/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('Current password required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be ≥ 6 characters'),
  ],
  validate,
  ctrl.changePassword
)

// POST /auth/refresh  (protected)
router.post('/refresh', authenticate, ctrl.refreshToken)

module.exports = router
