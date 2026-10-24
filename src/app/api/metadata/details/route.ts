import { NextRequest, NextResponse } from "next/server";
import { getMetadataProvider } from "@/lib/metadata";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const type = (searchParams.get("type") as "movie" | "tv") || "movie";

    if (!id) {
      return NextResponse.json({ error: "Missing required 'id' parameter" }, { status: 400 });
    }

    const provider = getMetadataProvider();
    const result = await provider.getDetails(id, type);

    if (!result) {
      return NextResponse.json({ error: "Title not found in metadata catalog" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch media details" },
      { status: 500 }
    );
  }
}
