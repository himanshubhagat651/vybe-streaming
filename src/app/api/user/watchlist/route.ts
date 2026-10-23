import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        mode: "demo_isolated",
        message: "Supabase unconfigured. Client uses isolated localStorage partition.",
        items: [],
      },
      { status: 200 }
    );
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server client initialization failed" }, { status: 500 });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("watchlists")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items: data });
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        mode: "demo_isolated",
        message: "Supabase unconfigured. Watchlist saved in client partition.",
      },
      { status: 200 }
    );
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server client initialization failed" }, { status: 500 });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  if (!body.tmdb_id || typeof body.tmdb_id !== "number" || body.tmdb_id <= 0) {
    return NextResponse.json({ error: "Invalid tmdb_id" }, { status: 400 });
  }

  if (body.media_type !== "movie" && body.media_type !== "tv") {
    return NextResponse.json({ error: "Invalid media_type" }, { status: 400 });
  }

  if (!body.title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  // Strictly enforce user_id from verified session
  const { data, error } = await supabase
    .from("watchlists")
    .insert({
      user_id: user.id,
      tmdb_id: body.tmdb_id,
      media_type: body.media_type,
      title: body.title,
      poster_path: body.poster_path || null,
      backdrop_path: body.backdrop_path || null,
      vote_average: body.vote_average || null,
      release_year: body.release_year || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ item: data }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        mode: "demo_isolated",
        message: "Supabase unconfigured. Watchlist deleted in client partition.",
      },
      { status: 200 }
    );
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server client initialization failed" }, { status: 500 });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const tmdbIdStr = searchParams.get("tmdbId");
  const mediaType = searchParams.get("mediaType");

  if (!tmdbIdStr || !mediaType) {
    return NextResponse.json({ error: "Missing tmdbId or mediaType" }, { status: 400 });
  }

  const tmdbId = parseInt(tmdbIdStr, 10);

  const { error } = await supabase
    .from("watchlists")
    .delete()
    .eq("user_id", user.id)
    .eq("tmdb_id", tmdbId)
    .eq("media_type", mediaType);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
