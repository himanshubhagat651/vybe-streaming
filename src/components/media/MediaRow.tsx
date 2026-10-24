"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { MediaItem } from "@/lib/types";
import { MediaCard } from "./MediaCard";

interface MediaRowProps {
  title: string;
  subtitle?: string;
  items: MediaItem[];
  viewAllHref?: string;
  onOpenInfo?: (media: MediaItem) => void;
}

export function MediaRow({ title, subtitle, items, viewAllHref, onOpenInfo }: MediaRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    if (!rowRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  useEffect(() => {
    checkScroll();
    const current = rowRef.current;
    if (current) {
      current.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      if (current) current.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, items]);

  const scroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="space-y-3.5 relative group select-none">
      {/* Row Header */}
      <div className="flex items-end justify-between px-1">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span>{title}</span>
            <span className="text-xs font-mono font-normal text-foreground-muted/60">
              ({items.length})
            </span>
          </h2>
          {subtitle && (
            <p className="text-xs md:text-sm text-foreground-muted mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="text-xs md:text-sm font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors mr-2 group/link"
            >
              <span>Explore all</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
            </Link>
          )}

          {/* Top header navigation buttons */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              aria-label={`Scroll ${title} left`}
              className={`w-8 h-8 rounded-full border border-surface-border bg-surface flex items-center justify-center transition-all ${
                canScrollLeft
                  ? "text-foreground hover:bg-surface-hover hover:scale-105 active:scale-95"
                  : "text-foreground-muted/30 cursor-not-allowed opacity-50"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              aria-label={`Scroll ${title} right`}
              className={`w-8 h-8 rounded-full border border-surface-border bg-surface flex items-center justify-center transition-all ${
                canScrollRight
                  ? "text-foreground hover:bg-surface-hover hover:scale-105 active:scale-95"
                  : "text-foreground-muted/30 cursor-not-allowed opacity-50"
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Left Paddle (Appears on row hover) */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          aria-label={`Scroll ${title} left`}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-24 rounded-r-2xl bg-gradient-to-r from-background/90 via-background/70 to-transparent backdrop-blur-sm items-center justify-start pl-2 text-white/80 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:w-14"
        >
          <div className="w-8 h-8 rounded-full bg-surface/90 border border-surface-border flex items-center justify-center shadow-xl">
            <ChevronLeft className="w-5 h-5" />
          </div>
        </button>
      )}

      {/* Floating Right Paddle (Appears on row hover) */}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          aria-label={`Scroll ${title} right`}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-24 rounded-l-2xl bg-gradient-to-l from-background/90 via-background/70 to-transparent backdrop-blur-sm items-center justify-end pr-2 text-white/80 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:w-14"
        >
          <div className="w-8 h-8 rounded-full bg-surface/90 border border-surface-border flex items-center justify-center shadow-xl">
            <ChevronRight className="w-5 h-5" />
          </div>
        </button>
      )}

      {/* Horizontal Carousel */}
      <div
        ref={rowRef}
        className="flex items-stretch gap-4 overflow-x-auto pb-4 scroll-smooth no-scrollbar scrollbar-none snap-x snap-mandatory -mx-4 px-4 md:-mx-6 md:px-6 will-change-scroll"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="w-[145px] xs:w-[165px] sm:w-[185px] md:w-[205px] lg:w-[220px] 2xl:w-[250px] 3xl:w-[280px] shrink-0 snap-start"
          >
            <MediaCard media={item} onOpenInfo={onOpenInfo} />
          </div>
        ))}
      </div>
    </section>
  );
}
