import { NextResponse } from "next/server";
import { getMetadataProvider } from "@/lib/metadata";

export async function GET() {
  const provider = getMetadataProvider();
  return NextResponse.json(provider.getStatus());
}
