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
      className="relative w-full h-[380px] xs:h-[440px] sm:h-[500px] md:h-[560px] lg:h-[620px] 2xl:h-[700px] 3xl:h-[800px] rounded-2xl sm:rounded-3xl overflow-hidden mb-8 md:mb-12 border border-surface-border shadow-2xl select-none bg-surface-hover group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Dynamic Ambient Glow behind banner */}
      <div className="ambient-halo -top-24 -left-24 w-72 sm:w-96 2xl:w-[32rem] h-72 sm:h-96 2xl:h-[32rem] bg-brand-600/30" />
      <div className="ambient-halo -bottom-24 -right-24 w-72 sm:w-96 2xl:w-[32rem] h-72 sm:h-96 2xl:h-[32rem] bg-indigo-600/30" />

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
              <Tv className="w-16 sm:w-24 h-16 sm:h-24 text-white/20" />
            ) : (
              <Film className="w-16 sm:w-24 h-16 sm:h-24 text-white/20" />
            )}
          </div>
        )}

        {/* Cinematic Vignette Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent max-w-4xl 2xl:max-w-6xl" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent to-background/40" />
      </div>

      {/* Hero Content Overlay (Fluid padding & typography for mobile to TV) */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 xs:p-6 sm:p-8 md:p-12 2xl:p-16 max-w-xl sm:max-w-2xl md:max-w-3xl 2xl:max-w-5xl space-y-2.5 sm:space-y-4 z-10">
        {/* Spotlight Pill & Badges */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-brand-500 text-white shadow-lg shadow-brand-500/40">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-pulse" />
            Spotlight Premiere
          </span>
          {activeMedia.rating > 0 && (
            <Badge variant="rating" className="text-[10px] sm:text-xs">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />
              {activeMedia.rating.toFixed(1)} Rating
            </Badge>
          )}
          <Badge variant="quality" className="text-[9px] sm:text-[10px]">
            {activeMedia.quality || "4K Ultra HD"}
          </Badge>
          {activeMedia.releaseYear && (
            <Badge variant="outline" className="text-[10px] sm:text-xs hidden xs:inline-flex">
              {activeMedia.releaseYear}
            </Badge>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl 2xl:text-7xl font-black tracking-tight text-white drop-shadow-md leading-tight">
          {activeMedia.title}
        </h1>

        {/* Tagline */}
        {activeMedia.tagline && (
          <p className="text-xs sm:text-sm md:text-base font-medium text-brand-300 italic line-clamp-1">
            &ldquo;{activeMedia.tagline}&rdquo;
          </p>
        )}

        {/* Overview Description */}
        {activeMedia.overview && (
          <p className="text-xs sm:text-sm md:text-base 2xl:text-lg text-gray-200 line-clamp-2 sm:line-clamp-3 2xl:line-clamp-4 leading-relaxed max-w-2xl 2xl:max-w-4xl drop-shadow">
            {activeMedia.overview}
          </p>
        )}

        {/* Genres Pill List */}
        {activeMedia.genres && activeMedia.genres.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-0.5 text-xs text-gray-300">
            <span className="font-semibold text-white text-[11px] sm:text-xs">Genres:</span>
            {activeMedia.genres.slice(0, 4).map((g) => (
              <span
                key={g}
                className="px-2 sm:px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 font-medium text-[10px] sm:text-xs"
              >
                {g}
              </span>
            ))}
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-2 sm:pt-3">
          <Link href={watchUrl}>
            <Button
              size="md"
              variant="primary"
              className="sm:h-12 sm:px-6 2xl:h-14 2xl:px-8 shadow-2xl shadow-brand-600/40 hover:scale-105 transition-all text-xs sm:text-sm 2xl:text-base font-bold min-h-[44px]"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current mr-1.5" />
              Watch Now
            </Button>
          </Link>

          {onOpenInfo && (
            <Button
              size="md"
              variant="glass"
              onClick={() => onOpenInfo(activeMedia)}
              className="sm:h-12 sm:px-6 2xl:h-14 2xl:px-8 bg-white/15 hover:bg-white/25 text-white backdrop-blur-xl border border-white/20 hover:scale-105 transition-all text-xs sm:text-sm 2xl:text-base font-semibold min-h-[44px]"
            >
              <Info className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5" />
              More Details
            </Button>
          )}
        </div>
      </div>

      {/* Slide Navigation Controls (Only if multiple items exist) */}
      {spotlightItems.length > 1 && (
        <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-12 md:right-12 z-20 flex items-center gap-2 sm:gap-3">
          {/* Slide Indicator Pills */}
          <div className="flex items-center gap-1 sm:gap-1.5 bg-black/50 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/10">
            {spotlightItems.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? "w-5 sm:w-7 bg-brand-400 shadow-md shadow-brand-400/50"
                    : "w-1.5 sm:w-2 bg-white/30 hover:bg-white/60"
                }`}
              />
            ))}
          </div>

          {/* Left / Right Arrow Buttons */}
          <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md p-0.5 sm:p-1 rounded-full border border-white/10">
            <button
              onClick={prevSlide}
              aria-label="Previous slide"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all min-h-[28px] min-w-[28px]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next slide"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all min-h-[28px] min-w-[28px]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
