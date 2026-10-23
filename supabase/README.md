# Supabase Database Migration & Setup Guide

This directory contains the production-grade PostgreSQL migration for **VYBE Streaming Platform**.

## Migration File
- `migrations/20261024000000_init_auth_schema.sql`

## Tables Created
1. `public.profiles`: Stores user preferences (theme, preferred audio language), avatar, and username linked 1:1 with `auth.users`.
2. `public.watchlists`: Stores saved movies and TV series with metadata cache and per-user uniqueness.
3. `public.watch_history`: Stores playback timestamps, progress seconds, episode information, and completion status.

## Security & Row Level Security (RLS)
- RLS is enabled on all tables.
- Authenticated users can only read, insert, update, or delete records where `auth.uid() = id` or `auth.uid() = user_id`.
- Unauthenticated requests are rejected.
- Triggers automatically provision profile records when a new user signs up in `auth.users`.

## How to Apply to Your Supabase Project

### Option A: Supabase Web Dashboard (Easiest)
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project and navigate to the **SQL Editor** in the left sidebar.
3. Click **New query**, paste the entire contents of `migrations/20261024000000_init_auth_schema.sql`, and click **Run**.
4. The tables, triggers, indexes, and RLS policies are now active!

### Option B: Supabase CLI
```bash
# Link your project
npx supabase link --project-ref your-project-ref

# Apply migrations
npx supabase db push
```

## Connecting VYBE to Supabase
Add your Supabase credentials to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOi..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOi..." # Server-only, never exposed to client
```
