"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bookmark, Film, Tv, Trash2, Play, Star, ShieldCheck, Users } from "lucide-react";
import { useUserData } from "@/context/UserDataContext";
import { useAuth } from "@/context/AuthContext";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { MediaType } from "@/lib/types";

export default function WatchlistPage() {
  const { watchlist, removeFromWatchlist, isLoading } = useUserData();
  const { user, openAuthModal, configStatus } = useAuth();
  const [filter, setFilter] = useState<"all" | MediaType>("all");

  const filteredItems = watchlist.filter((item) => {
    if (filter === "all") return true;
    return item.mediaType === filter;
  });

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-mono tracking-wider text-brand-400 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              {user ? `${user.username}'s Library` : "My Library"}
            </span>
          </div>

          <h1 className="text-3xl font-black text-foreground flex items-center gap-3">
            <Bookmark className="w-7 h-7 text-brand-400" />
            My Watchlist
            {watchlist.length > 0 && (
              <span className="text-sm px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30 font-semibold">
                {watchlist.length} {watchlist.length === 1 ? "title" : "titles"}
              </span>
            )}
          </h1>
          <p className="text-xs md:text-sm text-foreground-muted mt-1">
            Your saved movies and TV shows, synced and isolated per account.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-surface-border self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === "all"
                ? "bg-brand-600 text-white shadow-sm"
                : "text-foreground-muted hover:text-foreground"
            }`}
          >
            All ({watchlist.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("movie")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              filter === "movie"
                ? "bg-brand-600 text-white shadow-sm"
                : "text-foreground-muted hover:text-foreground"
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            Movies ({watchlist.filter((i) => i.mediaType === "movie").length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("tv")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              filter === "tv"
                ? "bg-brand-600 text-white shadow-sm"
                : "text-foreground-muted hover:text-foreground"
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            Series ({watchlist.filter((i) => i.mediaType === "tv").length})
          </button>
        </div>
      </div>

      {/* Watchlist Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 3xl:grid-cols-8 gap-3 sm:gap-4 lg:gap-5 2xl:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-poster rounded-2xl bg-surface border border-surface-border animate-pulse"
            />
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 3xl:grid-cols-8 gap-3 sm:gap-4 lg:gap-5 2xl:gap-6">
          {filteredItems.map((item) => {
            const watchUrl = `/watch/${item.mediaType}/${item.tmdbId}`;

            return (
              <div
                key={item.id}
                className="group relative flex flex-col rounded-2xl overflow-hidden bg-surface border border-surface-border transition-all duration-300 hover:shadow-2xl hover:shadow-black/50 hover:border-brand-500/40 hover:-translate-y-1.5 select-none"
              >
                {/* Poster Container */}
                <Link
                  href={watchUrl}
                  className="relative aspect-poster w-full overflow-hidden bg-surface-hover"
                >
                  {item.posterPath ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={
                        item.posterPath.startsWith("http")
                          ? item.posterPath
                          : `https://image.tmdb.org/t/p/w500${item.posterPath}`
                      }
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-brand-600/10 text-brand-400 flex items-center justify-center mb-2">
                        {item.mediaType === "tv" ? <Tv className="w-6 h-6" /> : <Film className="w-6 h-6" />}
                      </div>
                      <p className="text-xs font-bold text-foreground line-clamp-3">{item.title}</p>
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                  {/* Badges */}
                  <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10">
                    {item.voteAverage && item.voteAverage > 0 ? (
                      <Badge variant="rating">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {item.voteAverage.toFixed(1)}
                      </Badge>
                    ) : (
                      <Badge variant="outline">NR</Badge>
                    )}
                    <Badge variant="brand">{item.mediaType === "tv" ? "TV" : "Movie"}</Badge>
                  </div>

                  {/* Center Play Button on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100 z-10">
                    <div className="w-12 h-12 rounded-full bg-brand-600/90 hover:bg-brand-500 text-white flex items-center justify-center shadow-xl shadow-brand-500/50 backdrop-blur-md transition-transform hover:scale-110">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Remove Button on Hover */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeFromWatchlist(item.tmdbId, item.mediaType);
                    }}
                    title="Remove from watchlist"
                    aria-label={`Remove ${item.title} from watchlist`}
                    className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-red-600/80 hover:bg-red-600 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all z-20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </Link>

                {/* Card Title & Info */}
                <div className="p-3 flex flex-col flex-1 justify-between gap-1.5">
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] text-foreground-muted font-mono">
                      <span className="uppercase text-brand-400 font-semibold">
                        {item.mediaType === "tv" ? "TV Series" : "Movie"}
                      </span>
                      {item.releaseYear && <span>• {item.releaseYear}</span>}
                    </div>
                    <h3 className="font-bold text-sm text-foreground group-hover:text-brand-400 transition-colors line-clamp-1 mt-0.5">
                      <Link href={watchUrl}>{item.title}</Link>
                    </h3>
                  </div>

                  <Link
                    href={watchUrl}
                    className="mt-1 w-full py-1 text-center text-xs font-semibold rounded-lg bg-surface-hover hover:bg-brand-600 hover:text-white transition-colors text-foreground-muted"
                  >
                    Watch Now
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Bookmark className="w-10 h-10" />}
          title={
            filter === "all"
              ? "Your watchlist is empty"
              : `No ${filter === "movie" ? "movies" : "series"} in your watchlist`
          }
          description={
            user
              ? `Save titles while browsing to build ${user.username}'s personal streaming queue.`
              : "Sign in or save titles while browsing to build your personal streaming queue."
          }
          actionText="Browse Popular Titles"
          actionHref="/browse"
        />
      )}

      {/* Account Isolation Info Card */}
      <div className="mt-8 p-4 rounded-2xl bg-surface border border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600/10 text-brand-400 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">Multi-Account Isolation Verification</h4>
            <p className="text-xs text-foreground-muted">
              Current account: <span className="text-brand-400 font-semibold">{user?.username || "Guest"}</span> ({user?.email || "No email"}). Switching to another test account loads their distinct private watchlist.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openAuthModal}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-surface-hover hover:bg-brand-600 hover:text-white border border-surface-border transition-colors shrink-0"
        >
          Switch Account / Sign In
        </button>
      </div>
    </div>
  );
}
