"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Play, Info, Star, Sparkles, Film, Tv, ChevronLeft, ChevronRight } from "lucide-react";
import { MediaItem } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface HeroBannerProps {
  media?: MediaItem;
  items?: MediaItem[];
  onOpenInfo?: (media: MediaItem) => void;
}

export function HeroBanner({ media, items, onOpenInfo }: HeroBannerProps) {
  const spotlightItems = (items && items.length > 0)
    ? items.filter((m) => m && m.backdropUrl && m.overview).slice(0, 5)
    : media
    ? [media]
    : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const activeMedia = spotlightItems[currentIndex] || media;

  useEffect(() => {
    if (spotlightItems.length <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % spotlightItems.length);
    }, 7000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [spotlightItems.length, isPaused]);

  if (!activeMedia) return null;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % spotlightItems.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + spotlightItems.length) % spotlightItems.length);
  };

  const watchUrl = `/watch/${activeMedia.type}/${activeMedia.tmdbId}`;

  return (
    <div
      className="relative w-full h-[540px] md:h-[620px] rounded-3xl overflow-hidden mb-10 border border-surface-border shadow-2xl select-none bg-surface-hover group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Dynamic Ambient Glow behind banner */}
      <div className="ambient-halo -top-24 -left-24 w-96 h-96 bg-brand-600/30" />
      <div className="ambient-halo -bottom-24 -right-24 w-96 h-96 bg-indigo-600/30" />

      {/* Cinematic Backdrop Image with smooth crossfade */}
      <div className="relative w-full h-full overflow-hidden">
        {activeMedia.backdropUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            key={activeMedia.tmdbId}
            src={activeMedia.backdropUrl}
            alt={activeMedia.title}
            className="w-full h-full object-cover object-center transform scale-100 animate-fadeIn transition-transform duration-1000 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-950 via-surface to-background flex items-center justify-center opacity-40">
            {activeMedia.type === "tv" ? (
              <Tv className="w-24 h-24 text-white/20" />
            ) : (
              <Film className="w-24 h-24 text-white/20" />
            )}
          </div>
        )}

        {/* Cinematic Vignette Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent max-w-4xl" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent to-background/40" />
      </div>

      {/* Hero Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 max-w-3xl space-y-4 z-10">
        {/* Spotlight Pill & Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500 text-white shadow-lg shadow-brand-500/40">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            Spotlight Premiere
          </span>
          {activeMedia.rating > 0 && (
            <Badge variant="rating">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {activeMedia.rating.toFixed(1)} Rating
            </Badge>
          )}
          <Badge variant="quality">{activeMedia.quality || "4K Ultra HD"}</Badge>
          {activeMedia.releaseYear && (
            <Badge variant="outline">{activeMedia.releaseYear}</Badge>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white drop-shadow-md leading-tight">
          {activeMedia.title}
        </h1>

        {/* Tagline */}
        {activeMedia.tagline && (
          <p className="text-sm md:text-base font-medium text-brand-300 italic line-clamp-1">
            &ldquo;{activeMedia.tagline}&rdquo;
          </p>
        )}

        {/* Overview Description */}
        {activeMedia.overview && (
          <p className="text-xs sm:text-sm md:text-base text-gray-200 line-clamp-3 leading-relaxed max-w-2xl drop-shadow">
            {activeMedia.overview}
          </p>
        )}

        {/* Genres Pill List */}
        {activeMedia.genres && activeMedia.genres.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-gray-300">
            <span className="font-semibold text-white">Genres:</span>
            {activeMedia.genres.slice(0, 4).map((g) => (
              <span
                key={g}
                className="px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 font-medium"
              >
                {g}
              </span>
            ))}
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-3">
          <Link href={watchUrl}>
            <Button
              size="lg"
              variant="primary"
              className="shadow-2xl shadow-brand-600/40 hover:scale-105 transition-all text-sm sm:text-base font-bold"
            >
              <Play className="w-5 h-5 fill-current mr-1.5" />
              Watch Now
            </Button>
          </Link>

          {onOpenInfo && (
            <Button
              size="lg"
              variant="glass"
              onClick={() => onOpenInfo(activeMedia)}
              className="bg-white/15 hover:bg-white/25 text-white backdrop-blur-xl border border-white/20 hover:scale-105 transition-all text-sm sm:text-base font-semibold"
            >
              <Info className="w-5 h-5 mr-1.5" />
              More Details
            </Button>
          )}
        </div>
      </div>

      {/* Slide Navigation Controls (Only if multiple items exist) */}
      {spotlightItems.length > 1 && (
        <div className="absolute bottom-6 right-6 md:bottom-12 md:right-12 z-20 flex items-center gap-3">
          {/* Slide Indicator Pills */}
          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            {spotlightItems.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? "w-7 bg-brand-400 shadow-md shadow-brand-400/50"
                    : "w-2 bg-white/30 hover:bg-white/60"
                }`}
              />
            ))}
          </div>

          {/* Left / Right Arrow Buttons */}
          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md p-1 rounded-full border border-white/10">
            <button
              onClick={prevSlide}
              aria-label="Previous slide"
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next slide"
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
