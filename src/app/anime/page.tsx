"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { MediaItem } from "@/lib/types";
import { MediaCard } from "@/components/media/MediaCard";
import { MediaModal } from "@/components/media/MediaModal";
import { MediaRow } from "@/components/media/MediaRow";
import { HeroBanner } from "@/components/media/HeroBanner";
import { MediaCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { fetchByGenre } from "@/lib/metadata/client";
import {
  Sparkles,
  Tv,
  Film,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

type FilterType = "all" | "tv" | "movie";
type SortOption = "default" | "rating" | "popular" | "newest";

export default function AnimePage() {
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [animeItems, setAnimeItems] = useState<MediaItem[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [featuredAnime, setFeaturedAnime] = useState<MediaItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Search & Sorting controls
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("default");

  // Load first page for the active filter
  const loadInitialAnime = useCallback(async (type: FilterType) => {
    setIsLoading(true);
    setError(null);
    setCurrentPage(1);
    try {
      const data = await fetchByGenre(
        "anime",
        type === "all" ? undefined : type,
        1
      );
      const results = data.results || [];
      setAnimeItems(results);
      setTotalPages(data.totalPages || 1);
      setTotalResults(data.totalResults || results.length);

      // Select featured spotlight anime if not yet selected
      setFeaturedAnime((current) => {
        if (!current && results.length > 0) {
          return results.find((m) => m.backdropUrl && m.rating >= 8.0) || results[0];
        }
        return current;
      });
    } catch (err: any) {
      setError(err.message || "Failed to load anime collection from ScreenScape.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load next page and append
  const loadMoreAnime = async () => {
    if (isLoadingMore || currentPage >= totalPages) return;
    setIsLoadingMore(true);
    const nextPage = currentPage + 1;
    try {
      const data = await fetchByGenre(
        "anime",
        filterType === "all" ? undefined : filterType,
        nextPage
      );
      const newResults = data.results || [];
      setAnimeItems((prev) => {
        const seen = new Set(prev.map((i) => i.id));
        const additions = newResults.filter((i) => !seen.has(i.id));
        return [...prev, ...additions];
      });
      setCurrentPage(nextPage);
      setTotalPages(data.totalPages || totalPages);
      if (data.totalResults) setTotalResults(data.totalResults);
    } catch (err: any) {
      console.error("Failed to load more anime:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    loadInitialAnime(filterType);
  }, [filterType, loadInitialAnime]);

  // Client-side filtering & sorting of loaded catalog
  const processedItems = useMemo(() => {
    let list = [...animeItems];

    // Filter by search query if user typed something
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.overview?.toLowerCase().includes(q) ||
          m.genres.some((g) => g.toLowerCase().includes(q))
      );
    }

    // Apply sorting
    if (sortBy === "rating") {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === "popular") {
      list.sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));
    } else if (sortBy === "newest") {
      list.sort((a, b) => {
        const yA = parseInt(a.releaseYear || "0", 10);
        const yB = parseInt(b.releaseYear || "0", 10);
        return yB - yA;
      });
    }

    return list;
  }, [animeItems, searchQuery, sortBy]);

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
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-surface-border pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs uppercase font-mono tracking-wider text-brand-400 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                Live ScreenScape Catalog
              </span>
              <span className="text-xs text-foreground-muted">•</span>
              <span className="text-xs text-foreground-muted">
                {totalResults > 0
                  ? `${totalResults.toLocaleString()} Titles Indexed`
                  : "Thousands of Titles"}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-foreground flex items-center gap-2.5">
              <Sparkles className="w-8 h-8 text-brand-400 shrink-0" />
              <span>Anime Vault</span>
            </h1>
            <p className="text-sm text-foreground-muted mt-1 max-w-2xl">
              Stream the complete ScreenScape anime catalog — legendary shonen epics, dark fantasy masterpieces, psychological thrillers, and cinematic anime features.
            </p>
          </div>

          {/* Type Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-surface border border-surface-border shrink-0 self-start md:self-auto">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterType === "all"
                  ? "bg-brand-600 text-white shadow-sm shadow-brand-600/30"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              All Anime
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
              <span>Anime Series (5,400+)</span>
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
              <span>Movies (1,400+)</span>
            </button>
          </div>
        </div>

        {/* Search & Sort Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Quick Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-foreground-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search anime by title, character, or genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface border border-surface-border text-xs sm:text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-foreground-muted hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sort Dropdown & Count */}
          <div className="flex items-center justify-between sm:justify-end gap-3">
            <span className="text-xs text-foreground-muted hidden md:inline">
              Showing {processedItems.length} of {totalResults.toLocaleString()}
            </span>

            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-foreground-muted" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Sort anime by"
                className="bg-surface border border-surface-border text-xs rounded-xl px-3 py-2 text-foreground font-medium focus:outline-none focus:border-brand-500 transition-all cursor-pointer"
              >
                <option value="default">Default Order</option>
                <option value="rating">Top Rated (Highest Rating)</option>
                <option value="popular">Most Popular</option>
                <option value="newest">Latest Releases</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 rounded-2xl bg-danger/10 border border-danger/30 text-xs text-danger flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <Button size="sm" variant="outline" onClick={() => loadInitialAnime(filterType)}>
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Retry
            </Button>
          </div>
        )}

        {/* Main Grid or Skeletons */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 18 }).map((_, i) => (
              <MediaCardSkeleton key={i} />
            ))}
          </div>
        ) : processedItems.length === 0 ? (
          <EmptyState
            icon={<Sparkles className="w-10 h-10 text-brand-400" />}
            title="No Anime Titles Found"
            description={
              searchQuery
                ? `No anime matching "${searchQuery}" was found. Try a different keyword.`
                : "No anime available under this filter."
            }
            actionText="Clear Filter"
            actionHref="/anime"
          />
        ) : (
          <div className="space-y-12">
            {/* Main Responsive Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {processedItems.map((item) => (
                <MediaCard
                  key={item.id}
                  media={item}
                  onOpenInfo={(m) => setSelectedMedia(m)}
                />
              ))}
            </div>

            {/* Load More Button & Pagination Controls */}
            {currentPage < totalPages && !searchQuery && (
              <div className="flex flex-col items-center justify-center pt-4 pb-6 space-y-3">
                <Button
                  size="lg"
                  variant="primary"
                  onClick={loadMoreAnime}
                  disabled={isLoadingMore}
                  className="px-8 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-brand-600/30 hover:scale-105 active:scale-95 transition-all"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading More Anime...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Load More Anime ({currentPage + 1} of {totalPages})
                    </>
                  )}
                </Button>
                <p className="text-xs text-foreground-muted">
                  Loaded {animeItems.length} of {totalResults.toLocaleString()} anime titles from ScreenScape
                </p>
              </div>
            )}

            {/* Curated Shelf Rows if in "All" view with no active search query */}
            {filterType === "all" && !searchQuery && animeSeries.length > 0 && (
              <div className="pt-8 space-y-10 border-t border-surface-border">
                <MediaRow
                  title="Legendary Anime Series"
                  subtitle="Binge top-rated shonen sagas, dark fantasy, and anime classics"
                  items={animeSeries.slice(0, 15)}
                  onOpenInfo={(item) => setSelectedMedia(item)}
                />

                {animeMovies.length > 0 && (
                  <MediaRow
                    title="Acclaimed Anime Feature Films"
                    subtitle="Award-winning animated masterpieces and cinematic journeys"
                    items={animeMovies.slice(0, 15)}
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
