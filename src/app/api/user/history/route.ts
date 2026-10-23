import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        mode: "demo_isolated",
        message: "Supabase unconfigured. Client uses isolated localStorage partition.",
        history: [],
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
    .from("watch_history")
    .select("*")
    .eq("user_id", user.id)
    .order("last_watched_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ history: data });
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        mode: "demo_isolated",
        message: "Supabase unconfigured. History recorded in client partition.",
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

  const progressSeconds = Math.max(Number(body.progress_seconds) || 0, 0);
  const durationSeconds = body.duration_seconds ? Number(body.duration_seconds) : null;
  const isCompleted =
    durationSeconds !== null && durationSeconds > 0 && progressSeconds / durationSeconds >= 0.95;

  const { data, error } = await supabase
    .from("watch_history")
    .upsert(
      {
        user_id: user.id,
        tmdb_id: body.tmdb_id,
        media_type: body.media_type,
        title: body.title || "Untitled",
        poster_path: body.poster_path || null,
        backdrop_path: body.backdrop_path || null,
        season: body.season ? Number(body.season) : null,
        episode: body.episode ? Number(body.episode) : null,
        progress_seconds: progressSeconds,
        duration_seconds: durationSeconds,
        completed: isCompleted,
        last_watched_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,tmdb_id,media_type,coalesce(season,0),coalesce(episode,0)",
      }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ item: data });
}

export async function DELETE(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        mode: "demo_isolated",
        message: "Supabase unconfigured. History cleared in client partition.",
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
  const seasonStr = searchParams.get("season");
  const episodeStr = searchParams.get("episode");

  if (!tmdbIdStr) {
    // Clear all history for this user
    const { error } = await supabase.from("watch_history").delete().eq("user_id", user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, clearedAll: true });
  }

  const tmdbId = parseInt(tmdbIdStr, 10);
  let query = supabase
    .from("watch_history")
    .delete()
    .eq("user_id", user.id)
    .eq("tmdb_id", tmdbId);

  if (mediaType) query = query.eq("media_type", mediaType);
  if (seasonStr) query = query.eq("season", parseInt(seasonStr, 10));
  if (episodeStr) query = query.eq("episode", parseInt(episodeStr, 10));

  const { error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
