"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  getMediaByTmdbId,
  getMediaById,
  DEMO_MEDIA,
  getMediaByGenre,
} from "@/lib/demoData";
import { MediaType } from "@/lib/types";
import { ScreenScapePlayer } from "@/components/player/ScreenScapePlayer";
import { TvEpisodeDrawer } from "@/components/player/TvEpisodeDrawer";
import { MediaRow } from "@/components/media/MediaRow";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Star,
  Calendar,
  Clock,
  Bookmark,
  Share2,
  Check,
  ChevronLeft,
  Tv,
  Film,
  Download,
} from "lucide-react";

export default function WatchPage() {
  const params = useParams();
  const rawType = (params.type as string) || "movie";
  const rawId = params.id as string;

  const mediaType: MediaType = rawType === "tv" ? "tv" : "movie";
  const tmdbIdNum = parseInt(rawId, 10);

  // Lookup media in demo store
  const media =
    getMediaByTmdbId(tmdbIdNum, mediaType) ||
    getMediaById(rawId) ||
    DEMO_MEDIA[0];

  const actualTmdbId = media.tmdbId || tmdbIdNum || 550;

  // TV Series active episode state
  const [activeSeason, setActiveSeason] = useState(1);
  const [activeEpisode, setActiveEpisode] = useState(1);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleEpisodeChange = (s: number, e: number) => {
    setActiveSeason(s);
    setActiveEpisode(e);
    // Smooth scroll back to player on mobile
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Recommended titles based on genre
  const recommendations = getMediaByGenre(media.genres[0] || "Action").filter(
    (m) => m.tmdbId !== actualTmdbId
  );

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Back button link */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs md:text-sm font-semibold text-foreground-muted hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Discovery</span>
        </Link>

        {/* Dedicated ScreenScape Download Page Link */}
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
          media.type === "tv" && media.seasons && media.seasons.length > 0 && !isTheaterMode
            ? "grid-cols-1 lg:grid-cols-3"
            : "grid-cols-1"
        }`}
      >
        {/* Left / Center: ScreenScape Player Frame */}
        <div
          className={`${
            media.type === "tv" && media.seasons && !isTheaterMode ? "lg:col-span-2" : "col-span-1"
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
                  <Badge variant="rating">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {media.rating.toFixed(1)}
                  </Badge>
                  <Badge variant="quality">{media.quality || "4K Ultra HD"}</Badge>
                  {media.ageRating && <Badge variant="outline">{media.ageRating}</Badge>}
                  <span className="text-xs text-foreground-muted font-medium">
                    {media.releaseYear}
                  </span>
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

            {/* Synopsis */}
            <div className="space-y-2 border-t border-surface-border/60 pt-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                Synopsis
              </h3>
              <p className="text-sm text-foreground/90 leading-relaxed max-w-4xl">
                {media.overview}
              </p>
            </div>

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
        {media.type === "tv" && media.seasons && media.seasons.length > 0 && (
          <div className="space-y-4">
            <TvEpisodeDrawer
              seasons={media.seasons}
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
            subtitle="Curated recommendations based on genres and themes"
            items={recommendations}
          />
        </div>
      )}
    </div>
  );
}
