import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PlusCircle, BookMarked, Map, Sparkles, TrendingUp, Clock, Compass, ChevronRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTrip } from '../context/TripContext'
import TripCard from '../components/trip/TripCard'

const T = {
  cream:       '#FAF7F0',
  creamDeep:   '#F0EAD6',
  creamCard:   '#E8DFC8',
  forest:      '#1E3A2F',
  forestMid:   '#2D5A40',
  forestLight: '#E8F0EB',
  sage:        '#7A9E87',
  sand:        '#C9B99A',
  sandLight:   '#E8DFC8',
}

const QUICK_DESTINATIONS = [
  { name: 'Goa',      emoji: '🏖️', subtitle: 'Beach & Vibes',    days: '3-5 days' },
  { name: 'Jaipur',   emoji: '🏯', subtitle: 'Royal Rajasthan',  days: '2-4 days' },
  { name: 'Manali',   emoji: '🏔️', subtitle: 'Mountain Magic',   days: '4-6 days' },
  { name: 'Kerala',   emoji: '🌴', subtitle: 'Backwaters',        days: '5-7 days' },
  { name: 'Varanasi', emoji: '🕯️', subtitle: 'Spiritual Soul',   days: '2-3 days' },
  { name: 'Udaipur',  emoji: '💎', subtitle: 'City of Lakes',     days: '3-4 days' },
]

const STAT_DEFS = [
  { label: 'Saved Trips',     icon: <BookMarked size={17} /> },
  { label: 'Cities Explored', icon: <Map size={17} /> },
  { label: 'Days Planned',    icon: <Clock size={17} /> },
  { label: 'AI Plans',        icon: <Sparkles size={17} /> },
]

export default function DashboardPage() {
  const { user }       = useAuth()
  const { savedTrips } = useTrip()
  const recentTrips    = savedTrips.slice(0, 3)
  const hour           = new Date().getHours()
  const greeting       = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const statValues = [
    savedTrips.length,
    savedTrips.length * 2 || 0,
    savedTrips.reduce((a, t) => a + (parseInt(t.tripData?.days) || 0), 0),
    savedTrips.length,
  ]

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6" style={{ background: T.cream }}>
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:36 }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              <img src={user?.avatar} alt={user?.name}
                style={{ width:56, height:56, borderRadius:14, background: T.creamDeep, border:`1.5px solid ${T.sand}` }} />
              <div>
                <p style={{ fontFamily:'system-ui, sans-serif', fontSize:13, color: T.sage, margin:0 }}>{greeting} 👋</p>
                <h1 style={{ fontFamily:'Georgia, serif', fontSize:24, fontWeight:700, color: T.forest, margin:0 }}>{user?.name}</h1>
              </div>
            </div>
            <Link to="/planner"
              className="inline-flex items-center gap-2 self-start sm:self-auto font-semibold transition-all hover:opacity-90 hover:scale-[1.02]"
              style={{ background: T.forest, color: T.cream, padding:'10px 22px', borderRadius:8, fontSize:14, fontFamily:'system-ui, sans-serif' }}>
              <PlusCircle size={16} /> Plan New Trip
            </Link>
          </div>
        </motion.div>

        {/* ── Stat Cards ── */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4" style={{ marginBottom:36 }}>
          {STAT_DEFS.map((s, i) => (
            <div key={i} style={{
              background: T.creamDeep,
              border: `1px solid ${T.sand}`,
              borderRadius: 12, padding: 20,
            }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                <div style={{ width:36, height:36, borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center',
                  background: T.forestLight, color: T.forestMid }}>
                  {s.icon}
                </div>
                <TrendingUp size={13} style={{ color: T.sand }} />
              </div>
              <p style={{ fontFamily:'Georgia, serif', fontWeight:700, fontSize:26, color: T.forest, margin:0, lineHeight:1 }}>{statValues[i]}</p>
              <p style={{ fontFamily:'system-ui, sans-serif', fontSize:12, color: T.sage, marginTop:4 }}>{s.label}</p>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Recent Trips ── */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                <h2 style={{ fontFamily:'Georgia, serif', fontWeight:700, fontSize:20, color: T.forest, margin:0 }}>Recent Trips</h2>
                <Link to="/saved"
                  style={{ fontFamily:'system-ui, sans-serif', fontSize:12, color: T.sage, display:'flex', alignItems:'center', gap:4, textDecoration:'none' }}
                  onMouseEnter={e => e.currentTarget.style.color = T.forest}
                  onMouseLeave={e => e.currentTarget.style.color = T.sage}>
                  View all <ChevronRight size={13} />
                </Link>
              </div>

              {recentTrips.length > 0 ? (
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {recentTrips.map((trip, i) => (
                    <motion.div key={trip.id} initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.1*i }}>
                      <TripCard trip={trip} compact />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <EmptyTrips />
              )}
            </motion.div>
          </div>

          {/* ── Sidebar ── */}
          <div>
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}>
              <h2 style={{ fontFamily:'Georgia, serif', fontWeight:700, fontSize:20, color: T.forest, marginBottom:20 }}>Quick Start</h2>

              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {QUICK_DESTINATIONS.map((d, i) => (
                  <Link key={i} to={`/planner?dest=${d.name}`}
                    style={{ display:'flex', alignItems:'center', gap:12,
                      background: T.creamDeep, border:`1px solid ${T.sand}`,
                      borderRadius:10, padding:'10px 14px', textDecoration:'none', transition:'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = T.sage; e.currentTarget.style.background = T.sandLight }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = T.sand; e.currentTarget.style.background = T.creamDeep }}>
                    <span style={{ fontSize:20 }}>{d.emoji}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontFamily:'system-ui, sans-serif', fontSize:13, fontWeight:600, color: T.forest, margin:0 }}>{d.name}</p>
                      <p style={{ fontFamily:'system-ui, sans-serif', fontSize:11, color: T.sage, margin:0 }}>{d.subtitle} · {d.days}</p>
                    </div>
                    <ChevronRight size={14} style={{ color: T.sage, flexShrink:0 }} />
                  </Link>
                ))}
              </div>

              {/* AI Tip */}
              <div style={{ marginTop:14, background: T.forest,
                borderRadius:12, padding:20 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                  <Sparkles size={16} style={{ color: T.sand }} />
                  <span style={{ fontFamily:'system-ui, sans-serif', fontSize:13, fontWeight:600, color: T.cream }}>AI Tip of the Day</span>
                </div>
                <p style={{ fontFamily:'system-ui, sans-serif', fontSize:12, color: T.sage, lineHeight:1.7, margin:0 }}>
                  Try Explorer Mode to discover hidden cafes and secret viewpoints that most tourists never see.
                  The best experiences are often off the beaten path. 🗺️
                </p>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  )
}

function EmptyTrips() {
  return (
    <div style={{ background: T.creamDeep, border:`1px solid ${T.sand}`, borderRadius:12, padding:48, textAlign:'center' }}>
      <Compass size={40} style={{ color: T.sand, margin:'0 auto 16px', display:'block' }} />
      <h3 style={{ fontFamily:'Georgia, serif', fontWeight:600, color: T.sage, marginBottom:8 }}>No trips yet</h3>
      <p style={{ fontFamily:'system-ui, sans-serif', color: T.sage, fontSize:13, marginBottom:24 }}>Plan your first AI-powered adventure!</p>
      <Link to="/planner"
        className="inline-flex items-center gap-2 font-semibold transition-all hover:opacity-90"
        style={{ background: T.forest, color: T.cream, padding:'10px 22px', borderRadius:8, fontSize:13, fontFamily:'system-ui, sans-serif' }}>
        <PlusCircle size={15} /> Plan a Trip
      </Link>
    </div>
  )
}