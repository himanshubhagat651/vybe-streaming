"use client";

import React, { useState } from "react";
import { Season, Episode } from "@/lib/types";
import { Play, Clock, CheckCircle, Tv } from "lucide-react";
import { cn } from "@/lib/utils";

interface TvEpisodeDrawerProps {
  seasons: Season[];
  activeSeason: number;
  activeEpisode: number;
  onSelectEpisode: (season: number, episode: number) => void;
}

export function TvEpisodeDrawer({
  seasons,
  activeSeason,
  activeEpisode,
  onSelectEpisode,
}: TvEpisodeDrawerProps) {
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState(activeSeason);

  React.useEffect(() => {
    setSelectedSeasonNumber(activeSeason);
  }, [activeSeason]);

  const currentSeason =
    seasons.find((s) => s.seasonNumber === selectedSeasonNumber) || seasons[0];

  return (
    <div className="rounded-3xl bg-surface border border-surface-border p-4 md:p-6 space-y-4">
      {/* Header & Season Dropdown */}
      <div className="flex items-center justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground">Episodes</h3>
          <p className="text-xs text-foreground-muted">
            {currentSeason?.episodes.length || 0} episodes available
          </p>
        </div>

        {/* Season Selector Tabs / Select */}
        <select
          value={selectedSeasonNumber}
          onChange={(e) => {
            const nextSeason = Number(e.target.value);
            setSelectedSeasonNumber(nextSeason);
            onSelectEpisode(nextSeason, 1);
          }}
          className="h-9 px-3 rounded-xl bg-surface-hover border border-surface-border text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {seasons.map((season) => (
            <option key={season.seasonNumber} value={season.seasonNumber}>
              {season.name} ({season.episodeCount || season.episodes?.length || 10} Ep)
            </option>
          ))}
        </select>
      </div>

      {/* Episode Grid / List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 max-h-[500px] overflow-y-auto pr-1">
        {currentSeason?.episodes.map((ep) => {
          const isPlaying =
            activeSeason === selectedSeasonNumber && activeEpisode === ep.episodeNumber;

          return (
            <div
              key={ep.episodeNumber}
              onClick={() => onSelectEpisode(selectedSeasonNumber, ep.episodeNumber)}
              className={cn(
                "flex items-start gap-3.5 p-3 rounded-2xl cursor-pointer transition-all border group",
                isPlaying
                  ? "bg-brand-600/15 border-brand-500/40 shadow-md ring-1 ring-brand-500/30"
                  : "bg-surface-hover/50 hover:bg-surface-hover border-surface-border/60 hover:border-surface-border"
              )}
            >
              {/* Thumbnail */}
              <div className="relative w-28 h-18 sm:w-32 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-black">
                {ep.thumbnailUrl ? (
                  <img
                    src={ep.thumbnailUrl}
                    alt={ep.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full bg-surface-hover flex items-center justify-center">
                    <Tv className="w-5 h-5 text-white/30" />
                  </div>
                )}
                <div
                  className={cn(
                    "absolute inset-0 flex items-center justify-center transition-opacity",
                    isPlaying ? "bg-brand-900/60 opacity-100" : "bg-black/40 opacity-0 group-hover:opacity-100"
                  )}
                >
                  <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-lg">
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Duration Badge */}
                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-black/70 text-white">
                  {ep.duration}
                </span>
              </div>

              {/* Episode Info */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-brand-400">
                    EP {ep.episodeNumber}
                  </span>
                  {isPlaying && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-brand-500 text-white">
                      Now Playing
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-semibold text-foreground truncate group-hover:text-brand-400 transition-colors">
                  {ep.title}
                </h4>

                <p className="text-xs text-foreground-muted line-clamp-2 leading-relaxed">
                  {ep.overview}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
