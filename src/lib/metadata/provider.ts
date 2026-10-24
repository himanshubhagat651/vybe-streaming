import { MediaItem, Genre, PaginatedResult, ProviderStatus, Season } from "../types";

export interface MetadataProvider {
  readonly name: string;
  isConfigured(): boolean;
  getStatus(): ProviderStatus;

  getTrending(
    mediaType?: "all" | "movie" | "tv",
    timeWindow?: "day" | "week",
    page?: number
  ): Promise<PaginatedResult<MediaItem>>;

  getPopular(
    mediaType: "movie" | "tv",
    page?: number
  ): Promise<PaginatedResult<MediaItem>>;

  search(
    query: string,
    mediaType?: "all" | "movie" | "tv",
    page?: number
  ): Promise<PaginatedResult<MediaItem>>;

  getByGenre(
    genreId: string | number,
    mediaType?: "movie" | "tv",
    page?: number
  ): Promise<PaginatedResult<MediaItem>>;

  getByRegion?(
    regionCode: string,
    mediaType?: "all" | "movie" | "tv",
    page?: number,
    subLang?: string
  ): Promise<PaginatedResult<MediaItem>>;

  getDetails(
    id: string | number,
    mediaType: "movie" | "tv"
  ): Promise<MediaItem | null>;

  getGenres(mediaType?: "movie" | "tv"): Promise<Genre[]>;

  getSeasonEpisodes(
    tvId: string | number,
    seasonNumber: number
  ): Promise<Season | null>;
}
