/**
 * Run this once to create the required Supabase tables.
 * Usage: node scripts/migrate.js
 */

require('dotenv').config({ path: '../.env' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const SQL = `
-- ── Users ──────────────────────────────────────────────────────────────────
create table if not exists public.users (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text unique not null,
  password_hash text,
  provider      text not null default 'email',
  avatar        text,
  bio           text,
  preferences   jsonb default '{}',
  trips_count   integer default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- RLS
alter table public.users enable row level security;
create policy "Users can read own profile"
  on public.users for select using (auth.uid()::text = id::text);
create policy "Users can update own profile"
  on public.users for update using (auth.uid()::text = id::text);

-- ── Trips ──────────────────────────────────────────────────────────────────
create table if not exists public.trips (
  id            text primary key,
  user_id       uuid not null references public.users(id) on delete cascade,
  title         text not null,
  destination   text not null,
  days          integer not null,
  budget        text,
  travel_mode   text,
  interests     text[] default '{}',
  explorer_mode boolean default false,
  travelers     integer default 2,
  trip_data     jsonb,
  itinerary     jsonb,
  thumbnail     text,
  share_token   text unique,
  is_public     boolean default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index if not exists trips_user_id_idx on public.trips(user_id);
create index if not exists trips_share_token_idx on public.trips(share_token);
create index if not exists trips_created_at_idx on public.trips(created_at desc);

-- RLS
alter table public.trips enable row level security;
create policy "Users can CRUD own trips"
  on public.trips for all using (auth.uid()::text = user_id::text);
create policy "Anyone can read public trips"
  on public.trips for select using (is_public = true);

-- ── Update timestamps trigger ───────────────────────────────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at_users
  before update on public.users
  for each row execute procedure update_updated_at();

create trigger set_updated_at_trips
  before update on public.trips
  for each row execute procedure update_updated_at();
`

async function migrate() {
  console.log('🗄️  Running Yatra-AI database migrations...\n')

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env')
    process.exit(1)
  }

  try {
    const { error } = await supabase.rpc('exec_sql', { sql: SQL })
    if (error) {
      // Try running statements individually
      console.log('ℹ️  Attempting statement-by-statement migration...')
      const statements = SQL.split(';').map(s => s.trim()).filter(Boolean)
      let success = 0
      for (const stmt of statements) {
        try {
          await supabase.rpc('exec_sql', { sql: stmt + ';' })
          success++
        } catch {}
      }
      console.log(`✅ Applied ${success}/${statements.length} statements`)
    } else {
      console.log('✅ All migrations applied successfully')
    }
  } catch (err) {
    console.error('Migration error:', err.message)
    console.log('\n📋 Please run this SQL manually in your Supabase SQL editor:')
    console.log('─'.repeat(60))
    console.log(SQL)
    console.log('─'.repeat(60))
  }
}

migrate()
