# VYBE — Technical Architecture Document
**Target Stack:** Next.js (App Router, Node.js 20+), TypeScript, Tailwind CSS, Supabase (PostgreSQL + Auth), TMDB API, ScreenScape Embed  
**Phase:** Phase 0 — Blueprint Specification

---

## 1. System Overview & Component Topology

```
+-------------------------------------------------------------------------------------------------------+
|                                              CLIENT BROWSER                                           |
|                                                                                                       |
|   +-----------------------------------------------------------------------------------------------+   |
|   |                                         VYBE Front-End                                        |   |
|   |                                                                                               |   |
|   |  +------------------+  +-------------------+  +--------------------+  +--------------------+  |   |
|   |  | Navbar & Sidebar |  | Catalog & Sliders |  | Title Detail Modal |  | Watch & TV Drawer  |  |   |
|   |  +------------------+  +-------------------+  +--------------------+  +--------------------+  |   |
|   |                                                                                               |   |
|   |  +------------------+  +-------------------+  +--------------------+  +--------------------+  |   |
|   |  | Theme Controller |  | Local State / Sync|  |   Auth State Hook  |  |  PostMessage Bridge|  |   |
|   |  +------------------+  +-------------------+  +--------------------+  +---------+----------+  |   |
|   +---------------------------------------------------------------------------------|-------------+   |
|                                                                                     |                 |
|                                                                      postMessage    | postMessage     |
|                                                                         requests    | events          |
|                                                                                     v                 |
|                                                   +-----------------------------------------------+   |
|                                                   |     Isolated ScreenScape Embed Iframe         |   |
|                                                   |   (https://web.screenscape.fun/embed?...)      |   |
|                                                   +-----------------------------------------------+   |
+-------------------------------------------------------------|-----------------------------------------+
                                                              |
                                                    Server Actions / HTTP
                                                              v
+-------------------------------------------------------------------------------------------------------+
|                                          NEXT.JS APP SERVER (Node.js)                                 |
|                                                                                                       |
|   +--------------------------------------+            +-------------------------------------------+   |
|   |      Metadata Route Handlers         |            |         Supabase Server Client            |   |
|   |    (/api/movies, /api/tv, /api/search) |            |     (Server Actions / Session Token)      |   |
|   +------------------+-------------------+            +---------------------+---------------------+   |
+----------------------|------------------------------------------------------|-------------------------+
                       |                                                      |
                       v                                                      v
      +----------------------------------+                   +----------------------------------+
      |             TMDB API             |                   |       SUPABASE CLOUD / DB        |
      |   (api.themoviedb.org/3)         |                   |      - PostgreSQL Database       |
      |   - Server-side response cache   |                   |      - Row Level Security (RLS)  |
      |   - Posters, backdrops, cast     |                   |      - GoTrue Auth Service       |
      +----------------------------------+                   +----------------------------------+
```

---

## 2. Directory & Route Hierarchy (Next.js App Router)

```
/Users/himanshu/Downloads/movie website
├── .env.example
├── .gitignore
├── PROJECT_PLAN.md
├── ARCHITECTURE.md
├── IMPLEMENTATION_STATUS.md
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── public/
│   ├── favicon.ico
│   ├── logo.svg
│   └── icons/
└── src/
    ├── app/
    │   ├── layout.tsx                # Root layout: ThemeProvider, QueryProvider, AuthProvider
    │   ├── page.tsx                  # Home: Hero, Trending, Categories, Top Rated
    │   ├── globals.css               # Tailwind CSS variables (dark & light tokens)
    │   ├── browse/
    │   │   └── page.tsx              # Advanced Browse & Filtering (Movies, Series, Anime, Genres)
    │   ├── search/
    │   │   └── page.tsx              # Deep search results page
    │   ├── watch/
    │   │   └── [type]/               # "movie" or "tv"
    │   │       └── [id]/
    │   │           └── page.tsx      # Player suite: iframe, TV episode selector, details & recs
    │   ├── watchlist/
    │   │   └── page.tsx              # Bookmarked media grid
    │   ├── history/
    │   │   └── page.tsx              # Full watch history & progress management
    │   └── api/
    │       ├── tmdb/
    │       │   ├── trending/route.ts
    │       │   ├── search/route.ts
    │       │   ├── details/route.ts
    │       │   └── tv-season/route.ts
    │       └── sync/
    │           └── progress/route.ts
    ├── components/
    │   ├── layout/
    │   │   ├── Navbar.tsx            # Sticky top bar with logo, search trigger, theme toggle, profile
    │   │   ├── Sidebar.tsx           # Collapsible YouTube-style left navigation rail
    │   │   └── Footer.tsx            # Links, disclaimer, copyright
    │   ├── player/
    │   │   ├── ScreenScapePlayer.tsx # Core iframe wrapper, fullscreen control, sandboxing
    │   │   ├── TvEpisodeDrawer.tsx   # Season tabs + horizontal/grid episode selector
    │   │   ├── PlayerControls.tsx    # Theater mode toggle, server reload, language selector
    │   │   └── PostMessageBridge.ts  # Typed listener and dispatch utility for ScreenScape events
    │   ├── media/
    │   │   ├── MediaCard.tsx         # Movie/TV poster with hover preview, rating, quick bookmark
    │   │   ├── MediaRow.tsx          # Smooth horizontal scrolling carousel with arrows
    │   │   ├── HeroBanner.tsx        # Cinematic full-bleed backdrop header with CTA buttons
    │   │   └── MediaModal.tsx        # Fast popup with trailer, synopsis, cast, and 'Watch Now'
    │   ├── ui/
    │   │   ├── Button.tsx
    │   │   ├── Dialog.tsx
    │   │   ├── Dropdown.tsx
    │   │   └── Skeleton.tsx          # Shimmer loading placeholders for posters
    ├── hooks/
    │   ├── useWatchProgress.ts       # Hook binding postMessage and Supabase/Local progress
    │   ├── useDebounce.ts            # Input debouncing for search
    │   └── useWatchlist.ts           # Add/remove watchlist items with optimistic UI
    ├── lib/
    │   ├── tmdb/
    │   │   ├── client.ts             # Typed fetch client with Next.js revalidation
    │   │   └── types.ts              # TMDB Movie, TV, Season, Episode, Cast interfaces
    │   ├── supabase/
    │   │   ├── client.ts             # Browser-side Supabase client
    │   │   ├── server.ts             # Server-side Supabase client with cookies
    │   │   └── schema.sql            # Table definitions, triggers, and RLS policies
    │   └── utils.ts
```

---

## 3. ScreenScape Embedded Player Architecture

### 3.1 URL Resolution Scheme
The player URL is dynamically built from media metadata:
```typescript
interface EmbedConfig {
  baseUrl?: string;            // Default: "https://web.screenscape.fun/embed"
  type: "movie" | "tv";
  tmdbId?: number | string;
  imdbId?: string;
  season?: number;             // Required when type === "tv"
  episode?: number;            // Required when type === "tv"
  language?: string;           // Optional: "eng", "hindi", "french", etc.
}

export function buildScreenScapeUrl(config: EmbedConfig): string {
  const base = config.baseUrl || "https://web.screenscape.fun/embed";
  const params = new URLSearchParams();

  if (config.tmdbId) {
    params.set("tmdb", String(config.tmdbId));
  } else if (config.imdbId) {
    params.set("imdb", config.imdbId);
  }

  params.set("type", config.type);

  if (config.type === "tv") {
    params.set("s", String(config.season ?? 1));
    params.set("e", String(config.episode ?? 1));
  }

  if (config.language) {
    params.set("lan", config.language);
  }

  return `${base}?${params.toString()}`;
}
```

### 3.2 PostMessage Protocol Specification
ScreenScape embeds communicate across iframe boundaries using `window.postMessage`.

#### Handshake & Ready Detection
1. When the embed iframe finishes loading its internal script, it dispatches to `window.parent`:
   ```json
   { "type": "SCREENSCAPE_EMBED_READY" }
   ```
2. The VYBE parent app intercepts this event to confirm the player is responsive and immediately restores the saved timestamp if available.

#### Message Payload Contract

| Operation | Parent Request Message | Embed Response Message |
| :--- | :--- | :--- |
| **Get Progress** | `{ type: "SCREENSCAPE_GET_PROGRESS", requestId: string, payload: { tmdbId: number, season?: number, episode?: number } }` | `{ type: "SCREENSCAPE_PROGRESS_RESPONSE", requestId: string, progressSeconds: number, error?: string }` |
| **Set Progress** | `{ type: "SCREENSCAPE_SET_PROGRESS", requestId: string, payload: { tmdbId: number, progressSeconds: number, season?: number, episode?: number } }` | `{ type: "SCREENSCAPE_SET_PROGRESS_RESPONSE", requestId: string, success: boolean, error?: string }` |
| **Get Watch History** | `{ type: "SCREENSCAPE_GET_WATCH_HISTORY", requestId: string }` | `{ type: "SCREENSCAPE_WATCH_HISTORY_RESPONSE", requestId: string, watchHistory: Array<any> }` |
| **Get Detailed Progress History** | `{ type: "SCREENSCAPE_GET_WATCH_HISTORY_WITH_PROGRESS", requestId: string }` | `{ type: "SCREENSCAPE_WATCH_HISTORY_WITH_PROGRESS_RESPONSE", requestId: string, watchHistory: Array<any> }` |
| **Get All History Detailed** | `{ type: "SCREENSCAPE_GET_ALL_WATCH_HISTORY_DETAILED", requestId: string }` | `{ type: "SCREENSCAPE_ALL_WATCH_HISTORY_DETAILED_RESPONSE", requestId: string, totalItems: number, watchHistory: Array<any> }` |

### 3.3 Iframe Sandboxing & Security Parameters
```html
<iframe
  id="screenscape-player"
  src="https://web.screenscape.fun/embed?tmdb=550&type=movie"
  width="100%"
  height="100%"
  frameborder="0"
  allowfullscreen
  allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
  sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
  loading="lazy"
  referrerpolicy="origin-when-cross-origin"
  class="w-full h-full rounded-2xl bg-black border border-white/10"
></iframe>
```

---

## 4. Database Schema (Supabase / PostgreSQL)

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. User Profiles
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  avatar_url text,
  preferred_language text default 'eng',
  preferred_theme text default 'dark',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Watch History & Progress Tracking
create table public.watch_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  tmdb_id integer not null,
  media_type text not null check (media_type in ('movie', 'tv')),
  title text not null,
  poster_path text,
  backdrop_path text,
  season integer default null,
  episode integer default null,
  progress_seconds integer default 0 not null,
  duration_seconds integer default null,
  last_watched_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_user_media unique (user_id, tmdb_id, media_type, season, episode)
);

-- 3. Watchlists & Bookmarks
create table public.watchlists (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  tmdb_id integer not null,
  media_type text not null check (media_type in ('movie', 'tv')),
  title text not null,
  poster_path text,
  vote_average numeric(3,1),
  release_year text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_user_watchlist unique (user_id, tmdb_id, media_type)
);

-- Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.watch_history enable row level security;
alter table public.watchlists enable row level security;

-- Policies: Users manage only their own records
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Users can read own history" on public.watch_history for select using (auth.uid() = user_id);
create policy "Users can insert own history" on public.watch_history for insert with check (auth.uid() = user_id);
create policy "Users can update own history" on public.watch_history for update using (auth.uid() = user_id);
create policy "Users can delete own history" on public.watch_history for delete using (auth.uid() = user_id);

create policy "Users can manage own watchlist" on public.watchlists for all using (auth.uid() = user_id);
```

---

## 5. Design System & Theme Engine

### 5.1 CSS Color Tokens (Dark & Light)
```css
/* Dark Theme (Default - Cinematic Obsidian) */
:root[data-theme='dark'], :root {
  --background: #0b0b0f;
  --surface: #14141c;
  --surface-hover: #1e1e2a;
  --surface-border: rgba(255, 255, 255, 0.08);
  --foreground: #f8fafc;
  --foreground-muted: #94a3b8;
  --accent: #8b5cf6;            /* Electric violet */
  --accent-hover: #7c3aed;
  --accent-glow: rgba(139, 92, 246, 0.25);
  --danger: #ef4444;
}

/* Light Theme (Clean Crisp Editorial) */
:root[data-theme='light'] {
  --background: #f8fafc;
  --surface: #ffffff;
  --surface-hover: #f1f5f9;
  --surface-border: rgba(0, 0, 0, 0.08);
  --foreground: #0f172a;
  --foreground-muted: #64748b;
  --accent: #6d28d9;
  --accent-hover: #5b21b6;
  --accent-glow: rgba(109, 40, 217, 0.15);
  --danger: #dc2626;
}
```

### 5.2 Responsive Layout Breakpoints
- **Mobile (< 640px)**: Bottom navigation bar, single-column media grid, horizontal swipe carousels.
- **Tablet (640px – 1024px)**: Collapsed icon rail, 3-4 column media grids, medium aspect hero.
- **Desktop (1024px – 1440px)**: Full collapsible sidebar, 5-6 column media grids, widescreen cinema player.
- **Ultrawide (1440px+)**: Constrained maximum content container (`max-w-7xl` or `2xl:max-w-[1700px]`) with balanced margins to prevent stretched layout distortions.
