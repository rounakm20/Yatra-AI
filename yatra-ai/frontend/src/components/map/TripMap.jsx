import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Layers, Eye, EyeOff, Clock, Star, Navigation, Car, PersonStanding, Bike } from 'lucide-react'

const T = {
  cream:       '#FAF7F0',
  creamDeep:   '#F0EAD6',
  forest:      '#1E3A2F',
  forestMid:   '#2D5A40',
  forestLight: '#E8F0EB',
  sage:        '#7A9E87',
  sageDark:    '#5C7F6A',
  sand:        '#C9B99A',
  sandLight:   '#E8DFC8',
  ink:         '#2C3A30',
}

const DAY_COLORS = ['#2D5A40', '#5C7F6A', '#C9B99A', '#7A9E87', '#1E3A2F', '#8FAE9C', '#B5A07A']

const TYPE_EMOJI = {
  attraction: '🏛️', restaurant: '🍽️', cafe: '☕', hotel: '🏨',
  viewpoint: '🌄', museum: '🖼️', market: '🛍️', temple: '⛪',
  beach: '🏖️', park: '🌿', street: '🛤️', monument: '🗿',
}

// Estimate transport between 2 places
function getTransportOptions(from, to) {
  if (!from?.lat || !to?.lat) return []
  const R = 6371
  const dLat = (to.lat - from.lat) * Math.PI / 180
  const dLon = (to.lon - from.lon) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(from.lat*Math.PI/180)*Math.cos(to.lat*Math.PI/180)*Math.sin(dLon/2)**2
  const distKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  const dist = distKm.toFixed(1)

  const options = []

  if (distKm < 1.5) {
    options.push({ mode: 'Walk', emoji: '🚶', time: `${Math.round(distKm * 14)} min`, cost: 'Free', color: T.forestMid })
  }
  if (distKm < 8) {
    options.push({ mode: 'Auto', emoji: '🛺', time: `${Math.round(distKm * 4)} min`, cost: `₹${Math.round(distKm * 15 + 20)}–${Math.round(distKm * 20 + 25)}`, color: '#C07A3A' })
  }
  if (distKm < 15) {
    options.push({ mode: 'Rickshaw', emoji: '🚲', time: `${Math.round(distKm * 7)} min`, cost: `₹${Math.round(distKm * 8 + 10)}–${Math.round(distKm * 12 + 15)}`, color: T.sageDark })
  }
  if (distKm >= 3) {
    options.push({ mode: 'Cab/Ola', emoji: '🚗', time: `${Math.round(distKm * 3)} min`, cost: `₹${Math.round(distKm * 12 + 30)}–${Math.round(distKm * 18 + 40)}`, color: '#3A7AC0' })
  }
  if (distKm >= 10) {
    options.push({ mode: 'Bus', emoji: '🚌', time: `${Math.round(distKm * 6)} min`, cost: `₹${Math.round(distKm * 2 + 5)}–${Math.round(distKm * 3 + 10)}`, color: '#7A5C9E' })
  }

  return { options, dist: `${dist} km` }
}

export default function TripMap({ days, activeDay, setActiveDay, hiddenGems, coordinates, destination }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const polylinesRef = useRef([])

  const [showAllDays, setShowAllDays] = useState(false)
  const [showGems, setShowGems] = useState(true)
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [selectedRoute, setSelectedRoute] = useState(null) // { from, to }
  const [leafletLoaded, setLeafletLoaded] = useState(false)
  const [LRef, setLRef] = useState(null)

  const center = coordinates ? [coordinates.lat, coordinates.lon] : [20.5937, 78.9629]
  const activeDayData = days?.[activeDay]
  const activePlaces = activeDayData?.places?.filter(p => p.lat && p.lon) || []

  useEffect(() => {
    import('leaflet').then(L => {
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })
      setLRef(L)
      setLeafletLoaded(true)
    })
  }, [])

  useEffect(() => {
    if (!leafletLoaded || !LRef || !mapRef.current || mapInstanceRef.current) return
    const map = LRef.map(mapRef.current, { zoomControl: true, scrollWheelZoom: false })
    map.setView(center, 13)
    mapInstanceRef.current = map
    LRef.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap © CARTO', maxZoom: 19,
    }).addTo(map)
    return () => { map.remove(); mapInstanceRef.current = null }
  }, [leafletLoaded])

  useEffect(() => {
    if (!mapInstanceRef.current || !LRef) return
    const map = mapInstanceRef.current

    markersRef.current.forEach(m => m.remove())
    markersRef.current = []
    polylinesRef.current.forEach(p => p.remove())
    polylinesRef.current = []

    const placesToShow = showAllDays
      ? days?.flatMap((d, di) => (d.places || []).filter(p => p.lat && p.lon).map(p => ({ ...p, dayIndex: di }))) || []
      : activePlaces.map(p => ({ ...p, dayIndex: activeDay }))

    if (!placesToShow.length) return

    const bounds = []

    // Route polyline
    const routeCoords = placesToShow.map(p => [p.lat, p.lon])
    if (routeCoords.length > 1) {
      const color = showAllDays ? T.sageDark : DAY_COLORS[activeDay % DAY_COLORS.length]
      const poly = LRef.polyline(routeCoords, { color, weight: 3, opacity: 0.8, dashArray: '8,5' }).addTo(map)
      polylinesRef.current.push(poly)
      // Arrow markers between each pair
      for (let i = 0; i < routeCoords.length - 1; i++) {
        const mid = [(routeCoords[i][0] + routeCoords[i+1][0])/2, (routeCoords[i][1] + routeCoords[i+1][1])/2]
        const arrowIcon = LRef.divIcon({
          html: `<div style="color:${color};font-size:14px;font-weight:700;text-shadow:0 0 4px white">→</div>`,
          className: '', iconSize: [14, 14], iconAnchor: [7, 7],
        })
        const m = LRef.marker(mid, { icon: arrowIcon }).addTo(map)
        markersRef.current.push(m)
      }
    }

    placesToShow.forEach((place, i) => {
      bounds.push([place.lat, place.lon])
      const color = DAY_COLORS[place.dayIndex % DAY_COLORS.length]
      const num = showAllDays ? (TYPE_EMOJI[place.type] || '📍') : (i + 1)

      const icon = LRef.divIcon({
        html: `<div style="width:34px;height:34px;border-radius:50%;background:${color};border:2.5px solid #fff;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:${showAllDays ? '15px' : '13px'};box-shadow:0 3px 10px ${color}70;cursor:pointer;">${num}</div>`,
        className: '', iconSize: [34, 34], iconAnchor: [17, 17],
      })

      const marker = LRef.marker([place.lat, place.lon], { icon })
        .addTo(map)
        .on('click', () => setSelectedPlace(prev => prev?.name === place.name ? null : place))

      marker.bindTooltip(`<div style="font-family:system-ui;padding:2px"><b style="color:${T.forest}">${place.name}</b><br/><small style="color:${color}">${place.time || ''}</small></div>`, {
        permanent: false, direction: 'top', className: 'yatra-map-tooltip',
      })
      markersRef.current.push(marker)
    })

    // Gems
    if (showGems && hiddenGems?.length) {
      hiddenGems.forEach(gem => {
        if (!gem.lat || !gem.lon) return
        bounds.push([gem.lat, gem.lon])
        const icon = LRef.divIcon({
          html: `<div style="width:30px;height:30px;border-radius:50%;background:#7A5A2A;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,0.2);cursor:pointer;">💎</div>`,
          className: '', iconSize: [30, 30], iconAnchor: [15, 15],
        })
        const m = LRef.marker([gem.lat, gem.lon], { icon })
          .addTo(map)
          .on('click', () => setSelectedPlace(prev => prev?.name === gem.name ? null : { ...gem, isHiddenGem: true }))
        markersRef.current.push(m)
      })
    }

    if (bounds.length) {
      try { map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 }) } catch {}
    }
  }, [leafletLoaded, activeDay, showAllDays, showGems, days])

  useEffect(() => {
    if (!mapInstanceRef.current || !selectedPlace?.lat) return
    mapInstanceRef.current.setView([selectedPlace.lat, selectedPlace.lon], 15, { animate: true })
  }, [selectedPlace])

  // Build route legs for current day
  const routeLegs = activePlaces.length > 1
    ? activePlaces.slice(0, -1).map((p, i) => ({
        from: p,
        to: activePlaces[i + 1],
        ...getTransportOptions(p, activePlaces[i + 1]),
      }))
    : []

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <style>{`
        .yatra-map-tooltip {
          background: ${T.forest} !important;
          border: 1px solid ${T.sage}50 !important;
          color: ${T.cream} !important;
          border-radius: 10px !important;
          font-size: 12px !important;
          padding: 5px 10px !important;
          box-shadow: 0 4px 12px rgba(30,58,47,0.2) !important;
        }
        .yatra-map-tooltip::before { border-top-color: ${T.forest} !important; }
      `}</style>

      {/* Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14, alignItems: 'center' }}>
        <button
          onClick={() => setShowAllDays(!showAllDays)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '6px 14px', borderRadius: 999, fontSize: 11, fontWeight: 600,
            background: showAllDays ? T.forest : T.forestLight,
            color: showAllDays ? T.cream : T.sageDark,
            border: `1px solid ${showAllDays ? T.forest : T.creamDeep}`,
            cursor: 'pointer',
          }}>
          <Layers size={12} /> {showAllDays ? 'All Days' : 'Single Day'}
        </button>

        <button
          onClick={() => setShowGems(!showGems)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '6px 14px', borderRadius: 999, fontSize: 11, fontWeight: 600,
            background: showGems ? T.forestMid : T.forestLight,
            color: showGems ? T.cream : T.sageDark,
            border: `1px solid ${showGems ? T.forestMid : T.creamDeep}`,
            cursor: 'pointer',
          }}>
          {showGems ? <Eye size={12} /> : <EyeOff size={12} />} Gems
        </button>

        {/* Day pills */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
          {days?.map((d, i) => (
            <button
              key={i}
              onClick={() => { setActiveDay(i); setShowAllDays(false) }}
              style={{
                flexShrink: 0, padding: '5px 12px', borderRadius: 999,
                fontSize: 11, fontWeight: 700,
                background: activeDay === i && !showAllDays ? `${DAY_COLORS[i % DAY_COLORS.length]}18` : T.forestLight,
                color: activeDay === i && !showAllDays ? DAY_COLORS[i % DAY_COLORS.length] : T.sand,
                border: `1px solid ${activeDay === i && !showAllDays ? DAY_COLORS[i % DAY_COLORS.length] + '50' : T.creamDeep}`,
                cursor: 'pointer',
              }}>
              D{d.day}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div style={{ borderRadius: 16, overflow: 'hidden', border: `1px solid ${T.creamDeep}`, height: 420, position: 'relative', zIndex: 1 }}>
        {!leafletLoaded && (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.creamDeep }}>
            <div style={{ width: 28, height: 28, border: `2px solid ${T.sand}`, borderTopColor: T.forest, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          </div>
        )}
        <div ref={mapRef} style={{ height: '100%', width: '100%', display: leafletLoaded ? 'block' : 'none' }} />
      </div>

      {/* Selected place popup */}
      <AnimatePresence>
        {selectedPlace && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            style={{ marginTop: 12, background: '#fff', border: `1px solid ${T.creamDeep}`, borderRadius: 14, padding: 16, boxShadow: `0 4px 16px rgba(30,58,47,0.08)` }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 22 }}>{selectedPlace.isHiddenGem ? '💎' : (TYPE_EMOJI[selectedPlace.type] || '📍')}</span>
                <div>
                  <p style={{ fontWeight: 700, color: T.forest, fontSize: 14, margin: 0 }}>{selectedPlace.name}</p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 3 }}>
                    {selectedPlace.time && <span style={{ fontSize: 11, color: T.sage, display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={10}/>{selectedPlace.time}</span>}
                    {selectedPlace.rating && <span style={{ fontSize: 11, color: '#E6A817', display: 'flex', alignItems: 'center', gap: 3 }}><Star size={10} fill="currentColor"/>{selectedPlace.rating}</span>}
                    {selectedPlace.cost > 0 && <span style={{ fontSize: 11, color: T.forestMid, fontWeight: 600 }}>₹{selectedPlace.cost}</span>}
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedPlace(null)} style={{ background: 'none', border: 'none', color: T.sand, cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>×</button>
            </div>
            {selectedPlace.description && <p style={{ fontSize: 12, color: T.sageDark, marginTop: 8, lineHeight: 1.6, margin: '8px 0 0' }}>{selectedPlace.description}</p>}
            {selectedPlace.tips && (
              <div style={{ marginTop: 8, padding: '8px 10px', borderRadius: 10, background: '#FFF8E7', border: '1px solid #F5D98060', display: 'flex', gap: 6 }}>
                <span style={{ fontSize: 12 }}>💡</span>
                <p style={{ fontSize: 11, color: '#8A6C2A', margin: 0, lineHeight: 1.5 }}>{selectedPlace.tips}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Transport Route Guide ── */}
      {!showAllDays && routeLegs.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 16, fontWeight: 700, color: T.forest, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Navigation size={14} style={{ color: T.sageDark }} /> How to Get Around — Day {activeDayData?.day}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {routeLegs.map((leg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                style={{ background: '#fff', border: `1px solid ${T.creamDeep}`, borderRadius: 14, overflow: 'hidden', boxShadow: `0 2px 8px rgba(30,58,47,0.05)` }}
              >
                {/* From → To header */}
                <div style={{ padding: '10px 14px', background: T.forestLight, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: DAY_COLORS[activeDay % DAY_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{i+1}</div>
                  <p style={{ fontSize: 12, color: T.forest, fontWeight: 600, margin: 0, flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {leg.from.name}
                  </p>
                  <span style={{ fontSize: 11, color: T.sage, flexShrink: 0 }}>→</span>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: DAY_COLORS[activeDay % DAY_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{i+2}</div>
                  <p style={{ fontSize: 12, color: T.forest, fontWeight: 600, margin: 0, flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {leg.to.name}
                  </p>
                  <span style={{ fontSize: 11, color: T.sand, flexShrink: 0 }}>{leg.dist}</span>
                </div>

                {/* Transport options */}
                <div style={{ padding: '10px 14px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {leg.options?.map((opt, j) => (
                    <div key={j} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '6px 12px', borderRadius: 10,
                      background: `${opt.color}10`,
                      border: `1px solid ${opt.color}30`,
                    }}>
                      <span style={{ fontSize: 16 }}>{opt.emoji}</span>
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 700, color: opt.color, margin: 0 }}>{opt.mode}</p>
                        <p style={{ fontSize: 10, color: T.sage, margin: 0 }}>{opt.time} · {opt.cost}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Total transport cost */}
          <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 12, background: T.forestLight, border: `1px solid ${T.creamDeep}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: T.sageDark }}>🛺 Estimated transport cost (auto)</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.forest }}>
              ₹{routeLegs.reduce((sum, leg) => {
                const auto = leg.options?.find(o => o.mode === 'Auto')
                if (!auto) return sum
                const match = auto.cost.match(/₹(\d+)/)
                return sum + (match ? parseInt(match[1]) : 0)
              }, 0)}–{routeLegs.reduce((sum, leg) => {
                const auto = leg.options?.find(o => o.mode === 'Auto')
                if (!auto) return sum
                const match = auto.cost.match(/–₹(\d+)/)
                return sum + (match ? parseInt(match[1]) : 0)
              }, 0)}/day
            </span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {days?.slice(0, 7).map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: T.sage }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: DAY_COLORS[i % DAY_COLORS.length] }} />
            Day {d.day}
          </div>
        ))}
        {showGems && <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: T.sage }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: '#7A5A2A' }}/>Gems</div>}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}