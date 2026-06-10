import React, { useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Clock, DollarSign, Star, Bookmark, Share2,
  ChevronDown, ChevronUp, Droplets, Utensils, Gem,
  Calendar, Users, ArrowLeft, Package, Phone,
  TrendingUp, Sun, Navigation, Route, Layers, Info
} from 'lucide-react'
import { useTrip } from '../context/TripContext'
import { toast } from '../components/common/Toaster'
import TripMap from '../components/map/TripMap'
import { getCustomPlacesForDestination } from '../data/hiddenPlacesData'

// ── Theme tokens (same as SignupPage) ────────────────────────────────────────
const T = {
  cream:       '#FAF7F0',
  creamDeep:   '#F0EAD6',
  creamMid:    '#EAE3D0',
  forest:      '#1E3A2F',
  forestMid:   '#2D5A40',
  forestLight: '#E8F0EB',
  sage:        '#7A9E87',
  sageDark:    '#5C7F6A',
  sand:        '#C9B99A',
  sandLight:   '#E8DFC8',
  ink:         '#2C3A30',
}

const TYPE_EMOJI = {
  attraction: '🏛️', restaurant: '🍽️', cafe: '☕', hotel: '🏨',
  viewpoint: '🌄', museum: '🖼️', market: '🛍️', temple: '⛪',
  beach: '🏖️', park: '🌿', street: '🛤️', monument: '🗿',
}

// Day palette — forest-compatible accent colors
const DAY_COLORS = ['#2D5A40', '#5C7F6A', '#C9B99A', '#7A9E87', '#1E3A2F', '#8FAE9C', '#B5A07A']

const CATEGORY_EMOJI = {
  cafe: '☕', nature: '🌿', heritage: '🏰', street: '🛤️',
  viewpoint: '🌄', food: '🍽️', art: '🎨', spiritual: '🕌',
}

// ── Shared style helpers ─────────────────────────────────────────────────────
const card = {
  background: '#fff',
  border: `1px solid ${T.creamDeep}`,
  borderRadius: 16,
  boxShadow: '0 2px 12px rgba(30,58,47,0.06)',
}

const pill = (active) => ({
  display: 'inline-flex', alignItems: 'center', gap: 5,
  padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600,
  fontFamily: 'system-ui, sans-serif',
  background: active ? T.forest : T.forestLight,
  color: active ? T.cream : T.sageDark,
  border: `1px solid ${active ? T.forest : T.creamDeep}`,
  cursor: 'pointer', transition: 'all 0.18s', whiteSpace: 'nowrap',
})

const btn = (variant = 'primary') => ({
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '9px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
  fontFamily: 'system-ui, sans-serif', cursor: 'pointer', border: 'none',
  transition: 'all 0.18s',
  ...(variant === 'primary'
    ? { background: T.forest, color: T.cream }
    : { background: T.forestLight, color: T.forest, border: `1px solid ${T.creamDeep}` }),
})

// ── Main Page ────────────────────────────────────────────────────────────────
export default function TripResultPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { currentTrip, getTripById, saveTrip } = useTrip()

  const [trip, setTrip] = useState(location.state?.trip || currentTrip || null)
  const [activeDay, setActiveDay] = useState(0)
  const [activeTab, setActiveTab] = useState('itinerary')
  const [saved, setSaved] = useState(false)
  const [expandedPlace, setExpandedPlace] = useState(null)

  React.useEffect(() => {
    if (!trip) {
      const found = getTripById(id)
      if (found) setTrip(found)
      else navigate('/dashboard')
    }
  }, [id])

  if (!trip) return <LoadingState />

  const { overview, days, budget, hiddenGems, packingList, emergencyContacts, tripData, weather } = trip

  const handleSave = () => {
    saveTrip(trip)
    setSaved(true)
    toast('Trip saved! 📍', 'success')
  }

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href)
    toast('Link copied!', 'success')
  }

  const allPlaces = days?.flatMap(d => d.places) || []

  const TABS = [
    { id: 'itinerary', label: 'Itinerary',    icon: <Calendar size={12} /> },
    { id: 'map',       label: 'Map & Routes', icon: <MapPin size={12} /> },
    { id: 'budget',    label: 'Budget',       icon: <DollarSign size={12} /> },
    { id: 'gems',      label: 'Hidden Gems',  icon: <Gem size={12} /> },
    { id: 'info',      label: 'Trip Info',    icon: <Info size={12} /> },
  ]

  return (
    <div style={{ minHeight: '100vh', background: T.cream, fontFamily: 'system-ui, sans-serif' }}>

      {/* ── Hero ── */}
      <div style={{ background: T.forest, padding: 'clamp(80px, 12vw, 96px) 24px 40px', position: 'relative', overflow: 'hidden' }}>
        {/* decorative blobs */}
        <div style={{ position: 'absolute', top: '-40%', right: '-10%', width: 420, height: 420, borderRadius: '50%', background: `radial-gradient(circle, ${T.forestMid}90, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-30%', left: '-8%', width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, ${T.sage}25, transparent 70%)`, pointerEvents: 'none' }} />

        <div style={{ maxWidth: 960, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, color: T.sage, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, marginBottom: 20, padding: 0 }}
            onMouseEnter={e => e.currentTarget.style.color = T.sandLight}
            onMouseLeave={e => e.currentTarget.style.color = T.sage}>
            <ArrowLeft size={14} /> Back
          </button>

          {/* Badge row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
            {[
              `📅 ${tripData?.days} Days`,
              tripData?.explorerMode ? '🔍 Explorer Mode' : '🏛️ Tourist Mode',
              `💰 ${tripData?.budget}`,
              tripData?.travelMode && `🚗 ${tripData.travelMode}`,
            ].filter(Boolean).map((label, i) => (
              <span key={i} style={{
                padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                background: 'rgba(255,255,255,0.08)', color: T.sandLight,
                border: `1px solid rgba(255,255,255,0.12)`,
              }}>
                {label}
              </span>
            ))}
          </div>

          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 5vw, 46px)', fontWeight: 700, color: T.cream, margin: '0 0 6px', lineHeight: 1.15 }}>
            {overview?.title || `${tripData?.days} Days in ${tripData?.destination}`}
          </h1>
          {overview?.tagline && (
            <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 15, color: T.sand, marginBottom: 16 }}>
              "{overview.tagline}"
            </p>
          )}

          {weather && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.07)', border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 10, padding: '8px 14px', marginBottom: 18 }}>
              <Sun size={14} style={{ color: '#FBD060' }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: T.cream }}>{weather.temp}°C</span>
              <span style={{ fontSize: 12, color: T.sage, textTransform: 'capitalize' }}>{weather.description}</span>
              {weather.humidity && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: T.sageDark }}>
                  <Droplets size={11} />{weather.humidity}%
                </span>
              )}
            </div>
          )}

          {/* Stats row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px', marginBottom: 24 }}>
            {[
              { icon: <MapPin size={12}/>, val: `${allPlaces.length} places` },
              { icon: <Users size={12}/>, val: `${tripData?.travelers || 2} travelers` },
              { icon: <DollarSign size={12}/>, val: `₹${(budget?.total || 0).toLocaleString()} est.` },
              { icon: <Gem size={12}/>, val: `${hiddenGems?.length || 0} hidden gems` },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: T.sage }}>
                <span style={{ color: T.sageDark }}>{s.icon}</span>{s.val}
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleSave} disabled={saved}
              style={{ ...btn(saved ? 'secondary' : 'primary'), opacity: saved ? 0.75 : 1 }}
              onMouseEnter={e => { if (!saved) e.currentTarget.style.background = T.forestMid }}
              onMouseLeave={e => { if (!saved) e.currentTarget.style.background = T.forest }}>
              <Bookmark size={14} fill={saved ? 'currentColor' : 'none'} />
              {saved ? 'Saved!' : 'Save Trip'}
            </button>
            <button
              onClick={handleShare}
              style={btn('secondary')}
              onMouseEnter={e => e.currentTarget.style.background = T.creamDeep}
              onMouseLeave={e => e.currentTarget.style.background = T.forestLight}>
              <Share2 size={14} /> Share
            </button>
          </div>
        </div>
      </div>

      {/* ── Tabs bar ── */}
      <div style={{ position: 'sticky', top: 60, zIndex: 30, background: T.cream, borderBottom: `1px solid ${T.creamDeep}`, padding: '0 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', gap: 0, overflowX: 'auto' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 600, fontFamily: 'system-ui, sans-serif',
                whiteSpace: 'nowrap', transition: 'all 0.15s',
                color: activeTab === tab.id ? T.forest : T.sand,
                borderBottom: activeTab === tab.id ? `2px solid ${T.forest}` : '2px solid transparent',
              }}
              onMouseEnter={e => { if (activeTab !== tab.id) e.currentTarget.style.color = T.sageDark }}
              onMouseLeave={e => { if (activeTab !== tab.id) e.currentTarget.style.color = T.sand }}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ── */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px 64px' }}>
        <AnimatePresence mode="wait">

          {activeTab === 'itinerary' && (
            <motion.div key="itinerary" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Day selector */}
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, marginBottom: 24 }}>
                {days?.map((d, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveDay(i)}
                    style={{
                      flexShrink: 0, padding: '10px 20px', borderRadius: 12,
                      fontFamily: 'system-ui, sans-serif', fontSize: 13, fontWeight: 600,
                      border: `1.5px solid ${activeDay === i ? DAY_COLORS[i % DAY_COLORS.length] : T.creamDeep}`,
                      background: activeDay === i ? `${DAY_COLORS[i % DAY_COLORS.length]}12` : '#fff',
                      color: activeDay === i ? DAY_COLORS[i % DAY_COLORS.length] : T.sand,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}>
                    <span style={{ display: 'block', fontSize: 9, opacity: 0.6, marginBottom: 2 }}>Day</span>
                    {d.day}
                  </button>
                ))}
              </div>

              {days?.[activeDay] && (
                <DayView
                  day={days[activeDay]}
                  dayIndex={activeDay}
                  color={DAY_COLORS[activeDay % DAY_COLORS.length]}
                  expandedPlace={expandedPlace}
                  setExpandedPlace={setExpandedPlace}
                  coordinates={overview?.coordinates}
                />
              )}
            </motion.div>
          )}

          {activeTab === 'map' && (
            <motion.div key="map" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <TripMap
                days={days || []}
                activeDay={activeDay}
                setActiveDay={setActiveDay}
                hiddenGems={hiddenGems || []}
                coordinates={overview?.coordinates || tripData?.coordinates}
                destination={tripData?.destination}
                explorerMode={tripData?.explorerMode}
              />
            </motion.div>
          )}

          {activeTab === 'budget' && (
            <motion.div key="budget" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <BudgetTab budget={budget} days={tripData?.days} travelers={tripData?.travelers} dayBreakdown={days} />
            </motion.div>
          )}

          {activeTab === 'gems' && (
            <motion.div key="gems" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <GemsTab gems={hiddenGems || []} destination={tripData?.destination} explorerMode={tripData?.explorerMode} />
            </motion.div>
          )}

          {activeTab === 'info' && (
            <motion.div key="info" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <InfoTab overview={overview} packingList={packingList} emergencyContacts={emergencyContacts} />
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        .yatra-tooltip {
          background: ${T.forest} !important;
          border: 1px solid ${T.sage}40 !important;
          color: ${T.cream} !important;
          border-radius: 10px !important;
          font-size: 12px !important;
          padding: 5px 10px !important;
        }
        .yatra-tooltip::before { border-top-color: ${T.sage}40 !important; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: ${T.creamDeep}; }
        ::-webkit-scrollbar-thumb { background: ${T.sand}; border-radius: 4px; }
      `}</style>
    </div>
  )
}

// ── Day View ─────────────────────────────────────────────────────────────────
function DayView({ day, dayIndex, color, expandedPlace, setExpandedPlace, coordinates }) {
  const mapRef = React.useRef(null)
  const mapInstanceRef = React.useRef(null)
  const [leafletReady, setLeafletReady] = React.useState(false)
  const [selectedOnMap, setSelectedOnMap] = React.useState(null)

  const places = day.places?.filter(p => p.lat && p.lon) || []

  React.useEffect(() => {
    import('leaflet').then(L => {
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null }
      if (!mapRef.current) return

      const center = places[0] ? [places[0].lat, places[0].lon]
        : coordinates ? [coordinates.lat, coordinates.lon]
        : [20.5937, 78.9629]

      const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: false })
      map.setView(center, 13)
      mapInstanceRef.current = map

      // Light map tiles to match cream theme
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO', maxZoom: 19,
      }).addTo(map)

      if (places.length) {
        const bounds = places.map(p => [p.lat, p.lon])
        if (bounds.length > 1) {
          L.polyline(bounds, { color, weight: 2.5, opacity: 0.75, dashArray: '8,5' }).addTo(map)
        }
        places.forEach((place, i) => {
          const icon = L.divIcon({
            html: `<div style="width:30px;height:30px;border-radius:50%;background:${color};border:2.5px solid #fff;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:12px;box-shadow:0 2px 8px ${color}55;cursor:pointer;">${i + 1}</div>`,
            className: '', iconSize: [30, 30], iconAnchor: [15, 15],
          })
          const shortDesc = place.description ? place.description.slice(0, 55) + (place.description.length > 55 ? '…' : '') : ''
          L.marker([place.lat, place.lon], { icon })
            .addTo(map)
            .bindTooltip(`<div style="max-width:180px"><b style="color:${T.forest}">${place.name}</b><br/><small style="color:${color}">${place.time || ''}</small>${shortDesc ? `<br/><span style="color:${T.sageDark};font-size:11px">${shortDesc}</span>` : ''}</div>`, {
              className: 'yatra-tooltip', direction: 'top'
            })
            .on('click', () => setSelectedOnMap(place))
        })
        try { map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 }) } catch {}
      }

      setLeafletReady(true)
      return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null } }
    })
  }, [day.day])

  React.useEffect(() => {
    if (!mapInstanceRef.current || !selectedOnMap?.lat) return
    mapInstanceRef.current.setView([selectedOnMap.lat, selectedOnMap.lon], 15, { animate: true })
  }, [selectedOnMap])

  return (
    <div>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

      {/* Day header card */}
      <div style={{ ...card, padding: '14px 16px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
            {day.day}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(15px, 4vw, 20px)', fontWeight: 700, color: T.forest, margin: 0, lineHeight: 1.25, wordBreak: 'break-word' }}>{day.theme}</h2>
            <p style={{ fontSize: 11, color: T.sage, margin: '3px 0 0' }}>{day.places?.length} places · ₹{day.dayEstimate?.toLocaleString()} est.</p>
          </div>
        </div>
        {day.transportNote && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, background: T.forestLight, borderRadius: 10, padding: '7px 12px', marginTop: 10 }}>
            <Navigation size={11} style={{ color: T.sageDark, flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 11, color: T.sageDark, margin: 0, lineHeight: 1.5 }}>{day.transportNote}</p>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>

        {/* LEFT: Map */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ ...card, overflow: 'hidden', height: 360, padding: 0 }}>
            {!leafletReady && (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.creamDeep }}>
                <div style={{ width: 24, height: 24, border: `2px solid ${T.sand}`, borderTopColor: T.forest, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              </div>
            )}
            <div ref={mapRef} style={{ height: '100%', width: '100%', display: leafletReady ? 'block' : 'none' }} />
          </div>

          <AnimatePresence>
            {selectedOnMap && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                style={{ ...card, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 22 }}>{TYPE_EMOJI[selectedOnMap.type] || '📍'}</span>
                    <div>
                      <p style={{ fontWeight: 700, color: T.forest, fontSize: 13, margin: 0 }}>{selectedOnMap.name}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                        {selectedOnMap.time && <span style={{ fontSize: 11, color: T.sage, display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={10}/>{selectedOnMap.time}</span>}
                        {selectedOnMap.rating && <span style={{ fontSize: 11, color: '#E6A817', display: 'flex', alignItems: 'center', gap: 3 }}><Star size={10} fill="currentColor"/>{selectedOnMap.rating}</span>}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedOnMap(null)} style={{ background: 'none', border: 'none', color: T.sand, cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 2 }}>×</button>
                </div>
                {selectedOnMap.description && <p style={{ fontSize: 12, color: T.sageDark, marginTop: 8, lineHeight: 1.6 }}>{selectedOnMap.description}</p>}
                {(selectedOnMap.tips || selectedOnMap.tip) && (
                  <div style={{ marginTop: 10, padding: '8px 10px', borderRadius: 10, background: '#FFF8E7', border: '1px solid #F5D98080', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <span style={{ fontSize: 12 }}>💡</span>
                    <p style={{ fontSize: 11, color: '#8A6C2A', margin: 0, lineHeight: 1.5 }}>{selectedOnMap.tips || selectedOnMap.tip}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {day.meals && (
            <div style={{ ...card, padding: '14px 16px' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: T.sage, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Utensils size={11} style={{ color: '#E07A3A' }} /> Today's Meals
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['breakfast', 'lunch', 'dinner'].map(meal => day.meals?.[meal] && (
                  <div key={meal} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 16 }}>{meal === 'breakfast' ? '🌅' : meal === 'lunch' ? '☀️' : '🌙'}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: T.forest, margin: 0, textTransform: 'capitalize' }}>{meal}</p>
                      <p style={{ fontSize: 11, color: T.sage, margin: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{day.meals[meal].name}</p>
                    </div>
                    <span style={{ fontSize: 11, color: T.forestMid, fontWeight: 600, flexShrink: 0 }}>₹{day.meals[meal].cost}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Place cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: T.sand, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0, paddingLeft: 4 }}>
            {day.places?.length} Places — click to expand
          </p>
          {day.places?.map((place, i) => (
            <PlaceCard
              key={i}
              place={place}
              index={i}
              color={color}
              isExpanded={expandedPlace === `${day.day}-${i}`}
              onToggle={() => {
                setExpandedPlace(expandedPlace === `${day.day}-${i}` ? null : `${day.day}-${i}`)
                setSelectedOnMap(place)
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Place Card ────────────────────────────────────────────────────────────────
function PlaceCard({ place, index, color, isExpanded, onToggle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={onToggle}
      style={{
        ...card,
        border: `1.5px solid ${isExpanded ? color + '55' : T.creamDeep}`,
        cursor: 'pointer',
        transition: 'border-color 0.18s, box-shadow 0.18s',
        boxShadow: isExpanded ? `0 4px 18px ${color}18` : card.boxShadow,
      }}
      onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.borderColor = T.sand }}
      onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.borderColor = T.creamDeep }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px' }}>
        <div style={{ width: 30, height: 30, borderRadius: 10, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
          {index + 1}
        </div>
        <span style={{ fontSize: 18, flexShrink: 0 }}>{TYPE_EMOJI[place.type] || '📍'}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: T.forest, margin: 0, lineHeight: 1.3 }}>
            {place.name}
            {place.isHiddenGem && (
              <span style={{ marginLeft: 8, padding: '1px 8px', borderRadius: 999, fontSize: 10, background: `${T.forestLight}`, color: T.sageDark, border: `1px solid ${T.creamDeep}` }}>💎 gem</span>
            )}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
            {place.time && <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: T.sage }}><Clock size={9}/>{place.time}</span>}
            {place.duration && <span style={{ fontSize: 11, color: T.sand }}>· {place.duration}</span>}
            {place.rating && <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#E6A817' }}><Star size={9} fill="currentColor"/>{place.rating}</span>}
          </div>
          {!isExpanded && place.description && (
            <p style={{ fontSize: 11, color: T.sage, margin: '3px 0 0', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
              {place.description}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {place.cost > 0 && <span style={{ fontSize: 11, color: T.forestMid, fontWeight: 600 }}>₹{place.cost}</span>}
          {isExpanded ? <ChevronUp size={14} style={{ color: T.sage }}/> : <ChevronDown size={14} style={{ color: T.sand }}/>}
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '4px 14px 14px', borderTop: `1px solid ${T.creamDeep}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {place.description && <p style={{ fontSize: 13, color: T.ink, lineHeight: 1.65, margin: 0 }}>{place.description}</p>}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {place.bestTimeToVisit && (
                  <div style={{ background: T.forestLight, borderRadius: 8, padding: '5px 10px' }}>
                    <span style={{ fontSize: 11, color: T.sage }}>Best time: </span>
                    <span style={{ fontSize: 11, color: T.forest, fontWeight: 600 }}>{place.bestTimeToVisit}</span>
                  </div>
                )}
                {place.crowdLevel && (
                  <div style={{ background: T.forestLight, borderRadius: 8, padding: '5px 10px' }}>
                    <span style={{ fontSize: 11, color: T.sage }}>Crowd: </span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: place.crowdLevel === 'low' ? T.forestMid : place.crowdLevel === 'medium' ? '#B8860B' : '#C0392B' }}>
                      {place.crowdLevel === 'low' ? '🟢 Low' : place.crowdLevel === 'medium' ? '🟡 Moderate' : '🔴 Busy'}
                    </span>
                  </div>
                )}
                {place.photoSpot && (
                  <div style={{ background: '#FFF0F5', borderRadius: 8, padding: '5px 10px', fontSize: 11, color: '#B05070' }}>📸 Photo spot</div>
                )}
              </div>

              {(place.tips || place.tip) && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px', borderRadius: 10, background: '#FFF8E7', border: '1px solid #F5D98060' }}>
                  <span style={{ fontSize: 13 }}>💡</span>
                  <p style={{ fontSize: 12, color: '#8A6C2A', margin: 0, lineHeight: 1.55 }}>{place.tips || place.tip}</p>
                </div>
              )}

              {place.tags?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {place.tags.map(tag => (
                    <span key={tag} style={{ padding: '2px 8px', borderRadius: 999, fontSize: 10, background: T.creamDeep, color: T.sage, border: `1px solid ${T.creamMid}` }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Budget Tab ────────────────────────────────────────────────────────────────
function BudgetTab({ budget, days, travelers, dayBreakdown }) {
  if (!budget) return (
    <div style={{ textAlign: 'center', padding: '64px 0', color: T.sand, fontFamily: 'system-ui, sans-serif' }}>
      No budget data available.
    </div>
  )

  const cats = [
    { label: 'Accommodation', key: 'accommodation', emoji: '🏨', color: T.sageDark },
    { label: 'Food & Dining',  key: 'food',          emoji: '🍽️', color: '#C07A3A' },
    { label: 'Transport',      key: 'transport',     emoji: '🚗', color: '#3A7AC0' },
    { label: 'Activities',     key: 'activities',    emoji: '🎯', color: T.forestMid },
    { label: 'Miscellaneous',  key: 'misc',          emoji: '🛍️', color: '#B8860B' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>

      {/* Breakdown */}
      <div style={{ ...card, padding: '24px' }}>
        <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 20, color: T.forest, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <DollarSign size={16} style={{ color: T.forestMid }}/> Budget Breakdown
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {cats.map(cat => {
            const val = budget[cat.key] || 0
            const pct = budget.total ? Math.round((val / budget.total) * 100) : 0
            return (
              <div key={cat.key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: T.ink }}>{cat.emoji} {cat.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.forest }}>₹{val.toLocaleString()}</span>
                </div>
                <div style={{ height: 6, background: T.creamDeep, borderRadius: 999, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, delay: 0.1 }}
                    style={{ height: '100%', borderRadius: 999, background: cat.color }}
                  />
                </div>
                <p style={{ fontSize: 10, color: T.sand, marginTop: 2 }}>{pct}%</p>
              </div>
            )
          })}
        </div>
        <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${T.creamDeep}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, color: T.forest }}>Total</span>
          <span style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 26, color: T.forestMid }}>₹{(budget.total || 0).toLocaleString()}</span>
        </div>
        {travelers && days && (
          <p style={{ fontSize: 11, color: T.sage, marginTop: 4, textAlign: 'right' }}>
            ₹{Math.round((budget.total||0)/(parseInt(travelers)||1)).toLocaleString()}/person · ₹{Math.round((budget.total||0)/(parseInt(days)||1)).toLocaleString()}/day
          </p>
        )}
      </div>

      {/* Day-wise */}
      <div style={{ ...card, padding: '24px' }}>
        <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 20, color: T.forest, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={16} style={{ color: T.sage }}/> Day-wise Costs
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {dayBreakdown?.map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, background: `${DAY_COLORS[i % DAY_COLORS.length]}18`, color: DAY_COLORS[i % DAY_COLORS.length] }}>
                {d.day}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 11, color: T.sage, margin: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{d.theme}</p>
                <div style={{ height: 5, background: T.creamDeep, borderRadius: 999, marginTop: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 999, background: DAY_COLORS[i % DAY_COLORS.length], width: `${Math.min(100, ((d.dayEstimate || 0) / (budget.total / (dayBreakdown.length || 1))) * 100)}%`, transition: 'width 0.7s ease' }} />
                </div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.forest, flexShrink: 0 }}>₹{(d.dayEstimate||0).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Gems Tab ──────────────────────────────────────────────────────────────────
function GemsTab({ gems, destination, explorerMode }) {
  const customPlaces = (explorerMode && destination)
    ? getCustomPlacesForDestination(destination).map(p => ({
        name: p.name, description: p.description, category: p.category,
        bestTime: p.bestTime, howToReach: p.howToReach,
        speciality: p.speciality, tip: p.tip, isCustomPlace: true,
      }))
    : []

  const allGems = [...(gems || []), ...customPlaces]

  if (!allGems.length) return (
    <div style={{ textAlign: 'center', padding: '64px 0', color: T.sand, fontFamily: 'system-ui, sans-serif' }}>
      <Gem size={40} style={{ margin: '0 auto 12px', opacity: 0.25, display: 'block' }} />
      <p style={{ margin: 0 }}>No hidden gems for this trip.</p>
      <p style={{ margin: '4px 0 0', fontSize: 12 }}>Try Explorer Mode for hidden gem discoveries!</p>
    </div>
  )

  return (
    <div>
      <div style={{ ...card, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12, border: `1px solid ${T.creamDeep}` }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: T.forestLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Gem size={16} style={{ color: T.sageDark }} />
        </div>
        <div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, color: T.forest, margin: 0, fontSize: 17 }}>Hidden Gems</h2>
          <p style={{ fontSize: 11, color: T.sage, margin: '2px 0 0' }}>
            {gems.length} AI-discovered{customPlaces.length > 0 ? ` · ${customPlaces.length} local secrets` : ' · exclusive spots most tourists never find'}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {allGems.map((gem, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            style={{
              ...card,
              border: `1.5px solid ${gem.isCustomPlace ? '#A0D4C8' : T.creamDeep}`,
              padding: 18,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 22 }}>{gem.isCustomPlace ? (CATEGORY_EMOJI[gem.category] || '🗝️') : '💎'}</span>
              <span style={{
                fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 999,
                background: gem.isCustomPlace ? '#E6F7F4' : T.forestLight,
                color: gem.isCustomPlace ? '#3A8C7A' : T.sageDark,
                border: `1px solid ${gem.isCustomPlace ? '#A0D4C8' : T.creamDeep}`,
              }}>
                {gem.isCustomPlace ? '🗝️ Local Secret' : gem.category}
              </span>
            </div>

            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 15, fontWeight: 700, color: T.forest, margin: '0 0 4px' }}>{gem.name}</h3>

            {gem.isCustomPlace && gem.speciality && (
              <p style={{ fontSize: 11, color: '#3A8C7A', fontStyle: 'italic', margin: '0 0 6px' }}>{gem.speciality}</p>
            )}

            <p style={{ fontSize: 12, color: T.sageDark, lineHeight: 1.6, margin: 0 }}>{gem.description}</p>

            {gem.bestTime && (
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: T.sage }}>
                <Clock size={10}/> Best: {gem.bestTime}
              </div>
            )}
            {gem.howToReach && (
              <div style={{ marginTop: 4, display: 'flex', alignItems: 'flex-start', gap: 5, fontSize: 11, color: T.sage }}>
                <Navigation size={10} style={{ marginTop: 1, flexShrink: 0 }}/> {gem.howToReach}
              </div>
            )}
            {gem.isCustomPlace && gem.tip && (
              <div style={{ marginTop: 10, padding: '8px 10px', borderRadius: 10, background: '#FFF8E7', border: '1px solid #F5D98060', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                <span style={{ fontSize: 12 }}>💡</span>
                <p style={{ fontSize: 11, color: '#8A6C2A', margin: 0, lineHeight: 1.5 }}>{gem.tip}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ── Info Tab ──────────────────────────────────────────────────────────────────
function InfoTab({ overview, packingList, emergencyContacts }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {overview?.localTips?.length > 0 && (
          <div style={{ ...card, padding: 20 }}>
            <h3 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, color: T.forest, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}><span>🌟</span> Local Tips</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {overview.localTips.map((tip, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: T.forestLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    <span style={{ fontSize: 10, color: T.sageDark, fontWeight: 700 }}>{i + 1}</span>
                  </div>
                  <p style={{ fontSize: 13, color: T.ink, lineHeight: 1.55, margin: 0 }}>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {packingList?.length > 0 && (
          <div style={{ ...card, padding: 20 }}>
            <h3 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, color: T.forest, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Package size={13} style={{ color: '#B8860B' }}/> Packing List
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {packingList.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: T.sageDark }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.sand, flexShrink: 0 }}/>
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ ...card, padding: 20 }}>
          <h3 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, color: T.forest, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}><span>📅</span> Best Time to Visit</h3>
          <p style={{ fontWeight: 700, color: T.forestMid, marginBottom: 4, fontSize: 14 }}>{overview?.bestTime || 'October to March'}</p>
          <p style={{ fontSize: 13, color: T.sageDark, lineHeight: 1.55, margin: 0 }}>{overview?.climate || 'Pleasant weather ideal for sightseeing.'}</p>
        </div>

        {emergencyContacts && (
          <div style={{ ...card, padding: 20, border: `1.5px solid #F5C0B880` }}>
            <h3 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, color: T.forest, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Phone size={13} style={{ color: '#C0392B' }}/> Emergency Contacts
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(emergencyContacts).map(([key, val]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: T.sage, textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: T.forest, fontSize: 13 }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Loading ───────────────────────────────────────────────────────────────────
function LoadingState() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.cream }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: `2px solid ${T.creamDeep}`, borderTopColor: T.forest, borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ color: T.sage, fontSize: 13, fontFamily: 'system-ui, sans-serif' }}>Loading trip...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}