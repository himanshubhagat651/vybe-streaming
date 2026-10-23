"use client";

import React, { useRef } from "react";
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
    <section className="space-y-3.5 relative group">
      {/* Row Header */}
      <div className="flex items-end justify-between px-1">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
            {title}
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
              className="text-xs md:text-sm font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors mr-2"
            >
              <span>Explore all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          {/* Scroll Navigation Arrows */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => scroll("left")}
              aria-label={`Scroll ${title} left`}
              className="w-8 h-8 rounded-full border border-surface-border bg-surface hover:bg-surface-hover text-foreground-muted hover:text-foreground flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label={`Scroll ${title} right`}
              className="w-8 h-8 rounded-full border border-surface-border bg-surface hover:bg-surface-hover text-foreground-muted hover:text-foreground flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={rowRef}
        className="flex items-stretch gap-4 overflow-x-auto pb-4 scroll-smooth scrollbar-none snap-x snap-mandatory -mx-4 px-4 md:-mx-6 md:px-6"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="w-[180px] sm:w-[200px] md:w-[220px] shrink-0 snap-start"
          >
            <MediaCard media={item} onOpenInfo={onOpenInfo} />
          </div>
        ))}
      </div>
    </section>
  );
}
