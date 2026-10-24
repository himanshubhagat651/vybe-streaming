import { NextRequest, NextResponse } from "next/server";
import { getMetadataProvider } from "@/lib/metadata";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = (searchParams.get("type") as "all" | "movie" | "tv") || "all";
    const timeWindow = (searchParams.get("timeWindow") as "day" | "week") || "day";
    const page = parseInt(searchParams.get("page") || "1", 10);

    const provider = getMetadataProvider();
    const result = await provider.getTrending(type, timeWindow, page);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch trending metadata" },
      { status: 500 }
    );
  }
}
