import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const TRACKERS = [
  "udp://tracker.opentrackr.org:1337/announce",
  "udp://open.stealth.si:80/announce",
  "udp://tracker.torrent.eu.org:451/announce",
  "udp://tracker.coppersurfer.tk:6969/announce",
  "udp://explodie.org:6969/announce",
  "wss://tracker.openwebtorrent.com",
  "wss://tracker.btorrent.xyz",
];

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
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get("title") || "";
    const type = (searchParams.get("type") as "movie" | "tv") || "movie";
    const year = searchParams.get("year") || "";
    let imdbId = searchParams.get("imdbId") || "";
    const season = searchParams.get("season") || "1";
    const episode = searchParams.get("episode") || "1";

    // Step 1: If no imdbId provided, resolve via Cinemeta search
    if (!imdbId && title) {
      const cinemetaType = type === "tv" ? "series" : "movie";
      const cleanTitle = title.replace(/[:\-]/g, " ").trim();
      const cinemetaUrl = `https://v3-cinemeta.strem.io/catalog/${cinemetaType}/top/search=${encodeURIComponent(
        cleanTitle
      )}.json`;

      try {
        const metaRes = await fetch(cinemetaUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)",
            Accept: "application/json",
          },
          next: { revalidate: 86400 },
        });

        if (metaRes.ok) {
          const metaData = await metaRes.json();
          const metas = metaData?.metas || [];

          // Try to match by year if available, else take the top result
          let match = metas.find((m: any) => {
            if (year && m.releaseInfo && m.releaseInfo.includes(year)) {
              return true;
            }
            return false;
          });

          if (!match && metas.length > 0) {
            match = metas[0];
          }

          if (match?.imdb_id || match?.id) {
            imdbId = match.imdb_id || match.id;
          }
        }
      } catch (e) {
        console.warn("Cinemeta lookup failed:", e);
      }
    }

    if (!imdbId) {
      return NextResponse.json({
        imdbId: null,
        streams: [],
        message: "Unable to resolve IMDb ID for torrent lookup",
      });
    }

    // Step 2: Query Torrentio
    const stremType = type === "tv" ? "series" : "movie";
    const stremId = type === "tv" ? `${imdbId}:${season}:${episode}` : imdbId;
    const torrentioUrl = `https://torrentio.strem.fun/stream/${stremType}/${stremId}.json`;

    const torrentRes = await fetch(torrentioUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)",
        Accept: "application/json",
      },
      next: { revalidate: 3600 },
    });

    if (!torrentRes.ok) {
      return NextResponse.json({
        imdbId,
        streams: [],
        message: `Torrentio returned HTTP ${torrentRes.status}`,
      });
    }

    const data = await torrentRes.json();
    const rawStreams = data?.streams || [];

    // Step 3: Parse and enrich streams
    const trackerParams = TRACKERS.map((t) => `&tr=${encodeURIComponent(t)}`).join("");

    const streams: TorrentStream[] = rawStreams
      .filter((s: any) => s.infoHash)
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
        let resolution = "1080p";
        if (/4k|2160p/i.test(s.name) || /2160p|4k/i.test(rawTitle)) resolution = "4K 2160p";
        else if (/1080p/i.test(s.name) || /1080p/i.test(rawTitle)) resolution = "1080p FHD";
        else if (/720p/i.test(s.name) || /720p/i.test(rawTitle)) resolution = "720p HD";

        // Quality features (HDR, DV, Remux)
        const tags: string[] = [];
        if (/HDR/i.test(rawTitle) || /HDR/i.test(s.name)) tags.push("HDR");
        if (/DV|Dolby Vision/i.test(rawTitle) || /DV/i.test(s.name)) tags.push("Dolby Vision");
        if (/Remux/i.test(rawTitle)) tags.push("Remux");
        const quality = tags.length > 0 ? tags.join(" • ") : "Standard";

        const filename = s.behaviorHints?.filename || lines[0] || `${title}`;
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
        };
      });

    // Sort by seeders descending
    streams.sort((a, b) => (b.seeders || 0) - (a.seeders || 0));

    return NextResponse.json({
      imdbId,
      totalStreams: streams.length,
      streams,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to search torrent streams" },
      { status: 500 }
    );
  }
}
