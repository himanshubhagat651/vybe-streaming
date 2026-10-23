"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  DEMO_MEDIA,
  getFeaturedMedia,
  getTrendingMovies,
  getTrendingSeries,
  getMediaByGenre,
  DEMO_GENRES,
} from "@/lib/demoData";
import { MediaItem } from "@/lib/types";
import { HeroBanner } from "@/components/media/HeroBanner";
import { MediaRow } from "@/components/media/MediaRow";
import { MediaModal } from "@/components/media/MediaModal";
import { Sparkles, Film, Flame, Tv } from "lucide-react";

export default function HomePage() {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [activeGenre, setActiveGenre] = useState("all");

  const featured = getFeaturedMedia();
  const trendingMovies = getTrendingMovies();
  const trendingSeries = getTrendingSeries();
  const animeHits = getMediaByGenre("anime");
  const actionHits = getMediaByGenre("action");

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Cinematic Spotlight Hero */}
      <HeroBanner
        media={featured}
        onOpenInfo={(item) => setSelectedMedia(item)}
      />

      {/* Quick Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {DEMO_GENRES.map((genre) => (
          <button
            key={genre.id}
            onClick={() => setActiveGenre(genre.slug)}
            className={`px-4 py-2 rounded-full text-xs md:text-sm font-semibold tracking-wide whitespace-nowrap transition-all select-none ${
              activeGenre === genre.slug
                ? "bg-brand-600 text-white shadow-lg shadow-brand-600/30 scale-105"
                : "bg-surface hover:bg-surface-hover text-foreground-muted hover:text-foreground border border-surface-border"
            }`}
          >
            {genre.name}
          </button>
        ))}
      </div>

      {/* Conditional Genre Row if filtered */}
      {activeGenre !== "all" && (
        <MediaRow
          title={`${activeGenre.toUpperCase()} TITLES`}
          subtitle={`Showing curated ${activeGenre} selections`}
          items={getMediaByGenre(activeGenre)}
          onOpenInfo={(item) => setSelectedMedia(item)}
        />
      )}

      {/* Trending Movies Row */}
      <MediaRow
        title="Trending Movies"
        subtitle="Most watched feature films this week"
        items={trendingMovies}
        viewAllHref="/browse?type=movie"
        onOpenInfo={(item) => setSelectedMedia(item)}
      />

      {/* Top TV Series Row */}
      <MediaRow
        title="Popular TV Series"
        subtitle="Critically acclaimed binge-worthy television"
        items={trendingSeries}
        viewAllHref="/browse?type=tv"
        onOpenInfo={(item) => setSelectedMedia(item)}
      />

      {/* Action & Sci-Fi Row */}
      <MediaRow
        title="High-Octane Action & Sci-Fi"
        subtitle="Mind-bending adventures and pulse-pounding action"
        items={actionHits}
        viewAllHref="/browse?genre=action"
        onOpenInfo={(item) => setSelectedMedia(item)}
      />

      {/* Anime & Animation Showcase */}
      {animeHits.length > 0 && (
        <MediaRow
          title="Anime & Animation Spotlight"
          subtitle="Top rated animated and anime hits"
          items={animeHits}
          viewAllHref="/browse?genre=anime"
          onOpenInfo={(item) => setSelectedMedia(item)}
        />
      )}

      {/* Quick Preview Modal */}
      <MediaModal
        media={selectedMedia}
        onClose={() => setSelectedMedia(null)}
      />
    </div>
  );
}
