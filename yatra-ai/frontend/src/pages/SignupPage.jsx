import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Compass, ArrowRight, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { toast } from '../components/common/Toaster'

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

export default function SignupPage() {
  const [name, setName]               = useState('')
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [showPass, setShowPass]       = useState(false)
  const [loading, setLoading]         = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const { signup, loginWithGoogle }   = useAuth()
  const navigate                      = useNavigate()

  const handleSignup = async (e) => {
    e.preventDefault()
    if (password.length < 6) { toast('Password must be at least 6 characters.', 'warning'); return }
    setLoading(true)
    try {
      await signup(name, email, password)
      toast('Account created! Welcome to Yatra-AI 🎉', 'success')
      navigate('/dashboard')
    } catch (err) {
      toast(err.message || 'Signup failed. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    try {
      await loginWithGoogle()
      toast('Welcome to Yatra-AI! 🌏', 'success')
      navigate('/dashboard')
    } catch {
      toast('Google signup failed.', 'error')
    } finally {
      setGoogleLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '11px 16px 11px 40px',
    borderRadius: 8, fontSize: 14,
    fontFamily: 'system-ui, sans-serif',
    background: T.cream,
    border: `1px solid ${T.sand}`,
    color: T.forest, outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: T.cream }}>

      {/* ── Left panel — decorative ── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center"
        style={{ background: T.forest }}>

        <div style={{ position: 'absolute', top: '15%', left: '-10%', width: 360, height: 360, borderRadius: '50%', background: `radial-gradient(circle, ${T.forestMid}80, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '15%', right: '-8%', width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, ${T.sage}30, transparent 70%)`, pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 48px', maxWidth: 400 }}>
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            style={{ fontSize: 80, marginBottom: 32 }}>
            ✈️
          </motion.div>

          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 36, fontWeight: 700, color: T.cream, lineHeight: 1.15, marginBottom: 16 }}>
            Begin your<br />
            <em style={{ fontStyle: 'italic', color: T.sand }}>journey.</em>
          </h2>
          <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: 14, color: T.sage, lineHeight: 1.75 }}>
            AI-crafted itineraries, hidden gems, interactive maps, and budget planning — all in one place.
          </p>

          <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {['Goa', 'Rajasthan', 'Kerala', 'Manali', 'Varanasi', 'Udaipur'].map((d, i) => (
              <div key={i} style={{
                background: `${T.forestMid}80`, border: `1px solid ${T.sage}40`,
                borderRadius: 8, padding: '7px 10px',
                fontFamily: 'system-ui, sans-serif', fontSize: 12,
                fontWeight: 500, color: T.sandLight, textAlign: 'center',
              }}>
                {d}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 9, marginBottom: 40 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: T.forest, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Compass size={16} color={T.cream} strokeWidth={2.2} />
            </div>
            <span style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 18, color: T.forest }}>
              Yatra<span style={{ color: T.sage }}>-AI</span>
            </span>
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 700, color: T.forest, margin: '0 0 6px' }}>
              Create account
            </h1>
            <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: 14, color: T.sage, marginBottom: 32 }}>
              Start planning your perfect trips with AI.
            </p>

            {/* Google button */}
            <button onClick={handleGoogle} disabled={googleLoading}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                background: T.creamDeep, border: `1px solid ${T.sand}`,
                borderRadius: 8, padding: '11px 16px',
                fontFamily: 'system-ui, sans-serif', fontSize: 14, fontWeight: 500,
                color: T.forest, cursor: 'pointer', transition: 'all 0.2s',
                marginBottom: 24, opacity: googleLoading ? 0.6 : 1,
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = T.sage}
              onMouseLeave={e => e.currentTarget.style.borderColor = T.sand}>
              {googleLoading ? (
                <div style={{ width: 16, height: 16, border: `2px solid ${T.sand}`, borderTopColor: T.forest, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Continue with Google
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ flex: 1, height: 1, background: `${T.sand}80` }} />
              <span style={{ fontFamily: 'system-ui, sans-serif', fontSize: 12, color: T.sand }}>or with email</span>
              <div style={{ flex: 1, height: 1, background: `${T.sand}80` }} />
            </div>

            {/* Form */}
            <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Name */}
              <div>
                <label style={{ fontFamily: 'system-ui, sans-serif', fontSize: 12, fontWeight: 600, color: T.sage, display: 'block', marginBottom: 6 }}>
                  Full name
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: T.sand }} />
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="Arjun Sharma" required
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = T.sage}
                    onBlur={e => e.target.style.borderColor = T.sand} />
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={{ fontFamily: 'system-ui, sans-serif', fontSize: 12, fontWeight: 600, color: T.sage, display: 'block', marginBottom: 6 }}>
                  Email address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: T.sand }} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" required
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = T.sage}
                    onBlur={e => e.target.style.borderColor = T.sand} />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ fontFamily: 'system-ui, sans-serif', fontSize: 12, fontWeight: 600, color: T.sage, display: 'block', marginBottom: 6 }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: T.sand }} />
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 6 characters" required
                    style={{ ...inputStyle, paddingRight: 40 }}
                    onFocus={e => e.target.style.borderColor = T.sage}
                    onBlur={e => e.target.style.borderColor = T.sand} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: T.sand, padding: 0, transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = T.sage}
                    onMouseLeave={e => e.currentTarget.style.color = T.sand}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: T.forest, color: T.cream,
                  padding: '12px 16px', borderRadius: 8,
                  fontFamily: 'system-ui, sans-serif', fontSize: 14, fontWeight: 600,
                  border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1, transition: 'all 0.2s', marginTop: 4,
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = T.forestMid }}
                onMouseLeave={e => e.currentTarget.style.background = T.forest}>
                {loading ? (
                  <div style={{ width: 16, height: 16, border: `2px solid ${T.sage}`, borderTopColor: T.cream, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                ) : (
                  <>Create Account <ArrowRight size={15} /></>
                )}
              </button>
            </form>

            <p style={{ fontFamily: 'system-ui, sans-serif', textAlign: 'center', fontSize: 13, color: T.sage, marginTop: 24 }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: T.forestMid, fontWeight: 600, textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.color = T.forest}
                onMouseLeave={e => e.currentTarget.style.color = T.forestMid}>
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}