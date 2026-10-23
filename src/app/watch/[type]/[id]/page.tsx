"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { fetchDetails, fetchSeasonEpisodes, fetchTrending } from "@/lib/metadata/client";
import { MediaType, MediaItem, Season } from "@/lib/types";
import { ScreenScapePlayer } from "@/components/player/ScreenScapePlayer";
import { TvEpisodeDrawer } from "@/components/player/TvEpisodeDrawer";
import { MediaRow } from "@/components/media/MediaRow";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Star,
  Bookmark,
  Share2,
  Check,
  ChevronLeft,
  Download,
  AlertCircle,
  Info,
  Film,
} from "lucide-react";

export default function WatchPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const rawType = (params.type as string) || "movie";
  const rawId = params.id as string;
  const initialSeason = parseInt(searchParams.get("s") || "1", 10);
  const initialEpisode = parseInt(searchParams.get("e") || "1", 10);

  const mediaType: MediaType = rawType === "tv" ? "tv" : "movie";
  const tmdbIdNum = parseInt(rawId, 10);

  const [media, setMedia] = useState<MediaItem | null>(null);
  const [activeSeason, setActiveSeason] = useState(initialSeason);
  const [activeEpisode, setActiveEpisode] = useState(initialEpisode);
  const [activeSeasonData, setActiveSeasonData] = useState<Season | null>(null);
  const [recommendations, setRecommendations] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    Promise.all([
      fetchDetails(rawId, mediaType),
      fetchTrending(mediaType, "day", 1).catch(() => ({ results: [] })),
    ])
      .then(([item, trendingData]) => {
        if (!isMounted) return;
        setMedia(item);
        setRecommendations((trendingData.results || []).filter((m) => String(m.tmdbId) !== rawId));

        if (mediaType === "tv") {
          fetchSeasonEpisodes(rawId, initialSeason)
            .then((sData) => {
              if (isMounted) setActiveSeasonData(sData);
            })
            .catch(() => {});
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || "Failed to load media for playback.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [rawId, mediaType, initialSeason]);

  const handleEpisodeChange = (s: number, e: number) => {
    setActiveSeason(s);
    setActiveEpisode(e);
    if (s !== activeSeason) {
      fetchSeasonEpisodes(rawId, s).then((data) => setActiveSeasonData(data)).catch(() => {});
    }
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fadeIn py-6">
        <Skeleton className="w-full aspect-video rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="lg:col-span-2 h-48 rounded-3xl" />
          <Skeleton className="h-48 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !media) {
    return (
      <EmptyState
        icon={<Film className="w-10 h-10" />}
        title="Playback Stream Unavailable"
        description={error || "Could not find title information in the metadata provider."}
        actionText="Back to Catalog"
        actionHref="/"
      />
    );
  }

  const actualTmdbId = media.tmdbId || tmdbIdNum;
  const seasonsToRender = activeSeasonData ? [activeSeasonData] : media.seasons || [];

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Back button and Download Mirror link */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs md:text-sm font-semibold text-foreground-muted hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Discovery</span>
        </Link>

        <a
          href={`https://web.screenscape.fun/download/${mediaType}/${actualTmdbId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-surface-hover hover:bg-surface-border text-foreground-muted hover:text-brand-400 border border-surface-border transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Mirror Download Links</span>
        </a>
      </div>

      {/* Main Watch Layout Grid */}
      <div
        className={`grid gap-8 ${
          media.type === "tv" && seasonsToRender.length > 0 && !isTheaterMode
            ? "grid-cols-1 lg:grid-cols-3"
            : "grid-cols-1"
        }`}
      >
        {/* Left / Center: ScreenScape Player Frame */}
        <div
          className={`${
            media.type === "tv" && seasonsToRender.length > 0 && !isTheaterMode ? "lg:col-span-2" : "col-span-1"
          } space-y-6`}
        >
          <ScreenScapePlayer
            tmdbId={actualTmdbId}
            type={mediaType}
            season={activeSeason}
            episode={activeEpisode}
            title={media.title}
            isTheaterMode={isTheaterMode}
            onToggleTheaterMode={() => setIsTheaterMode(!isTheaterMode)}
          />

          {/* Media Info & Title Header */}
          <div className="p-6 rounded-3xl bg-surface border border-surface-border space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="brand">
                    {media.type === "tv" ? "TV Series" : "Movie"}
                  </Badge>
                  {media.rating > 0 && (
                    <Badge variant="rating">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {media.rating.toFixed(1)}
                    </Badge>
                  )}
                  <Badge variant="quality">{media.quality || "4K"}</Badge>
                  {media.releaseYear && (
                    <span className="text-xs text-foreground-muted font-medium">
                      {media.releaseYear}
                    </span>
                  )}
                  {media.runtime && (
                    <span className="text-xs text-foreground-muted">• {media.runtime}</span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-foreground">
                  {media.title}
                  {media.type === "tv" && (
                    <span className="text-brand-400 font-semibold text-xl ml-2">
                      (S{activeSeason} E{activeEpisode})
                    </span>
                  )}
                </h1>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant={isBookmarked ? "primary" : "outline"}
                  onClick={() => setIsBookmarked(!isBookmarked)}
                >
                  {isBookmarked ? (
                    <>
                      <Check className="w-4 h-4 mr-1.5" />
                      In Watchlist
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4 mr-1.5" />
                      Save to Watchlist
                    </>
                  )}
                </Button>

                <Button size="sm" variant="outline" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-1.5" />
                  {copiedLink ? "Link Copied!" : "Share"}
                </Button>
              </div>
            </div>

            {/* Playback Disclaimer */}
            <div className="p-3.5 rounded-2xl bg-surface-hover/70 border border-surface-border flex items-start gap-2.5 text-xs text-foreground-muted">
              <Info className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                <strong>Third-Party Stream Notice:</strong> The embedded player references ScreenScape with provider ID <code>{actualTmdbId}</code>. Playback availability depends on multi-server mirror indexing and may not be available for every catalog entry.
              </p>
            </div>

            {/* Synopsis */}
            {media.overview && (
              <div className="space-y-2 border-t border-surface-border/60 pt-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                  Synopsis
                </h3>
                <p className="text-sm text-foreground/90 leading-relaxed max-w-4xl">
                  {media.overview}
                </p>
              </div>
            )}

            {/* Cast & Crew */}
            {media.cast && media.cast.length > 0 && (
              <div className="space-y-2 border-t border-surface-border/60 pt-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                  Starring
                </h3>
                <div className="flex flex-wrap gap-2">
                  {media.cast.map((actor) => (
                    <div
                      key={actor.id}
                      className="px-3 py-1.5 rounded-xl bg-surface-hover border border-surface-border text-xs"
                    >
                      <span className="font-semibold text-foreground">{actor.name}</span>
                      <span className="text-foreground-muted text-[11px] ml-1.5">
                        as {actor.character}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right / Sidebar: TV Episode Drawer (if TV series) */}
        {media.type === "tv" && seasonsToRender.length > 0 && (
          <div className="space-y-4">
            <TvEpisodeDrawer
              seasons={seasonsToRender}
              activeSeason={activeSeason}
              activeEpisode={activeEpisode}
              onSelectEpisode={handleEpisodeChange}
            />
          </div>
        )}
      </div>

      {/* Recommended Titles Carousel */}
      {recommendations.length > 0 && (
        <div className="pt-6">
          <MediaRow
            title="More Titles Like This"
            subtitle="Trending recommendations from the provider catalog"
            items={recommendations}
          />
        </div>
      )}
    </div>
  );
}
