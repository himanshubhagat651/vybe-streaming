import { NextRequest, NextResponse } from "next/server";
import { getMetadataProvider } from "@/lib/metadata";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = (searchParams.get("type") as "movie" | "tv") || "movie";
    const page = parseInt(searchParams.get("page") || "1", 10);

    const provider = getMetadataProvider();
    const result = await provider.getPopular(type, page);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch popular metadata" },
      { status: 500 }
    );
  }
}
