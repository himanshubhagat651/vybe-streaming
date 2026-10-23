"use client";

import React, { useState } from "react";
import { DEMO_MEDIA } from "@/lib/demoData";
import { MediaCard } from "@/components/media/MediaCard";
import { MediaModal } from "@/components/media/MediaModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Bookmark, Sparkles } from "lucide-react";
import { MediaItem } from "@/lib/types";

export default function WatchlistPage() {
  // Initial demo bookmarked items
  const [watchlist, setWatchlist] = useState<MediaItem[]>([
    DEMO_MEDIA[0],
    DEMO_MEDIA[1],
    DEMO_MEDIA[2],
  ]);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <h1 className="text-3xl font-black text-foreground flex items-center gap-3">
            <Bookmark className="w-7 h-7 text-brand-400" />
            My Watchlist
          </h1>
          <p className="text-xs md:text-sm text-foreground-muted mt-1">
            Titles you have saved to watch later.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-foreground-muted bg-surface px-3 py-1.5 rounded-xl border border-surface-border">
          <Sparkles className="w-4 h-4 text-brand-400" />
          <span>Local session storage (Cloud sync in Phase 4)</span>
        </div>
      </div>

      {watchlist.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {watchlist.map((item) => (
            <MediaCard
              key={item.id}
              media={item}
              onOpenInfo={(m) => setSelectedMedia(m)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Bookmark className="w-10 h-10" />}
          title="Your watchlist is empty"
          description="Bookmark movies and series while browsing to easily find and stream them later."
          actionText="Discover Movies & Shows"
          actionHref="/"
        />
      )}

      <MediaModal
        media={selectedMedia}
        onClose={() => setSelectedMedia(null)}
      />
    </div>
  );
}
