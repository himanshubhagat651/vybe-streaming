import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get("title") || "";
    const year = searchParams.get("year") || "";
    const requestedProvider = searchParams.get("provider") || "auto"; // "auto", "youtube", "dailymotion"
    const isMuted = searchParams.get("muted") !== "false";
    const isAutoplay = searchParams.get("autoplay") !== "false";

    if (!title.trim()) {
      return NextResponse.json({ error: "Missing title parameter" }, { status: 400 });
    }

    const cleanTitle = title.trim();
    const query = `${cleanTitle} ${year} official trailer`.trim();

    let ytVideoId: string | null = null;
    let dmVideoId: string | null = null;

    // 1. Try YouTube if not exclusively asking for dailymotion
    if (requestedProvider !== "dailymotion") {
      try {
        const qYt = encodeURIComponent(query);
        const ytRes = await fetch(`https://www.youtube.com/results?search_query=${qYt}`, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9",
          },
          next: { revalidate: 86400 },
        });

        if (ytRes.ok) {
          const html = await ytRes.text();
          const match = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
          if (match && match[1]) {
            ytVideoId = match[1];
          }
        }
      } catch (err) {
        console.warn("YouTube search API fetch error:", err);
      }
    }

    // 2. Fetch DailyMotion video ID (either as primary if requested, or as fallback)
    try {
      const qDm = encodeURIComponent(`${cleanTitle} trailer`);
      const dmRes = await fetch(
        `https://api.dailymotion.com/videos?search=${qDm}&limit=1&fields=id,title`,
        { next: { revalidate: 86400 } }
      );
      if (dmRes.ok) {
        const dmData = await dmRes.json();
        if (Array.isArray(dmData.list) && dmData.list.length > 0 && dmData.list[0]?.id) {
          dmVideoId = dmData.list[0].id;
        }
      }
    } catch (err) {
      console.warn("DailyMotion search API fetch error:", err);
    }

    // Determine primary provider
    if (requestedProvider === "dailymotion" && dmVideoId) {
      const embedUrl = `https://www.dailymotion.com/embed/video/${dmVideoId}?autoplay=${
        isAutoplay ? 1 : 0
      }&mute=${isMuted ? 1 : 0}&ui-theme=dark&controls=0&queue-enable=false`;

      return NextResponse.json(
        {
          provider: "dailymotion",
          videoId: dmVideoId,
          embedUrl,
          fallbackUrl: ytVideoId
            ? `https://www.youtube-nocookie.com/embed/${ytVideoId}?autoplay=1&mute=1&loop=1&playlist=${ytVideoId}&playsinline=1`
            : null,
          title: cleanTitle,
        },
        {
          headers: {
            "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
          },
        }
      );
    }

    if (ytVideoId) {
      const embedUrl = `https://www.youtube-nocookie.com/embed/${ytVideoId}?autoplay=${
        isAutoplay ? 1 : 0
      }&mute=${isMuted ? 1 : 0}&loop=1&playlist=${ytVideoId}&playsinline=1&controls=0&rel=0&modestbranding=1&enablejsapi=1`;

      return NextResponse.json(
        {
          provider: "youtube",
          videoId: ytVideoId,
          embedUrl,
          fallbackUrl: dmVideoId
            ? `https://www.dailymotion.com/embed/video/${dmVideoId}?autoplay=1&mute=1&ui-theme=dark`
            : null,
          title: cleanTitle,
        },
        {
          headers: {
            "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
          },
        }
      );
    }

    // If YouTube video ID was not parsed, but DailyMotion is available:
    if (dmVideoId) {
      const embedUrl = `https://www.dailymotion.com/embed/video/${dmVideoId}?autoplay=${
        isAutoplay ? 1 : 0
      }&mute=${isMuted ? 1 : 0}&ui-theme=dark&controls=0`;

      return NextResponse.json(
        {
          provider: "dailymotion",
          videoId: dmVideoId,
          embedUrl,
          fallbackUrl: null,
          title: cleanTitle,
        },
        {
          headers: {
            "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
          },
        }
      );
    }

    // Default YouTube search playlist embed as last guaranteed fallback
    const fallbackSearchUrl = `https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(
      query
    )}&autoplay=${isAutoplay ? 1 : 0}&mute=${isMuted ? 1 : 0}&playsinline=1&controls=0`;

    return NextResponse.json(
      {
        provider: "youtube",
        videoId: null,
        embedUrl: fallbackSearchUrl,
        fallbackUrl: null,
        title: cleanTitle,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to resolve trailer video" },
      { status: 500 }
    );
  }
}
