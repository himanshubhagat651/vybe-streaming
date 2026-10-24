"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Play, Star, Bookmark, Check, Info, Film, Tv } from "lucide-react";
import { MediaItem } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { useUserData } from "@/context/UserDataContext";

interface MediaCardProps {
  media: MediaItem;
  onOpenInfo?: (media: MediaItem) => void;
  priority?: boolean;
}

export function MediaCard({ media, onOpenInfo }: MediaCardProps) {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useUserData();
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const isBookmarked = isInWatchlist(media.tmdbId, media.type);

  const toggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isBookmarked) {
      await removeFromWatchlist(media.tmdbId, media.type);
    } else {
      await addToWatchlist({
        tmdbId: media.tmdbId,
        mediaType: media.type,
        title: media.title,
        posterPath: media.posterUrl,
        backdropPath: media.backdropUrl,
        voteAverage: media.rating,
        releaseYear: media.releaseYear,
      });
    }
  };

  const handleInfo = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onOpenInfo) {
      onOpenInfo(media);
    }
  };

  const watchUrl = `/watch/${media.type}/${media.tmdbId}`;
  const hasValidImage = media.posterUrl && !imgError;

  return (
    <div className="group relative flex flex-col rounded-2xl overflow-hidden bg-surface border border-surface-border transition-all duration-300 ease-out hover:shadow-[0_22px_45px_-12px_rgba(0,0,0,0.85)] hover:border-brand-500/40 hover:-translate-y-2 active:scale-[0.98] select-none will-change-transform">
      {/* Poster Image Container */}
      <Link href={watchUrl} className="relative aspect-poster w-full overflow-hidden bg-surface-hover block">
        {/* Placeholder shimmer before load */}
        {hasValidImage && !imgLoaded && (
          <div className="absolute inset-0 shimmer bg-surface-hover" />
        )}

        {hasValidImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={media.posterUrl!}
            alt={media.title}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            className={cn(
              "w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-105",
              imgLoaded ? "opacity-100" : "opacity-0"
            )}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-b from-surface-hover to-surface border-b border-surface-border">
            <div className="w-12 h-12 rounded-2xl bg-brand-600/10 text-brand-400 flex items-center justify-center mb-2">
              {media.type === "tv" ? <Tv className="w-6 h-6" /> : <Film className="w-6 h-6" />}
            </div>
            <p className="text-xs font-bold text-foreground line-clamp-3">{media.title}</p>
            <span className="text-[10px] text-foreground-muted/60 mt-1 uppercase font-mono">No Poster</span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-60 group-hover:opacity-85 transition-opacity duration-300" />

        {/* Top Badges */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10 pointer-events-none">
          {media.rating > 0 ? (
            <Badge variant="rating">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {media.rating.toFixed(1)}
            </Badge>
          ) : (
            <Badge variant="outline">NR</Badge>
          )}

          <Badge variant="quality">{media.quality || "4K"}</Badge>
        </div>

        {/* Hover Center Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100 z-10">
          <div className="w-12 h-12 rounded-full bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center shadow-2xl shadow-brand-500/60 backdrop-blur-md transition-transform hover:scale-110 active:scale-95">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>

        {/* Bottom Hover Actions */}
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0 z-10">
          <button
            onClick={toggleBookmark}
            aria-label={isBookmarked ? "Remove from watchlist" : "Add to watchlist"}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-xl transition-all hover:scale-110 active:scale-90 shadow-lg",
              isBookmarked
                ? "bg-brand-600 text-white"
                : "bg-black/60 hover:bg-black/80 text-white/90 border border-white/10"
            )}
          >
            {isBookmarked ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>
          {onOpenInfo && (
            <button
              onClick={handleInfo}
              aria-label="More information"
              className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white/90 flex items-center justify-center backdrop-blur-xl transition-all hover:scale-110 active:scale-90 border border-white/10 shadow-lg"
            >
              <Info className="w-4 h-4" />
            </button>
          )}
        </div>
      </Link>

      {/* Card Body */}
      <div className="p-3 flex flex-col flex-1 justify-between gap-1.5">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-foreground-muted font-medium">
            <span className="uppercase tracking-wider font-mono text-[10px] text-brand-400 font-semibold">
              {media.type === "tv" ? "TV Series" : "Movie"}
            </span>
            {media.releaseYear && <span>•</span>}
            {media.releaseYear && <span>{media.releaseYear}</span>}
            {media.runtime && <span>•</span>}
            {media.runtime && <span>{media.runtime}</span>}
          </div>

          <h3 className="font-bold text-sm text-foreground group-hover:text-brand-400 transition-colors line-clamp-1 mt-0.5">
            <Link href={watchUrl}>{media.title}</Link>
          </h3>
        </div>

        {/* Genres Pill Row */}
        {media.genres && media.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {media.genres.slice(0, 2).map((genre) => (
              <span
                key={genre}
                className="text-[10px] px-1.5 py-0.5 rounded-md bg-surface-hover/80 text-foreground-muted border border-surface-border font-medium"
              >
                {genre}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
