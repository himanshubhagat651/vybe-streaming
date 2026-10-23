"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { DEMO_MEDIA, DEMO_GENRES } from "@/lib/demoData";
import { MediaItem } from "@/lib/types";
import { MediaCard } from "@/components/media/MediaCard";
import { MediaModal } from "@/components/media/MediaModal";
import { Badge } from "@/components/ui/Badge";
import { Film, Tv, Flame, SlidersHorizontal } from "lucide-react";

export default function BrowsePage() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") || "all";
  const initialGenre = searchParams.get("genre") || "all";
  const initialSort = searchParams.get("sort") || "popular";

  const [filterType, setFilterType] = useState<string>(initialType);
  const [filterGenre, setFilterGenre] = useState<string>(initialGenre);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  // Filter
  let items = DEMO_MEDIA;

  if (filterType === "movie") {
    items = items.filter((m) => m.type === "movie");
  } else if (filterType === "tv") {
    items = items.filter((m) => m.type === "tv");
  }

  if (filterGenre !== "all") {
    items = items.filter((m) =>
      m.genres.some((g) => g.toLowerCase() === filterGenre.toLowerCase())
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Browse Header */}
      <div className="space-y-3">
        <h1 className="text-3xl font-black text-foreground">
          {filterType === "movie"
            ? "Explore Movies"
            : filterType === "tv"
            ? "Explore TV Series"
            : "Browse Entire Catalog"}
        </h1>
        <p className="text-sm text-foreground-muted max-w-xl">
          Discover handpicked blockbusters, binge-worthy series, anime adaptations, and critically acclaimed productions.
        </p>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {/* Type filters */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-surface border border-surface-border">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterType === "all"
                  ? "bg-brand-600 text-white"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType("movie")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterType === "movie"
                  ? "bg-brand-600 text-white"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => setFilterType("tv")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterType === "tv"
                  ? "bg-brand-600 text-white"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              TV Series
            </button>
          </div>

          {/* Genre Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
            {DEMO_GENRES.map((g) => (
              <button
                key={g.id}
                onClick={() => setFilterGenre(g.slug)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  filterGenre === g.slug
                    ? "bg-surface-hover text-brand-400 border border-brand-500/40 font-semibold"
                    : "bg-surface text-foreground-muted hover:text-foreground border border-surface-border"
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {items.map((item) => (
          <MediaCard
            key={item.id}
            media={item}
            onOpenInfo={(m) => setSelectedMedia(m)}
          />
        ))}
      </div>

      {/* Media Details Modal */}
      <MediaModal
        media={selectedMedia}
        onClose={() => setSelectedMedia(null)}
      />
    </div>
  );
}
