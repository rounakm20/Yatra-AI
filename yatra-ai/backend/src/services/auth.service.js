const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')
const { getSupabase } = require('../config/supabase')
const { createError } = require('../middleware/error.middleware')

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

// ── In-memory user store (fallback when Supabase not configured) ─────────────
const localUsers = new Map()

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
}

function sanitizeUser(user) {
  const { password_hash, ...safe } = user
  return safe
}

// ── Supabase helpers ─────────────────────────────────────────────────────────

async function findUserByEmail(email) {
  const db = getSupabase()
  if (!db) {
    for (const u of localUsers.values()) {
      if (u.email === email) return u
    }
    return null
  }
  const { data, error } = await db
    .from('users')
    .select('*')
    .eq('email', email)
    .single()
  if (error || !data) return null
  return data
}

async function findUserById(id) {
  const db = getSupabase()
  if (!db) return localUsers.get(id) || null
  const { data, error } = await db
    .from('users')
    .select('*')
    .eq('id', id)
    .single()
  if (error || !data) return null
  return data
}

async function createUser({ name, email, password, provider = 'email', avatar = null }) {
  const db = getSupabase()
  const id = uuidv4()
  const password_hash = password ? await bcrypt.hash(password, 12) : null
  const avatarUrl = avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`

  const user = {
    id,
    name,
    email,
    password_hash,
    provider,
    avatar: avatarUrl,
    trips_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  if (!db) {
    localUsers.set(id, user)
    return user
  }

  const { data, error } = await db
    .from('users')
    .insert([{ ...user }])
    .select()
    .single()
  if (error) throw createError(`Failed to create user: ${error.message}`, 500)
  return data
}

async function updateUser(id, updates) {
  const db = getSupabase()
  const payload = { ...updates, updated_at: new Date().toISOString() }

  if (!db) {
    const existing = localUsers.get(id)
    if (!existing) throw createError('User not found', 404)
    const updated = { ...existing, ...payload }
    localUsers.set(id, updated)
    return updated
  }

  const { data, error } = await db
    .from('users')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw createError(`Update failed: ${error.message}`, 500)
  return data
}

// ── Auth operations ──────────────────────────────────────────────────────────

async function register({ name, email, password }) {
  const existing = await findUserByEmail(email)
  if (existing) throw createError('An account with this email already exists', 409)

  const user = await createUser({ name, email, password })
  const token = signToken(user)
  return { user: sanitizeUser(user), token }
}

async function login({ email, password }) {
  const user = await findUserByEmail(email)
  if (!user) throw createError('Invalid email or password', 401)

  if (user.provider !== 'email') {
    throw createError(`This account uses ${user.provider} sign-in. Please use that method.`, 401)
  }

  const valid = await bcrypt.compare(password, user.password_hash || '')
  if (!valid) throw createError('Invalid email or password', 401)

  const token = signToken(user)
  return { user: sanitizeUser(user), token }
}

async function googleLogin({ googleId, email, name, avatar }) {
  let user = await findUserByEmail(email)

  if (!user) {
    user = await createUser({ name, email, provider: 'google', avatar })
  } else if (user.provider !== 'google') {
    // Email already exists with password — merge by updating provider
    user = await updateUser(user.id, { provider: 'google', avatar: avatar || user.avatar })
  }

  const token = signToken(user)
  return { user: sanitizeUser(user), token }
}

async function getProfile(userId) {
  const user = await findUserById(userId)
  if (!user) throw createError('User not found', 404)
  return sanitizeUser(user)
}

async function updateProfile(userId, updates) {
  const allowed = ['name', 'avatar', 'bio', 'preferences']
  const filtered = Object.fromEntries(
    Object.entries(updates).filter(([k]) => allowed.includes(k))
  )
  if (Object.keys(filtered).length === 0) throw createError('No valid fields to update', 400)
  const user = await updateUser(userId, filtered)
  return sanitizeUser(user)
}

async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await findUserById(userId)
  if (!user) throw createError('User not found', 404)
  if (user.provider !== 'email') {
    throw createError('Password change is only available for email accounts', 400)
  }

  const valid = await bcrypt.compare(currentPassword, user.password_hash || '')
  if (!valid) throw createError('Current password is incorrect', 401)

  const password_hash = await bcrypt.hash(newPassword, 12)
  await updateUser(userId, { password_hash })
  return { message: 'Password updated successfully' }
}

module.exports = {
  register,
  login,
  googleLogin,
  getProfile,
  updateProfile,
  changePassword,
  signToken,
  findUserById,
}
