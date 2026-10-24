export interface TorrentStream {
  infoHash: string;
  name: string;
  title: string;
  quality: string;
  resolution: string;
  seeders?: number;
  size?: string;
  source?: string;
  filename?: string;
  magnetUrl: string;
  isHindiDubbed?: boolean;
}

export const TRACKERS = [
  "udp://tracker.opentrackr.org:1337/announce",
  "udp://open.stealth.si:80/announce",
  "udp://tracker.torrent.eu.org:451/announce",
  "udp://tracker.coppersurfer.tk:6969/announce",
  "udp://explodie.org:6969/announce",
  "wss://tracker.openwebtorrent.com",
  "wss://tracker.btorrent.xyz",
];

/**
 * Parses and enriches raw Torrentio streams into structured TorrentStream objects.
 */
export function parseTorrentioStreams(
  rawStreams: any[],
  defaultTitle: string
): TorrentStream[] {
  const trackerParams = TRACKERS.map((t) => `&tr=${encodeURIComponent(t)}`).join("");

  return rawStreams
    .filter((s: any) => s && s.infoHash)
    .map((s: any) => {
      const rawTitle: string = s.title || "";
      const lines = rawTitle.split("\n");

      // Extract seeders
      const seedMatch = rawTitle.match(/👤\s*(\d+)/);
      const seeders = seedMatch ? parseInt(seedMatch[1], 10) : undefined;

      // Extract size
      const sizeMatch = rawTitle.match(/💾\s*([\d\.]+\s*[GMK]B)/i);
      const size = sizeMatch ? sizeMatch[1] : undefined;

      // Extract provider/indexer
      const sourceMatch = rawTitle.match(/⚙️\s*([^\n]+)/);
      const source = sourceMatch ? sourceMatch[1].trim() : undefined;

      // Extract resolution from name or title
      let resolution = "1080p FHD";
      if (/4k|2160p/i.test(s.name) || /2160p|4k/i.test(rawTitle)) resolution = "4K 2160p";
      else if (/1080p/i.test(s.name) || /1080p/i.test(rawTitle)) resolution = "1080p FHD";
      else if (/720p/i.test(s.name) || /720p/i.test(rawTitle)) resolution = "720p HD";
      else if (/480p/i.test(s.name) || /480p/i.test(rawTitle)) resolution = "480p SD";

      // Quality features (HDR, DV, Remux)
      const tags: string[] = [];
      if (/HDR/i.test(rawTitle) || /HDR/i.test(s.name)) tags.push("HDR");
      if (/DV|Dolby Vision/i.test(rawTitle) || /DV/i.test(s.name)) tags.push("Dolby Vision");
      if (/Remux/i.test(rawTitle)) tags.push("Remux");
      const quality = tags.length > 0 ? tags.join(" • ") : "Standard";

      // Detect Hindi dubbing / dual audio
      const isHindiDubbed =
        /hindi|hin[\s\.\-_]|dubbed|dual[\s\-_]?audio|multi[\s\-_]?audio/i.test(rawTitle) ||
        /hindi/i.test(s.name);

      const filename = s.behaviorHints?.filename || lines[0] || defaultTitle;
      const dn = encodeURIComponent(filename);
      const magnetUrl = `magnet:?xt=urn:btih:${s.infoHash}&dn=${dn}${trackerParams}`;

      return {
        infoHash: s.infoHash,
        name: s.name,
        title: filename,
        quality,
        resolution,
        seeders,
        size,
        source,
        filename,
        magnetUrl,
        isHindiDubbed,
      };
    })
    .sort((a, b) => (b.seeders || 0) - (a.seeders || 0));
}

/**
 * Universal torrent streams fetcher with client-side fallback.
 * First queries the local /api/torrents/streams route. If that fails, is rate-limited,
 * or blocked by Cloudflare on datacenter IPs, it falls back directly to Cinemeta + Torrentio
 * in the user's browser (which is residential/mobile IP and fully supports CORS).
 */
export async function getTorrentStreams(options: {
  title: string;
  type: "movie" | "tv";
  year?: string;
  season?: number | string;
  episode?: number | string;
}): Promise<{ streams: TorrentStream[]; imdbId?: string }> {
  const { title, type, year, season = 1, episode = 1 } = options;

  let knownImdbId: string | undefined;

  // 1. Try our internal API route first
  try {
    const params = new URLSearchParams();
    params.set("title", title);
    params.set("type", type);
    if (year) params.set("year", year);
    if (type === "tv") {
      params.set("season", String(season));
      params.set("episode", String(episode));
    }

    const res = await fetch(`/api/torrents/streams?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.imdbId) knownImdbId = data.imdbId;
      if (data.streams && data.streams.length > 0) {
        return { streams: data.streams, imdbId: data.imdbId };
      }
    }
  } catch (err) {
    console.warn("Internal torrent API route fetch error, falling back to client fetch:", err);
  }

  // 2. Client-side fallback to Cinemeta + Torrentio
  try {
    let imdbId = knownImdbId;
    if (!imdbId && title) {
      const cinemetaType = type === "tv" ? "series" : "movie";
      const cleanTitle = title.replace(/[:\-]/g, " ").trim();
      const cinemetaUrl = `https://v3-cinemeta.strem.io/catalog/${cinemetaType}/top/search=${encodeURIComponent(
        cleanTitle
      )}.json`;

      const cRes = await fetch(cinemetaUrl);
      if (cRes.ok) {
        const cData = await cRes.json();
        const metas = cData?.metas || [];
        let match = metas.find(
          (m: any) => year && m.releaseInfo && m.releaseInfo.includes(year)
        );
        if (!match && metas.length > 0) match = metas[0];
        imdbId = match?.imdb_id || match?.id;
      }
    }

    if (!imdbId) {
      return { streams: [] };
    }

    const stremType = type === "tv" ? "series" : "movie";
    const stremId = type === "tv" ? `${imdbId}:${season}:${episode}` : imdbId;
    const torrentioUrl = `https://torrentio.strem.fun/stream/${stremType}/${stremId}.json`;

    const tRes = await fetch(torrentioUrl);
    if (tRes.ok) {
      const tData = await tRes.json();
      const streams = parseTorrentioStreams(tData?.streams || [], title);
      return { streams, imdbId };
    }
  } catch (clientErr) {
    console.error("Client torrent fetch fallback failed:", clientErr);
  }

  return { streams: [] };
}
