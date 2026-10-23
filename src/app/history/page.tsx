"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DEMO_MEDIA } from "@/lib/demoData";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { History, Play, Trash2, Clock, CheckCircle } from "lucide-react";

interface WatchProgressItem {
  id: string;
  media: (typeof DEMO_MEDIA)[0];
  season?: number;
  episode?: number;
  progressPercentage: number;
  remainingTime: string;
  lastWatched: string;
}

export default function HistoryPage() {
  const [historyItems, setHistoryItems] = useState<WatchProgressItem[]>([
    {
      id: "h-1",
      media: DEMO_MEDIA[0], // Dune: Part Two
      progressPercentage: 68,
      remainingTime: "52m remaining",
      lastWatched: "2 hours ago",
    },
    {
      id: "h-2",
      media: DEMO_MEDIA[2], // Arcane
      season: 1,
      episode: 2,
      progressPercentage: 42,
      remainingTime: "24m remaining",
      lastWatched: "Yesterday",
    },
    {
      id: "h-3",
      media: DEMO_MEDIA[1], // Interstellar
      progressPercentage: 85,
      remainingTime: "25m remaining",
      lastWatched: "3 days ago",
    },
  ]);

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear your local watch history?")) {
      setHistoryItems([]);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <h1 className="text-3xl font-black text-foreground flex items-center gap-3">
            <History className="w-7 h-7 text-indigo-400" />
            Continue Watching & History
          </h1>
          <p className="text-xs md:text-sm text-foreground-muted mt-1">
            Pick up right where you left off across all your devices.
          </p>
        </div>

        {historyItems.length > 0 && (
          <Button size="sm" variant="outline" onClick={clearHistory}>
            <Trash2 className="w-4 h-4 mr-1.5 text-danger" />
            Clear History
          </Button>
        )}
      </div>

      {historyItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {historyItems.map((item) => {
            const watchUrl = `/watch/${item.media.type}/${item.media.tmdbId}${
              item.season ? `?s=${item.season}&e=${item.episode}` : ""
            }`;

            return (
              <div
                key={item.id}
                className="group flex flex-col rounded-3xl overflow-hidden bg-surface border border-surface-border hover:border-brand-500/40 transition-all duration-300 shadow-lg hover:shadow-2xl"
              >
                {/* Backdrop Thumbnail with Progress Bar */}
                <Link href={watchUrl} className="relative aspect-video w-full overflow-hidden bg-black">
                  <img
                    src={item.media.backdropUrl || undefined}
                    alt={item.media.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  {/* Play icon overlay on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-brand-600/90 text-white flex items-center justify-center shadow-xl shadow-brand-500/40 transform scale-90 group-hover:scale-100 transition-transform">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Progress Line Bar at Bottom of Image */}
                  <div className="absolute bottom-0 inset-x-0 h-1.5 bg-white/20">
                    <div
                      className="h-full bg-brand-500 rounded-r-full"
                      style={{ width: `${item.progressPercentage}%` }}
                    />
                  </div>
                </Link>

                {/* Details Card */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-foreground-muted">
                      <span className="font-semibold text-brand-400 uppercase">
                        {item.media.type === "tv" ? `TV • S${item.season} E${item.episode}` : "Movie"}
                      </span>
                      <span>{item.remainingTime}</span>
                    </div>

                    <h3 className="font-bold text-base text-foreground group-hover:text-brand-400 transition-colors">
                      {item.media.title}
                    </h3>

                    <p className="text-xs text-foreground-muted line-clamp-2">
                      {item.media.overview}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-surface-border/60">
                    <span className="text-[11px] text-foreground-muted">
                      Watched {item.lastWatched}
                    </span>

                    <Link href={watchUrl}>
                      <Button size="sm" variant="primary">
                        <Play className="w-3.5 h-3.5 fill-current mr-1" />
                        Resume
                      </Button>
                    </Link>
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
          description="When you start watching a movie or TV show, your progress will automatically appear here."
          actionText="Start Watching"
          actionHref="/"
        />
      )}
    </div>
  );
}
