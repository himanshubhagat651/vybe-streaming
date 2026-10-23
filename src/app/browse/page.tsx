"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MediaItem, Genre } from "@/lib/types";
import { MediaCard } from "@/components/media/MediaCard";
import { MediaModal } from "@/components/media/MediaModal";
import { MediaCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { fetchTrending, fetchPopular, fetchGenres } from "@/lib/metadata/client";
import { AlertCircle, ChevronLeft, ChevronRight, Film, RefreshCw } from "lucide-react";

export default function BrowsePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = (searchParams.get("type") as "movie" | "tv" | "all") || "all";
  const initialGenre = searchParams.get("genre") || "all";
  const initialPage = parseInt(searchParams.get("page") || "1", 10);

  const [filterType, setFilterType] = useState<"movie" | "tv" | "all">(initialType);
  const [filterGenre, setFilterGenre] = useState<string>(initialGenre);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [genres, setGenres] = useState<Genre[]>([]);

  const [items, setItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  useEffect(() => {
    fetchGenres(filterType === "tv" ? "tv" : "movie")
      .then((g) => setGenres(g))
      .catch(() => {});
  }, [filterType]);

  const loadData = async (type: "movie" | "tv" | "all", page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      let data;
      if (type === "all") {
        data = await fetchTrending("all", "week", page);
      } else {
        data = await fetchPopular(type, page);
      }
      setItems(data.results || []);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      setError(err.message || "Failed to load titles from metadata provider.");
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(filterType, currentPage);
  }, [filterType, currentPage]);

  const handleTypeChange = (newType: "movie" | "tv" | "all") => {
    setFilterType(newType);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams.toString());
    if (newType === "all") {
      params.delete("type");
    } else {
      params.set("type", newType);
    }
    params.set("page", "1");
    router.push(`/browse?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/browse?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
          Browse real-time trending releases and top titles indexed across the metadata provider.
        </p>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {/* Type filters */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-surface border border-surface-border">
            <button
              onClick={() => handleTypeChange("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterType === "all"
                  ? "bg-brand-600 text-white"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleTypeChange("movie")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterType === "movie"
                  ? "bg-brand-600 text-white"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => handleTypeChange("tv")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterType === "tv"
                  ? "bg-brand-600 text-white"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              TV Series
            </button>
          </div>

          {/* Genre Chips (if available) */}
          {genres.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
              {genres.slice(0, 10).map((g) => (
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
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-2xl bg-danger/10 border border-danger/30 text-xs text-danger flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button size="sm" variant="outline" onClick={() => loadData(filterType, currentPage)}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Retry
          </Button>
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {Array.from({ length: 15 }).map((_, i) => (
            <MediaCardSkeleton key={i} />
          ))}
        </div>
      ) : items.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {items.map((item) => (
              <MediaCard
                key={item.id}
                media={item}
                onOpenInfo={(m) => setSelectedMedia(m)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-8 pb-4">
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              <span className="text-xs font-mono text-foreground-muted">
                Page <strong className="text-foreground">{currentPage}</strong> of{" "}
                <strong className="text-foreground">{totalPages}</strong>
              </span>

              <Button
                size="sm"
                variant="outline"
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={<Film className="w-10 h-10" />}
          title="No titles available"
          description="We couldn't find any titles in this category."
          actionText="Reset Filter"
          onAction={() => handleTypeChange("all")}
        />
      )}

      {/* Media Details Modal */}
      <MediaModal
        media={selectedMedia}
        onClose={() => setSelectedMedia(null)}
      />
    </div>
  );
}
