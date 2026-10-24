"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { X, Play, Star, Bookmark, Check, Heart, Clapperboard } from "lucide-react";
import { MediaItem } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useUserData } from "@/context/UserDataContext";
import { TrailerBackgroundPlayer } from "./TrailerBackgroundPlayer";
import { playPop, playHeart, playSuccess } from "@/lib/audio";
import { cn } from "@/lib/utils";

interface MediaModalProps {
  media: MediaItem | null;
  onClose: () => void;
}

export function MediaModal({ media, onClose }: MediaModalProps) {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useUserData();
  const [isLiked, setIsLiked] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    if (media) {
      try {
        const liked = localStorage.getItem(`vybe_liked_${media.type}_${media.tmdbId}`) === "true";
        setIsLiked(liked);
        const rating = parseInt(localStorage.getItem(`vybe_rating_${media.type}_${media.tmdbId}`) || "0", 10);
        setUserRating(rating);
      } catch {}
      setShowTrailer(false);
    }
  }, [media]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (media) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [media, onClose]);

  if (!media) return null;

  const isBookmarked = isInWatchlist(media.tmdbId, media.type);

  const toggleWatchlist = async () => {
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
      playSuccess();
    }
  };

  const toggleLike = () => {
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

  const handleRate = (star: number) => {
    setUserRating(star);
    try {
      localStorage.setItem(`vybe_rating_${media.type}_${media.tmdbId}`, String(star));
      playSuccess();
    } catch {}
  };

  const watchUrl = `/watch/${media.type}/${media.tmdbId}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl 2xl:max-w-4xl rounded-2xl sm:rounded-3xl overflow-hidden glass-panel border border-surface-border shadow-2xl z-10 max-h-[90vh] flex flex-col bg-surface">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header with Live Trailer Video (YouTube with DailyMotion fallback) */}
        <div className="relative h-64 sm:h-80 w-full shrink-0 overflow-hidden bg-black">
          <TrailerBackgroundPlayer
            key={media.tmdbId}
            title={media.title}
            year={media.releaseYear}
            aspectRatio="modal"
          />

          {/* Title on Trailer Header */}
          <div className="absolute bottom-4 left-6 right-6 space-y-2 pointer-events-none z-20">
            <div className="flex items-center gap-2">
              <Badge variant="rating">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {media.rating.toFixed(1)}
              </Badge>
              <Badge variant="brand">{media.type === "tv" ? "TV Series" : "Movie"}</Badge>
              <Badge variant="quality">{media.quality || "4K"}</Badge>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-600/30 border border-red-500/40 text-red-300 backdrop-blur-md">
                <Clapperboard className="w-3 h-3 text-red-400" />
                Live Trailer Stream
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">{media.title}</h2>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3">
            <Link href={watchUrl} onClick={onClose} className="flex-1 sm:flex-initial">
              <Button size="lg" variant="primary" className="w-full sm:w-auto">
                <Play className="w-5 h-5 fill-current mr-2" />
                Watch Stream
              </Button>
            </Link>

            <Button
              size="lg"
              variant={isBookmarked ? "primary" : "secondary"}
              onClick={toggleWatchlist}
              className={isBookmarked ? "bg-brand-600 text-white" : ""}
            >
              {isBookmarked ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  In Watchlist
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 mr-2" />
                  + Watchlist
                </>
              )}
            </Button>

            <Button
              size="lg"
              variant="secondary"
              onClick={toggleLike}
              className={cn(
                "transition-all",
                isLiked ? "bg-rose-500/20 text-rose-400 border border-rose-500/40" : ""
              )}
            >
              <Heart className={cn("w-4 h-4 mr-2", isLiked ? "fill-rose-500 text-rose-500" : "")} />
              {isLiked ? "Liked" : "Like"}
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                playPop();
                setShowTrailer(!showTrailer);
              }}
              className={cn(
                "transition-all",
                showTrailer ? "border-brand-500 bg-brand-500/10 text-brand-400" : ""
              )}
            >
              <Clapperboard className="w-4 h-4 mr-2" />
              {showTrailer ? "Hide Trailer" : "Watch Trailer"}
            </Button>

            <Link href={`/${media.type === "tv" ? "tv" : "movie"}/${media.tmdbId}`} onClick={onClose}>
              <Button size="lg" variant="ghost">
                Full Details Page
              </Button>
            </Link>
          </div>

          {/* Embedded Trailer Player (Interactive) */}
          {showTrailer && (
            <div className="space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1.5">
                  <Clapperboard className="w-4 h-4" />
                  Official Trailer Preview
                </span>
                <button
                  onClick={() => setShowTrailer(false)}
                  className="text-xs text-foreground-muted hover:text-foreground"
                >
                  Close Trailer
                </button>
              </div>
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-brand-500/40 shadow-2xl">
                <iframe
                  src={`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(
                    media.title + " " + (media.releaseYear || "") + " official trailer"
                  )}&autoplay=1`}
                  title={`${media.title} Official Trailer`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Interactive Rating Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-surface-hover/60 border border-surface-border">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-xs font-bold text-foreground">Rate this title:</span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => handleRate(star)}
                  className="p-1 hover:scale-125 transition-transform"
                  aria-label={`Rate ${star * 2} out of 10`}
                >
                  <Star
                    className={cn(
                      "w-5 h-5 transition-colors",
                      star <= (hoverRating || userRating)
                        ? "fill-amber-400 text-amber-400 drop-shadow"
                        : "text-foreground-muted/30"
                    )}
                  />
                </button>
              ))}
              {userRating > 0 && (
                <span className="ml-2 text-xs font-mono font-bold text-amber-400">
                  {userRating * 2}/10 ★
                </span>
              )}
            </div>
          </div>

          {/* Overview */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
              Overview
            </h4>
            <p className="text-sm text-foreground/90 leading-relaxed">{media.overview}</p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-surface-hover/50 border border-surface-border text-xs">
            <div>
              <span className="text-foreground-muted block mb-1">Release Year</span>
              <span className="font-semibold text-foreground">{media.releaseYear}</span>
            </div>
            <div>
              <span className="text-foreground-muted block mb-1">Duration</span>
              <span className="font-semibold text-foreground">{media.runtime || "N/A"}</span>
            </div>
            <div>
              <span className="text-foreground-muted block mb-1">Age Rating</span>
              <span className="font-semibold text-foreground">{media.ageRating || "PG-13"}</span>
            </div>
            <div>
              <span className="text-foreground-muted block mb-1">TMDB ID</span>
              <span className="font-mono text-brand-400">{media.tmdbId}</span>
            </div>
          </div>

          {/* Cast */}
          {media.cast && media.cast.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                Starring Cast
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {media.cast.map((actor) => (
                  <div key={actor.id} className="p-2.5 rounded-xl bg-surface border border-surface-border">
                    <p className="text-xs font-bold text-foreground truncate">{actor.name}</p>
                    <p className="text-[11px] text-foreground-muted truncate">{actor.character}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
