-- ==============================================================================
-- VYBE Streaming Platform — Supabase / PostgreSQL Schema & RLS Policies
-- Migration: 20261024000000_init_auth_schema.sql
-- Description: Sets up user profiles, watchlists, watch history/progress,
--              automatic profile triggers, indexes, and strict Row Level Security (RLS).
-- ==============================================================================

-- 1. Enable Required Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ==============================================================================
-- 2. User Profiles Table
-- Linked 1:1 with Supabase auth.users. Automatically populated on signup.
-- ==============================================================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  username text unique,
  avatar_url text,
  preferred_language text default 'eng' check (preferred_language in ('eng', 'hindi', 'french')),
  preferred_theme text default 'dark' check (preferred_theme in ('dark', 'light')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table public.profiles is 'Public user profile records associated with auth.users';

-- ==============================================================================
-- 3. Watchlists Table
-- Stores user-bookmarked movies and TV series with metadata cache.
-- ==============================================================================
create table if not exists public.watchlists (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  tmdb_id integer not null check (tmdb_id > 0),
  media_type text not null check (media_type in ('movie', 'tv')),
  title text not null,
  poster_path text,
  backdrop_path text,
  vote_average numeric(3,1),
  release_year text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_user_watchlist unique (user_id, tmdb_id, media_type)
);

comment on table public.watchlists is 'User movie and TV series watchlists with per-user uniqueness';

-- ==============================================================================
-- 4. Watch History & Continue Watching Table
-- Stores watch timestamps, progress seconds, duration, season & episode for series.
-- ==============================================================================
create table if not exists public.watch_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  tmdb_id integer not null check (tmdb_id > 0),
  media_type text not null check (media_type in ('movie', 'tv')),
  title text not null,
  poster_path text,
  backdrop_path text,
  season integer default null check (season is null or season >= 1),
  episode integer default null check (episode is null or episode >= 1),
  progress_seconds integer default 0 not null check (progress_seconds >= 0),
  duration_seconds integer default null check (duration_seconds is null or duration_seconds >= 0),
  completed boolean default false not null,
  last_watched_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table public.watch_history is 'Playback timestamps and watch progress for Continue Watching and History';

-- Create unique index to handle nulls in season/episode for movies
create unique index if not exists unique_user_watch_item_idx
  on public.watch_history (user_id, tmdb_id, media_type, coalesce(season, 0), coalesce(episode, 0));

-- ==============================================================================
-- 5. Performance Indexes
-- Optimize frequent queries: user history sorted by recency, user watchlist by date.
-- ==============================================================================
create index if not exists idx_profiles_username on public.profiles (username);
create index if not exists idx_watchlists_user_created on public.watchlists (user_id, created_at desc);
create index if not exists idx_watchlists_lookup on public.watchlists (user_id, tmdb_id, media_type);
create index if not exists idx_watch_history_user_last_watched on public.watch_history (user_id, last_watched_at desc);
create index if not exists idx_watch_history_lookup on public.watch_history (user_id, tmdb_id, media_type);

-- ==============================================================================
-- 6. Trigger: Automatic Profile Creation on auth.users Signup
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  default_username text;
begin
  default_username := coalesce(
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1)
  );

  insert into public.profiles (id, email, username, avatar_url, preferred_language, preferred_theme)
  values (
    new.id,
    new.email,
    default_username,
    coalesce(new.raw_user_meta_data->>'avatar_url', null),
    coalesce(new.raw_user_meta_data->>'preferred_language', 'eng'),
    coalesce(new.raw_user_meta_data->>'preferred_theme', 'dark')
  )
  on conflict (id) do update set
    email = excluded.email,
    updated_at = timezone('utc'::text, now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger for updating profiles.updated_at
create or replace function public.update_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists on_profile_updated on public.profiles;
create trigger on_profile_updated
  before update on public.profiles
  for each row execute procedure public.update_profiles_updated_at();

-- ==============================================================================
-- 7. Row Level Security (RLS) Policies
-- Strict isolation: authenticated users can ONLY read and write their own records.
-- ==============================================================================

-- Enable RLS on all public tables
alter table public.profiles enable row level security;
alter table public.watchlists enable row level security;
alter table public.watch_history enable row level security;

-- Profiles Policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Watchlists Policies
create policy "Users can view own watchlist"
  on public.watchlists for select
  using (auth.uid() = user_id);

create policy "Users can add to own watchlist"
  on public.watchlists for insert
  with check (auth.uid() = user_id);

create policy "Users can delete from own watchlist"
  on public.watchlists for delete
  using (auth.uid() = user_id);

-- Watch History Policies
create policy "Users can view own watch history"
  on public.watch_history for select
  using (auth.uid() = user_id);

create policy "Users can insert own watch history"
  on public.watch_history for insert
  with check (auth.uid() = user_id);

create policy "Users can update own watch history"
  on public.watch_history for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own watch history"
  on public.watch_history for delete
  using (auth.uid() = user_id);
