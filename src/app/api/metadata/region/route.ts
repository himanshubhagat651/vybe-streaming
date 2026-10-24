import { NextRequest, NextResponse } from "next/server";
import { getMetadataProvider } from "@/lib/metadata";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code") || searchParams.get("region") || "all";
    const type = (searchParams.get("type") as "all" | "movie" | "tv") || "all";
    const page = parseInt(searchParams.get("page") || "1", 10);

    const provider = getMetadataProvider();
    if (provider.getByRegion) {
      const data = await provider.getByRegion(code, type, page);
      return NextResponse.json(data);
    }

    const data = await provider.getTrending(type, "week", page);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch regional content" },
      { status: 500 }
    );
  }
}
