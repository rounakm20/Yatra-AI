# Yatra-AI Backend

Express.js API backend for the Yatra-AI travel planner.

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database & Auth**: Supabase (PostgreSQL)
- **AI**: Google Gemini 1.5 Flash
- **Maps**: Nominatim (geocoding), Overpass API (nearby places)
- **Routes**: OpenRouteService
- **Weather**: OpenWeatherMap

---

## Quick Start

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Configure environment
cp .env.example .env
# Fill in your API keys in .env

# 3. Run migrations (optional — needs Supabase)
npm run db:migrate

# 4. Start development server
npm run dev
# Server starts on http://localhost:3001
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: 3001) |
| `NODE_ENV` | No | development / production |
| `FRONTEND_URL` | Yes | Frontend URL for CORS |
| `JWT_SECRET` | Yes | Secret for JWT signing |
| `SUPABASE_URL` | No* | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | No* | Supabase service role key |
| `GEMINI_API_KEY` | No* | Google Gemini API key |
| `OPENWEATHER_API_KEY` | No* | OpenWeatherMap key |
| `ORS_API_KEY` | No* | OpenRouteService key |

*Falls back to mock data / local store when not set.

---

## API Reference

### Auth

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Create account |
| POST | `/auth/login` | — | Login with email/password |
| POST | `/auth/google` | — | Google OAuth login |
| GET | `/auth/profile` | ✅ | Get own profile |
| PATCH | `/auth/profile` | ✅ | Update profile |
| POST | `/auth/change-password` | ✅ | Change password |
| POST | `/auth/refresh` | ✅ | Refresh JWT token |

### Trip Generation

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/generate-trip` | Optional | Generate AI itinerary |

**Request body:**
```json
{
  "destination": "Jaipur",
  "days": 3,
  "budget": "mid-range",
  "budgetAmount": 2500,
  "travelMode": "car",
  "interests": ["history", "food", "photography"],
  "explorerMode": false,
  "travelers": 2
}
```

### Trips (CRUD)

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/trips/save` | ✅ | Save a generated trip |
| GET | `/trips` | ✅ | List all user trips |
| GET | `/trips/stats` | ✅ | Get user trip stats |
| GET | `/trips/:id` | Optional | Get trip by ID |
| GET | `/trips/share/:token` | — | Get shared trip |
| PATCH | `/trips/:id` | ✅ | Update trip |
| DELETE | `/trips/:id` | ✅ | Delete trip |

### Places

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/places/geocode?q=` | — | Geocode a destination |
| GET | `/places/reverse?lat=&lon=` | — | Reverse geocode |
| GET | `/places/nearby?lat=&lon=&radius=&types=` | — | Nearby places |
| GET | `/places/cafes?lat=&lon=` | — | Nearby cafes |
| GET | `/places/hotels?lat=&lon=` | — | Nearby hotels |
| GET | `/places/attractions?lat=&lon=` | — | Nearby attractions |
| POST | `/places/route` | — | Calculate route |

**Route request body:**
```json
{
  "waypoints": [
    { "lat": 26.9124, "lon": 75.7873 },
    { "lat": 26.9255, "lon": 75.8236 }
  ],
  "profile": "car"
}
```

### Weather

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/weather?lat=&lon=` | — | Weather by coordinates |
| GET | `/weather/city?q=` | — | Weather by city name |

---

## Folder Structure

```
backend/
├── src/
│   ├── index.js              # Express app & server
│   ├── config/
│   │   └── supabase.js       # Supabase client
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── trip.controller.js
│   │   ├── place.controller.js
│   │   └── weather.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js    # JWT authentication
│   │   ├── error.middleware.js   # Global error handler
│   │   └── validate.middleware.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── trip.routes.js
│   │   ├── place.routes.js
│   │   └── weather.routes.js
│   ├── services/
│   │   ├── ai.service.js       # Gemini AI + mock generator
│   │   ├── auth.service.js     # User auth + JWT
│   │   ├── places.service.js   # Geocoding + Overpass + ORS
│   │   ├── trip.service.js     # Trip CRUD + Supabase
│   │   └── weather.service.js  # OpenWeather
│   └── utils/
└── scripts/
    └── migrate.js            # Supabase DB setup
```

---

## Deploying to Render

1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repo
3. Set **Root Directory** to `backend`
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `npm start`
6. Add all environment variables in the Render dashboard
7. Set `FRONTEND_URL` to your Vercel frontend URL

---

## Development Notes

### Mock Mode
All external services gracefully degrade when API keys are absent:
- **No Gemini key** → Rich mock itinerary generated locally
- **No OpenWeather key** → Mock weather data returned
- **No Supabase** → In-memory Map used (data lost on restart)
- **No ORS key** → Straight-line route distances calculated

This means the backend runs fully out-of-the-box with zero API keys for development.

### Rate Limits
- Global: 200 requests / 15 min per IP
- AI generation: 20 requests / hour per IP
