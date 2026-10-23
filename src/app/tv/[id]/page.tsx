"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getMediaByTmdbId, getMediaById, DEMO_MEDIA, getMediaByGenre } from "@/lib/demoData";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MediaRow } from "@/components/media/MediaRow";
import { Play, Star, Calendar, Clock, Bookmark, Check, ChevronLeft, Tv } from "lucide-react";

export default function TvDetailsPage() {
  const params = useParams();
  const rawId = params.id as string;
  const tmdbIdNum = parseInt(rawId, 10);

  const media =
    getMediaByTmdbId(tmdbIdNum, "tv") ||
    getMediaById(rawId) ||
    DEMO_MEDIA.find((m) => m.type === "tv") ||
    DEMO_MEDIA[2];

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState(1);
  const watchUrl = `/watch/tv/${media.tmdbId}`;

  const currentSeason =
    media.seasons?.find((s) => s.seasonNumber === selectedSeasonNumber) ||
    media.seasons?.[0];

  const related = getMediaByGenre(media.genres[0] || "Action").filter(
    (m) => m.tmdbId !== media.tmdbId
  );

  return (
    <div className="space-y-12 animate-fadeIn pb-16">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs md:text-sm font-semibold text-foreground-muted hover:text-foreground transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Discovery</span>
      </Link>

      {/* Hero Showcase */}
      <div className="relative rounded-3xl overflow-hidden border border-surface-border bg-black shadow-2xl min-h-[480px] md:min-h-[540px] flex items-end">
        <img
          src={media.backdropUrl}
          alt={media.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent max-w-4xl" />

        <div className="relative z-10 p-6 md:p-12 flex flex-col md:flex-row gap-8 items-start md:items-end">
          {/* Poster Thumb */}
          <div className="w-36 md:w-48 aspect-poster rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10 shrink-0 hidden sm:block">
            <img src={media.posterUrl} alt={media.title} className="w-full h-full object-cover" />
          </div>

          {/* Metadata */}
          <div className="space-y-4 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="brand">TV Series</Badge>
              <Badge variant="rating">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {media.rating.toFixed(1)}
              </Badge>
              <Badge variant="quality">{media.quality || "4K"}</Badge>
              {media.ageRating && <Badge variant="outline">{media.ageRating}</Badge>}
              <span className="text-xs text-gray-300 font-medium">{media.releaseYear}</span>
              {media.runtime && <span className="text-xs text-gray-300">• {media.runtime}</span>}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white">{media.title}</h1>
            {media.tagline && <p className="text-sm font-medium text-brand-300 italic">&ldquo;{media.tagline}&rdquo;</p>}

            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed line-clamp-3">
              {media.overview}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href={watchUrl}>
                <Button size="lg" variant="primary" className="shadow-2xl">
                  <Play className="w-5 h-5 fill-current mr-2" />
                  Stream Series
                </Button>
              </Link>

              <Button
                size="lg"
                variant={isBookmarked ? "primary" : "glass"}
                onClick={() => setIsBookmarked(!isBookmarked)}
              >
                {isBookmarked ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    In Watchlist
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4 mr-2" />
                    Save to Watchlist
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Seasons & Episodes Browser */}
      {media.seasons && media.seasons.length > 0 && (
        <div className="p-6 md:p-8 rounded-3xl bg-surface border border-surface-border space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">Episodes Guide</h2>
              <p className="text-xs text-foreground-muted">Browse all seasons and full episode listings</p>
            </div>

            <div className="flex items-center gap-2">
              {media.seasons.map((s) => (
                <button
                  key={s.seasonNumber}
                  onClick={() => setSelectedSeasonNumber(s.seasonNumber)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedSeasonNumber === s.seasonNumber
                      ? "bg-brand-600 text-white shadow-md shadow-brand-600/30"
                      : "bg-surface-hover hover:bg-surface-border text-foreground-muted hover:text-foreground"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentSeason?.episodes.map((ep) => (
              <Link
                key={ep.episodeNumber}
                href={`/watch/tv/${media.tmdbId}?s=${selectedSeasonNumber}&e=${ep.episodeNumber}`}
                className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-surface-hover/50 hover:bg-surface-hover border border-surface-border/60 hover:border-brand-500/40 transition-all group"
              >
                <div className="relative w-32 aspect-video rounded-xl overflow-hidden shrink-0 bg-black">
                  <img src={ep.thumbnailUrl} alt={ep.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Play className="w-5 h-5 text-white fill-current" />
                  </div>
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-black/70 text-white">
                    {ep.duration}
                  </span>
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <span className="text-xs font-mono font-bold text-brand-400">EP {ep.episodeNumber}</span>
                  <h4 className="text-sm font-semibold text-foreground truncate group-hover:text-brand-400 transition-colors">
                    {ep.title}
                  </h4>
                  <p className="text-xs text-foreground-muted line-clamp-2 leading-relaxed">{ep.overview}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Cast & Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {media.cast && media.cast.length > 0 && (
            <div className="p-6 rounded-3xl bg-surface border border-surface-border space-y-4">
              <h2 className="text-lg font-bold text-foreground">Series Cast</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {media.cast.map((actor) => (
                  <div key={actor.id} className="p-3 rounded-2xl bg-surface-hover/60 border border-surface-border">
                    <p className="text-xs font-bold text-foreground truncate">{actor.name}</p>
                    <p className="text-[11px] text-foreground-muted truncate">as {actor.character}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-surface border border-surface-border space-y-4 text-xs">
            <h3 className="font-bold text-sm text-foreground">Series Info</h3>
            <div className="space-y-3">
              <div>
                <span className="text-foreground-muted block mb-0.5">Genres</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {media.genres.map((g) => (
                    <Badge key={g} variant="outline">{g}</Badge>
                  ))}
                </div>
              </div>
              <hr className="border-surface-border" />
              <div>
                <span className="text-foreground-muted block mb-0.5">Total Seasons</span>
                <span className="font-semibold text-foreground">{media.seasons?.length || 1} Seasons</span>
              </div>
              <hr className="border-surface-border" />
              <div>
                <span className="text-foreground-muted block mb-0.5">TMDB ID</span>
                <span className="font-mono text-brand-400">{media.tmdbId}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Titles */}
      {related.length > 0 && (
        <MediaRow title="Similar Series You Might Like" items={related} />
      )}
    </div>
  );
}
