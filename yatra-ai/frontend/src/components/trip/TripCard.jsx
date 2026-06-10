import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Calendar, DollarSign, Trash2, ChevronRight, Clock } from 'lucide-react'
import { useTrip } from '../../context/TripContext'
import { toast } from '../common/Toaster'
import { formatDistanceToNow } from 'date-fns'

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
  const dest = trip?.tripData?.destination || 'Unknown'
  const days = trip?.tripData?.days || '?'
  const budget = trip?.budget?.total || 0
  const createdAt = trip?.createdAt ? formatDistanceToNow(new Date(trip.createdAt), { addSuffix: true }) : ''

  const handleDelete = (e) => {
    e.preventDefault()
    e.stopPropagation()
    deleteTrip(trip.id)
    toast('Trip deleted.', 'info')
  }

  if (compact) {
    return (
      <Link
        to={`/trip/${trip.id}`}
        state={{ trip }}
        onClick={() => setCurrentTrip(trip)}
        className="flex items-center gap-4 glass-card rounded-2xl p-4 hover:border-brand-500/20 transition-all group"
      >
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: 'rgba(14,165,233,0.1)' }}>
          {getEmoji(dest)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm truncate">{trip.overview?.title || `${days} Days in ${dest}`}</p>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-slate-500 flex items-center gap-1"><MapPin size={10} />{dest}</span>
            <span className="text-xs text-slate-500 flex items-center gap-1"><Calendar size={10} />{days}d</span>
            {budget > 0 && <span className="text-xs text-emerald-400">₹{budget.toLocaleString()}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600">{createdAt}</span>
          <ChevronRight size={14} className="text-slate-600 group-hover:text-brand-400 transition-colors" />
        </div>
      </Link>
    )
  }

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <Link
        to={`/trip/${trip.id}`}
        state={{ trip }}
        onClick={() => setCurrentTrip(trip)}
        className="block glass-card rounded-2xl overflow-hidden hover:border-brand-500/20 transition-all group"
      >
        {/* Card header */}
        <div className="h-36 relative flex items-center justify-center overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.15), rgba(139,92,246,0.1))' }}>
          <span className="text-6xl">{getEmoji(dest)}</span>
          <div className="absolute inset-0 bg-gradient-to-t from-dark-800/80 to-transparent" />
          {trip.tripData?.explorerMode && (
            <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-mono bg-violet-500/20 text-violet-300 border border-violet-500/20">
              🔍 Explorer
            </div>
          )}
          <button
            onClick={handleDelete}
            className="absolute top-3 left-3 w-7 h-7 rounded-lg bg-dark-800/60 flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
          >
            <Trash2 size={13} />
          </button>
        </div>

        <div className="p-5">
          <h3 className="font-display font-bold text-white mb-1 truncate">
            {trip.overview?.title || `${days} Days in ${dest}`}
          </h3>
          <p className="text-xs text-slate-500 mb-3 line-clamp-2">{trip.overview?.tagline}</p>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-slate-400"><MapPin size={11} />{dest}</span>
            <span className="flex items-center gap-1 text-xs text-slate-400"><Calendar size={11} />{days} days</span>
            {budget > 0 && <span className="flex items-center gap-1 text-xs text-emerald-400"><DollarSign size={11} />₹{budget.toLocaleString()}</span>}
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
            <span className="text-xs text-slate-600 flex items-center gap-1"><Clock size={10} />{createdAt}</span>
            <span className="text-xs text-brand-400 group-hover:text-brand-300 transition-colors flex items-center gap-1">
              View Trip <ChevronRight size={12} />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
