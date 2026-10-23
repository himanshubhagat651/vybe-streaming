import {
  MediaItem,
  Genre,
  PaginatedResult,
  ProviderStatus,
  Season,
} from "../types";
import { MetadataProvider } from "./provider";
import { DEMO_MEDIA, DEMO_GENRES } from "../demoData";

export class MockMetadataProvider implements MetadataProvider {
  readonly name = "Mock Fallback Provider";

  isConfigured(): boolean {
    return false;
  }

  getStatus(): ProviderStatus {
    return {
      providerName: "Mock",
      isConfigured: false,
      message:
        "Running on offline demo catalog. To enable live real-time search, trending releases, and 1,000,000+ titles, configure TMDB_API_KEY in .env.local.",
    };
  }

  async getTrending(
    mediaType: "all" | "movie" | "tv" = "all",
    timeWindow: "day" | "week" = "day",
    page: number = 1
  ): Promise<PaginatedResult<MediaItem>> {
    let list = DEMO_MEDIA;
    if (mediaType !== "all") {
      list = list.filter((m) => m.type === mediaType);
    }
    return this.paginate(list, page);
  }

  async getPopular(
    mediaType: "movie" | "tv",
    page: number = 1
  ): Promise<PaginatedResult<MediaItem>> {
    const list = DEMO_MEDIA.filter((m) => m.type === mediaType);
    return this.paginate(list, page);
  }

  async search(
    query: string,
    mediaType: "all" | "movie" | "tv" = "all",
    page: number = 1
  ): Promise<PaginatedResult<MediaItem>> {
    if (!query.trim()) {
      return { page: 1, totalPages: 0, totalResults: 0, results: [] };
    }
    const q = query.toLowerCase().trim();
    let list = DEMO_MEDIA.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        (m.overview && m.overview.toLowerCase().includes(q)) ||
        m.genres.some((g) => g.toLowerCase().includes(q)) ||
        m.cast.some((c) => c.name.toLowerCase().includes(q))
    );

    if (mediaType !== "all") {
      list = list.filter((m) => m.type === mediaType);
    }

    return this.paginate(list, page);
  }

  async getByGenre(
    genreId: string | number,
    mediaType?: "movie" | "tv",
    page: number = 1
  ): Promise<PaginatedResult<MediaItem>> {
    const genreObj = DEMO_GENRES.find(
      (g) => String(g.id) === String(genreId) || g.slug === String(genreId)
    );
    const targetName = genreObj ? genreObj.name.toLowerCase() : String(genreId).toLowerCase();

    let list = mediaType ? DEMO_MEDIA.filter((m) => m.type === mediaType) : DEMO_MEDIA;
    if (targetName !== "all") {
      list = list.filter((m) =>
        m.genres.some((g) => g.toLowerCase() === targetName)
      );
    }

    return this.paginate(list, page);
  }

  async getDetails(id: string | number, mediaType: "movie" | "tv"): Promise<MediaItem | null> {
    const idStr = String(id);
    const item = DEMO_MEDIA.find(
      (m) => m.id === idStr || String(m.tmdbId) === idStr
    );
    return item || null;
  }

  async getGenres(mediaType: "movie" | "tv" = "movie"): Promise<Genre[]> {
    return DEMO_GENRES;
  }

  async getSeasonEpisodes(tvId: string | number, seasonNumber: number): Promise<Season | null> {
    const item = DEMO_MEDIA.find(
      (m) => m.type === "tv" && (m.id === String(tvId) || String(m.tmdbId) === String(tvId))
    );
    if (!item?.seasons) return null;
    return item.seasons.find((s) => s.seasonNumber === seasonNumber) || item.seasons[0] || null;
  }

  private paginate(items: MediaItem[], page: number, pageSize: number = 20): PaginatedResult<MediaItem> {
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = items.slice(startIndex, startIndex + pageSize);
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

    return {
      page,
      totalPages,
      totalResults: items.length,
      results: paginatedItems,
    };
  }
}
