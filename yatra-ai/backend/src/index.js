require('dotenv').config()

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')

const authRoutes = require('./routes/auth.routes')
const tripRoutes = require('./routes/trip.routes')
const placeRoutes = require('./routes/place.routes')
const weatherRoutes = require('./routes/weather.routes')
const { errorHandler } = require('./middleware/error.middleware')

const app = express()
const PORT = process.env.PORT || 3001

// ── Security ────────────────────────────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: true,
  credentials: true
}))

// ── Rate limiting ────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  message: { error: 'Too many requests, please try again later.' },
})

const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: { error: 'AI generation limit reached. Please try again in an hour.' },
})

app.use(globalLimiter)

// ── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ── Logging ──────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
}

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Yatra-AI Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  })
})

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/auth', authRoutes)
app.use('/generate-trip', aiLimiter, tripRoutes)
app.use('/trips', tripRoutes)
app.use('/places', placeRoutes)
app.use('/weather', weatherRoutes)

// ── Gemini test ───────────────────────────────────────────────────────────────
app.get('/test-gemini', async (req, res) => {
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai')
    const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })
    const result = await model.generateContent('Say "Gemini is working!" in one line.')
    const text = result.response.text()
    res.json({ success: true, response: text, key: process.env.GEMINI_API_KEY ? 'Key is set ✅' : 'Key is MISSING ❌' })
  } catch (err) {
    res.json({ success: false, error: err.message, key: process.env.GEMINI_API_KEY ? 'Key is set ✅' : 'Key is MISSING ❌' })
  }
})

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` })
})

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler)

// ── Start ─────────────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Yatra-AI Backend running on port ${PORT}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`📡 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`)
  console.log(`🤖 Gemini AI: ${process.env.GEMINI_API_KEY ? '✅ configured' : '⚠️  not configured (mock mode)'}`)
  console.log(`🌤️  Weather API: ${process.env.OPENWEATHER_API_KEY ? '✅ configured' : '⚠️  not configured (mock mode)'}`)
  console.log(`🗺️  ORS Routes: ${process.env.ORS_API_KEY ? '✅ configured' : '⚠️  not configured (mock mode)'}`)
  console.log(`🗄️  Supabase: ${process.env.SUPABASE_URL ? '✅ configured' : '⚠️  not configured (local mode)'}\n`)
})

// ── Port-in-use error handling ────────────────────────────────────────────────
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use.`)
    console.error(`   Try one of the following:`)
    console.error(`   1. Kill the process:  npx kill-port ${PORT}`)
    console.error(`   2. Use a different port: set PORT=3002 in your .env file\n`)
    process.exit(1)
  } else {
    console.error('Server error:', err)
    process.exit(1)
  }
})

// ── Graceful shutdown ─────────────────────────────────────────────────────────
const shutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`)
  server.close(() => {
    console.log('✅ Server closed. Goodbye!\n')
    process.exit(0)
  })

  // Force exit if server hasn't closed within 10 seconds
  setTimeout(() => {
    console.error('⚠️  Forced shutdown after timeout.')
    process.exit(1)
  }, 10_000)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT',  () => shutdown('SIGINT'))   // Ctrl+C

module.exports = app