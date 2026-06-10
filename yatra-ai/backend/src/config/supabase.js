const { createClient } = require('@supabase/supabase-js')

let supabase = null

function getSupabase() {
  if (supabase) return supabase

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY

  if (!url || !key || url.startsWith('your_') || key.startsWith('your_')) {
    console.warn('⚠️  Supabase not configured — running in local (mock) mode')
    return null
  }

  supabase = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return supabase
}

module.exports = { getSupabase }
