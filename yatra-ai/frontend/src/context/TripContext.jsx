import React, { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../utils/api'
import { useAuth } from './AuthContext'

const TripContext = createContext(null)

export function TripProvider({ children }) {
  const [currentTrip, setCurrentTrip] = useState(null)
  const [savedTrips, setSavedTrips] = useState([])
  const [generating, setGenerating] = useState(false)
  const { user } = useAuth()

  // Load saved trips when user logs in
  useEffect(() => {
    if (user) {
      api.getTrips(user.id).then(trips => {
        if (trips && trips.length > 0) {
          setSavedTrips(trips)
        } else {
          // Fallback: load from localStorage
          const stored = localStorage.getItem('yatra_saved_trips')
          if (stored) {
            try { setSavedTrips(JSON.parse(stored)) } catch {}
          }
        }
      }).catch(() => {
        const stored = localStorage.getItem('yatra_saved_trips')
        if (stored) {
          try { setSavedTrips(JSON.parse(stored)) } catch {}
        }
      })
    } else {
      // Not logged in: use localStorage
      const stored = localStorage.getItem('yatra_saved_trips')
      if (stored) {
        try { setSavedTrips(JSON.parse(stored)) } catch {}
      }
    }
  }, [user])

  const saveTrip = async (trip) => {
    // Always persist to localStorage for instant UI
    const existing = savedTrips.find(t => t.id === trip.id)
    let updated
    if (existing) {
      updated = savedTrips.map(t => t.id === trip.id ? trip : t)
    } else {
      updated = [trip, ...savedTrips]
    }
    setSavedTrips(updated)
    localStorage.setItem('yatra_saved_trips', JSON.stringify(updated))

    // Also persist to backend if logged in
    if (user) {
      api.saveTrip(trip, trip.tripData, user.id).catch(err =>
        console.warn('Backend save failed (data saved locally):', err.message)
      )
    }
    return trip
  }

  const deleteTrip = async (tripId) => {
    const updated = savedTrips.filter(t => t.id !== tripId)
    setSavedTrips(updated)
    localStorage.setItem('yatra_saved_trips', JSON.stringify(updated))

    if (user) {
      api.deleteTrip(tripId).catch(err =>
        console.warn('Backend delete failed:', err.message)
      )
    }
  }

  const getTripById = (id) => savedTrips.find(t => t.id === id) || null

  return (
    <TripContext.Provider value={{
      currentTrip, setCurrentTrip,
      savedTrips, setSavedTrips,
      generating, setGenerating,
      saveTrip, deleteTrip, getTripById,
    }}>
      {children}
    </TripContext.Provider>
  )
}

export function useTrip() {
  return useContext(TripContext)
}
