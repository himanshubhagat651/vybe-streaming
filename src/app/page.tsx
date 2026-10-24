"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MediaItem, Genre } from "@/lib/types";
import { HeroBanner } from "@/components/media/HeroBanner";
import { MediaRow } from "@/components/media/MediaRow";
import { TopTenShowcase } from "@/components/media/TopTenShowcase";
import { MediaModal } from "@/components/media/MediaModal";
import { MediaCardSkeleton } from "@/components/ui/Skeleton";
import { fetchTrending, fetchPopular, fetchGenres, fetchByGenre, fetchByRegion } from "@/lib/metadata/client";
import { RegionTabBar } from "@/components/media/RegionTabBar";
import { getRegionByCode, getStoredSelectedRegion, setStoredSelectedRegion } from "@/lib/regions";
import { ALL_GENRES, getGenreBySlug } from "@/lib/genres";
import { getAllIndianCinema, getAllIndianSeries } from "@/lib/demoData";
import { playPop } from "@/lib/audio";
import { AlertCircle, RefreshCw, History, Play, Globe, Sparkles, ChevronDown, Plus, Search, X } from "lucide-react";
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
  const [indianCinemaList, setIndianCinemaList] = useState<MediaItem[]>([]);
  const [indianSeriesList, setIndianSeriesList] = useState<MediaItem[]>([]);
  const [trendingAll, setTrendingAll] = useState<MediaItem[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [activeGenre, setActiveGenre] = useState("all");
  const [activeGenreItems, setActiveGenreItems] = useState<MediaItem[]>([]);
  const [isGenreLoading, setIsGenreLoading] = useState(false);
  const [isGenreModalOpen, setIsGenreModalOpen] = useState(false);
  const [genreModalSearch, setGenreModalSearch] = useState("");

  useEffect(() => {
    if (activeGenre === "all") {
      setActiveGenreItems([]);
      return;
    }
    if (activeGenre === "anime") {
      setActiveGenreItems(animeList);
      return;
    }
    setIsGenreLoading(true);
    fetchByGenre(activeGenre, undefined, 1)
      .then((data) => {
        setActiveGenreItems(data.results || []);
      })
      .catch(() => {
        const fallback = trendingAll.filter((m) =>
          m.genres.some((g) => g.toLowerCase() === activeGenre.toLowerCase())
        );
        setActiveGenreItems(fallback);
      })
      .finally(() => {
        setIsGenreLoading(false);
      });
  }, [activeGenre, animeList, trendingAll]);

  const [selectedRegion, setSelectedRegion] = useState<string>("IN");
  const [selectedSubLang, setSelectedSubLang] = useState<string>("all");
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
    playPop();
    setSelectedRegion(code);
    setStoredSelectedRegion(code);
    if (code !== "IN") {
      setSelectedSubLang("all");
    }
  };

  useEffect(() => {
    let isCancelled = false;
    setIsRegionLoading(true);
    fetchByRegion(
      selectedRegion,
      "all",
      1,
      selectedRegion.toUpperCase() === "IN" && selectedSubLang !== "all"
        ? selectedSubLang
        : undefined
    )
      .then((data) => {
        if (!isCancelled) {
          let res = data.results || [];
          if (res.length === 0 && selectedRegion.toUpperCase() === "IN") {
            const cinema = getAllIndianCinema();
            const series = getAllIndianSeries();
            let fallback = [...cinema, ...series];
            if (selectedSubLang !== "all") {
              fallback = fallback.filter((m) =>
                m.languageAvailable?.includes(selectedSubLang) ||
                (selectedSubLang === "hi" && m.languageAvailable?.includes("hindi"))
              );
            }
            res = fallback;
          }
          setRegionalItems(res);
        }
      })
      .catch((err) => {
        console.warn("fetchByRegion error:", err);
        if (!isCancelled) {
          if (selectedRegion.toUpperCase() === "IN") {
            const cinema = getAllIndianCinema();
            const series = getAllIndianSeries();
            let fallback = [...cinema, ...series];
            if (selectedSubLang !== "all") {
              fallback = fallback.filter((m) =>
                m.languageAvailable?.includes(selectedSubLang) ||
                (selectedSubLang === "hi" && m.languageAvailable?.includes("hindi"))
              );
            }
            setRegionalItems(fallback);
          } else {
            setRegionalItems([]);
          }
        }
      })
      .finally(() => {
        if (!isCancelled) setIsRegionLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedRegion, selectedSubLang]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [
        trendingData,
        trendingSeriesData,
        popSeriesData,
        trendingMoviesData,
        genreList,
        animeData,
        indianMoviesData,
        indianTvData,
      ] = await Promise.all([
        fetchTrending("all", "day", 1),
        fetchTrending("tv", "day", 1),
        fetchPopular("tv", 1),
        fetchPopular("movie", 1),
        fetchGenres("movie"),
        fetchByGenre("anime").catch(() => ({ results: [] })),
        fetchByRegion("IN", "movie", 1).catch(() => ({ results: [] })),
        fetchByRegion("IN", "tv", 1).catch(() => ({ results: [] })),
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

      const cinemaResults = (indianMoviesData?.results?.length ?? 0) > 0
        ? indianMoviesData.results
        : getAllIndianCinema();
      const seriesResults = (indianTvData?.results?.length ?? 0) > 0
        ? indianTvData.results
        : getAllIndianSeries();
      setIndianCinemaList(cinemaResults);
      setIndianSeriesList(seriesResults);

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

          {/* Upper Genre Tab Bar with "+ More Genres" Modal */}
          <div className="space-y-3 pt-1 select-none">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-400" />
                <span className="text-xs sm:text-sm font-bold text-foreground tracking-wide uppercase font-mono">
                  Explore By Genre
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 font-semibold">
                  Categories
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsGenreModalOpen(true)}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold bg-surface-hover hover:bg-surface-border text-brand-400 hover:text-brand-300 border border-surface-border transition-all active:scale-95 shadow-sm"
              >
                <span>All Genres</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Horizontal Scrollable Genre Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
              {ALL_GENRES.slice(0, 11).map((genre) => {
                const isActive = activeGenre.toLowerCase() === genre.slug.toLowerCase();
                return (
                  <button
                    key={genre.id}
                    type="button"
                    onClick={() => {
                      playPop();
                      setActiveGenre(genre.slug);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-semibold tracking-wide whitespace-nowrap transition-all duration-200 select-none active:scale-95 border ${
                      isActive
                        ? "bg-gradient-to-r from-brand-600 to-indigo-600 text-white border-brand-500/50 shadow-lg shadow-brand-600/30 scale-[1.02] font-bold"
                        : "bg-surface hover:bg-surface-hover text-foreground-muted hover:text-foreground border-surface-border"
                    }`}
                  >
                    <span>{genre.icon}</span>
                    <span>{genre.name}</span>
                  </button>
                );
              })}

              {/* More Genres Button */}
              <button
                type="button"
                onClick={() => setIsGenreModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-semibold tracking-wide whitespace-nowrap bg-surface-hover/60 hover:bg-brand-600/10 text-brand-400 hover:text-brand-300 border border-dashed border-brand-500/40 transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>More Genres...</span>
              </button>
            </div>
          </div>

          {/* Active Genre Filter Showcase */}
          {activeGenre !== "all" && (
            <div className="p-4 sm:p-5 rounded-3xl bg-brand-600/10 border border-brand-500/20 space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-foreground flex items-center gap-2">
                    <span>{getGenreBySlug(activeGenre)?.icon || "🎬"}</span>
                    <span>{getGenreBySlug(activeGenre)?.name || activeGenre} Spotlight</span>
                  </h3>
                  <p className="text-xs text-foreground-muted mt-0.5">
                    {getGenreBySlug(activeGenre)?.description || `Featured ${activeGenre} titles from our catalog`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveGenre("all")}
                    className="text-xs font-semibold text-foreground-muted hover:text-foreground px-2.5 py-1 rounded-lg hover:bg-surface border border-transparent hover:border-surface-border transition-colors"
                  >
                    Clear Filter
                  </button>
                  <Link
                    href={`/browse?genre=${activeGenre}`}
                    className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1"
                  >
                    <span>Explore full catalog &rarr;</span>
                  </Link>
                </div>
              </div>

              {isGenreLoading ? (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none pt-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-none w-[145px] xs:w-[160px] sm:w-[185px] md:w-[200px] aspect-poster rounded-2xl bg-surface-hover shimmer"
                    />
                  ))}
                </div>
              ) : activeGenreItems.length > 0 ? (
                <div className="pt-2">
                  <MediaRow
                    title=""
                    items={activeGenreItems}
                    viewAllHref={`/browse?genre=${activeGenre}`}
                    onOpenInfo={(item) => setSelectedMedia(item)}
                  />
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-foreground-muted">
                  No titles found for {activeGenre}.
                </div>
              )}
            </div>
          )}

          {/* TOP 10 Showcase (Matching Netflix / Movy Spotlight Leaderboard UI) */}
          {trendingAll.length > 0 && (
            <TopTenShowcase
              items={trendingAll}
              title="TOP 10 on VYBE"
              onOpenInfo={(item) => setSelectedMedia(item)}
            />
          )}

          {/* Regional Cinema & Shows Spotlight Tab Section */}
          <div className="space-y-4 pt-1">
            <div className="rounded-3xl bg-surface/50 border border-surface-border/60 p-4 sm:p-5 backdrop-blur-sm space-y-4 shadow-sm">
              <RegionTabBar
                selectedRegion={selectedRegion}
                onSelectRegion={handleSelectRegion}
                selectedSubLang={selectedSubLang}
                onSelectSubLang={setSelectedSubLang}
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

          {/* Dedicated Indian Cinema Row (Pan-India: Bollywood, Tollywood, Kollywood, Mollywood, Sandalwood) */}
          <MediaRow
            title="🇮🇳 Desi Hits & Pan-Indian Cinema"
            subtitle="Blockbusters across Bollywood, Tollywood, Kollywood, Mollywood, Sandalwood & regional industries"
            items={indianCinemaList.length > 0 ? indianCinemaList : getAllIndianCinema()}
            viewAllHref="/browse?region=IN&type=movie"
            onOpenInfo={(item) => setSelectedMedia(item)}
          />

          {/* Dedicated South Indian Cinema Row (Tollywood, Kollywood, Mollywood, Sandalwood) */}
          {(() => {
            const southMovies = (indianCinemaList.length > 0 ? indianCinemaList : getAllIndianCinema()).filter(
              (m) =>
                m.languageAvailable?.some((l) =>
                  ["te", "ta", "ml", "kn", "telugu", "tamil", "malayalam", "kannada"].includes(l)
                ) ||
                ["579974", "587412", "937020", "949229", "1075794", "770906", "350312", "256040"].some((id) =>
                  m.id.includes(id)
                )
            );
            if (southMovies.length === 0) return null;
            return (
              <MediaRow
                title="🔥 South Indian Blockbusters"
                subtitle="High-octane mass cinema & acclaimed gems from Tollywood, Kollywood, Mollywood & Sandalwood"
                items={southMovies}
                viewAllHref="/browse?region=IN&subLang=te"
                onOpenInfo={(item) => setSelectedMedia(item)}
              />
            );
          })()}

          {/* Dedicated Indian Web Series & OTT Hits */}
          <MediaRow
            title="🇮🇳 Top Indian Web Series & OTT Hits"
            subtitle="Binge-worthy Indian crime thrillers, drama, and comedy series (Mirzapur, Sacred Games, The Family Man, Panchayat)"
            items={indianSeriesList.length > 0 ? indianSeriesList : getAllIndianSeries()}
            viewAllHref="/browse?region=IN&type=tv"
            onOpenInfo={(item) => setSelectedMedia(item)}
          />

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

      {/* Full Genres Modal Dialog */}
      {isGenreModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md animate-fadeIn"
          onClick={() => setIsGenreModalOpen(false)}
        >
          <div
            className="relative w-full max-w-xl bg-surface border border-surface-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-surface-border flex items-center justify-between bg-surface-hover/30">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-brand-400" />
                <div>
                  <h3 className="font-bold text-base text-foreground">Select Genre</h3>
                  <p className="text-xs text-foreground-muted">
                    Filter by movie & TV show categories
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGenreModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-hover hover:bg-surface-border text-foreground-muted hover:text-foreground flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Search */}
            <div className="p-4 border-b border-surface-border/60">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
                <input
                  type="text"
                  placeholder="Search genres (e.g. Action, Horror, Anime, Comedy)..."
                  value={genreModalSearch}
                  onChange={(e) => setGenreModalSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-background border border-surface-border text-xs text-foreground placeholder:text-foreground-muted/60 focus:outline-none focus:border-brand-500"
                  autoFocus
                />
              </div>
            </div>

            {/* Genres List */}
            <div className="p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ALL_GENRES.filter(
                (g) =>
                  genreModalSearch.trim() === "" ||
                  g.name.toLowerCase().includes(genreModalSearch.toLowerCase()) ||
                  g.slug.toLowerCase().includes(genreModalSearch.toLowerCase()) ||
                  g.description.toLowerCase().includes(genreModalSearch.toLowerCase())
              ).map((genre) => {
                const isSelected = activeGenre.toLowerCase() === genre.slug.toLowerCase();
                return (
                  <button
                    key={genre.id}
                    type="button"
                    onClick={() => {
                      setActiveGenre(genre.slug);
                      setIsGenreModalOpen(false);
                      setGenreModalSearch("");
                    }}
                    className={`flex items-start gap-3 p-3 rounded-2xl text-left border transition-all ${
                      isSelected
                        ? "bg-brand-600/15 border-brand-500/50 shadow-sm"
                        : "bg-surface-hover/50 hover:bg-surface-hover border-surface-border/60 hover:border-surface-border"
                    }`}
                  >
                    <span className="text-2xl shrink-0">{genre.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isSelected ? "text-brand-400" : "text-foreground"}`}>
                          {genre.name}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-bold text-brand-400 bg-brand-500/20 px-1.5 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-foreground-muted line-clamp-1 mt-0.5">
                        {genre.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
