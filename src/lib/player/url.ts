import { MediaType } from "../types";

export interface PlayerUrlOptions {
  tmdbId: number | string;
  type: MediaType;
  season?: number | string;
  episode?: number | string;
  language?: string;
  baseUrl?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
  sanitizedTmdbId?: number;
  sanitizedSeason?: number;
  sanitizedEpisode?: number;
}

export const SUPPORTED_LANGUAGES = [
  { code: "hindi", label: "🇮🇳 Hindi (Forced Audio Default)" },
  { code: "eng", label: "🇺🇸 English (Original)" },
  { code: "french", label: "🇫🇷 French" },
] as const;

export const DEFAULT_PLAYER_BASE_URL =
  process.env.NEXT_PUBLIC_SCREENSCAPE_EMBED_BASE_URL ||
  "https://web.screenscape.fun/embed";

export const FALLBACK_PLAYER_BASE_URL =
  process.env.NEXT_PUBLIC_SCREENSCAPE_FALLBACK_URL ||
  "https://nxsha.screenscape.me/embed";

export const VIDLINK_PLAYER_BASE_URL = "https://vidlink.pro";

export const PLAYER_SERVERS = [
  { id: "core", name: "ScreenScape Core (Default)", url: DEFAULT_PLAYER_BASE_URL },
  { id: "nxsha", name: "ScreenScape NXSHA (Mirror)", url: FALLBACK_PLAYER_BASE_URL },
  { id: "vidlink", name: "VidLink (Fast Fallback Stream)", url: VIDLINK_PLAYER_BASE_URL },
];

/**
 * Validates player input parameters according to ScreenScape documentation.
 */
export function validatePlayerParams(options: PlayerUrlOptions): ValidationResult {
  const numericId = typeof options.tmdbId === "string" ? parseInt(options.tmdbId, 10) : options.tmdbId;

  if (!numericId || isNaN(numericId) || numericId <= 0) {
    return {
      isValid: false,
      errorMessage: `Invalid TMDB ID: "${options.tmdbId}". Must be a valid positive number.`,
    };
  }

  if (options.type !== "movie" && options.type !== "tv") {
    return {
      isValid: false,
      errorMessage: `Invalid media type: "${options.type}". Must be "movie" or "tv".`,
    };
  }

  let sanitizedSeason: number | undefined;
  let sanitizedEpisode: number | undefined;

  if (options.type === "tv") {
    const s = typeof options.season === "string" ? parseInt(options.season, 10) : options.season;
    const e = typeof options.episode === "string" ? parseInt(options.episode, 10) : options.episode;

    sanitizedSeason = !s || isNaN(s) || s < 1 ? 1 : Math.floor(s);
    sanitizedEpisode = !e || isNaN(e) || e < 1 ? 1 : Math.floor(e);
  }

  return {
    isValid: true,
    sanitizedTmdbId: numericId,
    sanitizedSeason,
    sanitizedEpisode,
  };
}

/**
 * Builds the verified ScreenScape embed URL with validated parameters.
 * Specification:
 * - Movie: {baseUrl}?tmdb={id}&type=movie[&lan={code}]
 * - TV:    {baseUrl}?tmdb={id}&type=tv&s={season}&e={episode}[&lan={code}]
 */
export function buildScreenScapeEmbedUrl(options: PlayerUrlOptions): {
  url: string;
  validation: ValidationResult;
} {
  const validation = validatePlayerParams(options);

  if (!validation.isValid || !validation.sanitizedTmdbId) {
    return {
      url: "",
      validation,
    };
  }

  const base = options.baseUrl || DEFAULT_PLAYER_BASE_URL;

  // VidLink multi-server fallback format with multi-language enabled
  if (base.includes("vidlink.pro")) {
    const isTv = options.type === "tv";
    const vidlinkUrl = isTv
      ? `https://vidlink.pro/tv/${validation.sanitizedTmdbId}/${validation.sanitizedSeason || 1}/${validation.sanitizedEpisode || 1}?multiLang=true`
      : `https://vidlink.pro/movie/${validation.sanitizedTmdbId}?multiLang=true`;
    return {
      url: vidlinkUrl,
      validation,
    };
  }

  const params = new URLSearchParams();

  params.set("tmdb", String(validation.sanitizedTmdbId));
  params.set("type", options.type);

  if (options.type === "tv") {
    params.set("s", String(validation.sanitizedSeason || 1));
    params.set("e", String(validation.sanitizedEpisode || 1));
  }

  // Force Hindi language unless user explicitly selected another language
  const requestedLanguage =
    options.language && options.language.trim() ? options.language.trim() : "hindi";
  params.set("lan", encodeURIComponent(requestedLanguage));

  return {
    url: `${base}?${params.toString()}`,
    validation,
  };
}

/**
 * Dedicated download route URL according to ScreenScape documentation.
 */
export function buildScreenScapeDownloadUrl(
  tmdbId: number | string,
  type: MediaType
): string {
  const id = typeof tmdbId === "string" ? parseInt(tmdbId, 10) : tmdbId;
  const safeId = !id || isNaN(id) ? "" : String(id);
  return `https://web.screenscape.fun/download/${type}/${safeId}`;
}
