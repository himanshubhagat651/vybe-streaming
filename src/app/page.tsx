"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MediaItem, Genre } from "@/lib/types";
import { HeroBanner } from "@/components/media/HeroBanner";
import { MediaRow } from "@/components/media/MediaRow";
import { MediaModal } from "@/components/media/MediaModal";
import { MediaCardSkeleton } from "@/components/ui/Skeleton";
import { fetchTrending, fetchPopular, fetchGenres, fetchByGenre, fetchByRegion } from "@/lib/metadata/client";
import { RegionTabBar } from "@/components/media/RegionTabBar";
import { getRegionByCode, getStoredSelectedRegion, setStoredSelectedRegion } from "@/lib/regions";
import { AlertCircle, RefreshCw, History, Play, Globe } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useUserData } from "@/context/UserDataContext";

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  return `${m}m`;
}

export default function HomePage() {
  const { continueWatching } = useUserData();
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [featuredMedia, setFeaturedMedia] = useState<MediaItem | null>(null);
  const [trendingMovies, setTrendingMovies] = useState<MediaItem[]>([]);
  const [trendingSeries, setTrendingSeries] = useState<MediaItem[]>([]);
  const [popularSeries, setPopularSeries] = useState<MediaItem[]>([]);
  const [animeList, setAnimeList] = useState<MediaItem[]>([]);
  const [trendingAll, setTrendingAll] = useState<MediaItem[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [activeGenre, setActiveGenre] = useState("all");

  const [selectedRegion, setSelectedRegion] = useState<string>("IN");
  const [regionalItems, setRegionalItems] = useState<MediaItem[]>([]);
  const [isRegionLoading, setIsRegionLoading] = useState<boolean>(true);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize stored region preference from localStorage on mount
  useEffect(() => {
    const stored = getStoredSelectedRegion();
    if (stored) {
      setSelectedRegion(stored);
    }
  }, []);

  const handleSelectRegion = (code: string) => {
    setSelectedRegion(code);
    setStoredSelectedRegion(code);
  };

  useEffect(() => {
    let isCancelled = false;
    setIsRegionLoading(true);
    fetchByRegion(selectedRegion, "all", 1)
      .then((data) => {
        if (!isCancelled) {
          setRegionalItems(data.results || []);
        }
      })
      .catch((err) => {
        console.warn("fetchByRegion error:", err);
        if (!isCancelled) setRegionalItems([]);
      })
      .finally(() => {
        if (!isCancelled) setIsRegionLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedRegion]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [trendingData, trendingSeriesData, popSeriesData, trendingMoviesData, genreList, animeData] =
        await Promise.all([
          fetchTrending("all", "day", 1),
          fetchTrending("tv", "day", 1),
          fetchPopular("tv", 1),
          fetchPopular("movie", 1),
          fetchGenres("movie"),
          fetchByGenre("anime").catch(() => ({ results: [] })),
        ]);

      const allItems = trendingData.results || [];
      setTrendingAll(allItems);

      // Select featured title with a valid backdrop
      const bestFeatured =
        allItems.find((m) => m.backdropUrl && m.overview) || allItems[0];
      setFeaturedMedia(bestFeatured || null);

      setTrendingSeries(trendingSeriesData.results || []);
      setPopularSeries(popSeriesData.results || []);
      setTrendingMovies(trendingMoviesData.results || []);
      setAnimeList(animeData.results || []);

      const listWithAnime = [...(genreList || [])];
      if (!listWithAnime.some((g) => g.slug === "anime")) {
        listWithAnime.splice(1, 0, { id: "anime", name: "Anime", slug: "anime" });
      }
      setGenres(listWithAnime);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load media catalog.");
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
              items={trendingAll.filter((m) => m.backdropUrl && m.overview)}
              onOpenInfo={(item) => setSelectedMedia(item)}
            />
          )}

          {/* Continue Watching Row (Active user watch progress) */}
          {continueWatching.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-foreground flex items-center gap-2">
                    <History className="w-5 h-5 text-indigo-400" />
                    Continue Watching
                  </h2>
                  <p className="text-xs text-foreground-muted">
                    Resume where you left off
                  </p>
                </div>
                <Link
                  href="/history"
                  className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
                >
                  View All History &rarr;
                </Link>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                {continueWatching.map((item) => {
                  const watchUrl = `/watch/${item.mediaType}/${item.tmdbId}${
                    item.season ? `?s=${item.season}&e=${item.episode}` : ""
                  }`;

                  const percent =
                    item.durationSeconds && item.durationSeconds > 0
                      ? Math.min(Math.round((item.progressSeconds / item.durationSeconds) * 100), 100)
                      : 50;

                  const imageSrc = item.backdropPath
                    ? item.backdropPath.startsWith("http")
                      ? item.backdropPath
                      : `https://image.tmdb.org/t/p/w780${item.backdropPath}`
                    : item.posterPath
                    ? item.posterPath.startsWith("http")
                      ? item.posterPath
                      : `https://image.tmdb.org/t/p/w500${item.posterPath}`
                    : null;

                  return (
                    <div
                      key={item.id}
                      className="group relative flex-none w-56 xs:w-64 sm:w-72 lg:w-80 2xl:w-96 rounded-2xl overflow-hidden bg-surface border border-surface-border hover:border-brand-500/40 transition-all select-none shadow-md"
                    >
                      <Link href={watchUrl} className="relative aspect-video w-full block bg-black">
                        {imageSrc && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={imageSrc}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-lg">
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          </div>
                        </div>

                        {item.mediaType === "tv" && (
                          <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-black/70 text-white border border-white/10">
                            S{item.season ?? 1}:E{item.episode ?? 1}
                          </span>
                        )}

                        <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20">
                          <div className="h-full bg-brand-500" style={{ width: `${percent}%` }} />
                        </div>
                      </Link>

                      <div className="p-3">
                        <h3 className="font-bold text-xs text-foreground truncate group-hover:text-brand-400">
                          <Link href={watchUrl}>{item.title}</Link>
                        </h3>
                        <p className="text-[10px] text-foreground-muted mt-0.5">
                          {formatDuration(item.progressSeconds)} watched • {percent}%
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Category Filter Pills */}
          {genres.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                type="button"
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
                  type="button"
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

          {/* Active Genre Filter Showcase */}
          {activeGenre !== "all" && (
            <div className="p-4 rounded-3xl bg-brand-600/10 border border-brand-500/20">
              <MediaRow
                title={`${genres.find((g) => g.slug === activeGenre)?.name || activeGenre} Spotlight`}
                subtitle={`Showing featured ${activeGenre} titles from the catalog`}
                items={
                  activeGenre === "anime"
                    ? animeList
                    : trendingAll.filter((m) =>
                        m.genres.some((g) => g.toLowerCase() === activeGenre.toLowerCase())
                      )
                }
                viewAllHref={`/browse?genre=${activeGenre}`}
                onOpenInfo={(item) => setSelectedMedia(item)}
              />
            </div>
          )}

          {/* Regional Cinema & Shows Spotlight Tab Section */}
          <div className="space-y-4 pt-1">
            <div className="rounded-3xl bg-surface/50 border border-surface-border/60 p-4 sm:p-5 backdrop-blur-sm space-y-4 shadow-sm">
              <RegionTabBar
                selectedRegion={selectedRegion}
                onSelectRegion={handleSelectRegion}
                title="Regional Spotlight"
              />

              <div className="pt-1">
                {isRegionLoading ? (
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex-none w-[145px] xs:w-[160px] sm:w-[185px] md:w-[200px] aspect-poster rounded-2xl bg-surface-hover shimmer"
                      />
                    ))}
                  </div>
                ) : regionalItems.length > 0 ? (
                  <MediaRow
                    title={`${getRegionByCode(selectedRegion)?.flag || "🌍"} ${
                      getRegionByCode(selectedRegion)?.name || "Regional"
                    } Cinema & Shows`}
                    subtitle={`Trending releases, blockbuster hits, and local productions from ${
                      getRegionByCode(selectedRegion)?.name || "this region"
                    }`}
                    items={regionalItems}
                    viewAllHref={`/browse?region=${selectedRegion}`}
                    onOpenInfo={(item) => setSelectedMedia(item)}
                  />
                ) : (
                  <div className="py-8 text-center text-xs text-foreground-muted">
                    No regional titles currently available for {getRegionByCode(selectedRegion)?.name}.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Trending Today Row */}
          <MediaRow
            title="Trending Today"
            subtitle="Most popular entertainment across movies and series right now"
            items={trendingAll}
            viewAllHref="/browse?sort=trending"
            onOpenInfo={(item) => setSelectedMedia(item)}
          />

          {/* Trending TV Series Row */}
          <MediaRow
            title="Trending TV Series"
            subtitle="Global sensation television series trending this week"
            items={trendingSeries}
            viewAllHref="/browse?type=tv&sort=trending"
            onOpenInfo={(item) => setSelectedMedia(item)}
          />

          {/* Top Anime & Animation Section */}
          {animeList.length > 0 && (
            <MediaRow
              title="Top Anime & Animation Hits"
              subtitle="Acclaimed Japanese anime series, cyberpunk sagas, and epic adventures"
              items={animeList}
              viewAllHref="/anime"
              onOpenInfo={(item) => setSelectedMedia(item)}
            />
          )}

          {/* Popular Movies Row */}
          <MediaRow
            title="Blockbuster Movies"
            subtitle="Top rated feature films and cinema hits"
            items={trendingMovies}
            viewAllHref="/browse?type=movie"
            onOpenInfo={(item) => setSelectedMedia(item)}
          />

          {/* Popular TV Series Row */}
          <MediaRow
            title="Top Binge-Worthy TV Series"
            subtitle="Television series celebrated by audiences worldwide"
            items={popularSeries}
            viewAllHref="/browse?type=tv&sort=popular"
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
