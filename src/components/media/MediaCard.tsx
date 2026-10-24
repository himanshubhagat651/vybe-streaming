"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Play, Star, Bookmark, Check, Info, Film, Tv, Heart } from "lucide-react";
import { MediaItem } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { useUserData } from "@/context/UserDataContext";
import { playPop, playHeart } from "@/lib/audio";

interface MediaCardProps {
  media: MediaItem;
  onOpenInfo?: (media: MediaItem) => void;
  priority?: boolean;
}

export function MediaCard({ media, onOpenInfo }: MediaCardProps) {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useUserData();
  const [currentSrc, setCurrentSrc] = useState<string>(media.posterUrl || media.backdropUrl || "");
  const [triedBackdrop, setTriedBackdrop] = useState(false);
  const [imgError, setImgError] = useState(!media.posterUrl && !media.backdropUrl);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const initial = media.posterUrl || media.backdropUrl || "";
    setCurrentSrc(initial);
    setTriedBackdrop(false);
    setImgError(!initial);
    setImgLoaded(false);
  }, [media.posterUrl, media.backdropUrl]);

  const handleImageError = () => {
    if (!triedBackdrop && media.backdropUrl && media.backdropUrl !== currentSrc) {
      setTriedBackdrop(true);
      setCurrentSrc(media.backdropUrl);
      setImgLoaded(false);
    } else {
      setImgError(true);
    }
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`vybe_liked_${media.type}_${media.tmdbId}`);
      if (stored === "true") setIsLiked(true);
    } catch {}
  }, [media.tmdbId, media.type]);

  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !isLiked;
    setIsLiked(next);
    try {
      if (next) {
        localStorage.setItem(`vybe_liked_${media.type}_${media.tmdbId}`, "true");
        playHeart();
      } else {
        localStorage.removeItem(`vybe_liked_${media.type}_${media.tmdbId}`);
        playPop();
      }
    } catch {}
  };

  const isBookmarked = isInWatchlist(media.tmdbId, media.type);

  const toggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isBookmarked) {
      await removeFromWatchlist(media.tmdbId, media.type);
      playPop();
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
      playHeart();
    }
  };

  const handleInfo = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    playPop();
    if (onOpenInfo) {
      onOpenInfo(media);
    }
  };

  const watchUrl = `/watch/${media.type}/${media.tmdbId}`;
  const hasValidImage = Boolean(currentSrc) && !imgError;

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
            src={currentSrc}
            alt={media.title}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={handleImageError}
            className={cn(
              "w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-105",
              imgLoaded ? "opacity-100" : "opacity-0"
            )}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-between p-4 text-center bg-gradient-to-br from-brand-950/70 via-surface to-background border-b border-surface-border/50 relative overflow-hidden select-none">
            {/* Subtle atmospheric ambient glow */}
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-brand-500/15 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-purple-500/15 rounded-full blur-2xl pointer-events-none" />

            {/* Top tag */}
            <div className="w-full flex items-center justify-between z-10 pt-1">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-brand-400 px-2 py-0.5 rounded-full bg-brand-500/15 border border-brand-500/25">
                {media.type === "tv" ? "TV Series" : "Cinema"}
              </span>
              {media.releaseYear && (
                <span className="text-[10px] font-mono text-foreground-muted">{media.releaseYear}</span>
              )}
            </div>

            {/* Center Title and Icon */}
            <div className="my-auto flex flex-col items-center gap-2 max-w-[92%] z-10">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600/30 to-brand-400/20 text-brand-300 flex items-center justify-center shadow-lg border border-brand-500/25 group-hover:scale-110 transition-transform duration-300">
                {media.type === "tv" ? <Tv className="w-6 h-6" /> : <Film className="w-6 h-6" />}
              </div>
              <p className="text-sm font-bold text-foreground line-clamp-3 leading-snug tracking-tight">
                {media.title}
              </p>
              {media.genres?.[0] && (
                <span className="text-[10px] text-foreground-muted uppercase tracking-wider">
                  {media.genres.slice(0, 2).join(" • ")}
                </span>
              )}
            </div>

            {/* Bottom Brand Watermark */}
            <div className="w-full text-center z-10 pb-1">
              <span className="text-[9px] text-brand-400/70 font-mono tracking-widest uppercase">
                Vybe Stream
              </span>
            </div>
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

          <div className="flex items-center gap-1.5">
            {isLiked && (
              <span className="p-1 rounded-full bg-rose-500/90 text-white shadow-md shadow-rose-500/40 animate-scaleUp">
                <Heart className="w-2.5 h-2.5 fill-current" />
              </span>
            )}
            <Badge variant="quality">{media.quality || "4K"}</Badge>
          </div>
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
            onClick={toggleLike}
            aria-label={isLiked ? "Unlike title" : "Like title"}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-xl transition-all hover:scale-110 active:scale-90 shadow-lg",
              isLiked
                ? "bg-rose-600 text-white shadow-rose-600/40"
                : "bg-black/60 hover:bg-black/80 text-white/90 border border-white/10"
            )}
          >
            <Heart className={cn("w-3.5 h-3.5", isLiked ? "fill-current" : "")} />
          </button>
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
      <div className="p-2.5 sm:p-3 2xl:p-4 flex flex-col flex-1 justify-between gap-1 sm:gap-1.5">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] 2xl:text-xs text-foreground-muted font-medium">
            <span className="uppercase tracking-wider font-mono text-[9px] sm:text-[10px] 2xl:text-[11px] text-brand-400 font-semibold">
              {media.type === "tv" ? "TV Series" : "Movie"}
            </span>
            {media.releaseYear && <span>•</span>}
            {media.releaseYear && <span>{media.releaseYear}</span>}
            {media.runtime && <span>•</span>}
            {media.runtime && <span>{media.runtime}</span>}
          </div>

          <h3 className="font-bold text-xs sm:text-sm 2xl:text-base text-foreground group-hover:text-brand-400 transition-colors line-clamp-1 mt-0.5">
            <Link href={watchUrl}>{media.title}</Link>
          </h3>
        </div>

        {/* Genres Pill Row */}
        {media.genres && media.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5 sm:mt-1">
            {media.genres.slice(0, 2).map((genre) => (
              <span
                key={genre}
                className="text-[9px] sm:text-[10px] 2xl:text-xs px-1.5 py-0.5 rounded-md bg-surface-hover/80 text-foreground-muted border border-surface-border font-medium"
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
