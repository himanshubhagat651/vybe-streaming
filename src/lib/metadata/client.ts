import { MediaItem, Genre, PaginatedResult, ProviderStatus, Season } from "../types";

export async function fetchProviderStatus(): Promise<ProviderStatus> {
  try {
    const res = await fetch("/api/metadata/status", { cache: "no-store" });
    if (!res.ok) throw new Error("Status check failed");
    return await res.json();
  } catch {
    return {
      providerName: "Mock",
      isConfigured: false,
      message: "Offline demo mode active.",
    };
  }
}

export async function fetchTrending(
  type: "all" | "movie" | "tv" = "all",
  timeWindow: "day" | "week" = "day",
  page: number = 1
): Promise<PaginatedResult<MediaItem>> {
  const res = await fetch(
    `/api/metadata/trending?type=${type}&timeWindow=${timeWindow}&page=${page}`
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return await res.json();
}

export async function fetchPopular(
  type: "movie" | "tv" = "movie",
  page: number = 1
): Promise<PaginatedResult<MediaItem>> {
  const res = await fetch(`/api/metadata/popular?type=${type}&page=${page}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return await res.json();
}

export async function fetchSearch(
  query: string,
  type: "all" | "movie" | "tv" = "all",
  page: number = 1
): Promise<PaginatedResult<MediaItem>> {
  if (!query.trim()) {
    return { page: 1, totalPages: 0, totalResults: 0, results: [] };
  }
  const res = await fetch(
    `/api/metadata/search?q=${encodeURIComponent(query)}&type=${type}&page=${page}`
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return await res.json();
}

export async function fetchDetails(
  id: string | number,
  type: "movie" | "tv" = "movie"
): Promise<MediaItem | null> {
  const res = await fetch(`/api/metadata/details?id=${id}&type=${type}`);
  if (res.status === 404) return null;
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return await res.json();
}

export async function fetchSeasonEpisodes(
  tvId: string | number,
  season: number
): Promise<Season | null> {
  const res = await fetch(`/api/metadata/season?tvId=${tvId}&season=${season}`);
  if (res.status === 404) return null;
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return await res.json();
}

export async function fetchGenres(type: "movie" | "tv" = "movie"): Promise<Genre[]> {
  const res = await fetch(`/api/metadata/genres?type=${type}`);
  if (!res.ok) return [];
  return await res.json();
}

export async function fetchByGenre(
  genre: string,
  type?: "movie" | "tv",
  page: number = 1
): Promise<PaginatedResult<MediaItem>> {
  const typeQuery = type ? `&type=${type}` : "";
  const res = await fetch(
    `/api/metadata/genre?genre=${encodeURIComponent(genre)}${typeQuery}&page=${page}`
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return await res.json();
}

export async function fetchByRegion(
  regionCode: string,
  type: "all" | "movie" | "tv" = "all",
  page: number = 1
): Promise<PaginatedResult<MediaItem>> {
  const typeQuery = type ? `&type=${type}` : "";
  const res = await fetch(
    `/api/metadata/region?code=${encodeURIComponent(regionCode)}${typeQuery}&page=${page}`
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return await res.json();
}
