"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Dices, Play, Star, Bookmark, Check, RefreshCw, X, Sparkles, Film, Tv } from "lucide-react";
import { MediaItem } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useUserData } from "@/context/UserDataContext";
import { playDice, playSuccess, playHeart, playPop } from "@/lib/audio";
import { DEMO_MEDIA } from "@/lib/demoData";

interface SurpriseMeModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateItems?: MediaItem[];
  onOpenDetails?: (media: MediaItem) => void;
}

export function SurpriseMeModal({
  isOpen,
  onClose,
  candidateItems = [],
  onOpenDetails,
}: SurpriseMeModalProps) {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useUserData();
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [rouletteTitle, setRouletteTitle] = useState("");

  const pool = candidateItems.length > 5 ? candidateItems : DEMO_MEDIA;

  const rollDice = useCallback(() => {
    if (pool.length === 0) return;
    setIsRolling(true);
    playDice();

    let rollCount = 0;
    const maxRolls = 14;
    const interval = setInterval(() => {
      rollCount++;
      const rand = pool[Math.floor(Math.random() * pool.length)];
      setRouletteTitle(rand.title);

      if (rollCount >= maxRolls) {
        clearInterval(interval);
        // Final pick: pick a high-rated title or random from pool
        const finalPick = pool[Math.floor(Math.random() * pool.length)];
        setSelectedItem(finalPick);
        setIsRolling(false);
        playSuccess();
      }
    }, 85);
  }, [pool]);

  useEffect(() => {
    if (isOpen) {
      rollDice();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen, rollDice]);

  if (!isOpen) return null;

  const isBookmarked = selectedItem
    ? isInWatchlist(selectedItem.tmdbId, selectedItem.type)
    : false;

  const toggleWatchlist = async () => {
    if (!selectedItem) return;
    if (isBookmarked) {
      await removeFromWatchlist(selectedItem.tmdbId, selectedItem.type);
      playPop();
    } else {
      await addToWatchlist({
        tmdbId: selectedItem.tmdbId,
        mediaType: selectedItem.type,
        title: selectedItem.title,
        posterPath: selectedItem.posterUrl,
        backdropPath: selectedItem.backdropUrl,
        voteAverage: selectedItem.rating,
        releaseYear: selectedItem.releaseYear,
      });
      playHeart();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md animate-fadeIn">
      <div
        className="fixed inset-0"
        onClick={() => {
          playPop();
          onClose();
        }}
      />

      <div className="relative w-full max-w-xl bg-surface border border-brand-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 animate-scaleUp">
        {/* Glowing Top Ambient Ribbon */}
        <div className="h-1.5 w-full bg-gradient-to-r from-brand-500 via-indigo-500 to-amber-400" />

        {/* Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-surface-border/60 bg-surface-hover/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
              <Dices className={`w-5 h-5 ${isRolling ? "animate-spin" : ""}`} />
            </div>
            <div>
              <h3 className="font-black text-foreground text-base sm:text-lg flex items-center gap-1.5">
                <span>Surprise Me</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-[11px] text-foreground-muted">
                {isRolling ? "Spinning the VYBE wheel..." : "Your algorithm-free random pick"}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playPop();
              onClose();
            }}
            className="p-2 rounded-xl text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {isRolling ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin flex items-center justify-center">
                <Dices className="w-6 h-6 text-brand-400 animate-pulse" />
              </div>
              <p className="text-base font-bold text-brand-400 font-mono tracking-wide animate-pulse">
                {rouletteTitle || "Rolling..."}
              </p>
            </div>
          ) : selectedItem ? (
            <>
              {/* Media Card Showcase */}
              <div className="flex gap-4 sm:gap-5 items-start">
                <div className="w-24 sm:w-32 aspect-poster rounded-2xl overflow-hidden bg-surface-hover shrink-0 border border-surface-border shadow-md">
                  {selectedItem.posterUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={selectedItem.posterUrl}
                      alt={selectedItem.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-foreground-muted">
                      {selectedItem.type === "tv" ? <Tv className="w-8 h-8" /> : <Film className="w-8 h-8" />}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {selectedItem.rating > 0 && (
                      <Badge variant="rating" className="text-[10px]">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {selectedItem.rating.toFixed(1)}
                      </Badge>
                    )}
                    <Badge variant="brand" className="text-[10px]">
                      {selectedItem.type === "tv" ? "TV Series" : "Movie"}
                    </Badge>
                    {selectedItem.releaseYear && (
                      <span className="text-[11px] text-foreground-muted font-medium">
                        {selectedItem.releaseYear}
                      </span>
                    )}
                  </div>

                  <h4 className="text-lg sm:text-xl font-black text-foreground leading-tight">
                    {selectedItem.title}
                  </h4>

                  {selectedItem.genres && selectedItem.genres.length > 0 && (
                    <p className="text-xs text-brand-400 font-semibold truncate">
                      {selectedItem.genres.slice(0, 3).join(" • ")}
                    </p>
                  )}

                  <p className="text-xs text-foreground-muted line-clamp-3 leading-relaxed">
                    {selectedItem.overview || "Stream this critically acclaimed title right now on VYBE."}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <Link
                  href={`/watch/${selectedItem.type}/${selectedItem.tmdbId}`}
                  onClick={() => {
                    playSuccess();
                    onClose();
                  }}
                  className="flex-1"
                >
                  <Button size="md" variant="primary" className="w-full justify-center">
                    <Play className="w-4 h-4 fill-current mr-1.5" />
                    Watch Now
                  </Button>
                </Link>

                <Button
                  size="md"
                  variant={isBookmarked ? "primary" : "secondary"}
                  onClick={toggleWatchlist}
                  className={isBookmarked ? "bg-brand-600 text-white" : ""}
                >
                  {isBookmarked ? (
                    <>
                      <Check className="w-4 h-4 mr-1.5" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4 mr-1.5" />
                      Watchlist
                    </>
                  )}
                </Button>

                <Button
                  size="md"
                  variant="outline"
                  onClick={rollDice}
                  className="border-brand-500/40 text-brand-400 hover:bg-brand-500/10"
                >
                  <RefreshCw className="w-4 h-4 mr-1.5" />
                  Roll Again
                </Button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
