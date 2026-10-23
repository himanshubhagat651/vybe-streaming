"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal, Film, Tv, Star, X } from "lucide-react";
import { DEMO_MEDIA, DEMO_GENRES, searchMedia } from "@/lib/demoData";
import { MediaItem } from "@/lib/types";
import { MediaCard } from "@/components/media/MediaCard";
import { MediaModal } from "@/components/media/MediaModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [selectedType, setSelectedType] = useState<"all" | "movie" | "tv">("all");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [sortBy, setSortBy] = useState<"rating" | "year" | "title">("rating");
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  // Perform search and filtering
  let results = searchMedia(query, selectedGenre);

  if (selectedType !== "all") {
    results = results.filter((m) => m.type === selectedType);
  }

  // Sort
  results.sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "year") return parseInt(b.releaseYear) - parseInt(a.releaseYear);
    return a.title.localeCompare(b.title);
  });

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Search Header Banner */}
      <div className="p-6 md:p-10 rounded-3xl bg-surface border border-surface-border shadow-xl space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground">
            Search & Explore
          </h1>
          <p className="text-xs md:text-sm text-foreground-muted mt-1">
            Browse our entire library of blockbusters, series, anime, and hidden gems.
          </p>
        </div>

        {/* Search Input Box */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-2xl">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a title, actor, or genre (e.g. Dune, Nolan, Sci-Fi)..."
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
          {/* Media Type Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-hover/80 border border-surface-border">
            <button
              onClick={() => setSelectedType("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedType === "all"
                  ? "bg-brand-600 text-white shadow"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setSelectedType("movie")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedType === "movie"
                  ? "bg-brand-600 text-white shadow"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => setSelectedType("tv")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedType === "tv"
                  ? "bg-brand-600 text-white shadow"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              TV Series
            </button>
          </div>

          {/* Genre & Sort Dropdowns */}
          <div className="flex items-center gap-3">
            {/* Genre */}
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="h-9 px-3 rounded-xl bg-surface-hover border border-surface-border text-xs text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              {DEMO_GENRES.map((g) => (
                <option key={g.id} value={g.slug}>
                  Genre: {g.name}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-9 px-3 rounded-xl bg-surface-hover border border-surface-border text-xs text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="rating">Sort: Highest Rating</option>
              <option value="year">Sort: Release Year</option>
              <option value="title">Sort: Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-foreground-muted">
          Showing <strong className="text-foreground">{results.length}</strong> titles
          {query && (
            <span>
              {" "}
              matching &ldquo;<span className="text-brand-400 font-semibold">{query}</span>&rdquo;
            </span>
          )}
        </p>
      </div>

      {/* Media Results Grid */}
      {results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {results.map((item) => (
            <MediaCard
              key={item.id}
              media={item}
              onOpenInfo={(m) => setSelectedMedia(m)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Search className="w-10 h-10" />}
          title="No titles found"
          description={`We couldn't find any results matching "${query}". Try searching for another keyword or clear filters.`}
          actionText="Clear Filters"
          onAction={() => {
            setQuery("");
            setSelectedType("all");
            setSelectedGenre("all");
            router.push("/search");
          }}
        />
      )}

      {/* Details Preview Modal */}
      <MediaModal
        media={selectedMedia}
        onClose={() => setSelectedMedia(null)}
      />
    </div>
  );
}
