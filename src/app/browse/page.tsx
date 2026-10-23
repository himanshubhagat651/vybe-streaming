"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MediaItem, Genre } from "@/lib/types";
import { MediaCard } from "@/components/media/MediaCard";
import { MediaModal } from "@/components/media/MediaModal";
import { MediaCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { fetchTrending, fetchPopular, fetchGenres, fetchByGenre } from "@/lib/metadata/client";
import { AlertCircle, ChevronLeft, ChevronRight, Film, Flame, RefreshCw, Sparkles, Tv } from "lucide-react";

function BrowseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const typeParam = (searchParams.get("type") as "movie" | "tv" | "all") || "all";
  const genreParam = searchParams.get("genre") || "all";
  const sortParam = (searchParams.get("sort") as "trending" | "popular") || (searchParams.get("type") ? "trending" : "trending");
  const pageParam = parseInt(searchParams.get("page") || "1", 10);

  const [filterType, setFilterType] = useState<"movie" | "tv" | "all">(typeParam);
  const [filterSort, setFilterSort] = useState<"trending" | "popular">(sortParam);
  const [filterGenre, setFilterGenre] = useState<string>(genreParam);
  const [currentPage, setCurrentPage] = useState<number>(pageParam);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [genres, setGenres] = useState<Genre[]>([]);

  const [items, setItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  // Sync state whenever URL query params change (e.g. sidebar navigation)
  useEffect(() => {
    const currentType = (searchParams.get("type") as "movie" | "tv" | "all") || "all";
    const currentGenre = searchParams.get("genre") || "all";
    const currentSort = (searchParams.get("sort") as "trending" | "popular") || (searchParams.get("type") === "tv" ? "trending" : "trending");
    const currentPageNum = parseInt(searchParams.get("page") || "1", 10);

    setFilterType(currentType);
    setFilterGenre(currentGenre);
    setFilterSort(currentSort);
    setCurrentPage(currentPageNum);
  }, [searchParams]);

  useEffect(() => {
    fetchGenres(filterType === "tv" ? "tv" : "movie")
      .then((g) => {
        const list = [...g];
        if (!list.some((item) => item.slug === "anime")) {
          list.splice(1, 0, { id: "anime", name: "Anime", slug: "anime" });
        }
        setGenres(list);
      })
      .catch(() => {});
  }, [filterType]);

  const loadData = async (
    type: "movie" | "tv" | "all",
    sort: "trending" | "popular",
    page: number,
    genre: string
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      let data;
      if (genre && genre.toLowerCase() === "anime") {
        data = await fetchByGenre("anime", type === "all" ? undefined : type, page);
      } else if (sort === "trending") {
        data = await fetchTrending(type, "week", page);
      } else {
        data = await fetchPopular(type === "all" ? "movie" : type, page);
      }

      let results = data.results || [];

      // Filter by genre if selected (for non-anime genres)
      if (genre && genre !== "all" && genre.toLowerCase() !== "anime") {
        const targetG = genre.toLowerCase();
        const filtered = results.filter((m) =>
          m.genres.some((g) => g.toLowerCase().includes(targetG) || targetG.includes(g.toLowerCase()))
        );
        if (filtered.length > 0) {
          results = filtered;
        }
      }

      setItems(results);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      setError(err.message || "Failed to load titles from metadata provider.");
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(filterType, filterSort, currentPage, filterGenre);
  }, [filterType, filterSort, currentPage, filterGenre]);

  const updateUrl = (newType: "movie" | "tv" | "all", newSort: "trending" | "popular", newGenre: string, newPage: number) => {
    const params = new URLSearchParams();
    if (newType !== "all") params.set("type", newType);
    if (newSort !== "trending") params.set("sort", newSort);
    if (newGenre !== "all") params.set("genre", newGenre);
    if (newPage > 1) params.set("page", String(newPage));

    const queryString = params.toString();
    router.push(`/browse${queryString ? `?${queryString}` : ""}`);
  };

  const handleTypeChange = (newType: "movie" | "tv" | "all") => {
    setFilterType(newType);
    setCurrentPage(1);
    updateUrl(newType, filterSort, filterGenre, 1);
  };

  const handleSortChange = (newSort: "trending" | "popular") => {
    setFilterSort(newSort);
    setCurrentPage(1);
    updateUrl(filterType, newSort, filterGenre, 1);
  };

  const handleGenreChange = (newGenre: string) => {
    const target = filterGenre === newGenre ? "all" : newGenre;
    setFilterGenre(target);
    setCurrentPage(1);
    updateUrl(filterType, filterSort, target, 1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    updateUrl(filterType, filterSort, filterGenre, newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Browse Header */}
      <div className="space-y-3">
        <h1 className="text-3xl font-black text-foreground flex items-center gap-2.5">
          {filterGenre.toLowerCase() === "anime" ? (
            <>
              <Sparkles className="w-7 h-7 text-brand-400" />
              <span>
                {filterType === "tv"
                  ? "Anime Series"
                  : filterType === "movie"
                  ? "Anime Movies"
                  : "Anime Collection"}
              </span>
            </>
          ) : filterType === "tv" ? (
            <>
              <Tv className="w-7 h-7 text-brand-400" />
              <span>{filterSort === "trending" ? "Trending TV Series" : "Popular TV Series"}</span>
            </>
          ) : filterType === "movie" ? (
            <>
              <Film className="w-7 h-7 text-brand-400" />
              <span>{filterSort === "trending" ? "Trending Movies" : "Popular Movies"}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-7 h-7 text-brand-400" />
              <span>{filterSort === "trending" ? "Trending Entertainment" : "Popular Entertainment"}</span>
            </>
          )}
        </h1>
        <p className="text-sm text-foreground-muted max-w-xl">
          {filterGenre.toLowerCase() === "anime"
            ? "Stream acclaimed Japanese anime series, cyberpunk sagas, supernatural thrillers, and studio feature films."
            : filterType === "tv"
            ? "Discover television seasons, binge-worthy series, and global trending releases."
            : filterType === "movie"
            ? "Stream blockbuster movies, Hollywood cinema, and latest theatre releases."
            : "Explore real-time trending releases and top titles indexed across ScreenScape."}
        </p>

        {/* Filter & Sort Bar */}
        <div className="flex flex-wrap items-center gap-3 pt-3">
          {/* Media Type Filters */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-surface border border-surface-border">
            <button
              onClick={() => handleTypeChange("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterType === "all"
                  ? "bg-brand-600 text-white shadow-sm"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleTypeChange("movie")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filterType === "movie"
                  ? "bg-brand-600 text-white shadow-sm"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Movies</span>
            </button>
            <button
              onClick={() => handleTypeChange("tv")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filterType === "tv"
                  ? "bg-brand-600 text-white shadow-sm"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>TV Series</span>
            </button>
          </div>

          {/* Sort Filters (Trending vs Popular) */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-surface border border-surface-border">
            <button
              onClick={() => handleSortChange("trending")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filterSort === "trending"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Trending</span>
            </button>
            <button
              onClick={() => handleSortChange("popular")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filterSort === "popular"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Popular</span>
            </button>
          </div>

          {/* Genre Chips */}
          {genres.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none max-w-full">
              <button
                onClick={() => handleGenreChange("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  filterGenre === "all"
                    ? "bg-brand-600/15 text-brand-400 border border-brand-500/40 font-semibold"
                    : "bg-surface text-foreground-muted hover:text-foreground border border-surface-border"
                }`}
              >
                All Genres
              </button>
              {genres.slice(0, 10).map((g) => (
                <button
                  key={g.id}
                  onClick={() => handleGenreChange(g.slug)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    filterGenre === g.slug
                      ? "bg-brand-600/15 text-brand-400 border border-brand-500/40 font-semibold"
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
          <Button size="sm" variant="outline" onClick={() => loadData(filterType, filterSort, currentPage, filterGenre)}>
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
          icon={<Tv className="w-10 h-10" />}
          title="No titles available"
          description="We couldn't find any titles in this category."
          actionText="View Trending TV Series"
          onAction={() => {
            handleTypeChange("tv");
            handleSortChange("trending");
          }}
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

export default function BrowsePage() {
  return (
    <Suspense
      fallback={
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 py-8">
          {Array.from({ length: 15 }).map((_, i) => (
            <MediaCardSkeleton key={i} />
          ))}
        </div>
      }
    >
      <BrowseContent />
    </Suspense>
  );
}
