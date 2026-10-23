import { MetadataProvider } from "./provider";
import { MediaItem, Genre, PaginatedResult, ProviderStatus, Season } from "../types";
import { DEMO_MEDIA, DEMO_GENRES } from "../demoData";

const SCREENSCAPE_BASE_API = "https://web.screenscape.fun/api";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

const GENRE_MAP: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
  10759: "Action & Adventure",
  10765: "Sci-Fi & Fantasy",
  10768: "War & Politics",
};

export class ScreenScapeProvider implements MetadataProvider {
  public readonly name = "ScreenScape";
  private cache = new Map<string, MediaItem>();

  public isConfigured(): boolean {
    return true;
  }

  public getStatus(): ProviderStatus {
    return {
      providerName: "ScreenScape",
      isConfigured: true,
      message: "Connected to live ScreenScape catalog & search API.",
    };
  }

  private mapScreenScapeItem(raw: any, overrideType?: "movie" | "tv"): MediaItem {
    const isTv = overrideType === "tv" || raw.media_type === "tv" || (!raw.title && Boolean(raw.name));
    const title = raw.title || raw.name || "Untitled";
    const tmdbId = Number(raw.id);

    const genres: string[] = [];
    if (Array.isArray(raw.genre_ids)) {
      raw.genre_ids.forEach((id: number) => {
        if (GENRE_MAP[id]) genres.push(GENRE_MAP[id]);
      });
    } else if (Array.isArray(raw.genres)) {
      raw.genres.forEach((g: any) => {
        if (g?.name) genres.push(g.name);
      });
    }
    if (genres.length === 0) {
      genres.push(isTv ? "TV Series" : "Cinema");
    }

    const isAnime =
      raw.original_language === "ja" ||
      (Array.isArray(raw.origin_country) && raw.origin_country.includes("JP")) ||
      (genres.some((g) => g.toLowerCase() === "animation") &&
        (raw.original_language === "ja" ||
          (Array.isArray(raw.origin_country) && raw.origin_country.includes("JP")))) ||
      ["edgerunners", "apothecary", "titan", "slayer", "kaisen", "death note", "piece", "chainsaw", "solo leveling", "spirited away", "your name"].some((kw) =>
        title.toLowerCase().includes(kw)
      );

    if (isAnime && !genres.some((g) => g.toLowerCase() === "anime")) {
      genres.unshift("Anime");
    }

    const releaseDate = raw.release_date || raw.first_air_date || "";
    const releaseYear = releaseDate ? releaseDate.split("-")[0] : undefined;

    const posterUrl = raw.poster_path
      ? `${TMDB_IMAGE_BASE}/w500${raw.poster_path}`
      : null;
    const backdropUrl = raw.backdrop_path
      ? `${TMDB_IMAGE_BASE}/w1280${raw.backdrop_path}`
      : null;

    const seasons: Season[] = [];
    if (Array.isArray(raw.seasons)) {
      raw.seasons.forEach((s: any) => {
        if (s.season_number > 0) {
          seasons.push({
            seasonNumber: s.season_number,
            name: s.name || `Season ${s.season_number}`,
            overview: s.overview || "",
            episodeCount: s.episode_count || 10,
            episodes: [],
          });
        }
      });
    }

    const cast = Array.isArray(raw.credits?.cast)
      ? raw.credits.cast.slice(0, 8).map((c: any) => ({
          id: c.id,
          name: c.name || "Unknown",
          character: c.character || "Actor",
          profileUrl: c.profile_path ? `${TMDB_IMAGE_BASE}/w185${c.profile_path}` : undefined,
        }))
      : [];

    const item: MediaItem = {
      id: `${isTv ? "tv" : "movie"}-${tmdbId}`,
      tmdbId,
      type: isTv ? "tv" : "movie",
      title,
      tagline: raw.tagline || undefined,
      overview: raw.overview || "No overview available.",
      posterUrl,
      backdropUrl,
      rating: Number(raw.vote_average) || 0,
      voteCount: Number(raw.vote_count) || 0,
      releaseYear,
      releaseDate,
      runtime: raw.runtime ? `${raw.runtime}m` : raw.episode_run_time?.[0] ? `${raw.episode_run_time[0]}m` : undefined,
      quality: "4K",
      genres,
      cast,
      seasons: seasons.length > 0 ? seasons : undefined,
      featured: true,
    };

    // Store in internal lookup cache
    this.cache.set(`${item.type}-${item.tmdbId}`, item);
    return item;
  }

  public async getTrending(
    mediaType: "all" | "movie" | "tv" = "all",
    _timeWindow: "day" | "week" = "day",
    page: number = 1
  ): Promise<PaginatedResult<MediaItem>> {
    try {
      if (mediaType === "movie") {
        const res = await fetch(`${SCREENSCAPE_BASE_API}/movies/trending`, {
          headers: { "User-Agent": "Mozilla/5.0", Referer: "https://web.screenscape.fun" },
          next: { revalidate: 3600 },
        });
        if (!res.ok) throw new Error(`ScreenScape trending movies failed: HTTP ${res.status}`);
        const data = await res.json();
        const results = (data.results || []).map((r: any) => this.mapScreenScapeItem(r, "movie"));
        return {
          page: data.page || page,
          totalPages: data.total_pages || 1,
          totalResults: data.total_results || results.length,
          results,
        };
      }

      if (mediaType === "tv") {
        const res = await fetch(`${SCREENSCAPE_BASE_API}/tv/trending`, {
          headers: { "User-Agent": "Mozilla/5.0", Referer: "https://web.screenscape.fun" },
          next: { revalidate: 3600 },
        });
        if (!res.ok) throw new Error(`ScreenScape trending TV failed: HTTP ${res.status}`);
        const data = await res.json();
        const results = (data.results || []).map((r: any) => this.mapScreenScapeItem(r, "tv"));
        return {
          page: data.page || page,
          totalPages: data.total_pages || 1,
          totalResults: data.total_results || results.length,
          results,
        };
      }

      // "all": fetch both and interleave
      const [moviesRes, tvRes] = await Promise.all([
        fetch(`${SCREENSCAPE_BASE_API}/movies/trending`, {
          headers: { "User-Agent": "Mozilla/5.0", Referer: "https://web.screenscape.fun" },
          next: { revalidate: 3600 },
        }),
        fetch(`${SCREENSCAPE_BASE_API}/tv/trending`, {
          headers: { "User-Agent": "Mozilla/5.0", Referer: "https://web.screenscape.fun" },
          next: { revalidate: 3600 },
        }),
      ]);

      const moviesData = moviesRes.ok ? await moviesRes.json() : { results: [] };
      const tvData = tvRes.ok ? await tvRes.json() : { results: [] };

      const movies = (moviesData.results || []).map((r: any) => this.mapScreenScapeItem(r, "movie"));
      const tvShows = (tvData.results || []).map((r: any) => this.mapScreenScapeItem(r, "tv"));

      const combined: MediaItem[] = [];
      const maxLen = Math.max(movies.length, tvShows.length);
      for (let i = 0; i < maxLen; i++) {
        if (i < movies.length) combined.push(movies[i]);
        if (i < tvShows.length) combined.push(tvShows[i]);
      }

      return {
        page: 1,
        totalPages: 10,
        totalResults: combined.length,
        results: combined,
      };
    } catch (err) {
      console.warn("ScreenScapeProvider.getTrending fallback to mock:", err);
      return {
        page: 1,
        totalPages: 1,
        totalResults: DEMO_MEDIA.length,
        results: DEMO_MEDIA,
      };
    }
  }

  public async getPopular(
    mediaType: "movie" | "tv",
    page: number = 1
  ): Promise<PaginatedResult<MediaItem>> {
    try {
      if (mediaType === "movie") {
        let res = await fetch(`${SCREENSCAPE_BASE_API}/movies/popular`, {
          headers: { "User-Agent": "Mozilla/5.0", Referer: "https://web.screenscape.fun" },
          next: { revalidate: 3600 },
        });
        if (!res.ok) {
          res = await fetch(`${SCREENSCAPE_BASE_API}/movies/now-playing`, {
            headers: { "User-Agent": "Mozilla/5.0", Referer: "https://web.screenscape.fun" },
            next: { revalidate: 3600 },
          });
        }
        if (!res.ok) throw new Error(`ScreenScape popular movies failed: HTTP ${res.status}`);
        const data = await res.json();
        const results = (data.results || []).map((r: any) => this.mapScreenScapeItem(r, "movie"));
        return {
          page: data.page || page,
          totalPages: data.total_pages || 1,
          totalResults: data.total_results || results.length,
          results,
        };
      }

      let res = await fetch(`${SCREENSCAPE_BASE_API}/tv/popular`, {
        headers: { "User-Agent": "Mozilla/5.0", Referer: "https://web.screenscape.fun" },
        next: { revalidate: 3600 },
      });
      if (!res.ok) {
        res = await fetch(`${SCREENSCAPE_BASE_API}/tv/trending`, {
          headers: { "User-Agent": "Mozilla/5.0", Referer: "https://web.screenscape.fun" },
          next: { revalidate: 3600 },
        });
      }
      if (!res.ok) throw new Error(`ScreenScape popular TV failed: HTTP ${res.status}`);
      const data = await res.json();
      const results = (data.results || []).map((r: any) => this.mapScreenScapeItem(r, "tv"));
      return {
        page: data.page || page,
        totalPages: data.total_pages || 1,
        totalResults: data.total_results || results.length,
        results,
      };
    } catch (err) {
      console.warn("ScreenScapeProvider.getPopular fallback to mock:", err);
      const filtered = DEMO_MEDIA.filter((m) => m.type === mediaType);
      return {
        page: 1,
        totalPages: 1,
        totalResults: filtered.length,
        results: filtered,
      };
    }
  }

  public async search(
    query: string,
    mediaType: "all" | "movie" | "tv" = "all",
    page: number = 1
  ): Promise<PaginatedResult<MediaItem>> {
    if (!query.trim()) {
      return { page: 1, totalPages: 0, totalResults: 0, results: [] };
    }

    try {
      const res = await fetch(
        `${SCREENSCAPE_BASE_API}/search?q=${encodeURIComponent(query.trim())}`,
        {
          headers: { "User-Agent": "Mozilla/5.0", Referer: "https://web.screenscape.fun" },
          next: { revalidate: 600 },
        }
      );

      if (!res.ok) throw new Error(`ScreenScape search failed: HTTP ${res.status}`);
      const data = await res.json();

      let results: MediaItem[] = (data.results || []).map((r: any) =>
        this.mapScreenScapeItem(r)
      );

      if (mediaType !== "all") {
        results = results.filter((r) => r.type === mediaType);
      }

      return {
        page: data.page || page,
        totalPages: data.total_pages || 1,
        totalResults: data.total_results || results.length,
        results,
      };
    } catch (err) {
      console.warn("ScreenScapeProvider.search fallback to mock:", err);
      const q = query.toLowerCase().trim();
      const filtered = DEMO_MEDIA.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.overview?.toLowerCase().includes(q) ||
          m.genres.some((g) => g.toLowerCase().includes(q))
      );
      return {
        page: 1,
        totalPages: 1,
        totalResults: filtered.length,
        results: filtered,
      };
    }
  }

  public async getByGenre(
    genreId: string | number,
    mediaType?: "movie" | "tv",
    page: number = 1
  ): Promise<PaginatedResult<MediaItem>> {
    const targetGenre =
      typeof genreId === "string" ? genreId.toLowerCase() : GENRE_MAP[Number(genreId)]?.toLowerCase();

    // Specialize for Anime: combine curated anime collection and trending anime
    if (targetGenre === "anime") {
      const animeFromDemo = DEMO_MEDIA.filter((m) =>
        m.genres.some((g) => g.toLowerCase() === "anime") &&
        (!mediaType || m.type === mediaType)
      );

      try {
        const trending = await this.getTrending(mediaType || "all", "day", page);
        const liveAnime = trending.results.filter((m) =>
          m.genres.some((g) => g.toLowerCase() === "anime")
        );
        const seen = new Set<number>();
        const merged: MediaItem[] = [];
        for (const item of [...animeFromDemo, ...liveAnime]) {
          if (!seen.has(item.tmdbId)) {
            seen.add(item.tmdbId);
            merged.push(item);
          }
        }
        return {
          page: 1,
          totalPages: 1,
          totalResults: merged.length,
          results: merged,
        };
      } catch {
        return {
          page: 1,
          totalPages: 1,
          totalResults: animeFromDemo.length,
          results: animeFromDemo,
        };
      }
    }

    const trending = await this.getTrending(mediaType || "all", "day", page);

    if (!targetGenre) return trending;

    const filtered = trending.results.filter((m) =>
      m.genres.some((g) => g.toLowerCase() === targetGenre)
    );

    return {
      page: 1,
      totalPages: 1,
      totalResults: filtered.length,
      results: filtered.length > 0 ? filtered : trending.results,
    };
  }

  public async getDetails(
    id: string | number,
    mediaType: "movie" | "tv"
  ): Promise<MediaItem | null> {
    const cacheKey = `${mediaType}-${id}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      if (mediaType === "tv") {
        const res = await fetch(`${SCREENSCAPE_BASE_API}/tv/${id}`, {
          headers: { "User-Agent": "Mozilla/5.0", Referer: "https://web.screenscape.fun" },
          next: { revalidate: 3600 },
        });

        if (res.ok) {
          const raw = await res.json();
          return this.mapScreenScapeItem(raw, "tv");
        }

        // Check tv/popular and tv/trending
        const [tvPop, tvTrend] = await Promise.all([
          fetch(`${SCREENSCAPE_BASE_API}/tv/popular`, {
            headers: { "User-Agent": "Mozilla/5.0", Referer: "https://web.screenscape.fun" },
            next: { revalidate: 3600 },
          }),
          fetch(`${SCREENSCAPE_BASE_API}/tv/trending`, {
            headers: { "User-Agent": "Mozilla/5.0", Referer: "https://web.screenscape.fun" },
            next: { revalidate: 3600 },
          }),
        ]);
        if (tvPop.ok) {
          const data = await tvPop.json();
          const found = (data.results || []).find((r: any) => String(r.id) === String(id));
          if (found) return this.mapScreenScapeItem(found, "tv");
        }
        if (tvTrend.ok) {
          const data = await tvTrend.json();
          const found = (data.results || []).find((r: any) => String(r.id) === String(id));
          if (found) return this.mapScreenScapeItem(found, "tv");
        }
      }

      // For movies or if TV direct lookup fails, search ScreenScape catalog by ID / title
      const res = await fetch(`${SCREENSCAPE_BASE_API}/movies/trending`, {
        headers: { "User-Agent": "Mozilla/5.0", Referer: "https://web.screenscape.fun" },
        next: { revalidate: 3600 },
      });

      if (res.ok) {
        const data = await res.json();
        const found = (data.results || []).find((r: any) => String(r.id) === String(id));
        if (found) {
          return this.mapScreenScapeItem(found, mediaType);
        }
      }

      // Check now-playing
      const nowPlayingRes = await fetch(`${SCREENSCAPE_BASE_API}/movies/now-playing`, {
        headers: { "User-Agent": "Mozilla/5.0", Referer: "https://web.screenscape.fun" },
        next: { revalidate: 3600 },
      });

      if (nowPlayingRes.ok) {
        const data = await nowPlayingRes.json();
        const found = (data.results || []).find((r: any) => String(r.id) === String(id));
        if (found) {
          return this.mapScreenScapeItem(found, mediaType);
        }
      }
    } catch (err) {
      console.warn("ScreenScapeProvider.getDetails error:", err);
    }

    // Fallback to demo data if present
    const demo = DEMO_MEDIA.find((m) => String(m.tmdbId) === String(id) && m.type === mediaType);
    if (demo) return demo;

    // Construct a generic playable item using the TMDB ID
    return {
      id: `${mediaType}-${id}`,
      tmdbId: Number(id),
      type: mediaType,
      title: `${mediaType === "tv" ? "TV Series" : "Movie"} #${id}`,
      overview: "Streaming playback provided via ScreenScape player.",
      rating: 8.0,
      voteCount: 100,
      quality: "4K",
      genres: [mediaType === "tv" ? "TV Series" : "Cinema"],
      cast: [],
      featured: false,
    };
  }

  public async getSeasonEpisodes(
    tvId: string | number,
    seasonNumber: number
  ): Promise<Season> {
    try {
      // 1. Try ScreenScape dedicated season API endpoint: /api/tv/{id}/season/{season}
      const seasonRes = await fetch(`${SCREENSCAPE_BASE_API}/tv/${tvId}/season/${seasonNumber}`, {
        headers: { "User-Agent": "Mozilla/5.0", Referer: "https://web.screenscape.fun" },
        next: { revalidate: 3600 },
      });

      if (seasonRes.ok) {
        const sData = await seasonRes.json();
        if (Array.isArray(sData.episodes) && sData.episodes.length > 0) {
          const episodes = sData.episodes.map((ep: any) => ({
            episodeNumber: ep.episode_number,
            title: ep.name || `Episode ${ep.episode_number}`,
            overview: ep.overview || `Season ${seasonNumber}, Episode ${ep.episode_number}`,
            duration: ep.runtime ? `${ep.runtime}m` : "45m",
            thumbnailUrl: ep.still_path ? `${TMDB_IMAGE_BASE}/w780${ep.still_path}` : null,
            airDate: ep.air_date,
          }));

          return {
            seasonNumber,
            name: sData.name || `Season ${seasonNumber}`,
            overview: sData.overview || "",
            episodeCount: episodes.length,
            episodes,
          };
        }
      }

      // 2. Fallback to /api/tv/{id}
      const res = await fetch(`${SCREENSCAPE_BASE_API}/tv/${tvId}`, {
        headers: { "User-Agent": "Mozilla/5.0", Referer: "https://web.screenscape.fun" },
        next: { revalidate: 3600 },
      });

      if (res.ok) {
        const raw = await res.json();
        const seasonInfo = (raw.seasons || []).find((s: any) => s.season_number === seasonNumber);
        const epCount = seasonInfo?.episode_count || 10;

        const episodes = Array.from({ length: epCount }, (_, i) => ({
          episodeNumber: i + 1,
          title: `Episode ${i + 1}`,
          overview: `${raw.name || "Series"} - Season ${seasonNumber}, Episode ${i + 1}`,
          duration: raw.episode_run_time?.[0] ? `${raw.episode_run_time[0]}m` : "45m",
          thumbnailUrl: raw.backdrop_path ? `${TMDB_IMAGE_BASE}/w780${raw.backdrop_path}` : null,
          airDate: raw.first_air_date,
        }));

        return {
          seasonNumber,
          name: seasonInfo?.name || `Season ${seasonNumber}`,
          overview: seasonInfo?.overview || "",
          episodeCount: epCount,
          episodes,
        };
      }
    } catch (err) {
      console.warn("ScreenScapeProvider.getSeasonEpisodes error:", err);
    }

    // Default season structure
    return {
      seasonNumber,
      name: `Season ${seasonNumber}`,
      episodeCount: 10,
      episodes: Array.from({ length: 10 }, (_, i) => ({
        episodeNumber: i + 1,
        title: `Episode ${i + 1}`,
        overview: `Episode ${i + 1} of Season ${seasonNumber}`,
        duration: "45m",
      })),
    };
  }

  public async getGenres(_mediaType?: "movie" | "tv"): Promise<Genre[]> {
    return DEMO_GENRES;
  }
}
