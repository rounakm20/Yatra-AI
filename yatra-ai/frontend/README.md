# Yatra-AI 🌍 — AI-Powered Travel Planner

A premium AI travel planner built with React + Vite, Tailwind CSS, Framer Motion, and Leaflet maps.

## ✨ Features

- 🤖 **AI Trip Generation** — Gemini AI creates personalized itineraries
- 🗺️ **Interactive Maps** — React Leaflet with OpenStreetMap & custom markers
- 💎 **Explorer Mode** — Hidden gems, local cafes, secret spots
- ☀️ **Weather Intelligence** — OpenWeather API integration
- 💰 **Budget Planner** — Cost breakdowns for every category
- 📱 **Mobile Responsive** — Premium dark UI with glassmorphism
- 🔐 **Auth System** — Email/password + Google login (Supabase-ready)
- 💾 **Save & Share** — Persist trips to localStorage / Supabase

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and add your API keys
cp .env.example .env

# 3. Start dev server
npm run dev
```

App runs at **http://localhost:5173**

## 🔑 API Keys Setup

### Gemini AI (Required for real AI itineraries)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API key
3. Add to `.env`: `VITE_GEMINI_API_KEY=your_key`

### OpenWeather (Optional — weather data)
1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up and get free API key
3. Add to `.env`: `VITE_OPENWEATHER_KEY=your_key`

### Supabase (Optional — persistent auth & DB)
1. Create project at [supabase.com](https://supabase.com)
2. Add URL and anon key to `.env`

> **Without API keys**: App works fully with rich mock data — perfect for development!

## 📁 Project Structure

```
src/
├── components/
│   ├── common/       # Toaster notifications
│   ├── layout/       # Navbar
│   ├── map/          # TripMap (React Leaflet)
│   └── trip/         # TripCard
├── context/
│   ├── AuthContext   # Auth state (mock + Supabase-ready)
│   └── TripContext   # Trip state management
├── pages/
│   ├── LandingPage   # Hero, features, testimonials
│   ├── LoginPage     # Email + Google auth
│   ├── SignupPage    # Registration
│   ├── DashboardPage # User dashboard
│   ├── PlannerPage   # 4-step trip planner form
│   ├── TripResultPage# Generated itinerary view
│   ├── SavedTripsPage# Trip collection
│   └── ProfilePage   # User profile
├── utils/
│   └── api.js        # Gemini AI, geocoding, weather calls
└── styles/
    └── globals.css   # Tailwind + custom design system
```

## 🎨 Design System

- **Fonts**: Syne (display) + Outfit (body) + JetBrains Mono
- **Theme**: Deep space dark (#030712) with cyan/violet gradients
- **Components**: Glassmorphism cards, gradient borders, floating animations
- **Motion**: Framer Motion for page transitions and microinteractions

## 🏗️ Backend Setup (Node.js + Express)

The frontend is ready to connect to a backend. See backend routes needed:

```
POST /auth/login
POST /auth/signup  
POST /generate-trip    # Calls Gemini API server-side
POST /save-trip        # Saves to Supabase
GET  /get-trips/:userId
DELETE /delete-trip/:id
```

## 🌐 Deployment

**Frontend → Vercel**
```bash
npm run build
# Deploy dist/ folder to Vercel
```

**Backend → Render**
```bash
# Deploy Node.js/Express backend
# Set environment variables in Render dashboard
```

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS v3 |
| Animation | Framer Motion |
| Routing | React Router v6 |
| Maps | React Leaflet + OpenStreetMap |
| AI | Google Gemini API |
| Weather | OpenWeather API |
| Geocoding | Nominatim (OpenStreetMap) |
| Auth/DB | Supabase (ready to connect) |
| Icons | Lucide React |
