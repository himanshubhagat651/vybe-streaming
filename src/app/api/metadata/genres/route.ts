import { NextRequest, NextResponse } from "next/server";
import { getMetadataProvider } from "@/lib/metadata";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = (searchParams.get("type") as "movie" | "tv") || "movie";

    const provider = getMetadataProvider();
    const result = await provider.getGenres(type);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch genre list" },
      { status: 500 }
    );
  }
}
