"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { X, Play, Star, Clock, Calendar, Bookmark, Share2 } from "lucide-react";
import { MediaItem } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface MediaModalProps {
  media: MediaItem | null;
  onClose: () => void;
}

export function MediaModal({ media, onClose }: MediaModalProps) {
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

  const watchUrl = `/watch/${media.type}/${media.tmdbId}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl rounded-3xl overflow-hidden glass-panel border border-surface-border shadow-2xl z-10 max-h-[90vh] flex flex-col bg-surface">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header with Backdrop */}
        <div className="relative h-64 sm:h-80 w-full shrink-0 overflow-hidden bg-black">
          <img
            src={media.backdropUrl}
            alt={media.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />

          {/* Title on Backdrop */}
          <div className="absolute bottom-6 left-6 right-6 space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="rating">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {media.rating.toFixed(1)}
              </Badge>
              <Badge variant="brand">{media.type === "tv" ? "TV Series" : "Movie"}</Badge>
              <Badge variant="quality">{media.quality || "4K"}</Badge>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">{media.title}</h2>
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

            <Link href={`/${media.type === "tv" ? "tv" : "movie"}/${media.tmdbId}`} onClick={onClose}>
              <Button size="lg" variant="secondary">
                Full Details Page
              </Button>
            </Link>
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
