import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { TripProvider } from './context/TripContext'
import { ModeProvider } from './context/ModeContext'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import PlannerPage from './pages/PlannerPage'
import TripResultPage from './pages/TripResultPage'
import SavedTripsPage from './pages/SavedTripsPage'
import ProfilePage from './pages/ProfilePage'

import Navbar from './components/layout/Navbar'
import { Toaster } from './components/common/Toaster'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  if (!user) return <Navigate to="/login" replace />
  return children
}

function PageLoader() {
  return (
    <div className="min-h-screen page-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
        <p className="text-slate-400 font-body text-sm">Loading Yatra-AI...</p>
      </div>
    </div>
  )
}

function AppContent() {
  return (
    <div className="min-h-screen page-bg">
      <div className="noise-overlay" />
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/planner" element={<ProtectedRoute><PlannerPage /></ProtectedRoute>} />
        <Route path="/trip/:id" element={<ProtectedRoute><TripResultPage /></ProtectedRoute>} />
        <Route path="/saved" element={<ProtectedRoute><SavedTripsPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </div>
  )
}

export default function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <ModeProvider>
          <TripProvider>
            <AppContent />
          </TripProvider>
        </ModeProvider>
      </AuthProvider>
    </Router>
  )
}