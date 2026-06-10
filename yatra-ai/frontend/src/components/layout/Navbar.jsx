import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Map, BookMarked, User, LogOut, Menu, X,
  Compass, PlusCircle, LayoutDashboard, ChevronRight
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useMode } from '../../context/ModeContext'

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

export default function Navbar() {
  const { user, logout } = useAuth()
  const { mode, setMode } = useMode()
  const location = useLocation()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobileOpen(false)
  }

  const scrollToFeatures = () => {
    setMobileOpen(false)
    if (location.pathname !== '/') {
      navigate('/#features')
    } else {
      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  if (location.pathname === '/login' || location.pathname === '/signup') return null

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          background: scrolled ? `${T.cream}F2` : `${T.cream}CC`,
          borderBottom: `1px solid ${scrolled ? T.sand + '70' : T.creamDeep}`,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          transition: 'all 0.35s ease',
        }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          padding: `${scrolled ? 10 : 16}px 24px`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          transition: 'padding 0.35s ease',
        }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: T.forest,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'transform 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              <Compass size={16} color={T.cream} strokeWidth={2.2} />
            </div>
            <span style={{
              fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 18,
              letterSpacing: '-0.02em', color: T.forest,
            }}>
              Yatra<span style={{ color: T.sage }}>-AI</span>
            </span>
          </Link>

          {/* Desktop right — mode toggle only (no profile pill) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="hidden md:flex">
            {user && (
              <div style={{
                display: 'flex', alignItems: 'center',
                background: T.creamDeep,
                border: `1px solid ${T.sand}`,
                borderRadius: 8, padding: 3, gap: 2,
              }}>
                {[{ key: 'tourist', label: '🏛️ Tourist' }, { key: 'explorer', label: '🔍 Explorer' }].map(m => (
                  <button key={m.key} onClick={() => setMode(m.key)} style={{
                    padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                    fontFamily: 'system-ui, sans-serif', cursor: 'pointer', border: 'none',
                    background: mode === m.key ? T.forest : 'transparent',
                    color: mode === m.key ? T.cream : T.sage,
                    transition: 'all 0.2s',
                  }}>
                    {m.label}
                  </button>
                ))}
              </div>
            )}

            {!user && (
              <div style={{ display: 'flex', gap: 8 }}>
                <Link to="/login" style={{
                  fontSize: 13, fontWeight: 500,
                  color: T.forest,
                  padding: '7px 16px', borderRadius: 8,
                  border: `1px solid ${T.sand}`,
                  background: 'transparent', textDecoration: 'none',
                  fontFamily: 'system-ui, sans-serif', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = T.creamDeep}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  Sign In
                </Link>
                <Link to="/signup" style={{
                  fontSize: 13, fontWeight: 600, color: T.cream,
                  padding: '7px 16px', borderRadius: 8,
                  background: T.forest, textDecoration: 'none',
                  fontFamily: 'system-ui, sans-serif', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = T.forestMid; e.currentTarget.style.transform = 'scale(1.02)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = T.forest; e.currentTarget.style.transform = 'scale(1)' }}>
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Hamburger — always visible */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              width: 34, height: 34, borderRadius: 8,
              background: T.creamDeep,
              border: `1px solid ${T.sand}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: T.forest,
            }}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={mobileOpen ? 'x' : 'menu'}
                initial={{ opacity: 0, rotate: -90, scale: 0.7 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.7 }}
                transition={{ duration: 0.15 }}>
                {mobileOpen ? <X size={16} /> : <Menu size={16} />}
              </motion.div>
            </AnimatePresence>
          </button>
        </div>
      </motion.nav>

      {/* ── Drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'fixed',
              top: scrolled ? 58 : 70,
              right: 12,
              width: 260,
              zIndex: 40,
              background: T.cream,
              border: `1px solid ${T.sand}`,
              borderRadius: 14,
              overflow: 'hidden',
              boxShadow: `0 16px 48px ${T.forest}22`,
            }}>

            {user ? (
              <>
                {/* User info */}
                <div style={{ padding: '12px 14px', borderBottom: `1px solid ${T.sand}60`, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img src={user.avatar} alt={user.name} style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }} />
                  <div style={{ overflow: 'hidden' }}>
                    <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: 13, fontWeight: 600, color: T.forest, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
                    <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: 11, color: T.sage, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                  </div>
                </div>

                {/* Mode toggle */}
                <div style={{ padding: '10px 10px', borderBottom: `1px solid ${T.sand}60` }}>
                  <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.sage, margin: '0 0 8px 2px' }}>Travel Mode</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {[{ key: 'tourist', label: '🏛️ Tourist' }, { key: 'explorer', label: '🔍 Explorer' }].map(m => (
                      <button key={m.key} onClick={() => setMode(m.key)} style={{
                        padding: '7px 0', borderRadius: 8, fontSize: 12, fontWeight: 600,
                        fontFamily: 'system-ui, sans-serif', cursor: 'pointer', border: 'none',
                        background: mode === m.key ? T.forest : T.creamDeep,
                        color: mode === m.key ? T.cream : T.sage,
                        transition: 'all 0.2s',
                      }}>
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nav links */}
                <div style={{ padding: '6px 8px' }}>
                  {[
                    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard'     },
                    { to: '/planner',   icon: PlusCircle,      label: 'Plan New Trip' },
                    { to: '/saved',     icon: BookMarked,      label: 'Saved Trips'   },
                    { to: '/profile',   icon: User,            label: 'Profile'       },
                  ].map(({ to, icon: Icon, label }) => (
                    <Link key={to} to={to} onClick={() => setMobileOpen(false)} style={{
                      display: 'flex', alignItems: 'center', gap: 9,
                      padding: '9px 10px', borderRadius: 9, fontSize: 13,
                      fontFamily: 'system-ui, sans-serif', fontWeight: 500,
                      textDecoration: 'none', color: T.forest, transition: 'background 0.15s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = T.creamDeep}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <Icon size={14} strokeWidth={1.8} style={{ color: T.sage }} />
                      {label}
                      <ChevronRight size={12} style={{ color: T.sand, marginLeft: 'auto' }} />
                    </Link>
                  ))}
                </div>

                {/* Logout */}
                <div style={{ padding: '0 8px 8px' }}>
                  <div style={{ height: 1, background: `${T.sand}80`, marginBottom: 6 }} />
                  <button onClick={handleLogout} style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 9,
                    padding: '9px 10px', borderRadius: 9, fontSize: 13,
                    fontFamily: 'system-ui, sans-serif', fontWeight: 500,
                    color: '#A0522D', background: 'transparent', border: 'none',
                    cursor: 'pointer', transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = '#A0522D15'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ padding: '6px 8px', borderBottom: `1px solid ${T.sand}60` }}>
                  <button onClick={scrollToFeatures} style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 9,
                    padding: '10px 10px', borderRadius: 9, fontSize: 13,
                    fontFamily: 'system-ui, sans-serif', fontWeight: 500,
                    color: T.forest, background: 'transparent', border: 'none',
                    cursor: 'pointer', transition: 'background 0.15s', textAlign: 'left',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = T.creamDeep}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <Map size={14} strokeWidth={1.8} style={{ color: T.sage }} />
                    Features
                    <ChevronRight size={12} style={{ color: T.sand, marginLeft: 'auto' }} />
                  </button>
                </div>
                <div style={{ padding: '10px 10px', display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <Link to="/login" onClick={() => setMobileOpen(false)} style={{
                    display: 'block', padding: '10px 16px', borderRadius: 9,
                    fontSize: 13, fontWeight: 500, color: T.forest,
                    border: `1px solid ${T.sand}`, textDecoration: 'none',
                    fontFamily: 'system-ui, sans-serif', textAlign: 'center',
                    background: 'transparent', transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = T.creamDeep}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    Sign In
                  </Link>
                  <Link to="/signup" onClick={() => setMobileOpen(false)} style={{
                    display: 'block', padding: '10px 16px', borderRadius: 9,
                    fontSize: 13, fontWeight: 600, color: T.cream,
                    background: T.forest, textDecoration: 'none',
                    fontFamily: 'system-ui, sans-serif', textAlign: 'center',
                  }}>
                    Get Started
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 30 }}
          onClick={() => setMobileOpen(false)} />
      )}
    </>
  )
}