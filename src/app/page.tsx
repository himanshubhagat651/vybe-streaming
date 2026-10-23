"use client";

import React, { useState, useEffect } from "react";
import { MediaItem, Genre } from "@/lib/types";
import { HeroBanner } from "@/components/media/HeroBanner";
import { MediaRow } from "@/components/media/MediaRow";
import { MediaModal } from "@/components/media/MediaModal";
import { MediaCardSkeleton } from "@/components/ui/Skeleton";
import { fetchTrending, fetchPopular, fetchGenres } from "@/lib/metadata/client";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [featuredMedia, setFeaturedMedia] = useState<MediaItem | null>(null);
  const [trendingMovies, setTrendingMovies] = useState<MediaItem[]>([]);
  const [popularSeries, setPopularSeries] = useState<MediaItem[]>([]);
  const [trendingAll, setTrendingAll] = useState<MediaItem[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [activeGenre, setActiveGenre] = useState("all");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [trendingData, popSeriesData, trendingMoviesData, genreList] =
        await Promise.all([
          fetchTrending("all", "day", 1),
          fetchPopular("tv", 1),
          fetchPopular("movie", 1),
          fetchGenres("movie"),
        ]);

      const allItems = trendingData.results || [];
      setTrendingAll(allItems);

      // Select featured title with a valid backdrop
      const bestFeatured =
        allItems.find((m) => m.backdropUrl && m.overview) || allItems[0];
      setFeaturedMedia(bestFeatured || null);

      setPopularSeries(popSeriesData.results || []);
      setTrendingMovies(trendingMoviesData.results || []);
      setGenres(genreList || []);
    } catch (err: any) {
      setError(err.message || "Failed to load media catalog.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Error State */}
      {error && (
        <div className="p-4 rounded-2xl bg-danger/10 border border-danger/30 text-xs text-danger flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button size="sm" variant="outline" onClick={loadData}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Retry
          </Button>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-8">
          <div className="w-full h-[540px] rounded-3xl bg-surface-hover/80 shimmer border border-surface-border/40" />
          <div className="space-y-4">
            <div className="h-6 w-48 rounded-lg bg-surface-hover shimmer" />
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <MediaCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Cinematic Spotlight Hero */}
          {featuredMedia && (
            <HeroBanner
              media={featuredMedia}
              onOpenInfo={(item) => setSelectedMedia(item)}
            />
          )}

          {/* Quick Category Filter Pills */}
          {genres.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setActiveGenre("all")}
                className={`px-4 py-2 rounded-full text-xs md:text-sm font-semibold tracking-wide whitespace-nowrap transition-all select-none ${
                  activeGenre === "all"
                    ? "bg-brand-600 text-white shadow-lg shadow-brand-600/30 scale-105"
                    : "bg-surface hover:bg-surface-hover text-foreground-muted hover:text-foreground border border-surface-border"
                }`}
              >
                All
              </button>
              {genres.slice(0, 10).map((genre) => (
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
          )}

          {/* Trending Today Row */}
          <MediaRow
            title="Trending Today"
            subtitle="Most popular entertainment across movies and series right now"
            items={trendingAll}
            viewAllHref="/browse?sort=trending"
            onOpenInfo={(item) => setSelectedMedia(item)}
          />

          {/* Popular Movies Row */}
          <MediaRow
            title="Blockbuster Movies"
            subtitle="Top rated feature films"
            items={trendingMovies}
            viewAllHref="/browse?type=movie"
            onOpenInfo={(item) => setSelectedMedia(item)}
          />

          {/* Popular TV Series Row */}
          <MediaRow
            title="Top Binge-Worthy TV Series"
            subtitle="Television series trending globally"
            items={popularSeries}
            viewAllHref="/browse?type=tv"
            onOpenInfo={(item) => setSelectedMedia(item)}
          />
        </>
      )}

      {/* Quick Preview Modal */}
      <MediaModal
        media={selectedMedia}
        onClose={() => setSelectedMedia(null)}
      />
    </div>
  );
}
