export type MediaType = "movie" | "tv";

export interface CastMember {
  id: string;
  name: string;
  character: string;
  avatarUrl?: string | null;
}

export interface Episode {
  episodeNumber: number;
  title: string;
  overview: string;
  duration?: string;
  thumbnailUrl?: string | null;
  airDate?: string;
}

export interface Season {
  seasonNumber: number;
  name: string;
  overview?: string;
  episodeCount: number;
  episodes: Episode[];
}

export interface MediaItem {
  id: string;
  tmdbId: number;
  imdbId?: string;
  type: MediaType;
  title: string;
  tagline?: string;
  overview?: string;
  posterUrl?: string | null;
  backdropUrl?: string | null;
  rating: number; // 0 if unrated
  voteCount: number;
  releaseYear?: string;
  releaseDate?: string;
  runtime?: string;
  quality?: "4K" | "1080p" | "HD";
  ageRating?: "PG-13" | "R" | "TV-MA" | "PG" | "TV-14" | "U/A 13+" | "U/A 16+" | "16+" | "18+" | "U" | "A" | string;
  genres: string[];
  cast: CastMember[];
  director?: string;
  seasons?: Season[];
  featured?: boolean;
  trendingRank?: number;
  languageAvailable?: string[];
  status?: string;
}

export interface Genre {
  id: string | number;
  name: string;
  slug: string;
}

export interface PaginatedResult<T> {
  page: number;
  totalPages: number;
  totalResults: number;
  results: T[];
}

export interface ProviderStatus {
  providerName: "TMDB" | "Mock" | "ScreenScape";
  isConfigured: boolean;
  message?: string;
}

// ==============================================================================
// Phase 4: Auth, Profiles, Watchlist & History Types
// ==============================================================================

export type SupportedLanguage = "hindi" | "eng" | "french";
export type SupportedTheme = "dark" | "light";

export interface UserProfile {
  id: string;
  email: string | null;
  username: string;
  avatarUrl?: string | null;
  preferredLanguage: SupportedLanguage;
  preferredTheme: SupportedTheme;
  createdAt?: string;
  updatedAt?: string;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  voteAverage?: number;
  releaseYear?: string;
  createdAt: string;
}

export interface WatchHistoryItem {
  id: string;
  userId: string;
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  season?: number | null;
  episode?: number | null;
  progressSeconds: number;
  durationSeconds?: number | null;
  completed: boolean;
  lastWatchedAt: string;
}

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  mode: "supabase" | "demo_isolated";
  hasUrl: boolean;
  hasAnonKey: boolean;
  missingVars: string[];
  message: string;
}
