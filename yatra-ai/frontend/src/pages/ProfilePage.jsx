import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Save, BookMarked, Map, Calendar, Edit3, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTrip } from '../context/TripContext'
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

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const { savedTrips } = useTrip()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [saving, setSaving] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [previewAvatar, setPreviewAvatar] = useState(null)
  const fileInputRef = useRef(null)

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    const updates = { name }
    if (previewAvatar) updates.avatar = previewAvatar
    updateProfile(updates)
    setEditing(false)
    setSaving(false)
    setPreviewAvatar(null)
    toast('Profile updated!', 'success')
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast('Image size should be less than 2MB', 'error')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      setPreviewAvatar(ev.target.result)
      setImgError(false)
    }
    reader.readAsDataURL(file)
  }

  const currentAvatar = previewAvatar || (!imgError ? user?.avatar : null)

  const initials = (user?.name || 'U')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const stats = [
    { label: 'Saved Trips',  value: savedTrips.length, icon: <BookMarked size={18} /> },
    { label: 'Destinations', value: savedTrips.length * 2, icon: <Map size={18} /> },
    { label: 'Days Planned', value: savedTrips.reduce((a, t) => a + (parseInt(t.tripData?.days) || 0), 0), icon: <Calendar size={18} /> },
  ]

  const destinations = ['Goa', 'Rajasthan', 'Kerala', 'Manali', 'Varanasi', 'Udaipur']

  return (
    <div style={{ minHeight: '100vh', background: T.cream, padding: '80px 28px 40px', fontFamily: 'system-ui, sans-serif' }}>

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 700, color: T.forest, marginBottom: 28 }}
      >
        Your Profile
      </motion.h1>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20 }}>

        {/* ── Left — Avatar panel ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: T.forest,
            borderRadius: 16,
            padding: '28px 20px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: '-30px', left: '-30px', width: 160, height: 160, borderRadius: '50%', background: `radial-gradient(circle, ${T.forestMid}80, transparent 70%)`, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', width: 120, height: 120, borderRadius: '50%', background: `radial-gradient(circle, ${T.sage}30, transparent 70%)`, pointerEvents: 'none' }} />

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageChange}
          />

          {/* Avatar */}
          <div style={{ position: 'relative', zIndex: 2, display: 'inline-block', marginBottom: 14 }}>
            <div style={{
              width: 80, height: 80, borderRadius: 14,
              background: T.forestMid,
              border: `2px solid ${T.sage}50`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 700, color: T.cream,
              overflow: 'hidden',
            }}>
              {currentAvatar ? (
                <img
                  src={currentAvatar}
                  alt={user?.name}
                  referrerPolicy="no-referrer"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={() => setImgError(true)}
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            {/* Camera button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Change profile photo"
              style={{
                position: 'absolute', bottom: -6, right: -6,
                width: 26, height: 26, borderRadius: 8,
                background: T.sage, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = T.sandLight}
              onMouseLeave={e => e.currentTarget.style.background = T.sage}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T.forest} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </button>
          </div>

          {/* Preview notice */}
          {previewAvatar && (
            <div style={{
              position: 'relative', zIndex: 2,
              marginBottom: 8,
              fontSize: 10, color: T.sandLight,
              background: `${T.forestMid}90`,
              border: `1px solid ${T.sage}40`,
              padding: '3px 8px', borderRadius: 20,
              display: 'inline-block',
            }}>
              📷 Save karo apply karne ke liye
            </div>
          )}

          <p style={{ position: 'relative', zIndex: 2, fontFamily: 'Georgia, serif', fontSize: 15, fontWeight: 700, color: T.cream, marginBottom: 4 }}>
            {user?.name}
          </p>
          <p style={{ position: 'relative', zIndex: 2, fontSize: 11, color: T.sage }}>
            {user?.email}
          </p>

          {user?.provider === 'google' && (
            <div style={{
              position: 'relative', zIndex: 2,
              marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: 11, color: T.sand,
              background: `${T.forestMid}80`,
              border: `1px solid ${T.sage}40`,
              padding: '4px 10px', borderRadius: 20,
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google account
            </div>
          )}

          {/* Destination tags */}
          <div style={{ position: 'relative', zIndex: 2, marginTop: 24, borderTop: `1px solid ${T.sage}30`, paddingTop: 16 }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: T.sage, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Destinations
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {destinations.map((d, i) => (
                <div key={i} style={{
                  background: `${T.forestMid}80`,
                  border: `1px solid ${T.sage}40`,
                  borderRadius: 7, padding: '5px 6px',
                  fontSize: 11, fontWeight: 500,
                  color: T.sandLight, textAlign: 'center',
                }}>
                  {d}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Right column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Account Details card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            style={{
              background: T.cream,
              border: `1px solid ${T.sand}`,
              borderRadius: 16,
              padding: '22px 24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 17, fontWeight: 700, color: T.forest }}>
                Account Details
              </h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    fontSize: 12, fontWeight: 600, color: T.sage,
                    background: T.forestLight,
                    border: `1px solid ${T.sand}80`,
                    padding: '5px 13px', borderRadius: 7,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = T.sage; e.currentTarget.style.color = T.forest }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = `${T.sand}80`; e.currentTarget.style.color = T.sage }}
                >
                  <Edit3 size={13} /> Edit
                </button>
              )}
            </div>

            {/* Name */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: T.sage, display: 'flex', alignItems: 'center', gap: 5, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 5 }}>
                <User size={12} /> Full Name
              </label>
              {editing ? (
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 14px',
                    borderRadius: 8, border: `1px solid ${T.sand}`,
                    background: T.cream, color: T.forest,
                    fontSize: 14, fontFamily: 'system-ui, sans-serif',
                    outline: 'none', transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = T.sage}
                  onBlur={e => e.target.style.borderColor = T.sand}
                />
              ) : (
                <p style={{ fontSize: 14, color: T.forest, fontWeight: 500 }}>{user?.name}</p>
              )}
            </div>

            {/* Email */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: T.sage, display: 'flex', alignItems: 'center', gap: 5, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 5 }}>
                <Mail size={12} /> Email Address
              </label>
              <p style={{ fontSize: 14, color: T.sage }}>{user?.email}</p>
            </div>

            {/* Member since */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: T.sage, display: 'flex', alignItems: 'center', gap: 5, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 5 }}>
                <Calendar size={12} /> Member Since
              </label>
              <p style={{ fontSize: 14, color: T.sage }}>
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                  : 'Today'}
              </p>
            </div>

            <div style={{ height: 1, background: T.creamDeep, margin: '4px 0 14px' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <ShieldCheck size={14} color={T.sage} />
              <span style={{ fontSize: 12, color: T.sage }}>Your data is secure and never shared.</span>
            </div>

            {editing && (
              <div style={{ display: 'flex', alignItems: 'center', marginTop: 16 }}>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: T.forest, color: T.cream,
                    fontSize: 13, fontWeight: 600,
                    padding: '10px 18px', borderRadius: 8,
                    border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.6 : 1,
                    transition: 'background 0.15s', marginRight: 8,
                  }}
                  onMouseEnter={e => { if (!saving) e.currentTarget.style.background = T.forestMid }}
                  onMouseLeave={e => e.currentTarget.style.background = T.forest}
                >
                  {saving
                    ? <div style={{ width: 14, height: 14, border: `2px solid ${T.sage}`, borderTopColor: T.cream, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    : <><Save size={14} /> Save Changes</>
                  }
                </button>
                <button
                  onClick={() => { setEditing(false); setName(user?.name || ''); setPreviewAvatar(null) }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    background: 'transparent', color: T.sage,
                    fontSize: 13, fontWeight: 600,
                    padding: '10px 16px', borderRadius: 8,
                    border: `1px solid ${T.sand}`, cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = T.sage; e.currentTarget.style.color = T.forest }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.sand; e.currentTarget.style.color = T.sage }}
                >
                  Cancel
                </button>
              </div>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}
          >
            {stats.map((s, i) => (
              <div key={i} style={{
                background: T.creamDeep,
                border: `1px solid ${T.sand}80`,
                borderRadius: 12, padding: '16px 10px', textAlign: 'center',
              }}>
                <div style={{ color: i === 0 ? T.forestMid : i === 1 ? T.sage : T.sand, marginBottom: 6 }}>
                  {s.icon}
                </div>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: 24, fontWeight: 700, color: T.forest, marginBottom: 2 }}>
                  {s.value}
                </p>
                <p style={{ fontSize: 11, color: T.sage }}>{s.label}</p>
              </div>
            ))}
          </motion.div>

        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}