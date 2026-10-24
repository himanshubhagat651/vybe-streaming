import { NextRequest, NextResponse } from "next/server";
import { parseTorrentioStreams, TorrentStream } from "@/lib/torrents";

export const runtime = "edge";

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
    const streams: TorrentStream[] = parseTorrentioStreams(rawStreams, title);

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
