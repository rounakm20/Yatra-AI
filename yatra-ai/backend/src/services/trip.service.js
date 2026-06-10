const { v4: uuidv4 } = require('uuid')
const { getSupabase } = require('../config/supabase')
const { createError } = require('../middleware/error.middleware')

// ── In-memory fallback store ───────────────────────────────────────────────────
const localTrips = new Map()

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateShareToken() {
  return Buffer.from(uuidv4()).toString('base64url').slice(0, 16)
}

// ── CRUD ──────────────────────────────────────────────────────────────────────

async function saveTrip({ userId, tripData, generatedItinerary, title, thumbnail }) {
  const db = getSupabase()
  const id = (tripData && tripData.id) || generatedItinerary?.id || `trip_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  const shareToken = generateShareToken()

  const record = {
    id,
    user_id: userId,
    title: title || generatedItinerary?.overview?.title || `Trip to ${tripData.destination}`,
    destination: (tripData && tripData.destination) || generatedItinerary?.tripData?.destination || 'Unknown',
    days: parseInt((tripData && tripData.days) || generatedItinerary?.tripData?.days || 1),
    budget: (tripData && tripData.budget) || generatedItinerary?.tripData?.budget,
    travel_mode: (tripData && tripData.travelMode) || generatedItinerary?.tripData?.travelMode,
    interests: (tripData && tripData.interests) || generatedItinerary?.tripData?.interests || [],
    explorer_mode: (tripData && tripData.explorerMode) || generatedItinerary?.tripData?.explorerMode || false,
    travelers: (tripData && tripData.travelers) || generatedItinerary?.tripData?.travelers || 2,
    trip_data: tripData,
    itinerary: generatedItinerary,
    thumbnail: thumbnail || null,
    share_token: shareToken,
    is_public: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  if (!db) {
    localTrips.set(id, record)
    return record
  }

  const { data, error } = await db
    .from('trips')
    .upsert([record], { onConflict: 'id' })
    .select()
    .single()

  if (error) throw createError(`Failed to save trip: ${error.message}`, 500)
  return data
}

async function getTrips(userId, options = {}) {
  const { limit = 20, offset = 0, sortBy = 'created_at', order = 'desc' } = options
  const db = getSupabase()

  if (!db) {
    const trips = Array.from(localTrips.values())
      .filter(t => t.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(offset, offset + limit)
    return { trips, total: trips.length }
  }

  const { data, error, count } = await db
    .from('trips')
    .select('id, title, destination, days, budget, explorer_mode, thumbnail, share_token, created_at, updated_at', { count: 'exact' })
    .eq('user_id', userId)
    .order(sortBy, { ascending: order === 'asc' })
    .range(offset, offset + limit - 1)

  if (error) throw createError(`Failed to fetch trips: ${error.message}`, 500)
  return { trips: data, total: count }
}

async function getTripById(tripId, userId = null) {
  const db = getSupabase()

  if (!db) {
    const trip = localTrips.get(tripId)
    if (!trip) throw createError('Trip not found', 404)
    if (userId && trip.user_id !== userId && !trip.is_public) {
      throw createError('Access denied', 403)
    }
    return trip
  }

  const { data, error } = await db
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .single()

  if (error || !data) throw createError('Trip not found', 404)
  if (userId && data.user_id !== userId && !data.is_public) {
    throw createError('Access denied', 403)
  }
  return data
}

async function getTripByShareToken(shareToken) {
  const db = getSupabase()

  if (!db) {
    for (const trip of localTrips.values()) {
      if (trip.share_token === shareToken) return trip
    }
    throw createError('Shared trip not found', 404)
  }

  const { data, error } = await db
    .from('trips')
    .select('*')
    .eq('share_token', shareToken)
    .single()

  if (error || !data) throw createError('Shared trip not found', 404)
  return data
}

async function updateTrip(tripId, userId, updates) {
  const db = getSupabase()
  const allowed = ['title', 'thumbnail', 'is_public', 'itinerary', 'trip_data']
  const filtered = Object.fromEntries(
    Object.entries(updates).filter(([k]) => allowed.includes(k))
  )
  filtered.updated_at = new Date().toISOString()

  if (!db) {
    const existing = localTrips.get(tripId)
    if (!existing) throw createError('Trip not found', 404)
    if (existing.user_id !== userId) throw createError('Access denied', 403)
    const updated = { ...existing, ...filtered }
    localTrips.set(tripId, updated)
    return updated
  }

  const { data, error } = await db
    .from('trips')
    .update(filtered)
    .eq('id', tripId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw createError(`Update failed: ${error.message}`, 500)
  if (!data) throw createError('Trip not found or access denied', 404)
  return data
}

async function deleteTrip(tripId, userId) {
  const db = getSupabase()

  if (!db) {
    const existing = localTrips.get(tripId)
    if (!existing) throw createError('Trip not found', 404)
    if (existing.user_id !== userId) throw createError('Access denied', 403)
    localTrips.delete(tripId)
    return { success: true }
  }

  const { error } = await db
    .from('trips')
    .delete()
    .eq('id', tripId)
    .eq('user_id', userId)

  if (error) throw createError(`Delete failed: ${error.message}`, 500)
  return { success: true }
}

async function getTripStats(userId) {
  const db = getSupabase()

  if (!db) {
    const trips = Array.from(localTrips.values()).filter(t => t.user_id === userId)
    const destinations = [...new Set(trips.map(t => t.destination))]
    return {
      totalTrips: trips.length,
      uniqueDestinations: destinations.length,
      totalDaysPlanned: trips.reduce((s, t) => s + (t.days || 0), 0),
      explorerTrips: trips.filter(t => t.explorer_mode).length,
      touristTrips: trips.filter(t => !t.explorer_mode).length,
    }
  }

  const { data, error } = await db
    .from('trips')
    .select('destination, days, explorer_mode')
    .eq('user_id', userId)

  if (error) return {}
  return {
    totalTrips: data.length,
    uniqueDestinations: new Set(data.map(t => t.destination)).size,
    totalDaysPlanned: data.reduce((s, t) => s + (t.days || 0), 0),
    explorerTrips: data.filter(t => t.explorer_mode).length,
    touristTrips: data.filter(t => !t.explorer_mode).length,
  }
}

module.exports = {
  saveTrip,
  getTrips,
  getTripById,
  getTripByShareToken,
  updateTrip,
  deleteTrip,
  getTripStats,
}
