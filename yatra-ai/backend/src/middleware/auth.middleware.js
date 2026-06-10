const jwt = require('jsonwebtoken')
const { createError } = require('./error.middleware')

/**
 * Protect routes — require a valid JWT Bearer token.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(createError('Authentication required', 401))
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me')
    req.user = decoded
    next()
  } catch (err) {
    next(err)
  }
}

/**
 * Optional auth — attaches user if token present, doesn't fail if absent.
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next()
  }
  const token = authHeader.split(' ')[1]
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me')
  } catch {}
  next()
}

module.exports = { authenticate, optionalAuth }
