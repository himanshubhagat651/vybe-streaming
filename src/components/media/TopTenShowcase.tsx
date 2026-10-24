"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Play, Film, X, Star } from "lucide-react";
import { MediaItem } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TopTenShowcaseProps {
  items: MediaItem[];
  title?: string;
  onOpenInfo?: (media: MediaItem) => void;
  className?: string;
}

export function TopTenShowcase({
  items,
  title = "TOP 10 on VYBE",
  onOpenInfo,
  className,
}: TopTenShowcaseProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(true);
  const [trailerMedia, setTrailerMedia] = useState<MediaItem | null>(null);

  const top10 = (items || []).slice(0, 10);

  const checkScroll = useCallback(() => {
    if (!rowRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = rowRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      if (el) el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, top10]);

  const scroll = (direction: "left" | "right") => {
    if (!rowRef.current) return;
    const { scrollLeft, clientWidth } = rowRef.current;
    const scrollAmount = clientWidth * 0.65;
    rowRef.current.scrollTo({
      left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
      behavior: "smooth",
    });
  };

  if (top10.length === 0) return null;

  const activeItem = top10[selectedIndex] || top10[0];

  return (
    <section className={cn("space-y-4 relative select-none", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            <span>{title}</span>
          </h2>
          <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-600/15 text-red-500 border border-red-500/30">
            Daily Leaderboard
          </span>
        </div>

        {/* Scroll paddles (desktop & tablet) */}
        <div className="hidden md:flex items-center gap-1.5">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
            className={cn(
              "w-8 h-8 rounded-full border border-surface-border flex items-center justify-center transition-all",
              canScrollLeft
                ? "bg-surface hover:bg-surface-hover text-foreground cursor-pointer shadow-sm active:scale-95"
                : "opacity-30 text-foreground-muted cursor-not-allowed"
            )}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            aria-label="Scroll right"
            className={cn(
              "w-8 h-8 rounded-full border border-surface-border flex items-center justify-center transition-all",
              canScrollRight
                ? "bg-surface hover:bg-surface-hover text-foreground cursor-pointer shadow-sm active:scale-95"
                : "opacity-30 text-foreground-muted cursor-not-allowed"
            )}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Row */}
      <div className="relative group/showcase">
        <div
          ref={rowRef}
          className="flex items-start gap-4 sm:gap-5 overflow-x-auto pb-4 pt-1 no-scrollbar scrollbar-none scroll-smooth"
        >
          {top10.map((item, index) => {
            const isSpotlight = index === selectedIndex;
            const rank = index + 1;
            const watchUrl = `/watch/${item.type}/${item.tmdbId}`;

            // Lead cast or director or tagline
            const subtitleText =
              item.cast && item.cast.length > 0
                ? item.cast
                    .slice(0, 2)
                    .map((c) => c.name)
                    .join(", ")
                : item.director
                ? `Dir. ${item.director}`
                : item.genres && item.genres.length > 0
                ? item.genres.slice(0, 2).join(" • ")
                : item.tagline || "";

            const displayYear =
              item.releaseYear ||
              (item.releaseDate ? item.releaseDate.substring(0, 4) : "2024");
            const displayType = item.type === "tv" ? "Show" : "Movie";
            const ratingText = item.rating > 0 ? item.rating.toFixed(1) : "7.5";

            const backdropSrc = item.backdropUrl || item.posterUrl || "";
            const posterSrc = item.posterUrl || item.backdropUrl || "";

            return isSpotlight ? (
              /* ========================================================= */
              /* 1. SPOTLIGHT EXPANDED CARD (matching Card 1 in reference) */
              /* ========================================================= */
              <div
                key={item.id}
                className="flex-none w-[320px] xs:w-[420px] sm:w-[500px] md:w-[580px] lg:w-[620px] space-y-2 group"
              >
                {/* Visual Frame */}
                <div className="relative aspect-[16/10] sm:aspect-[16/9.5] w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-surface border border-white/10 shadow-2xl transition-all">
                  {/* TOP Rank Badge */}
                  <div className="absolute top-0 left-0 z-20 flex flex-col items-center justify-center bg-[#e50914] text-white px-2.5 py-1.5 rounded-tl-2xl rounded-br-2xl shadow-lg min-w-[38px] select-none">
                    <span className="text-[9px] font-black tracking-widest uppercase leading-none opacity-90">
                      TOP
                    </span>
                    <span className="text-base sm:text-lg font-black leading-tight">
                      {rank}
                    </span>
                  </div>

                  {/* Backdrop Image */}
                  {backdropSrc ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={backdropSrc}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-brand-950 via-surface to-black" />
                  )}

                  {/* Dark Vignette & Gradient Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/25 to-transparent pointer-events-none" />

                  {/* Text Overlay (Bottom-Left) */}
                  <div className="absolute bottom-3 left-3 right-3 sm:bottom-5 sm:left-5 sm:right-5 space-y-2 z-10">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight drop-shadow-md">
                      <Link href={watchUrl} className="hover:text-red-400 transition-colors">
                        {item.title}
                      </Link>
                    </h3>

                    {subtitleText && (
                      <p className="text-xs sm:text-sm text-white/80 font-medium line-clamp-1">
                        {subtitleText}
                      </p>
                    )}

                    {item.overview && (
                      <p className="text-xs text-white/70 line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-lg drop-shadow-sm">
                        {item.overview}
                      </p>
                    )}

                    {/* Action Buttons Row */}
                    <div className="flex items-center gap-2.5 pt-1">
                      {/* See trailer button (frosted glass pill matching reference) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTrailerMedia(item);
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-semibold bg-white/20 hover:bg-white/35 text-white backdrop-blur-md border border-white/25 transition-all active:scale-95 shadow-md"
                      >
                        <Film className="w-3.5 h-3.5" />
                        <span>See trailer</span>
                      </button>

                      {/* Watch Stream button */}
                      <Link
                        href={watchUrl}
                        className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-semibold bg-red-600 hover:bg-red-500 text-white transition-all active:scale-95 shadow-md shadow-red-600/30"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Watch now</span>
                      </Link>

                      {/* More info button */}
                      {onOpenInfo && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenInfo(item);
                          }}
                          className="hidden xs:inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium text-white/75 hover:text-white bg-black/40 hover:bg-black/60 border border-white/10 transition-colors"
                        >
                          Details
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Subtitle Under Spotlight Card (Title in Red + Meta) */}
                <div className="px-1">
                  <h4 className="font-bold text-sm sm:text-base text-red-500 hover:text-red-400 truncate transition-colors">
                    <Link href={watchUrl}>{item.title}</Link>
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-foreground-muted mt-0.5">
                    <span className="flex items-center gap-1 font-semibold text-white">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {ratingText}
                    </span>
                    <span>•</span>
                    <span>{displayYear}</span>
                    <span>•</span>
                    <span>{displayType}</span>
                  </div>
                </div>
              </div>
            ) : (
              /* ========================================================= */
              /* 2. PORTRAIT CARDS (#2 to #10 in reference)                */
              /* ========================================================= */
              <div
                key={item.id}
                onClick={() => setSelectedIndex(index)}
                className="flex-none w-[145px] xs:w-[165px] sm:w-[185px] md:w-[205px] lg:w-[220px] space-y-2 group cursor-pointer"
                title={`Click to spotlight #${rank} ${item.title}`}
              >
                {/* Portrait Poster Frame */}
                <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-surface border border-surface-border/60 hover:border-red-500/60 shadow-lg transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-red-500/10">
                  {/* TOP Rank Badge */}
                  <div className="absolute top-0 left-0 z-20 flex flex-col items-center justify-center bg-[#e50914] text-white px-2 py-1 rounded-tl-2xl rounded-br-xl shadow-md min-w-[34px] select-none">
                    <span className="text-[8px] font-black tracking-widest uppercase leading-none opacity-90">
                      TOP
                    </span>
                    <span className="text-sm sm:text-base font-black leading-tight">
                      {rank}
                    </span>
                  </div>

                  {/* Poster Image */}
                  {posterSrc ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={posterSrc}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-surface to-surface-hover" />
                  )}

                  {/* Hover Overlay with Quick Expand / Info */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <span className="text-[11px] font-bold text-white bg-black/60 px-2 py-1 rounded-lg backdrop-blur-sm border border-white/10 w-full text-center">
                      Tap to spotlight
                    </span>
                  </div>
                </div>

                {/* Subtitle Under Portrait Card */}
                <div className="px-1">
                  <h4 className="font-bold text-xs sm:text-sm text-foreground truncate group-hover:text-red-400 transition-colors">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-foreground-muted mt-0.5">
                    <span className="flex items-center gap-1 font-semibold text-foreground">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {ratingText}
                    </span>
                    <span>•</span>
                    <span>{displayYear}</span>
                    <span>•</span>
                    <span>{displayType}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating Right Chevron Arrow (Matching reference screenshot) */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll next"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-11 h-16 rounded-l-2xl bg-black/75 hover:bg-black/95 text-white flex items-center justify-center transition-all backdrop-blur-md border-l border-y border-white/15 shadow-2xl hover:scale-105"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Official YouTube Trailer Modal */}
      {trailerMedia && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fadeIn"
          onClick={() => setTrailerMedia(null)}
        >
          <div
            className="relative w-full max-w-4xl rounded-2xl sm:rounded-3xl overflow-hidden bg-black border border-surface-border shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 bg-surface flex items-center justify-between border-b border-surface-border">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-red-500" />
                <span className="text-sm font-bold text-foreground truncate max-w-md">
                  {trailerMedia.title} — Official Trailer
                </span>
              </div>
              <button
                onClick={() => setTrailerMedia(null)}
                aria-label="Close trailer"
                className="w-8 h-8 rounded-full bg-surface-hover hover:bg-surface-border text-foreground flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Iframe Container */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(
                  trailerMedia.title + " official trailer"
                )}&autoplay=1&rel=0`}
                title={`${trailerMedia.title} Trailer`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-surface flex items-center justify-between">
              <span className="text-xs text-foreground-muted">
                Official preview streaming via YouTube
              </span>
              <Link
                href={`/watch/${trailerMedia.type}/${trailerMedia.tmdbId}`}
                onClick={() => setTrailerMedia(null)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/30 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Stream Full {trailerMedia.type === "tv" ? "Series" : "Movie"}</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
