"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MediaItem } from "@/lib/types";
import { MediaCard } from "@/components/media/MediaCard";
import { MediaModal } from "@/components/media/MediaModal";
import { MediaRow } from "@/components/media/MediaRow";
import { HeroBanner } from "@/components/media/HeroBanner";
import { MediaCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { fetchByGenre } from "@/lib/metadata/client";
import { Sparkles, Tv, Film, Flame, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AnimePage() {
  const [animeItems, setAnimeItems] = useState<MediaItem[]>([]);
  const [filterType, setFilterType] = useState<"all" | "tv" | "movie">("all");
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [featuredAnime, setFeaturedAnime] = useState<MediaItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnime = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchByGenre("anime");
      const results = data.results || [];
      setAnimeItems(results);

      // Select high-rated title for spotlight hero
      const best =
        results.find((m) => m.backdropUrl && m.rating >= 8.5) || results[0];
      setFeaturedAnime(best || null);
    } catch (err: any) {
      setError(err.message || "Failed to load anime collection.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnime();
  }, []);

  const filteredItems = animeItems.filter((item) => {
    if (filterType === "all") return true;
    return item.type === filterType;
  });

  const animeSeries = animeItems.filter((m) => m.type === "tv");
  const animeMovies = animeItems.filter((m) => m.type === "movie");

  return (
    <div className="space-y-10 animate-fadeIn pb-16">
      {/* Anime Hub Hero Banner */}
      {featuredAnime && !isLoading && (
        <HeroBanner
          media={featuredAnime}
          onOpenInfo={(item) => setSelectedMedia(item)}
        />
      )}

      {/* Header & Filter Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs uppercase font-mono tracking-wider text-brand-400 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                Curated Collection
              </span>
              <span className="text-xs text-foreground-muted">•</span>
              <span className="text-xs text-foreground-muted">
                {animeItems.length} Titles Available
              </span>
            </div>

            <h1 className="text-3xl font-black text-foreground flex items-center gap-2.5">
              <Sparkles className="w-8 h-8 text-brand-400" />
              <span>Anime Vault</span>
            </h1>
            <p className="text-sm text-foreground-muted mt-1 max-w-2xl">
              Immerse yourself in legendary Japanese animation, dark fantasy epics, cyberpunk sagas, and critically-acclaimed anime blockbusters.
            </p>
          </div>

          {/* Type Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-surface border border-surface-border shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterType === "all"
                  ? "bg-brand-600 text-white shadow-sm shadow-brand-600/30"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              All Anime ({animeItems.length})
            </button>
            <button
              onClick={() => setFilterType("tv")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filterType === "tv"
                  ? "bg-brand-600 text-white shadow-sm shadow-brand-600/30"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Series ({animeSeries.length})</span>
            </button>
            <button
              onClick={() => setFilterType("movie")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filterType === "movie"
                  ? "bg-brand-600 text-white shadow-sm shadow-brand-600/30"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Movies ({animeMovies.length})</span>
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 rounded-2xl bg-danger/10 border border-danger/30 text-xs text-danger flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <Button size="sm" variant="outline" onClick={loadAnime}>
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Retry
            </Button>
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <MediaCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            icon={<Sparkles className="w-10 h-10" />}
            title="No Anime Titles Found"
            description="No anime matching your filter was found in the indexed collection."
            actionText="View All Anime"
            actionHref="/anime"
          />
        ) : (
          <div className="space-y-10">
            {/* Main Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {filteredItems.map((item) => (
                <MediaCard
                  key={item.id}
                  media={item}
                  onOpenInfo={(m) => setSelectedMedia(m)}
                />
              ))}
            </div>

            {/* Curated Shelf Rows if in "All" filter */}
            {filterType === "all" && animeSeries.length > 0 && (
              <div className="pt-8 space-y-8 border-t border-surface-border">
                <MediaRow
                  title="Legendary Anime Series"
                  subtitle="Binge top-rated shonen sagas, psychological thrillers, and dark fantasy"
                  items={animeSeries}
                  onOpenInfo={(item) => setSelectedMedia(item)}
                />

                {animeMovies.length > 0 && (
                  <MediaRow
                    title="Anime Feature Films"
                    subtitle="Award-winning animated masterpieces and cinematic journeys"
                    items={animeMovies}
                    onOpenInfo={(item) => setSelectedMedia(item)}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Preview Modal */}
      <MediaModal
        media={selectedMedia}
        onClose={() => setSelectedMedia(null)}
      />
    </div>
  );
}
