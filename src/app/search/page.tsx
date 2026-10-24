"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Film, Tv, Star, X, AlertCircle, ChevronLeft, ChevronRight, Loader2, Magnet } from "lucide-react";
import { MediaItem, Genre } from "@/lib/types";
import { MediaCard } from "@/components/media/MediaCard";
import { MediaModal } from "@/components/media/MediaModal";
import { TorrentFallbackModal } from "@/components/player/TorrentFallbackModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { MediaCardSkeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { fetchSearch, fetchGenres } from "@/lib/metadata/client";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialType = (searchParams.get("type") as "all" | "movie" | "tv") || "all";
  const initialPage = parseInt(searchParams.get("page") || "1", 10);

  const [query, setQuery] = useState(initialQuery);
  const [selectedType, setSelectedType] = useState<"all" | "movie" | "tv">(initialType);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const [results, setResults] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [isTorrentModalOpen, setIsTorrentModalOpen] = useState(false);

  // Sync state if URL changes
  useEffect(() => {
    setQuery(initialQuery);
    setSelectedType(initialType);
    setCurrentPage(initialPage);
  }, [initialQuery, initialType, initialPage]);

  // Execute search via API route
  const performSearch = useCallback(async (q: string, type: "all" | "movie" | "tv", page: number) => {
    if (!q.trim()) {
      setResults([]);
      setTotalPages(1);
      setTotalResults(0);
      return;
    }

    setIsLoading(true);
    setApiError(null);

    try {
      const data = await fetchSearch(q, type, page);
      setResults(data.results || []);
      setTotalPages(data.totalPages || 1);
      setTotalResults(data.totalResults || 0);
    } catch (err: any) {
      setApiError(err.message || "Failed to search metadata provider.");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    performSearch(initialQuery, selectedType, currentPage);
  }, [initialQuery, selectedType, currentPage, performSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (selectedType !== "all") params.set("type", selectedType);
    params.set("page", "1");
    router.push(`/search?${params.toString()}`);
  };

  const handleTypeChange = (newType: "all" | "movie" | "tv") => {
    setSelectedType(newType);
    const params = new URLSearchParams(searchParams.toString());
    if (newType === "all") {
      params.delete("type");
    } else {
      params.set("type", newType);
    }
    params.set("page", "1");
    router.push(`/search?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/search?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Search Header Banner */}
      <div className="p-6 md:p-10 rounded-3xl bg-surface border border-surface-border shadow-xl space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground">
            Search Catalog
          </h1>
          <p className="text-xs md:text-sm text-foreground-muted mt-1">
            Search movies and series directly across the metadata provider.
          </p>
        </div>

        {/* Search Input Box */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-2xl">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search titles, actors, or franchises..."
            className="w-full h-12 pl-12 pr-28 rounded-2xl bg-surface-hover border border-surface-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-inner"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                router.push("/search");
              }}
              className="absolute right-20 top-1/2 -translate-y-1/2 p-1 text-foreground-muted hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-colors"
          >
            Search
          </button>
        </form>

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-surface-border/60">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-hover/80 border border-surface-border">
            <button
              onClick={() => handleTypeChange("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedType === "all"
                  ? "bg-brand-600 text-white shadow"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => handleTypeChange("movie")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedType === "movie"
                  ? "bg-brand-600 text-white shadow"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => handleTypeChange("tv")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedType === "tv"
                  ? "bg-brand-600 text-white shadow"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              TV Series
            </button>
          </div>

          {totalResults > 0 && (
            <span className="text-xs text-foreground-muted">
              Found <strong>{totalResults}</strong> titles
            </span>
          )}
        </div>
      </div>

      {/* API Error State */}
      {apiError && (
        <div className="p-4 rounded-2xl bg-danger/10 border border-danger/30 text-xs text-danger flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{apiError}</span>
          </div>
          <Button size="sm" variant="outline" onClick={() => performSearch(query, selectedType, currentPage)}>
            Retry
          </Button>
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <MediaCardSkeleton key={i} />
          ))}
        </div>
      ) : results.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {results.map((item) => (
              <MediaCard
                key={item.id}
                media={item}
                onOpenInfo={(m) => setSelectedMedia(m)}
              />
            ))}
          </div>

          {/* Pagination Controls */}
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
      ) : initialQuery ? (
        <div className="space-y-4">
          <EmptyState
            icon={<Search className="w-10 h-10" />}
            title="No titles found on ScreenScape"
            description={`No direct catalog matches found for "${initialQuery}". You can search decentralized torrent streams for this title.`}
            actionText="Clear Search"
            onAction={() => {
              setQuery("");
              router.push("/search");
            }}
          />
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => setIsTorrentModalOpen(true)}
              className="text-xs text-indigo-400 hover:text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/10 shadow-sm"
            >
              <Magnet className="w-3.5 h-3.5 mr-1.5" />
              Search Torrents &amp; Magnets for &quot;{initialQuery}&quot;
            </Button>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={<Film className="w-10 h-10" />}
          title="Search the Entertainment Universe"
          description="Type in a title above to discover movies, series, anime, and documentaries."
        />
      )}

      {/* Details Preview Modal */}
      <MediaModal
        media={selectedMedia}
        onClose={() => setSelectedMedia(null)}
      />

      {/* Torrent Fallback Modal for Search */}
      {initialQuery && (
        <TorrentFallbackModal
          isOpen={isTorrentModalOpen}
          onClose={() => setIsTorrentModalOpen(false)}
          title={initialQuery}
          type={selectedType === "tv" ? "tv" : "movie"}
        />
      )}
    </div>
  );
}
