# 🌍 Yatra-AI — AI-Powered Travel Planner

A full-stack AI travel planning web app. Enter a destination, preferences, and budget — get a complete itinerary with maps, routes, weather, hidden gems, and day-by-day plans.

---

## 📁 Project Structure

```
yatra-ai/
├── frontend/          # React + Vite + Tailwind
└── backend/           # Express + Supabase + Gemini
```

---

## ⚡ Quick Start (Local Dev)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Add your API keys to .env (see below)
npm run dev
# → Running on http://localhost:3001
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:3001
npm run dev
# → Running on http://localhost:5173
```

---

## 🔑 API Keys Required

### Backend (.env)

| Key | Where to get it | Required? |
|---|---|---|
| `JWT_SECRET` | Any random 32+ char string | ✅ Yes |
| `GEMINI_API_KEY` | [Google AI Studio](https://makersuite.google.com/app/apikey) | Recommended |
| `OPENWEATHER_API_KEY` | [OpenWeatherMap](https://openweathermap.org/api) | Recommended |
| `ORS_API_KEY` | [OpenRouteService](https://openrouteservice.org/) | Optional |
| `SUPABASE_URL` | [Supabase](https://supabase.com) project settings | Optional |
| `SUPABASE_SERVICE_KEY` | Supabase → Settings → API | Optional |

> **No keys needed to run** — everything degrades gracefully to mock data.

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3001
VITE_OPENWEATHER_KEY=your_key   # optional, backend handles this
VITE_GEMINI_API_KEY=your_key    # optional, backend handles this
```

---

## 🗄️ Database Setup (Supabase)

1. Create a project at [supabase.com](https://supabase.com)
2. Copy your `Project URL` and `service_role` key to backend `.env`
3. Run migrations:
   ```bash
   cd backend
   npm run db:migrate
   ```
   Or paste the SQL from `scripts/migrate.js` into the Supabase SQL editor.

---

## 🚀 Deployment

### Backend → Render

1. New Web Service → connect GitHub repo
2. Root Directory: `backend`
3. Build: `npm install`  |  Start: `npm start`
4. Add all env vars in Render dashboard
5. Copy the service URL (e.g. `https://yatra-ai.onrender.com`)

### Frontend → Vercel

1. Import repo → Framework: Vite
2. Root Directory: `frontend`
3. Add env var: `VITE_API_URL=https://your-render-url.onrender.com`
4. Deploy

---

## 🛠️ API Overview

```
POST  /auth/register          Sign up
POST  /auth/login             Login
POST  /auth/google            Google OAuth
GET   /auth/profile           Get profile (auth required)
PATCH /auth/profile           Update profile (auth required)

POST  /generate-trip          Generate AI itinerary
POST  /trips/save             Save a trip (auth required)
GET   /trips                  List saved trips (auth required)
GET   /trips/:id              Get trip by ID
GET   /trips/share/:token     Get public shared trip
PATCH /trips/:id              Update trip (auth required)
DELETE /trips/:id             Delete trip (auth required)
GET   /trips/stats            Trip statistics (auth required)

GET   /places/geocode?q=      Geocode destination
GET   /places/nearby?lat=&lon= Nearby places
GET   /places/cafes           Nearby cafes
GET   /places/hotels          Nearby hotels
GET   /places/attractions     Nearby attractions
POST  /places/route           Calculate route

GET   /weather?lat=&lon=      Weather by coordinates
GET   /weather/city?q=        Weather by city
```

---

## 🧩 Architecture

```
Browser (React)
    │
    ├── /generate-trip  ──→  Backend
    │                            ├── Nominatim (geocode)
    │                            ├── OpenWeather (weather)
    │                            ├── Gemini API (AI itinerary)
    │                            └── Returns full itinerary JSON
    │
    ├── /trips/*  ──→  Backend ──→  Supabase (PostgreSQL)
    │
    └── Map display  ──→  React Leaflet + OpenStreetMap (client-side)
```

---

## ✨ Features

- 🤖 **Gemini AI** itinerary generation with structured JSON output
- 🗺️ **Interactive maps** with day-wise route polylines (React Leaflet)
- 🌤️ **Live weather** integration with travel advice
- 💎 **Explorer vs Tourist** mode for hidden gems vs iconic spots
- 💰 **Budget planner** with accommodation/food/transport breakdowns
- 📍 **Nearby places** via OpenStreetMap Overpass API
- 🔐 **Auth** with email/password + Google OAuth, JWT sessions
- 💾 **Save & share trips** with unique share links
- 📱 **Mobile responsive** with dark mode glassmorphism UI
- 🔄 **Full fallback** — works without any API keys (mock mode)
