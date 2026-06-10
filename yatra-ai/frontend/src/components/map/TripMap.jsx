import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Calendar, DollarSign, Trash2, ChevronRight, Clock } from 'lucide-react'
import { useTrip } from '../../context/TripContext'
import { toast } from '../common/Toaster'
import { formatDistanceToNow } from 'date-fns'

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
}

const DEST_EMOJIS = {
  goa: '🏖️', jaipur: '🏯', kerala: '🌴', manali: '🏔️', varanasi: '🕯️',
  udaipur: '💎', mumbai: '🌆', delhi: '🏛️', rishikesh: '🌊', shimla: '🏔️',
  paris: '🗼', london: '🎡', tokyo: '⛩️', bali: '🌺', dubai: '🌇',
}

function getEmoji(dest = '') {
  const key = dest.toLowerCase()
  for (const [k, v] of Object.entries(DEST_EMOJIS)) {
    if (key.includes(k)) return v
  }
  return '🗺️'
}

export default function TripCard({ trip, compact = false }) {
  const { deleteTrip, setCurrentTrip } = useTrip()
  const dest     = trip?.tripData?.destination || 'Unknown'
  const days     = trip?.tripData?.days || '?'
  const budget   = trip?.budget?.total || 0
  const createdAt = trip?.createdAt
    ? formatDistanceToNow(new Date(trip.createdAt), { addSuffix: true })
    : ''

  const handleDelete = (e) => {
    e.preventDefault()
    e.stopPropagation()
    deleteTrip(trip.id)
    toast('Trip deleted.', 'info')
  }

  // ── Compact variant ──────────────────────────────────────────────────────
  if (compact) {
    return (
      <Link
        to={`/trip/${trip.id}`}
        state={{ trip }}
        onClick={() => setCurrentTrip(trip)}
        style={{
          display: 'flex', alignItems: 'center', gap: 14,
          background: '#fff',
          border: `1px solid ${T.creamDeep}`,
          borderRadius: 14,
          padding: '12px 14px',
          textDecoration: 'none',
          boxShadow: '0 1px 6px rgba(30,58,47,0.05)',
          transition: 'border-color 0.18s, box-shadow 0.18s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = T.sage
          e.currentTarget.style.boxShadow = `0 3px 14px rgba(30,58,47,0.09)`
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = T.creamDeep
          e.currentTarget.style.boxShadow = '0 1px 6px rgba(30,58,47,0.05)'
        }}
      >
        {/* Emoji badge */}
        <div style={{
          width: 44, height: 44, borderRadius: 10, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, background: T.forestLight,
        }}>
          {getEmoji(dest)}
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 13, color: T.forest, margin: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            {trip.overview?.title || `${days} Days in ${dest}`}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 3 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: T.sage, fontFamily: 'system-ui, sans-serif' }}>
              <MapPin size={9} />{dest}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: T.sage, fontFamily: 'system-ui, sans-serif' }}>
              <Calendar size={9} />{days}d
            </span>
            {budget > 0 && (
              <span style={{ fontSize: 11, color: T.forestMid, fontWeight: 600, fontFamily: 'system-ui, sans-serif' }}>
                ₹{budget.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Time + chevron */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: T.sand, fontFamily: 'system-ui, sans-serif' }}>{createdAt}</span>
          <ChevronRight size={13} style={{ color: T.sand, transition: 'color 0.15s' }} />
        </div>
      </Link>
    )
  }

  // ── Full card variant ────────────────────────────────────────────────────
  return (
    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
      <Link
        to={`/trip/${trip.id}`}
        state={{ trip }}
        onClick={() => setCurrentTrip(trip)}
        className="group"
        style={{
          display: 'block', textDecoration: 'none',
          background: '#fff',
          border: `1px solid ${T.creamDeep}`,
          borderRadius: 16, overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(30,58,47,0.06)',
          transition: 'border-color 0.18s, box-shadow 0.18s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = T.sage
          e.currentTarget.style.boxShadow = '0 6px 24px rgba(30,58,47,0.12)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = T.creamDeep
          e.currentTarget.style.boxShadow = '0 2px 12px rgba(30,58,47,0.06)'
        }}
      >
        {/* Card header / thumbnail */}
        <div style={{
          height: 140, position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `linear-gradient(135deg, ${T.forestLight}, ${T.creamDeep})`,
          overflow: 'hidden',
        }}>
          {/* subtle decorative blob */}
          <div style={{
            position: 'absolute', top: '-30%', right: '-15%',
            width: 160, height: 160, borderRadius: '50%',
            background: `radial-gradient(circle, ${T.sage}30, transparent 70%)`,
            pointerEvents: 'none',
          }} />

          <span style={{ fontSize: 56, position: 'relative', zIndex: 1 }}>{getEmoji(dest)}</span>

          {/* gradient fade at bottom */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(to top, ${T.creamDeep}80, transparent)`,
          }} />

          {/* Explorer badge */}
          {trip.tripData?.explorerMode && (
            <div style={{
              position: 'absolute', top: 10, right: 10,
              padding: '3px 10px', borderRadius: 999,
              fontSize: 10, fontWeight: 600, fontFamily: 'system-ui, sans-serif',
              background: T.forestLight, color: T.sageDark,
              border: `1px solid ${T.creamDeep}`,
            }}>
              🔍 Explorer
            </div>
          )}

          {/* Delete button */}
          <button
            onClick={handleDelete}
            style={{
              position: 'absolute', top: 10, left: 10,
              width: 28, height: 28, borderRadius: 8,
              background: '#fff', border: `1px solid ${T.creamDeep}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: T.sand, cursor: 'pointer',
              opacity: 0, transition: 'opacity 0.15s, color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#C0392B'}
            onMouseLeave={e => e.currentTarget.style.color = T.sand}
            // reveal on parent hover via JS since we can't use CSS group-hover in inline styles
            ref={el => {
              if (!el) return
              const card = el.closest('a')
              if (!card) return
              const show = () => el.style.opacity = '1'
              const hide = () => el.style.opacity = '0'
              card.addEventListener('mouseenter', show)
              card.addEventListener('mouseleave', hide)
            }}
          >
            <Trash2 size={12} />
          </button>
        </div>

        {/* Card body */}
        <div style={{ padding: '16px 18px 18px', fontFamily: 'system-ui, sans-serif' }}>
          <h3 style={{
            fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 16,
            color: T.forest, margin: '0 0 4px',
            overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
          }}>
            {trip.overview?.title || `${days} Days in ${dest}`}
          </h3>

          {trip.overview?.tagline && (
            <p style={{
              fontSize: 12, color: T.sage, margin: '0 0 12px', lineHeight: 1.5,
              overflow: 'hidden', display: '-webkit-box',
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            }}>
              {trip.overview.tagline}
            </p>
          )}

          {/* Stats row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: T.sageDark }}>
              <MapPin size={10} />{dest}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: T.sageDark }}>
              <Calendar size={10} />{days} days
            </span>
            {budget > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: T.forestMid, fontWeight: 600 }}>
                <DollarSign size={10} />₹{budget.toLocaleString()}
              </span>
            )}
          </div>

          {/* Footer */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginTop: 14, paddingTop: 12,
            borderTop: `1px solid ${T.creamDeep}`,
          }}>
            <span style={{ fontSize: 11, color: T.sand, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={9} />{createdAt}
            </span>
            <span style={{ fontSize: 11, color: T.sageDark, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, transition: 'color 0.15s' }}>
              View Trip <ChevronRight size={11} />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}