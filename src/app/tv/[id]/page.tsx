"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchDetails, fetchSeasonEpisodes, fetchTrending } from "@/lib/metadata/client";
import { MediaItem, Season } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MediaRow } from "@/components/media/MediaRow";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Play,
  Star,
  Bookmark,
  Check,
  ChevronLeft,
  Tv,
  AlertCircle,
  RefreshCw,
  Info,
  Loader2,
} from "lucide-react";
import { useUserData } from "@/context/UserDataContext";

export default function TvDetailsPage() {
  const params = useParams();
  const rawId = params.id as string;
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useUserData();

  const [media, setMedia] = useState<MediaItem | null>(null);
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState(1);
  const [activeSeasonData, setActiveSeasonData] = useState<Season | null>(null);
  const [isLoadingSeason, setIsLoadingSeason] = useState(false);
  const [related, setRelated] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    Promise.all([
      fetchDetails(rawId, "tv"),
      fetchTrending("tv", "day", 1).catch(() => ({ results: [] })),
    ])
      .then(([item, relatedData]) => {
        if (!isMounted) return;
        setMedia(item);
        if (item?.seasons && item.seasons.length > 0) {
          const firstSeasonNum = item.seasons[0].seasonNumber;
          setSelectedSeasonNumber(firstSeasonNum);
          loadSeason(rawId, firstSeasonNum);
        }
        setRelated((relatedData.results || []).filter((m) => String(m.tmdbId) !== rawId));
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || "Failed to load TV series details.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [rawId]);

  const loadSeason = async (tvId: string, seasonNum: number) => {
    setIsLoadingSeason(true);
    try {
      const data = await fetchSeasonEpisodes(tvId, seasonNum);
      setActiveSeasonData(data);
    } catch {
      setActiveSeasonData(null);
    } finally {
      setIsLoadingSeason(false);
    }
  };

  const handleSeasonChange = (num: number) => {
    setSelectedSeasonNumber(num);
    loadSeason(rawId, num);
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fadeIn py-6">
        <Skeleton className="w-full h-[480px] rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Skeleton className="md:col-span-2 h-64 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 space-y-4">
        <div className="p-6 rounded-3xl bg-danger/10 border border-danger/30 text-danger space-y-4 max-w-xl mx-auto text-center">
          <AlertCircle className="w-10 h-10 mx-auto" />
          <h2 className="text-lg font-bold">Metadata Provider Error</h2>
          <p className="text-xs">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="w-3.5 h-3.5 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!media) {
    return (
      <EmptyState
        icon={<Tv className="w-10 h-10" />}
        title="Series Not Found"
        description="We couldn't locate this television series in the provider catalog."
        actionText="Back to Catalog"
        actionHref="/browse?type=tv"
      />
    );
  }

  const watchUrl = `/watch/tv/${media.tmdbId}`;

  return (
    <div className="space-y-12 animate-fadeIn pb-16">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs md:text-sm font-semibold text-foreground-muted hover:text-foreground transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Discovery</span>
      </Link>

      {/* Hero Showcase Header */}
      <div className="relative rounded-3xl overflow-hidden border border-surface-border bg-black shadow-2xl min-h-[480px] md:min-h-[540px] flex items-end">
        {media.backdropUrl ? (
          <img
            src={media.backdropUrl}
            alt={media.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-950 via-surface to-background opacity-60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent max-w-4xl" />

        <div className="relative z-10 p-6 md:p-12 flex flex-col md:flex-row gap-8 items-start md:items-end">
          {/* Poster Thumb */}
          {media.posterUrl && (
            <div className="w-36 md:w-48 aspect-poster rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10 shrink-0 hidden sm:block bg-surface-hover">
              <img src={media.posterUrl} alt={media.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Metadata */}
          <div className="space-y-4 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="brand">TV Series</Badge>
              {media.rating > 0 && (
                <Badge variant="rating">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {media.rating.toFixed(1)}
                </Badge>
              )}
              {media.releaseYear && (
                <span className="text-xs text-gray-300 font-medium">{media.releaseYear}</span>
              )}
              {media.runtime && <span className="text-xs text-gray-300">• {media.runtime}</span>}
              <Badge variant="quality">{media.quality || "4K"}</Badge>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white">{media.title}</h1>
            {media.tagline && (
              <p className="text-sm font-medium text-brand-300 italic">
                &ldquo;{media.tagline}&rdquo;
              </p>
            )}

            {media.overview && (
              <p className="text-xs sm:text-sm text-gray-200 leading-relaxed line-clamp-3">
                {media.overview}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href={watchUrl}>
                <Button size="lg" variant="primary" className="shadow-2xl">
                  <Play className="w-5 h-5 fill-current mr-2" />
                  Stream Series
                </Button>
              </Link>

              {(() => {
                const isBookmarked = media ? isInWatchlist(media.tmdbId, "tv") : false;
                const toggleWatchlist = async () => {
                  if (!media) return;
                  if (isBookmarked) {
                    await removeFromWatchlist(media.tmdbId, "tv");
                  } else {
                    await addToWatchlist({
                      tmdbId: media.tmdbId,
                      mediaType: "tv",
                      title: media.title,
                      posterPath: media.posterUrl,
                      backdropPath: media.backdropUrl,
                      voteAverage: media.rating,
                      releaseYear: media.releaseYear,
                    });
                  }
                };

                return (
                  <Button
                    size="lg"
                    variant={isBookmarked ? "primary" : "glass"}
                    onClick={toggleWatchlist}
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
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Seasons & Episodes Guide */}
      {media.seasons && media.seasons.length > 0 && (
        <div className="p-6 md:p-8 rounded-3xl bg-surface border border-surface-border space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">Episodes Guide</h2>
              <p className="text-xs text-foreground-muted">Browse all seasons and full episode listings</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {media.seasons.map((s) => (
                <button
                  key={s.seasonNumber}
                  onClick={() => handleSeasonChange(s.seasonNumber)}
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

          {isLoadingSeason ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-foreground-muted text-xs">
              <Loader2 className="w-6 h-6 animate-spin text-brand-400" />
              <span>Loading episode details...</span>
            </div>
          ) : activeSeasonData?.episodes && activeSeasonData.episodes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeSeasonData.episodes.map((ep) => (
                <Link
                  key={ep.episodeNumber}
                  href={`/watch/tv/${media.tmdbId}?s=${selectedSeasonNumber}&e=${ep.episodeNumber}`}
                  className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-surface-hover/50 hover:bg-surface-hover border border-surface-border/60 hover:border-brand-500/40 transition-all group"
                >
                  <div className="relative w-32 aspect-video rounded-xl overflow-hidden shrink-0 bg-black">
                    {ep.thumbnailUrl ? (
                      <img src={ep.thumbnailUrl} alt={ep.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full bg-surface-hover flex items-center justify-center">
                        <Tv className="w-5 h-5 text-white/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Play className="w-5 h-5 text-white fill-current" />
                    </div>
                    {ep.duration && (
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-black/70 text-white">
                        {ep.duration}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <span className="text-xs font-mono font-bold text-brand-400">EP {ep.episodeNumber}</span>
                    <h4 className="text-sm font-semibold text-foreground truncate group-hover:text-brand-400 transition-colors">
                      {ep.title}
                    </h4>
                    {ep.overview && (
                      <p className="text-xs text-foreground-muted line-clamp-2 leading-relaxed">{ep.overview}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-foreground-muted italic py-4">No episode records found for this season.</p>
          )}
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
                  <div key={actor.id} className="p-3 rounded-2xl bg-surface-hover/60 border border-surface-border flex items-center gap-3">
                    {actor.avatarUrl ? (
                      <img src={actor.avatarUrl} alt={actor.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center font-bold text-xs text-foreground-muted shrink-0">
                        {actor.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{actor.name}</p>
                      <p className="text-[11px] text-foreground-muted truncate">as {actor.character}</p>
                    </div>
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
              {media.genres && media.genres.length > 0 && (
                <div>
                  <span className="text-foreground-muted block mb-0.5">Genres</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {media.genres.map((g) => (
                      <Badge key={g} variant="outline">{g}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {media.seasons && (
                <>
                  <hr className="border-surface-border" />
                  <div>
                    <span className="text-foreground-muted block mb-0.5">Total Seasons</span>
                    <span className="font-semibold text-foreground">{media.seasons.length} Seasons</span>
                  </div>
                </>
              )}
              <hr className="border-surface-border" />
              <div>
                <span className="text-foreground-muted block mb-0.5">TMDB ID</span>
                <span className="font-mono text-brand-400">{media.tmdbId}</span>
              </div>
            </div>
          </div>

          {/* Stream Availability Notice */}
          <div className="p-4 rounded-2xl bg-surface-hover border border-surface-border text-xs text-foreground-muted flex items-start gap-2.5">
            <Info className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Playback Notice:</strong> ScreenScape links are generated using this series&apos; TMDB ID (<code>{media.tmdbId}</code>). Availability is subject to third-party mirror streams.
            </p>
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
