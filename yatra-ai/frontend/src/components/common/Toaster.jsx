import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react'

const T = {
  cream:     '#FAF7F0',
  creamDeep: '#F0EAD6',
  forest:    '#1E3A2F',
  sage:      '#7A9E87',
  sand:      '#C9B99A',
}

let globalToast = null

export function Toaster() {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
  }, [])

  useEffect(() => {
    globalToast = addToast
    return () => { globalToast = null }
  }, [addToast])

  const config = {
    success: {
      icon: <CheckCircle2 size={15} />,
      color: '#2D6A4F',
      bg: '#F0FAF4',
      border: '#A8D5B5',
    },
    error: {
      icon: <XCircle size={15} />,
      color: '#C0392B',
      bg: '#FDF3F2',
      border: '#F5C0B8',
    },
    warning: {
      icon: <AlertCircle size={15} />,
      color: '#B8860B',
      bg: '#FFFBF0',
      border: '#F5D980',
    },
    info: {
      icon: <Info size={15} />,
      color: T.forest,
      bg: T.cream,
      border: T.creamDeep,
    },
  }

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24,
      zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 10,
      maxWidth: 340,
    }}>
      <AnimatePresence>
        {toasts.map(t => {
          const c = config[t.type] || config.info
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 50, scale: 0.93 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.93 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                background: c.bg,
                border: `1px solid ${c.border}`,
                borderRadius: 14,
                padding: '12px 14px',
                boxShadow: '0 4px 20px rgba(30,58,47,0.10)',
                fontFamily: 'system-ui, sans-serif',
              }}
            >
              {/* Icon */}
              <span style={{ color: c.color, flexShrink: 0, marginTop: 1 }}>
                {c.icon}
              </span>

              {/* Message */}
              <p style={{
                fontSize: 13, color: T.forest,
                lineHeight: 1.55, margin: 0, flex: 1,
              }}>
                {t.message}
              </p>

              {/* Dismiss */}
              <button
                onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
                style={{
                  flexShrink: 0, background: 'none', border: 'none',
                  cursor: 'pointer', color: T.sand, padding: 0, marginTop: 1,
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = T.forest}
                onMouseLeave={e => e.currentTarget.style.color = T.sand}
              >
                <X size={13} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

export function toast(message, type = 'info', duration = 4000) {
  if (globalToast) globalToast(message, type, duration)
}

export function useToast() {
  const fn = useCallback((message, type, duration) => {
    if (globalToast) globalToast(message, type, duration)
  }, [])
  return { toast: fn }
}