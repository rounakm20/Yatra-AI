import React, { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  Compass, Map, Sparkles, CloudSun,
  Gem, Route, ChevronRight, Camera, Coffee,
  DollarSign, ArrowRight
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const T = {
  cream:     '#FAF7F0',
  creamDeep: '#F0EAD6',
  creamCard: '#EDE5CC',
  ink:       '#1C1917',
  forest:    '#1E3A2F',
  forestMid: '#2D5A40',
  forestLight:'#E8F0EB',
  sage:      '#7A9E87',
  sand:      '#C9B99A',
  sandLight: '#E8DFC8',
  rust:      '#A0522D',
}

const DESTINATIONS = [
  '🏔️ Manali', '🌊 Goa', '🏯 Jaipur', '🌿 Kerala',
  '🕌 Varanasi', '❄️ Ladakh', '🏝️ Andaman', '🌁 Coorg',
  '🌄 Darjeeling', '🏖️ Pondicherry', '🦁 Ranthambore', '🛕 Hampi',
]

const FEATURES = [
  { icon: Sparkles,   title: 'AI Itineraries',       desc: 'Gemini AI builds your full day-by-day plan — tailored to your pace, budget, and style.' },
  { icon: Map,        title: 'Interactive Maps',      desc: 'See your entire journey visualized on a live map with routes and place pins.' },
  { icon: Gem,        title: 'Hidden Gems',           desc: 'Local cafes, secret viewpoints, and off-the-beaten-path spots tourists never find.' },
  { icon: CloudSun,   title: 'Live Weather',          desc: 'Real-time forecasts shape your itinerary so every day is perfectly timed.' },
  { icon: DollarSign, title: 'Budget Breakdown',      desc: 'Transparent cost estimates for stays, food, transport, and activities.' },
  { icon: Route,      title: 'Route Optimizer',       desc: 'Smart sequencing so you see the most with the least backtracking.' },
  { icon: Camera,     title: 'Photo Spots',           desc: 'Golden hour timings and best angles for every destination on your route.' },
  { icon: Coffee,     title: 'Food Trail',            desc: 'Street food, local thalis, rooftop cafes — authentic eats curated by AI.' },
]

const STEPS = [
  {
    num: '01',
    title: 'Describe your dream trip',
    desc: 'Tell us where you want to go, how many days, your budget, and your travel style — tourist highlights or off-grid explorer.',
    detail: 'Takes less than a minute',
  },
  {
    num: '02',
    title: 'AI builds your itinerary',
    desc: 'Gemini AI crafts a complete plan — day-wise schedule, map routes, weather context, hidden gems, and a full cost breakdown.',
    detail: 'Ready in seconds',
  },
  {
    num: '03',
    title: 'Explore, save & go',
    desc: 'Browse your interactive map, tweak anything you like, save the trip, and share it with whoever is coming along.',
    detail: 'Your trip, your way',
  },
]

function FadeIn({ children, delay = 0, className = '', style = {} }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 22 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      style={style}>
      {children}
    </motion.div>
  )
}

export default function LandingPage() {
  const { user } = useAuth()
  const [hoveredStep, setHoveredStep] = useState(null)

  return (
    <div style={{ background: T.cream, color: T.ink, overflowX: 'hidden', fontFamily: 'Georgia, "Times New Roman", serif' }}>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', position: 'relative', overflow: 'hidden' }}>

        {/* Soft green blob top-left */}
        <div style={{ position: 'absolute', top: '5%', left: '-5%', width: 400, height: 400, borderRadius: '50%', background: `radial-gradient(circle, ${T.forestLight}CC, transparent 70%)`, pointerEvents: 'none' }} />
        {/* Warm sand blob bottom-right */}
        <div style={{ position: 'absolute', bottom: '5%', right: '-8%', width: 360, height: 360, borderRadius: '50%', background: `radial-gradient(circle, ${T.sandLight}CC, transparent 70%)`, pointerEvents: 'none' }} />

        {/* Eyebrow */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, position: 'relative' }}>
          <div style={{ width: 24, height: 1.5, background: T.sage }} />
          <span style={{ fontSize: 11, fontFamily: 'system-ui, sans-serif', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: T.sage }}>
            AI-Powered Travel Planning
          </span>
          <div style={{ width: 24, height: 1.5, background: T.sage }} />
        </motion.div>

        {/* Headline */}
        <motion.h1 initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontSize: 'clamp(2.6rem, 7vw, 5rem)',
            fontWeight: 700, lineHeight: 1.08,
            color: T.forest, textAlign: 'center',
            letterSpacing: '-0.02em', maxWidth: 800,
            position: 'relative', margin: 0,
          }}>
          Your next adventure,<br />
          <em style={{ fontStyle: 'italic', color: T.forestMid }}>planned in seconds.</em>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
          style={{
            fontFamily: 'system-ui, sans-serif', fontSize: '1rem',
            color: T.sage, textAlign: 'center', maxWidth: 480,
            lineHeight: 1.75, marginTop: 20, position: 'relative',
          }}>
          Yatra-AI crafts complete, personalized itineraries with interactive maps,
          live weather, smart budgets, and local secrets — all in one click.
        </motion.p>

        {/* CTAs */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.52 }}
          style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 28, justifyContent: 'center', position: 'relative' }}>
          <Link to={user ? '/planner' : '/signup'}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: T.forest, color: T.cream,
              padding: '13px 28px', borderRadius: 8,
              fontFamily: 'system-ui, sans-serif', fontWeight: 600, fontSize: 15,
              textDecoration: 'none', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = T.forestMid; e.currentTarget.style.transform = 'scale(1.02)' }}
            onMouseLeave={e => { e.currentTarget.style.background = T.forest; e.currentTarget.style.transform = 'scale(1)' }}>
            <Sparkles size={16} /> Plan My Trip <ChevronRight size={15} />
          </Link>
          <Link to={user ? '/saved' : '/login'}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'transparent', color: T.forest,
              padding: '12px 26px', borderRadius: 8,
              fontFamily: 'system-ui, sans-serif', fontWeight: 600, fontSize: 15,
              border: `1.5px solid ${T.sand}`,
              textDecoration: 'none', transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = T.creamDeep}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <Map size={16} /> See Sample Trip
          </Link>
        </motion.div>

        {/* Scroll hint */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          style={{ position: 'absolute', bottom: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: 'system-ui, sans-serif', fontSize: 11, color: T.sand, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Scroll</span>
          <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            <ChevronRight size={14} style={{ color: T.sand, transform: 'rotate(90deg)' }} />
          </motion.div>
        </motion.div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section style={{ background: T.creamDeep, padding: '100px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>

          <FadeIn style={{ textAlign: 'center', marginBottom: 64 }}>
            <span style={{ fontFamily: 'system-ui, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: T.sage }}>
              Everything Included
            </span>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, color: T.forest, marginTop: 12, lineHeight: 1.15, letterSpacing: '-0.02em' }}>
              Travel smarter,<br /><em style={{ fontStyle: 'italic' }}>not harder.</em>
            </h2>
          </FadeIn>

          {/* Feature rows — alternating text alignment, no boxes */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 0 }}>
            {FEATURES.map((f, i) => {
              const Icon = f.icon
              const isRightCol = i % 2 === 1
              const borderRight = !isRightCol ? `1px solid ${T.sand}50` : 'none'
              const borderBottom = i < FEATURES.length - 2 ? `1px solid ${T.sand}50` : 'none'
              return (
                <FadeIn key={i} delay={i * 0.05}>
                  <div
                    style={{
                      padding: '36px 32px',
                      borderRight, borderBottom,
                      display: 'flex', flexDirection: 'column', gap: 12,
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = T.sandLight + '80'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <Icon size={22} strokeWidth={1.5} style={{ color: T.forestMid }} />
                    <h3 style={{ fontFamily: 'system-ui, sans-serif', fontWeight: 700, fontSize: 15, color: T.forest, margin: 0 }}>{f.title}</h3>
                    <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: 13.5, color: T.sage, lineHeight: 1.75, margin: 0 }}>{f.desc}</p>
                  </div>
                </FadeIn>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section style={{ background: T.cream, padding: '100px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <FadeIn style={{ marginBottom: 72 }}>
            <span style={{ fontFamily: 'system-ui, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: T.sage, display: 'block', marginBottom: 12 }}>
              How It Works
            </span>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, color: T.forest, lineHeight: 1.15, letterSpacing: '-0.02em', margin: 0 }}>
              From idea to itinerary<br /><em style={{ fontStyle: 'italic' }}>in three steps.</em>
            </h2>
          </FadeIn>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {STEPS.map((s, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div
                  onMouseEnter={() => setHoveredStep(i)}
                  onMouseLeave={() => setHoveredStep(null)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '56px 1fr',
                    gap: '0 32px',
                    padding: '40px 0',
                    borderBottom: i < STEPS.length - 1 ? `1px solid ${T.sand}60` : 'none',
                    cursor: 'default',
                    transition: 'all 0.2s',
                  }}>

                  {/* Step number — magazine editorial style */}
                  <div style={{ paddingTop: 4 }}>
                    <span style={{
                      fontFamily: 'Georgia, serif',
                      fontStyle: 'italic',
                      fontSize: 'clamp(2.4rem, 5vw, 3.2rem)',
                      fontWeight: 700,
                      color: hoveredStep === i ? T.forestMid : T.sand,
                      lineHeight: 1,
                      transition: 'color 0.25s',
                      display: 'block',
                    }}>
                      {s.num}
                    </span>
                  </div>

                  {/* Content */}
                  <div>
                    <p style={{
                      fontFamily: 'system-ui, sans-serif',
                      fontSize: 11, fontWeight: 700,
                      letterSpacing: '0.14em', textTransform: 'uppercase',
                      color: T.sage, marginBottom: 10,
                    }}>
                      {s.detail}
                    </p>
                    <h3 style={{
                      fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
                      fontWeight: 700, color: T.forest,
                      marginBottom: 12, lineHeight: 1.2,
                      letterSpacing: '-0.01em',
                    }}>
                      {s.title}
                    </h3>
                    <p style={{
                      fontFamily: 'system-ui, sans-serif',
                      fontSize: 14.5, color: T.sage,
                      lineHeight: 1.8, margin: 0, maxWidth: 500,
                    }}>
                      {s.desc}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section style={{ background: T.forest, padding: '100px 24px' }}>
        <FadeIn>
          <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
            {/* Decorative compass */}
            <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                border: `1.5px solid ${T.sage}60`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Compass size={24} style={{ color: T.sand }} />
              </div>
            </div>

            <h2 style={{
              fontSize: 'clamp(2rem, 5vw, 3.2rem)',
              fontWeight: 700, color: T.cream,
              lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 16,
            }}>
              Ready to explore<br /><em style={{ fontStyle: 'italic', color: T.sand }}>something new?</em>
            </h2>
            <p style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: 15, color: T.sage,
              lineHeight: 1.8, maxWidth: 420, margin: '0 auto 36px',
            }}>
              Join thousands of travelers who plan smarter, discover more, and travel without the stress.
            </p>

            <Link to={user ? '/planner' : '/signup'}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: T.cream, color: T.forest,
                padding: '15px 34px', borderRadius: 8,
                fontFamily: 'system-ui, sans-serif', fontWeight: 700, fontSize: 15,
                textDecoration: 'none', transition: 'all 0.2s', letterSpacing: '0.01em',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = T.creamDeep; e.currentTarget.style.transform = 'scale(1.03)' }}
              onMouseLeave={e => { e.currentTarget.style.background = T.cream; e.currentTarget.style.transform = 'scale(1)' }}>
              <Sparkles size={16} />
              {user ? 'Plan a New Trip' : 'Start for Free'}
              <ArrowRight size={15} />
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer style={{ background: T.creamDeep, borderTop: `1px solid ${T.sand}50`, padding: '36px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: T.forest, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Compass size={14} color={T.cream} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 18, color: T.forest, letterSpacing: '-0.01em' }}>Yatra<span style={{ color: T.sage }}>-AI</span></span>
          </div>
          <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: 12, color: T.sage }}>© 2025 Yatra-AI. Built with ❤️ for explorers.</p>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy', 'Terms', 'Contact'].map(l => (
              <span key={l} style={{ fontFamily: 'system-ui, sans-serif', fontSize: 13, color: T.sage, cursor: 'pointer', transition: 'color 0.15s' }}
                onMouseEnter={e => e.target.style.color = T.forest}
                onMouseLeave={e => e.target.style.color = T.sage}>{l}</span>
            ))}
          </div>
        </div>
      </footer>

    </div>
  )
}