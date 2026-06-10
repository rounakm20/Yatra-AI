import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Calendar, Heart, ArrowRight, ArrowLeft,
  Sparkles, Users, Clock, Navigation, ChevronDown, ChevronUp, Star
} from 'lucide-react'
import { generateTripWithAI, geocodeDestination, fetchWeather } from '../utils/api'
import { useTrip } from '../context/TripContext'
import { useMode } from '../context/ModeContext'
import { toast } from '../components/common/Toaster'

const T = {
  cream:       '#FAF7F0',
  creamDeep:   '#F0EAD6',
  creamCard:   '#EDE5CC',
  forest:      '#1E3A2F',
  forestMid:   '#2D5A40',
  forestLight: '#E8F0EB',
  sage:        '#7A9E87',
  sand:        '#C9B99A',
  sandLight:   '#E8DFC8',
}

const DESTINATIONS = [
  { name: 'Goa',        emoji: '🏖️', desc: 'Beaches & nightlife',   img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&q=80' },
  { name: 'Jaipur',     emoji: '🏰', desc: 'Pink City forts',        img: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=400&q=80' },
  { name: 'Kerala',     emoji: '🌿', desc: 'Backwaters & spice',     img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&q=80' },
  { name: 'Manali',     emoji: '⛰️', desc: 'Mountains & snow',       img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&q=80' },
  { name: 'Varanasi',   emoji: '🕯️', desc: 'Spiritual & ancient',   img: 'https://images.unsplash.com/photo-1561361513-2d8a6c9c3f6a?w=400&q=80' },
  { name: 'Udaipur',    emoji: '🏯', desc: 'City of Lakes',          img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&q=80' },
  { name: 'Rishikesh',  emoji: '🧘', desc: 'Yoga & adventure',       img: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=400&q=80' },
  { name: 'Mumbai',     emoji: '🌆', desc: 'City of Dreams',         img: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=400&q=80' },
  { name: 'Darjeeling', emoji: '🍵', desc: 'Tea & Himalayas',        img: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&q=80' },
  { name: 'Agra',       emoji: '🕌', desc: 'Taj Mahal & Mughal',     img: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&q=80' },
]

const INTERESTS = [
  { id: 'heritage',     label: 'Heritage Sites', emoji: '🏛️', desc: 'Forts, temples, monuments' },
  { id: 'beaches',      label: 'Beaches',        emoji: '🏖️', desc: 'Shorelines & water sports' },
  { id: 'lakes',        label: 'Lakes & Rivers', emoji: '🏞️', desc: 'Scenic waterbodies' },
  { id: 'mountains',    label: 'Mountains',      emoji: '⛰️', desc: 'Treks & hill stations' },
  { id: 'food',         label: 'Local Food',     emoji: '🍜', desc: 'Street food & local cuisine' },
  { id: 'wildlife',     label: 'Wildlife',       emoji: '🐆', desc: 'Sanctuaries & safaris' },
  { id: 'spiritual',    label: 'Spiritual',      emoji: '🧘', desc: 'Temples & meditation' },
  { id: 'adventure',    label: 'Adventure',      emoji: '🪂', desc: 'Rafting, climbing, camping' },
  { id: 'photography',  label: 'Photography',    emoji: '📸', desc: 'Scenic & golden hour spots' },
  { id: 'nightlife',    label: 'Nightlife',      emoji: '🌃', desc: 'Clubs, rooftops & bars' },
  { id: 'shopping',     label: 'Shopping',       emoji: '🛍️', desc: 'Markets & local crafts' },
  { id: 'nature',       label: 'Nature & Parks', emoji: '🌿', desc: 'Gardens & forests' },
]

const DAY_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 10, 14]
const STEPS = ['Destination', 'Duration', 'Interests', 'Your Plan']

export default function PlannerPage() {
  const navigate = useNavigate()
  const { setCurrentTrip, setGenerating } = useTrip()
  const { mode } = useMode()

  const [step, setStep]               = useState(0)
  const [loading, setLoading]         = useState(false)
  const [generatedTrip, setGeneratedTrip] = useState(null)

  const [form, setForm] = useState({
    destination: '', days: '3', travelers: '2',
    budget: 'mid', travelMode: 'public',
    interests: [], explorerMode: mode === 'explorer',
  })

  useEffect(() => {
    setForm(prev => ({ ...prev, explorerMode: mode === 'explorer' }))
  }, [mode])

  const update       = (key, val) => setForm(prev => ({ ...prev, [key]: val }))
  const toggleInterest = (id) => setForm(prev => ({
    ...prev,
    interests: prev.interests.includes(id)
      ? prev.interests.filter(i => i !== id)
      : [...prev.interests, id]
  }))

  const canProceed = () => {
    if (step === 0) return form.destination.trim().length > 1
    if (step === 1) return parseInt(form.days) >= 1
    if (step === 2) return form.interests.length > 0
    return true
  }

  const handleGenerate = async () => {
    setLoading(true); setGenerating(true)
    try {
      toast('🤖 Building your itinerary...', 'info', 8000)
      const coords  = await geocodeDestination(form.destination)
      const weather = coords ? await fetchWeather(coords.lat, coords.lon) : null
      const tripData = { ...form, coordinates: coords, weather, budgetAmount: form.budget === 'budget' ? 1500 : form.budget === 'mid' ? 3000 : 6000 }
      const trip = await generateTripWithAI(tripData)
      setCurrentTrip(trip); setGeneratedTrip(trip)
      toast('✨ Itinerary ready!', 'success')
      setStep(3)
    } catch {
      toast('Failed to generate trip. Try again.', 'error')
    } finally {
      setLoading(false); setGenerating(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: T.cream, paddingTop: 96, paddingBottom: 64, paddingLeft: 16, paddingRight: 16 }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: T.forestLight, border: `1px solid ${T.sage}40`,
            padding: '6px 16px', borderRadius: 999, marginBottom: 16,
          }}>
            <span style={{ fontSize: 13 }}>{mode === 'explorer' ? '🔍' : '🏛️'}</span>
            <span style={{ fontFamily: 'system-ui, sans-serif', fontSize: 12, fontWeight: 600, color: T.forestMid }}>
              {mode === 'explorer' ? 'Explorer Mode — Hidden Gems' : 'Tourist Mode — Iconic Places'}
            </span>
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.8rem,5vw,2.5rem)', fontWeight: 700, color: T.forest, margin: '0 0 8px' }}>
            Plan Your <em style={{ fontStyle: 'italic', color: T.forestMid }}>Trip</em>
          </h1>
          <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: 14, color: T.sage }}>Answer 3 questions — AI plans everything.</p>
        </motion.div>

        {/* Progress steps */}
        {step < 3 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
            {STEPS.slice(0, 3).map((s, i) => (
              <React.Fragment key={i}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, fontFamily: 'system-ui, sans-serif',
                    flexShrink: 0, transition: 'all 0.3s',
                    background: i < step ? T.forest : 'transparent',
                    color: i < step ? T.cream : i === step ? T.forest : T.sand,
                    border: i < step ? 'none' : i === step ? `2px solid ${T.forest}` : `1px solid ${T.sand}`,
                  }}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span style={{
                    fontFamily: 'system-ui, sans-serif', fontSize: 12, fontWeight: 500,
                    color: i === step ? T.forest : T.sand,
                    display: 'none',
                  }} className="sm:block">{s}</span>
                </div>
                {i < 2 && <div style={{ flex: 1, height: 1, background: i < step ? T.forest : `${T.sand}60` }} />}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Step card */}
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}>
              <StepDestination form={form} update={update} />
            </motion.div>
          )}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}>
              <StepDuration form={form} update={update} />
            </motion.div>
          )}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}>
              <StepInterests form={form} toggleInterest={toggleInterest} />
            </motion.div>
          )}
          {step === 3 && generatedTrip && (
            <motion.div key="s3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <DayOnePreview trip={generatedTrip} onViewFull={() => navigate(`/trip/${generatedTrip.id}`, { state: { trip: generatedTrip } })} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nav buttons */}
        {step < 3 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
            <button onClick={() => setStep(s => s - 1)} disabled={step === 0} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 8, fontSize: 14,
              fontFamily: 'system-ui, sans-serif', fontWeight: 500,
              background: 'transparent', border: `1px solid ${T.sand}`,
              color: T.sage, cursor: step === 0 ? 'not-allowed' : 'pointer',
              opacity: step === 0 ? 0.3 : 1, transition: 'all 0.2s',
            }}>
              <ArrowLeft size={15} /> Back
            </button>

            {step < 2 ? (
              <button onClick={() => setStep(s => s + 1)} disabled={!canProceed()} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 24px', borderRadius: 8, fontSize: 14,
                fontFamily: 'system-ui, sans-serif', fontWeight: 600,
                background: T.forest, color: T.cream, border: 'none',
                cursor: canProceed() ? 'pointer' : 'not-allowed',
                opacity: canProceed() ? 1 : 0.4, transition: 'all 0.2s',
              }}>
                Continue <ArrowRight size={15} />
              </button>
            ) : (
              <button onClick={handleGenerate} disabled={!canProceed() || loading} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '11px 28px', borderRadius: 8, fontSize: 14,
                fontFamily: 'system-ui, sans-serif', fontWeight: 600,
                background: T.forest, color: T.cream, border: 'none',
                cursor: canProceed() && !loading ? 'pointer' : 'not-allowed',
                opacity: canProceed() && !loading ? 1 : 0.4, transition: 'all 0.2s',
              }}>
                {loading ? (
                  <><div style={{ width: 16, height: 16, border: `2px solid ${T.sage}`, borderTopColor: T.cream, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Planning...</>
                ) : (
                  <><Sparkles size={15} /> Generate My Trip</>
                )}
              </button>
            )}
          </div>
        )}

        {/* Loading overlay */}
        <AnimatePresence>
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${T.forest}CC`, backdropFilter: 'blur(6px)' }}>
              <div style={{ background: T.cream, borderRadius: 20, padding: 40, textAlign: 'center', maxWidth: 320, margin: '0 16px', border: `1px solid ${T.sand}` }}>
                <div style={{ position: 'relative', width: 72, height: 72, margin: '0 auto 24px' }}>
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid ${T.forestLight}`, animation: 'ping 1.5s ease-in-out infinite' }} />
                  <div style={{ position: 'absolute', inset: 8, borderRadius: '50%', border: `2px solid ${T.sage}`, animation: 'spin 3s linear infinite' }} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🌍</div>
                </div>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, color: T.forest, margin: '0 0 8px' }}>Crafting Your Trip</h3>
                <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: 13, color: T.sage, marginBottom: 20 }}>AI is planning every detail — places, times, routes...</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {['Finding best places for you...', 'Checking real-time weather...', mode === 'explorer' ? 'Digging up hidden gems...' : 'Picking iconic landmarks...', 'Building day-wise routes...'].map((msg, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 1 }}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'system-ui, sans-serif', fontSize: 12, color: T.sage }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.forestMid, flexShrink: 0 }} />
                      {msg}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } } @keyframes ping { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.4);opacity:0.3} }`}</style>
    </div>
  )
}

// ── Step 0: Destination ───────────────────────────────────────────────────────
function StepDestination({ form, update }) {
  const [query, setQuery] = useState(form.destination)
  const handleInput = (val) => { setQuery(val); update('destination', val) }
  const filtered = DESTINATIONS.filter(d => !query || d.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <div style={{ background: T.creamDeep, border: `1px solid ${T.sand}`, borderRadius: 16, padding: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: T.forestLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.forestMid }}>
          <MapPin size={18} strokeWidth={1.8} />
        </div>
        <div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, color: T.forest, margin: 0 }}>Where to?</h2>
          <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: 12, color: T.sage, margin: 0 }}>Type or pick a destination below</p>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <MapPin size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: T.sand }} />
        <input type="text" value={query} onChange={e => handleInput(e.target.value)}
          placeholder="Search destination... (e.g. Goa, Paris, Bali)"
          autoFocus
          style={{
            width: '100%', padding: '12px 16px 12px 38px', borderRadius: 8,
            border: `1px solid ${T.sand}`, background: T.cream,
            fontFamily: 'system-ui, sans-serif', fontSize: 14, color: T.forest,
            outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = T.sage}
          onBlur={e => e.target.style.borderColor = T.sand} />
      </div>

      <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.sage, marginBottom: 10 }}>
        Popular destinations
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {filtered.slice(0, 8).map(d => {
          const active = form.destination === d.name
          return (
            <button key={d.name} onClick={() => { update('destination', d.name); setQuery(d.name) }}
              style={{
                position: 'relative', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 10, textAlign: 'left',
                border: active ? `1.5px solid ${T.forest}` : `1px solid ${T.sand}60`,
                background: active ? T.forestLight : T.cream,
                cursor: 'pointer', transition: 'all 0.2s', overflow: 'hidden',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = T.sage }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = `${T.sand}60` }}>
              <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${d.img})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.07 }} />
              <span style={{ fontSize: 20, position: 'relative', zIndex: 1 }}>{d.emoji}</span>
              <div style={{ position: 'relative', zIndex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: 13, fontWeight: 600, color: active ? T.forest : T.forest, margin: 0 }}>{d.name}</p>
                <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: 11, color: T.sage, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.desc}</p>
              </div>
              {active && (
                <div style={{ position: 'absolute', right: 8, top: 8, width: 16, height: 16, borderRadius: '50%', background: T.forest, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                  <span style={{ color: T.cream, fontSize: 10 }}>✓</span>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {form.destination && !DESTINATIONS.find(d => d.name === form.destination) && (
        <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, background: T.forestLight, border: `1px solid ${T.sage}40`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <MapPin size={14} style={{ color: T.forestMid }} />
          <span style={{ fontFamily: 'system-ui, sans-serif', fontSize: 13, color: T.forestMid, fontWeight: 500 }}>"{form.destination}" — will be geocoded automatically</span>
        </div>
      )}
    </div>
  )
}

// ── Step 1: Duration ──────────────────────────────────────────────────────────
function StepDuration({ form, update }) {
  return (
    <div style={{ background: T.creamDeep, border: `1px solid ${T.sand}`, borderRadius: 16, padding: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: T.forestLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.forestMid }}>
          <Calendar size={18} strokeWidth={1.8} />
        </div>
        <div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, color: T.forest, margin: 0 }}>How long?</h2>
          <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: 12, color: T.sage, margin: 0 }}>Choose your trip duration</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 24 }}>
        {DAY_OPTIONS.map(d => {
          const active = form.days === String(d)
          return (
            <button key={d} onClick={() => update('days', String(d))} style={{
              padding: '16px 8px', borderRadius: 10, textAlign: 'center',
              border: active ? `1.5px solid ${T.forest}` : `1px solid ${T.sand}60`,
              background: active ? T.forestLight : T.cream,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = T.sage }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = `${T.sand}60` }}>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 700, color: active ? T.forest : T.forest, margin: 0 }}>{d}</p>
              <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: 11, color: T.sage, margin: '2px 0 0' }}>{d === 1 ? 'Day' : 'Days'}</p>
            </button>
          )
        })}
      </div>

      <div style={{ borderTop: `1px solid ${T.sand}60`, paddingTop: 20 }}>
        <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: 12, fontWeight: 600, color: T.sage, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Users size={13} /> How many travelers?
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          {['1', '2', '3', '4', '5+'].map(t => {
            const active = form.travelers === t
            return (
              <button key={t} onClick={() => update('travelers', t)} style={{
                flex: 1, padding: '10px 4px', borderRadius: 8, fontSize: 13,
                fontFamily: 'system-ui, sans-serif', fontWeight: 600,
                border: active ? `1.5px solid ${T.forest}` : `1px solid ${T.sand}60`,
                background: active ? T.forestLight : T.cream,
                color: T.forest, cursor: 'pointer', transition: 'all 0.2s',
              }}>
                {t}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Step 2: Interests ─────────────────────────────────────────────────────────
function StepInterests({ form, toggleInterest }) {
  return (
    <div style={{ background: T.creamDeep, border: `1px solid ${T.sand}`, borderRadius: 16, padding: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: T.forestLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.forestMid }}>
          <Heart size={18} strokeWidth={1.8} />
        </div>
        <div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, color: T.forest, margin: 0 }}>What do you love?</h2>
          <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: 12, color: T.sage, margin: 0 }}>Pick at least 1 — AI personalizes your trip</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {INTERESTS.map(interest => {
          const active = form.interests.includes(interest.id)
          return (
            <button key={interest.id} onClick={() => toggleInterest(interest.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '11px 12px', borderRadius: 10, textAlign: 'left',
              border: active ? `1.5px solid ${T.forest}` : `1px solid ${T.sand}60`,
              background: active ? T.forestLight : T.cream,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = T.sage }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = `${T.sand}60` }}>
              <span style={{ fontSize: 20 }}>{interest.emoji}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: 12, fontWeight: 600, color: T.forest, margin: 0 }}>{interest.label}</p>
                <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: 11, color: T.sage, margin: 0 }}>{interest.desc}</p>
              </div>
              {active && (
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: T.forest, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: T.cream, fontSize: 10 }}>✓</span>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {form.interests.length > 0 && (
        <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 8, background: T.forestLight, border: `1px solid ${T.sage}40`, fontFamily: 'system-ui, sans-serif', fontSize: 12, color: T.forestMid }}>
          ✨ {form.interests.length} interest{form.interests.length > 1 ? 's' : ''} selected — AI will prioritize these in your plan
        </div>
      )}
    </div>
  )
}

// ── Step 3: Day 1 Preview ─────────────────────────────────────────────────────
function DayOnePreview({ trip, onViewFull }) {
  const [selectedPlace, setSelectedPlace] = useState(null)
  const day1   = trip?.days?.[0]
  const coords = trip?.overview?.coordinates
  if (!day1) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ background: T.creamDeep, border: `1px solid ${T.sand}`, borderRadius: 16, padding: 24 }}>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, color: T.forest, margin: '0 0 4px' }}>Your Trip is Ready! 🎉</h2>
        <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: 14, color: T.sage, margin: 0 }}>{trip.overview?.title} · {trip.tripData?.days} days</p>
        <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: 13, color: T.sand, margin: '4px 0 0', fontStyle: 'italic' }}>"{trip.overview?.tagline}"</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: T.forest, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: T.cream, fontFamily: 'Georgia, serif' }}>1</div>
        <div>
          <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: 13, fontWeight: 600, color: T.forest, margin: 0 }}>Day 1 — {day1.theme}</p>
          <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: 12, color: T.sage, margin: 0 }}>{day1.places?.length} places · Est. ₹{day1.dayEstimate?.toLocaleString()}</p>
        </div>
      </div>

      <div style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${T.sand}` }}>
        <MiniMap places={day1.places} coords={coords} selectedPlace={selectedPlace} onSelect={setSelectedPlace} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {day1.places?.map((place, i) => (
          <PlaceCard key={i} place={place} index={i}
            isSelected={selectedPlace?.name === place.name}
            onClick={() => setSelectedPlace(selectedPlace?.name === place.name ? null : place)} />
        ))}
      </div>

      <button onClick={onViewFull} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '14px', borderRadius: 8, fontSize: 15, fontFamily: 'system-ui, sans-serif', fontWeight: 600,
        background: T.forest, color: T.cream, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
      }}
        onMouseEnter={e => e.currentTarget.style.background = T.forestMid}
        onMouseLeave={e => e.currentTarget.style.background = T.forest}>
        <Sparkles size={16} /> View Full Itinerary <ArrowRight size={15} />
      </button>
    </div>
  )
}

// ── Mini Map ──────────────────────────────────────────────────────────────────
function MiniMap({ places, coords, selectedPlace, onSelect }) {
  const mapRef         = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef     = useRef([])

  useEffect(() => {
    if (!mapRef.current || typeof window === 'undefined') return
    if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null }

    import('leaflet').then(L => {
      if (!mapRef.current) return
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const center = coords ? [coords.lat, coords.lon] : [20.5937, 78.9629]
      const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: false }).setView(center, 13)
      mapInstanceRef.current = map

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO', maxZoom: 19,
      }).addTo(map)

      if (places?.length) {
        const bounds = []
        places.forEach((place, i) => {
          if (!place.lat || !place.lon) return
          bounds.push([place.lat, place.lon])
          const icon = L.divIcon({
            html: `<div style="width:28px;height:28px;border-radius:50%;background:${T.forest};border:2px solid ${T.cream};display:flex;align-items:center;justify-content:center;color:${T.cream};font-weight:bold;font-size:11px;font-family:system-ui,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,0.3);cursor:pointer;">${i + 1}</div>`,
            className: '', iconSize: [28, 28], iconAnchor: [14, 14],
          })
          L.marker([place.lat, place.lon], { icon }).addTo(map)
            .on('click', () => onSelect(place))
            .bindTooltip(`<b>${place.name}</b><br/><small>${place.time || ''}</small>`, { permanent: false, direction: 'top' })
          markersRef.current.push({ lat: place.lat, lon: place.lon })
        })
        if (bounds.length > 1) L.polyline(bounds, { color: T.sage, weight: 2, opacity: 0.7, dashArray: '6,6' }).addTo(map)
        if (bounds.length) { try { map.fitBounds(bounds, { padding: [30, 30] }) } catch {} }
      }
    }).catch(err => console.warn('Leaflet load error:', err))

    return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null } markersRef.current = [] }
  }, [])

  useEffect(() => {
    if (!mapInstanceRef.current || !selectedPlace) return
    if (selectedPlace.lat && selectedPlace.lon) mapInstanceRef.current.setView([selectedPlace.lat, selectedPlace.lon], 15, { animate: true })
  }, [selectedPlace])

  return (
    <div>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div ref={mapRef} style={{ height: 260, width: '100%' }} />
    </div>
  )
}

// ── Place Card ────────────────────────────────────────────────────────────────
function PlaceCard({ place, index, isSelected, onClick }) {
  const typeEmoji = { attraction: '🏛️', restaurant: '🍽️', cafe: '☕', viewpoint: '🌄', museum: '🖼️', market: '🛍️', temple: '⛪', beach: '🏖️', park: '🌿', hotel: '🏨', default: '📍' }
  const emoji = typeEmoji[place.type] || typeEmoji.default

  return (
    <motion.div layout onClick={onClick} style={{
      borderRadius: 12, border: isSelected ? `1.5px solid ${T.forest}` : `1px solid ${T.sand}60`,
      background: isSelected ? T.forestLight : T.creamDeep,
      cursor: 'pointer', overflow: 'hidden', transition: 'all 0.2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: T.forest, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: T.cream, fontFamily: 'Georgia, serif', flexShrink: 0 }}>
          {index + 1}
        </div>
        <span style={{ fontSize: 18, flexShrink: 0 }}>{emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: 13, fontWeight: 600, color: T.forest, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{place.name}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
            {place.time && <span style={{ fontFamily: 'system-ui, sans-serif', fontSize: 11, color: T.sage, display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={9} /> {place.time}</span>}
            {place.duration && <span style={{ fontFamily: 'system-ui, sans-serif', fontSize: 11, color: T.sand }}>· {place.duration}</span>}
            {place.isHiddenGem && <span style={{ fontFamily: 'system-ui, sans-serif', fontSize: 11, color: T.forestMid, fontWeight: 600 }}>💎 Hidden gem</span>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {place.rating && <span style={{ fontFamily: 'system-ui, sans-serif', fontSize: 11, color: T.sand, display: 'flex', alignItems: 'center', gap: 3 }}><Star size={10} fill={T.sand} /> {place.rating}</span>}
          {isSelected ? <ChevronUp size={15} style={{ color: T.sage }} /> : <ChevronDown size={15} style={{ color: T.sand }} />}
        </div>
      </div>

      <AnimatePresence>
        {isSelected && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: 'hidden' }}>
            <div style={{ padding: '0 14px 14px', borderTop: `1px solid ${T.sand}60`, paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {place.description && <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: 13, color: T.forest, lineHeight: 1.7, margin: 0 }}>{place.description}</p>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {place.bestTimeToVisit && (
                  <div style={{ background: T.cream, borderRadius: 8, padding: '8px 10px', border: `1px solid ${T.sand}60` }}>
                    <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: 11, color: T.sage, margin: '0 0 2px' }}>Best time</p>
                    <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: 11, fontWeight: 600, color: T.forest, margin: 0 }}>{place.bestTimeToVisit}</p>
                  </div>
                )}
                {place.cost > 0 && (
                  <div style={{ background: T.cream, borderRadius: 8, padding: '8px 10px', border: `1px solid ${T.sand}60` }}>
                    <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: 11, color: T.sage, margin: '0 0 2px' }}>Est. cost</p>
                    <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: 11, fontWeight: 600, color: T.forestMid, margin: 0 }}>₹{place.cost?.toLocaleString()}</p>
                  </div>
                )}
                {place.crowdLevel && (
                  <div style={{ background: T.cream, borderRadius: 8, padding: '8px 10px', border: `1px solid ${T.sand}60` }}>
                    <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: 11, color: T.sage, margin: '0 0 2px' }}>Crowd level</p>
                    <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: 11, fontWeight: 600, color: T.forest, margin: 0 }}>
                      {place.crowdLevel === 'low' ? '🟢 Low' : place.crowdLevel === 'medium' ? '🟡 Moderate' : '🔴 High'}
                    </p>
                  </div>
                )}
                {place.type && (
                  <div style={{ background: T.cream, borderRadius: 8, padding: '8px 10px', border: `1px solid ${T.sand}60` }}>
                    <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: 11, color: T.sage, margin: '0 0 2px' }}>Type</p>
                    <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: 11, fontWeight: 600, color: T.forest, margin: 0, textTransform: 'capitalize' }}>{place.type}</p>
                  </div>
                )}
              </div>
              {place.tips && (
                <div style={{ display: 'flex', gap: 8, padding: '10px 12px', borderRadius: 8, background: T.sandLight, border: `1px solid ${T.sand}` }}>
                  <span style={{ fontSize: 13, flexShrink: 0 }}>💡</span>
                  <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: 12, color: T.forest, lineHeight: 1.65, margin: 0 }}>{place.tips}</p>
                </div>
              )}
              {place.tags?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {place.tags.map(tag => (
                    <span key={tag} style={{ padding: '3px 10px', borderRadius: 999, fontFamily: 'system-ui, sans-serif', fontSize: 11, background: T.cream, color: T.sage, border: `1px solid ${T.sand}60` }}>#{tag}</span>
                  ))}
                </div>
              )}
              {place.lat && place.lon && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'system-ui, sans-serif', fontSize: 11, color: T.sand }}>
                  <Navigation size={10} /> {place.lat.toFixed(4)}, {place.lon.toFixed(4)}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}