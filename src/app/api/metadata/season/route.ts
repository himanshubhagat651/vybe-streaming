import { NextRequest, NextResponse } from "next/server";
import { getMetadataProvider } from "@/lib/metadata";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tvId = searchParams.get("tvId");
    const seasonNumber = parseInt(searchParams.get("season") || "1", 10);

    if (!tvId) {
      return NextResponse.json({ error: "Missing required 'tvId' parameter" }, { status: 400 });
    }

    const provider = getMetadataProvider();
    const result = await provider.getSeasonEpisodes(tvId, seasonNumber);

    if (!result) {
      return NextResponse.json({ error: "Season not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch season episodes" },
      { status: 500 }
    );
  }
}
