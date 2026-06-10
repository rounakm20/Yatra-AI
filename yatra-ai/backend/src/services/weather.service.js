const axios = require('axios')

const OPENWEATHER_KEY = process.env.OPENWEATHER_API_KEY

async function fetchWeatherByCoords(lat, lon) {
  if (!OPENWEATHER_KEY) {
    return getMockWeather(lat, lon)
  }

  try {
    const [current, forecast] = await Promise.all([
      axios.get('https://api.openweathermap.org/data/2.5/weather', {
        params: { lat, lon, appid: OPENWEATHER_KEY, units: 'metric' },
      }),
      axios.get('https://api.openweathermap.org/data/2.5/forecast', {
        params: { lat, lon, appid: OPENWEATHER_KEY, units: 'metric', cnt: 40 },
      }),
    ])

    const w = current.data
    const forecasts = processForecast(forecast.data.list)

    return {
      current: {
        temp: Math.round(w.main.temp),
        feels_like: Math.round(w.main.feels_like),
        temp_min: Math.round(w.main.temp_min),
        temp_max: Math.round(w.main.temp_max),
        humidity: w.main.humidity,
        pressure: w.main.pressure,
        description: w.weather[0].description,
        icon: w.weather[0].icon,
        icon_url: `https://openweathermap.org/img/wn/${w.weather[0].icon}@2x.png`,
        wind_speed: w.wind.speed,
        wind_direction: w.wind.deg,
        visibility: w.visibility,
        clouds: w.clouds.all,
        sunrise: new Date(w.sys.sunrise * 1000).toISOString(),
        sunset: new Date(w.sys.sunset * 1000).toISOString(),
        city: w.name,
        country: w.sys.country,
      },
      forecast: forecasts,
      travelAdvice: buildTravelAdvice(w),
    }
  } catch (err) {
    console.error('OpenWeather API error:', err.message)
    return getMockWeather(lat, lon)
  }
}

async function fetchWeatherByCity(city) {
  if (!OPENWEATHER_KEY) {
    return getMockWeather(0, 0, city)
  }
  try {
    const res = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: { q: city, appid: OPENWEATHER_KEY, units: 'metric' },
    })
    const w = res.data
    return {
      current: {
        temp: Math.round(w.main.temp),
        feels_like: Math.round(w.main.feels_like),
        humidity: w.main.humidity,
        description: w.weather[0].description,
        icon: w.weather[0].icon,
        icon_url: `https://openweathermap.org/img/wn/${w.weather[0].icon}@2x.png`,
        wind_speed: w.wind.speed,
        city: w.name,
        country: w.sys.country,
      },
      travelAdvice: buildTravelAdvice(w),
    }
  } catch (err) {
    console.error('Weather by city error:', err.message)
    return getMockWeather(0, 0, city)
  }
}

function processForecast(list) {
  // Group by day, take one reading per day (noon closest)
  const byDay = {}
  for (const item of list) {
    const date = item.dt_txt.split(' ')[0]
    const hour = parseInt(item.dt_txt.split(' ')[1])
    if (!byDay[date] || Math.abs(hour - 12) < Math.abs(byDay[date].hour - 12)) {
      byDay[date] = { ...item, hour }
    }
  }
  return Object.entries(byDay).slice(0, 7).map(([date, item]) => ({
    date,
    temp_max: Math.round(item.main.temp_max),
    temp_min: Math.round(item.main.temp_min),
    description: item.weather[0].description,
    icon: item.weather[0].icon,
    icon_url: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
    pop: Math.round((item.pop || 0) * 100), // probability of precipitation
    humidity: item.main.humidity,
  }))
}

function buildTravelAdvice(w) {
  const advice = []
  const temp = w.main.temp
  const desc = w.weather[0].main.toLowerCase()

  if (temp > 35) advice.push('Extreme heat — carry water, wear light clothes, avoid midday outdoor activity')
  else if (temp > 28) advice.push('Warm weather — stay hydrated and apply sunscreen regularly')
  else if (temp < 10) advice.push('Cool weather — pack warm layers, especially for evenings')
  else if (temp < 0) advice.push('Freezing — heavy winter gear essential, watch for icy paths')
  else advice.push('Pleasant temperatures — ideal conditions for outdoor exploration')

  if (desc.includes('rain') || desc.includes('drizzle')) advice.push('Rain expected — carry an umbrella or light rain jacket')
  if (desc.includes('storm') || desc.includes('thunder')) advice.push('Thunderstorms possible — avoid open areas and high ground')
  if (desc.includes('snow')) advice.push('Snow conditions — wear waterproof boots and non-slip footwear')
  if (desc.includes('fog') || desc.includes('mist')) advice.push('Low visibility — drive carefully and allow extra travel time')
  if (w.wind && w.wind.speed > 10) advice.push('Strong winds — secure loose items and check coastal advisories')

  return advice
}

function getMockWeather(lat, lon, city = 'Your destination') {
  const conditions = [
    { description: 'clear sky', icon: '01d', temp: 28 },
    { description: 'few clouds', icon: '02d', temp: 26 },
    { description: 'scattered clouds', icon: '03d', temp: 24 },
    { description: 'light rain', icon: '10d', temp: 22 },
    { description: 'partly cloudy', icon: '02d', temp: 27 },
  ]
  const c = conditions[Math.floor(Math.random() * conditions.length)]
  const base = c.temp + Math.floor(Math.random() * 6)
  return {
    current: {
      temp: base,
      feels_like: base - 2,
      temp_min: base - 4,
      temp_max: base + 4,
      humidity: 45 + Math.floor(Math.random() * 35),
      description: c.description,
      icon: c.icon,
      icon_url: `https://openweathermap.org/img/wn/${c.icon}@2x.png`,
      wind_speed: +(1 + Math.random() * 5).toFixed(1),
      city,
    },
    forecast: Array.from({ length: 5 }, (_, i) => {
      const fc = conditions[Math.floor(Math.random() * conditions.length)]
      const d = new Date()
      d.setDate(d.getDate() + i + 1)
      return {
        date: d.toISOString().split('T')[0],
        temp_max: fc.temp + Math.floor(Math.random() * 5),
        temp_min: fc.temp - Math.floor(Math.random() * 5),
        description: fc.description,
        icon: fc.icon,
        icon_url: `https://openweathermap.org/img/wn/${fc.icon}@2x.png`,
        pop: Math.floor(Math.random() * 60),
        humidity: 40 + Math.floor(Math.random() * 40),
      }
    }),
    travelAdvice: ['Pleasant weather expected — great conditions for exploring'],
  }
}

module.exports = { fetchWeatherByCoords, fetchWeatherByCity }
