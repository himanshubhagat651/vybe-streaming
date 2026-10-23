import { NextRequest, NextResponse } from "next/server";
import { getMetadataProvider } from "@/lib/metadata";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const genre = searchParams.get("genre") || "all";
    const type = (searchParams.get("type") as "movie" | "tv") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);

    const provider = getMetadataProvider();
    const result = await provider.getByGenre(genre, type, page);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch genre metadata" },
      { status: 500 }
    );
  }
}
