import {
  MediaItem,
  Genre,
  PaginatedResult,
  ProviderStatus,
  CastMember,
  Season,
  Episode,
  MediaType,
} from "../types";
import { MetadataProvider } from "./provider";

export class TmdbProvider implements MetadataProvider {
  readonly name = "The Movie Database (TMDB)";
  private readonly baseUrl = "https://api.themoviedb.org/3";
  private readonly imageBase = "https://image.tmdb.org/t/p";
  private genreCache: Map<string, Genre[]> = new Map();

  isConfigured(): boolean {
    return Boolean(
      process.env.TMDB_API_KEY?.trim() || process.env.TMDB_READ_ACCESS_TOKEN?.trim()
    );
  }

  getStatus(): ProviderStatus {
    const configured = this.isConfigured();
    return {
      providerName: "TMDB",
      isConfigured: configured,
      message: configured
        ? "Connected to TMDB API v3/v4 live catalog."
        : "TMDB API credentials are missing. Add TMDB_API_KEY or TMDB_READ_ACCESS_TOKEN to .env.local to enable live metadata.",
    };
  }

  private async fetchTmdb<T>(path: string, params: Record<string, string> = {}): Promise<T> {
    const apiKey = process.env.TMDB_API_KEY?.trim();
    const readToken = process.env.TMDB_READ_ACCESS_TOKEN?.trim();

    if (!apiKey && !readToken) {
      throw new Error(
        "TMDB API configuration missing: Set TMDB_API_KEY or TMDB_READ_ACCESS_TOKEN in .env.local"
      );
    }

    const url = new URL(`${this.baseUrl}${path}`);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (readToken) {
      headers["Authorization"] = `Bearer ${readToken}`;
    } else if (apiKey) {
      url.searchParams.set("api_key", apiKey);
    }

    const response = await fetch(url.toString(), {
      headers,
      next: { revalidate: 3600 }, // 1 hour cache
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = `TMDB API request failed (${response.status} ${response.statusText})`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.status_message) {
          errorMsg = `TMDB: ${errorJson.status_message} (Status: ${response.status})`;
        }
      } catch {}
      throw new Error(errorMsg);
    }

    return (await response.json()) as T;
  }

  async getTrending(
    mediaType: "all" | "movie" | "tv" = "all",
    timeWindow: "day" | "week" = "day",
    page: number = 1
  ): Promise<PaginatedResult<MediaItem>> {
    const targetType = mediaType === "all" ? "all" : mediaType;
    const data = await this.fetchTmdb<any>(`/trending/${targetType}/${timeWindow}`, {
      page: String(page),
    });

    return {
      page: data.page,
      totalPages: Math.min(data.total_pages || 1, 500),
      totalResults: data.total_results || 0,
      results: (data.results || [])
        .filter((item: any) => item.media_type !== "person")
        .map((item: any) => this.mapListItemToMedia(item, item.media_type || mediaType)),
    };
  }

  async getPopular(
    mediaType: "movie" | "tv",
    page: number = 1
  ): Promise<PaginatedResult<MediaItem>> {
    const data = await this.fetchTmdb<any>(`/${mediaType}/popular`, {
      page: String(page),
    });

    return {
      page: data.page,
      totalPages: Math.min(data.total_pages || 1, 500),
      totalResults: data.total_results || 0,
      results: (data.results || []).map((item: any) =>
        this.mapListItemToMedia(item, mediaType)
      ),
    };
  }

  async search(
    query: string,
    mediaType: "all" | "movie" | "tv" = "all",
    page: number = 1
  ): Promise<PaginatedResult<MediaItem>> {
    if (!query.trim()) {
      return { page: 1, totalPages: 0, totalResults: 0, results: [] };
    }

    const endpoint =
      mediaType === "all" ? "/search/multi" : `/search/${mediaType}`;

    const data = await this.fetchTmdb<any>(endpoint, {
      query: query.trim(),
      page: String(page),
      include_adult: "false",
    });

    return {
      page: data.page,
      totalPages: Math.min(data.total_pages || 1, 500),
      totalResults: data.total_results || 0,
      results: (data.results || [])
        .filter((item: any) => item.media_type !== "person")
        .map((item: any) =>
          this.mapListItemToMedia(item, item.media_type || mediaType)
        ),
    };
  }

  async getByGenre(
    genreId: string | number,
    mediaType: "movie" | "tv" = "movie",
    page: number = 1
  ): Promise<PaginatedResult<MediaItem>> {
    const data = await this.fetchTmdb<any>(`/discover/${mediaType}`, {
      with_genres: String(genreId),
      page: String(page),
      sort_by: "popularity.desc",
      include_adult: "false",
    });

    return {
      page: data.page,
      totalPages: Math.min(data.total_pages || 1, 500),
      totalResults: data.total_results || 0,
      results: (data.results || []).map((item: any) =>
        this.mapListItemToMedia(item, mediaType)
      ),
    };
  }

  async getDetails(id: string | number, mediaType: "movie" | "tv"): Promise<MediaItem | null> {
    try {
      const data = await this.fetchTmdb<any>(`/${mediaType}/${id}`, {
        append_to_response: "credits,external_ids,recommendations",
      });

      return this.mapDetailsToMedia(data, mediaType);
    } catch (err: any) {
      if (err.message?.includes("404")) {
        return null;
      }
      throw err;
    }
  }

  async getGenres(mediaType: "movie" | "tv" = "movie"): Promise<Genre[]> {
    if (this.genreCache.has(mediaType)) {
      return this.genreCache.get(mediaType)!;
    }

    try {
      const data = await this.fetchTmdb<{ genres: { id: number; name: string }[] }>(
        `/genre/${mediaType}/list`
      );

      const genres: Genre[] = (data.genres || []).map((g) => ({
        id: g.id,
        name: g.name,
        slug: g.name.toLowerCase().replace(/\s+/g, "-"),
      }));

      this.genreCache.set(mediaType, genres);
      return genres;
    } catch {
      return [];
    }
  }

  async getSeasonEpisodes(tvId: string | number, seasonNumber: number): Promise<Season | null> {
    try {
      const data = await this.fetchTmdb<any>(`/tv/${tvId}/season/${seasonNumber}`);

      const episodes: Episode[] = (data.episodes || []).map((ep: any) => ({
        episodeNumber: ep.episode_number,
        title: ep.name || `Episode ${ep.episode_number}`,
        overview: ep.overview || "No episode overview available.",
        duration: ep.runtime ? `${ep.runtime}m` : undefined,
        thumbnailUrl: ep.still_path ? `${this.imageBase}/w500${ep.still_path}` : null,
        airDate: ep.air_date,
      }));

      return {
        seasonNumber: data.season_number,
        name: data.name || `Season ${data.season_number}`,
        overview: data.overview,
        episodeCount: episodes.length,
        episodes,
      };
    } catch (err: any) {
      if (err.message?.includes("404")) return null;
      throw err;
    }
  }

  private mapListItemToMedia(item: any, fallbackType: MediaType): MediaItem {
    const isTv = (item.media_type === "tv" || fallbackType === "tv");
    const mediaType: MediaType = isTv ? "tv" : "movie";
    const title = item.title || item.name || item.original_title || "Untitled";
    const releaseDate = item.release_date || item.first_air_date;
    const releaseYear = releaseDate ? releaseDate.slice(0, 4) : undefined;

    return {
      id: `${mediaType === "tv" ? "tv" : "m"}-${item.id}`,
      tmdbId: item.id,
      type: mediaType,
      title,
      overview: item.overview || undefined,
      posterUrl: item.poster_path ? `${this.imageBase}/w500${item.poster_path}` : null,
      backdropUrl: item.backdrop_path ? `${this.imageBase}/w1280${item.backdrop_path}` : null,
      rating: typeof item.vote_average === "number" ? Math.round(item.vote_average * 10) / 10 : 0,
      voteCount: item.vote_count || 0,
      releaseYear,
      releaseDate,
      genres: [], // genres populated on detail view or mapped
      cast: [],
      quality: "4K",
    };
  }

  private mapDetailsToMedia(data: any, mediaType: MediaType): MediaItem {
    const title = data.title || data.name || "Untitled";
    const releaseDate = data.release_date || data.first_air_date;
    const releaseYear = releaseDate ? releaseDate.slice(0, 4) : undefined;

    // Format runtime
    let runtime: string | undefined;
    if (data.runtime) {
      const h = Math.floor(data.runtime / 60);
      const m = data.runtime % 60;
      runtime = h > 0 ? `${h}h ${m}m` : `${m}m`;
    } else if (data.number_of_seasons) {
      runtime = `${data.number_of_seasons} ${data.number_of_seasons === 1 ? "Season" : "Seasons"}`;
    }

    // Extract cast
    const cast: CastMember[] = (data.credits?.cast || []).slice(0, 10).map((c: any) => ({
      id: String(c.id),
      name: c.name,
      character: c.character || "Unknown",
      avatarUrl: c.profile_path ? `${this.imageBase}/w185${c.profile_path}` : null,
    }));

    // Extract director or creator
    let director: string | undefined;
    if (data.credits?.crew) {
      const dir = data.credits.crew.find((c: any) => c.job === "Director");
      if (dir) director = dir.name;
    }
    if (!director && data.created_by && data.created_by.length > 0) {
      director = data.created_by.map((c: any) => c.name).join(", ");
    }

    // Extract seasons if TV
    const seasons: Season[] = (data.seasons || [])
      .filter((s: any) => s.season_number > 0)
      .map((s: any) => ({
        seasonNumber: s.season_number,
        name: s.name || `Season ${s.season_number}`,
        overview: s.overview,
        episodeCount: s.episode_count || 0,
        episodes: [], // loaded on demand
      }));

    return {
      id: `${mediaType === "tv" ? "tv" : "m"}-${data.id}`,
      tmdbId: data.id,
      imdbId: data.external_ids?.imdb_id || undefined,
      type: mediaType,
      title,
      tagline: data.tagline || undefined,
      overview: data.overview || undefined,
      posterUrl: data.poster_path ? `${this.imageBase}/w500${data.poster_path}` : null,
      backdropUrl: data.backdrop_path ? `${this.imageBase}/original${data.backdrop_path}` : null,
      rating: typeof data.vote_average === "number" ? Math.round(data.vote_average * 10) / 10 : 0,
      voteCount: data.vote_count || 0,
      releaseYear,
      releaseDate,
      runtime,
      quality: "4K",
      genres: (data.genres || []).map((g: any) => g.name),
      cast,
      director,
      seasons: seasons.length > 0 ? seasons : undefined,
      status: data.status,
    };
  }
}
