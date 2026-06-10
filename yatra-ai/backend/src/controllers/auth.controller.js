const authService = require('../services/auth.service')
const { asyncHandler, createError } = require('../middleware/error.middleware')

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body
  const result = await authService.register({ name, email, password })
  res.status(201).json({
    message: 'Account created successfully',
    ...result,
  })
})

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const result = await authService.login({ email, password })
  res.json({
    message: 'Login successful',
    ...result,
  })
})

const googleLogin = asyncHandler(async (req, res) => {
  // In production this would verify a Google OAuth token/code.
  // Here we accept the pre-verified user payload from the frontend
  // (Firebase / Google Identity / OAuth callback).
  const { googleId, email, name, avatar } = req.body
  if (!email) throw createError('Google login payload is missing email', 400)
  const result = await authService.googleLogin({ googleId, email, name, avatar })
  res.json({
    message: 'Google login successful',
    ...result,
  })
})

const getProfile = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.id)
  res.json({ user })
})

const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user.id, req.body)
  res.json({ message: 'Profile updated', user })
})

const changePassword = asyncHandler(async (req, res) => {
  const result = await authService.changePassword(req.user.id, req.body)
  res.json(result)
})

const refreshToken = asyncHandler(async (req, res) => {
  // Simple refresh: re-issue token for authenticated user
  const user = await authService.getProfile(req.user.id)
  const token = authService.signToken(user)
  res.json({ token, user })
})

module.exports = { register, login, googleLogin, getProfile, updateProfile, changePassword, refreshToken }
