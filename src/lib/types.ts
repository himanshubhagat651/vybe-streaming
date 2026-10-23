export type MediaType = "movie" | "tv";

export interface CastMember {
  id: string;
  name: string;
  character: string;
  avatarUrl?: string;
}

export interface Episode {
  episodeNumber: number;
  title: string;
  overview: string;
  duration: string;
  thumbnailUrl: string;
}

export interface Season {
  seasonNumber: number;
  name: string;
  episodeCount: number;
  episodes: Episode[];
}

export interface MediaItem {
  id: string;
  tmdbId: number;
  imdbId?: string;
  type: MediaType;
  title: string;
  tagline: string;
  overview: string;
  posterUrl: string;
  backdropUrl: string;
  rating: number;
  voteCount: number;
  releaseYear: string;
  runtime?: string;
  quality?: "4K" | "1080p" | "HD";
  ageRating?: "PG-13" | "R" | "TV-MA" | "PG" | "TV-14";
  genres: string[];
  cast: CastMember[];
  director?: string;
  seasons?: Season[];
  featured?: boolean;
  trendingRank?: number;
  languageAvailable?: string[];
}

export interface Genre {
  id: string;
  name: string;
  slug: string;
}
