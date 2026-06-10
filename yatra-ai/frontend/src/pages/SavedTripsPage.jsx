import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookMarked, Search, PlusCircle, Compass } from 'lucide-react'
import { useTrip } from '../context/TripContext'
import TripCard from '../components/trip/TripCard'

const T = {
  cream:       '#FAF7F0',
  creamDeep:   '#F0EAD6',
  forest:      '#1E3A2F',
  forestMid:   '#2D5A40',
  forestLight: '#E8F0EB',
  sage:        '#7A9E87',
  sand:        '#C9B99A',
  sandLight:   '#E8DFC8',
}

export default function SavedTripsPage() {
  const { savedTrips } = useTrip()
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState('all')

  const filtered = savedTrips.filter(t => {
    const dest  = t.tripData?.destination?.toLowerCase() || ''
    const title = t.overview?.title?.toLowerCase() || ''
    const q     = search.toLowerCase()
    const matchSearch = !q || dest.includes(q) || title.includes(q)
    const matchFilter =
      filter === 'all' ||
      (filter === 'explorer' && t.tripData?.explorerMode) ||
      (filter === 'tourist'  && !t.tripData?.explorerMode)
    return matchSearch && matchFilter
  })

  const filterTabs = [
    { val: 'all',      label: 'All' },
    { val: 'tourist',  label: '🏛️ Tourist' },
    { val: 'explorer', label: '🔍 Explorer' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: T.cream, padding: '40px 28px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <h1 style={{
                fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 700,
                color: T.forest, display: 'flex', alignItems: 'center', gap: 10, margin: 0,
              }}>
                <BookMarked size={26} color={T.sage} />
                Saved Trips
              </h1>
              <p style={{ fontSize: 13, color: T.sage, marginTop: 4 }}>
                {savedTrips.length} trip{savedTrips.length !== 1 ? 's' : ''} saved
              </p>
            </div>

            <Link to="/planner" style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: T.forest, color: T.cream,
              fontSize: 13, fontWeight: 600,
              padding: '10px 18px', borderRadius: 8,
              textDecoration: 'none', transition: 'background 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = T.forestMid}
              onMouseLeave={e => e.currentTarget.style.background = T.forest}
            >
              <PlusCircle size={15} /> Plan New Trip
            </Link>
          </div>
        </motion.div>

        {/* Filters */}
        {savedTrips.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 32 }}
          >
            {/* Search */}
            <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 340 }}>
              <Search size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: T.sand }} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search destinations..."
                style={{
                  width: '100%', padding: '10px 14px 10px 38px',
                  borderRadius: 8, border: `1px solid ${T.sand}`,
                  background: T.cream, color: T.forest,
                  fontSize: 13, fontFamily: 'system-ui, sans-serif',
                  outline: 'none', transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = T.sage}
                onBlur={e => e.target.style.borderColor = T.sand}
              />
            </div>

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: 8 }}>
              {filterTabs.map(({ val, label }) => {
                const active = filter === val
                return (
                  <button
                    key={val}
                    onClick={() => setFilter(val)}
                    style={{
                      padding: '9px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.15s',
                      background: active ? T.forestLight : 'transparent',
                      color:      active ? T.forest      : T.sage,
                      border:     active ? `1px solid ${T.sage}60` : `1px solid ${T.sand}80`,
                    }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.background = T.forestLight; e.currentTarget.style.color = T.forest } }}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.sage } }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Grid */}
        {filtered.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 20,
          }}>
            {filtered.map((trip, i) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <TripCard trip={trip} />
              </motion.div>
            ))}
          </div>
        ) : savedTrips.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <p style={{ fontSize: 14, color: T.sage }}>No trips match your search.</p>
          </div>
        )}

      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ textAlign: 'center', padding: '80px 0' }}
    >
      <div style={{
        width: 80, height: 80, borderRadius: 20,
        background: T.forestLight,
        border: `1px solid ${T.sand}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 24px',
      }}>
        <Compass size={34} color={T.sage} />
      </div>

      <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 700, color: T.forest, marginBottom: 10 }}>
        No saved trips yet
      </h2>
      <p style={{ fontSize: 14, color: T.sage, maxWidth: 320, margin: '0 auto 28px', lineHeight: 1.7 }}>
        Plan your first AI-powered trip and save it here to revisit anytime.
      </p>

      <Link to="/planner" style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        background: T.forest, color: T.cream,
        fontSize: 13, fontWeight: 600,
        padding: '11px 22px', borderRadius: 8,
        textDecoration: 'none', transition: 'background 0.15s',
      }}
        onMouseEnter={e => e.currentTarget.style.background = T.forestMid}
        onMouseLeave={e => e.currentTarget.style.background = T.forest}
      >
        <PlusCircle size={15} /> Plan Your First Trip
      </Link>
    </motion.div>
  )
}