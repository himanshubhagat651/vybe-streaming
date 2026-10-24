"use client";

import React from "react";
import Link from "next/link";
import { History, Play, Trash2, Clock, CheckCircle2, Tv, Film, ShieldCheck, Users } from "lucide-react";
import { useUserData } from "@/context/UserDataContext";
import { useAuth } from "@/context/AuthContext";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

function formatSeconds(sec: number): string {
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export default function HistoryPage() {
  const { history, continueWatching, removeFromHistory, clearHistory, isLoading } = useUserData();
  const { user, openAuthModal, configStatus } = useAuth();

  const handleClear = async () => {
    if (confirm("Are you sure you want to clear your watch history?")) {
      await clearHistory();
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-mono tracking-wider text-brand-400 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              {user ? `${user.username}'s Watch History` : "Watch History"}
            </span>
          </div>

          <h1 className="text-3xl font-black text-foreground flex items-center gap-3">
            <History className="w-7 h-7 text-indigo-400" />
            Continue Watching & History
            {history.length > 0 && (
              <span className="text-sm px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-semibold">
                {history.length} {history.length === 1 ? "entry" : "entries"}
              </span>
            )}
          </h1>
          <p className="text-xs md:text-sm text-foreground-muted mt-1">
            Pick up right where you left off across all your devices.
          </p>
        </div>

        {history.length > 0 && (
          <Button size="sm" variant="outline" onClick={handleClear} className="self-start sm:self-auto">
            <Trash2 className="w-4 h-4 mr-1.5 text-red-400" />
            Clear History
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4 sm:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-video rounded-3xl bg-surface border border-surface-border animate-pulse"
            />
          ))}
        </div>
      ) : history.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4 sm:gap-6">
          {history.map((item) => {
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
                className="group flex flex-col rounded-3xl overflow-hidden bg-surface border border-surface-border hover:border-brand-500/40 transition-all duration-300 shadow-lg hover:shadow-2xl select-none"
              >
                {/* Backdrop Thumbnail with Progress Bar */}
                <Link href={watchUrl} className="relative aspect-video w-full overflow-hidden bg-black">
                  {imageSrc ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={imageSrc}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-surface-hover">
                      {item.mediaType === "tv" ? (
                        <Tv className="w-10 h-10 text-foreground-muted" />
                      ) : (
                        <Film className="w-10 h-10 text-foreground-muted" />
                      )}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  {/* Play icon overlay on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-brand-600/90 text-white flex items-center justify-center shadow-xl shadow-brand-500/40 transform scale-90 group-hover:scale-100 transition-transform">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Top Tags */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/10 uppercase font-mono">
                      {item.mediaType === "tv"
                        ? `S${item.season ?? 1}:E${item.episode ?? 1}`
                        : "Movie"}
                    </span>

                    {item.completed && (
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/80 backdrop-blur-md text-white flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Completed
                      </span>
                    )}
                  </div>

                  {/* Progress Bar Container */}
                  <div className="absolute bottom-0 inset-x-0 h-1.5 bg-white/20">
                    <div
                      className={`h-full transition-all duration-300 ${
                        item.completed ? "bg-emerald-400" : "bg-brand-500"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </Link>

                {/* Card Body */}
                <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-base text-foreground group-hover:text-brand-400 transition-colors line-clamp-1">
                      <Link href={watchUrl}>{item.title}</Link>
                    </h3>

                    <div className="flex items-center justify-between text-xs text-foreground-muted mt-1.5">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {item.completed
                          ? "Finished"
                          : `${formatSeconds(item.progressSeconds)} watched${
                              item.durationSeconds ? ` (${percent}%)` : ""
                            }`}
                      </span>
                      <span className="text-[11px] font-mono text-foreground-muted/60">
                        TMDB #{item.tmdbId}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-surface-border/60">
                    <Link
                      href={watchUrl}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center gap-1.5 transition-colors shadow-sm shadow-brand-600/30"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{item.completed ? "Replay" : "Resume"}</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        removeFromHistory(item.tmdbId, item.mediaType, item.season, item.episode)
                      }
                      title="Remove from history"
                      aria-label="Remove item from history"
                      className="p-2 rounded-xl text-foreground-muted hover:text-red-400 hover:bg-red-500/10 transition-colors border border-surface-border"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<History className="w-10 h-10" />}
          title="No watch history yet"
          description={
            user
              ? `When ${user.username} watches movies or shows, progress timestamps will automatically sync here.`
              : "When you stream movies or series on VYBE, your playback progress will be saved here automatically."
          }
          actionText="Start Watching"
          actionHref="/"
        />
      )}

      {/* Account Isolation Notice */}
      <div className="mt-8 p-4 rounded-2xl bg-surface border border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">Multi-Account Isolation Verification</h4>
            <p className="text-xs text-foreground-muted">
              Current account: <span className="text-brand-400 font-semibold">{user?.username || "Guest"}</span> ({user?.email || "No email"}). Switching to another test account loads their distinct private watch history.
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
