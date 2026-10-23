"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Play, Star, Bookmark, Check, Info } from "lucide-react";
import { MediaItem } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface MediaCardProps {
  media: MediaItem;
  onOpenInfo?: (media: MediaItem) => void;
  priority?: boolean;
}

export function MediaCard({ media, onOpenInfo }: MediaCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  const toggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  const handleInfo = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onOpenInfo) {
      onOpenInfo(media);
    }
  };

  const watchUrl = `/watch/${media.type}/${media.tmdbId}`;

  return (
    <div className="group relative flex flex-col rounded-2xl overflow-hidden bg-surface border border-surface-border transition-all duration-300 hover:shadow-2xl hover:shadow-black/50 hover:border-brand-500/40 hover:-translate-y-1.5 select-none">
      {/* Poster Image Container */}
      <Link href={watchUrl} className="relative aspect-poster w-full overflow-hidden bg-surface-hover">
        <img
          src={media.posterUrl}
          alt={media.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10">
          <Badge variant="rating">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {media.rating.toFixed(1)}
          </Badge>

          <Badge variant="quality">{media.quality || "HD"}</Badge>
        </div>

        {/* Hover Center Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100 z-10">
          <div className="w-12 h-12 rounded-full bg-brand-600/90 hover:bg-brand-500 text-white flex items-center justify-center shadow-xl shadow-brand-500/50 backdrop-blur-md transition-transform hover:scale-110">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>

        {/* Bottom Hover Actions */}
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={toggleBookmark}
            aria-label="Add to watchlist"
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-colors",
              isBookmarked
                ? "bg-brand-600 text-white"
                : "bg-black/60 hover:bg-black/80 text-white/90"
            )}
          >
            {isBookmarked ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>
          {onOpenInfo && (
            <button
              onClick={handleInfo}
              aria-label="More information"
              className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white/90 flex items-center justify-center backdrop-blur-md transition-colors"
            >
              <Info className="w-4 h-4" />
            </button>
          )}
        </div>
      </Link>

      {/* Card Metadata Details */}
      <div className="p-3.5 flex flex-col justify-between flex-1 space-y-1.5">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-[11px] text-foreground-muted">
            <span className="uppercase font-semibold tracking-wider text-brand-400">
              {media.type === "tv" ? "TV Series" : "Movie"}
            </span>
            <span>•</span>
            <span>{media.releaseYear}</span>
            {media.runtime && (
              <>
                <span>•</span>
                <span>{media.runtime}</span>
              </>
            )}
          </div>

          <Link href={watchUrl} className="block group-hover:text-brand-400 transition-colors">
            <h3 className="font-semibold text-sm text-foreground truncate" title={media.title}>
              {media.title}
            </h3>
          </Link>
        </div>

        {/* Genre Tags */}
        <div className="flex flex-wrap gap-1 pt-1">
          {media.genres.slice(0, 2).map((genre) => (
            <span
              key={genre}
              className="text-[10px] text-foreground-muted/80 bg-surface-hover px-1.5 py-0.5 rounded border border-surface-border/50"
            >
              {genre}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
