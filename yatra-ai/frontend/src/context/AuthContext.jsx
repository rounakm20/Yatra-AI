import React, { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Restore session from localStorage
    const stored = localStorage.getItem('yatra_user')
    const token = localStorage.getItem('yatra_token')
    if (stored && token) {
      try {
        setUser(JSON.parse(stored))
        // Optionally re-validate token with backend
        authApi.getProfile()
          .then(u => { setUser(u); localStorage.setItem('yatra_user', JSON.stringify(u)) })
          .catch(() => { /* token expired — user will need to re-login */ })
      } catch {}
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const result = await authApi.login(email, password)
    setUser(result.user)
    localStorage.setItem('yatra_user', JSON.stringify(result.user))
    return result.user
  }

  const signup = async (name, email, password) => {
    const result = await authApi.register(name, email, password)
    setUser(result.user)
    localStorage.setItem('yatra_user', JSON.stringify(result.user))
    return result.user
  }

  const loginWithGoogle = async (googlePayload) => {
    // googlePayload: { googleId, email, name, avatar }
    // In production, get this from Firebase Auth or Google Identity
    const mockPayload = googlePayload || {
      googleId: 'google_' + Math.random().toString(36).substr(2, 9),
      email: 'traveler@gmail.com',
      name: 'Arjun Sharma',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=google',
    }
    const result = await authApi.googleLogin(mockPayload)
    setUser(result.user)
    localStorage.setItem('yatra_user', JSON.stringify(result.user))
    return result.user
  }

  const logout = () => {
    authApi.logout()
    setUser(null)
  }

  const updateProfile = async (updates) => {
    try {
      const updated = await authApi.updateProfile(updates)
      setUser(updated)
      localStorage.setItem('yatra_user', JSON.stringify(updated))
      return updated
    } catch {
      // Optimistic local update fallback
      const updated = { ...user, ...updates }
      setUser(updated)
      localStorage.setItem('yatra_user', JSON.stringify(updated))
      return updated
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, loginWithGoogle, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
