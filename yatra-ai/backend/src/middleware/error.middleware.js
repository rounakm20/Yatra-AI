/**
 * Central error handler — catches anything thrown in route handlers.
 */
function errorHandler(err, req, res, next) {
  console.error(`[Error] ${req.method} ${req.path}:`, err.message || err)

  // Validation errors from express-validator
  if (err.type === 'validation') {
    return res.status(400).json({ error: 'Validation failed', details: err.errors })
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' })
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' })
  }

  // Known operational errors
  if (err.statusCode) {
    return res.status(err.statusCode).json({ error: err.message })
  }

  // Unknown / unhandled
  return res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error',
  })
}

/**
 * Helper — wrap async route handlers so errors propagate to errorHandler
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

/**
 * Create a typed operational error
 */
function createError(message, statusCode = 500) {
  const err = new Error(message)
  err.statusCode = statusCode
  return err
}

module.exports = { errorHandler, asyncHandler, createError }
