"use client";

import React, { useState } from "react";
import {
  Maximize,
  Minimize,
  RotateCw,
  Tv,
  Globe,
  ShieldAlert,
  Server,
  Sparkles,
  Info,
} from "lucide-react";
import { MediaType } from "@/lib/types";
import { Button } from "@/components/ui/Button";

interface ScreenScapePlayerProps {
  tmdbId: number;
  type: MediaType;
  season?: number;
  episode?: number;
  title: string;
  isTheaterMode: boolean;
  onToggleTheaterMode: () => void;
}

export function ScreenScapePlayer({
  tmdbId,
  type,
  season = 1,
  episode = 1,
  title,
  isTheaterMode,
  onToggleTheaterMode,
}: ScreenScapePlayerProps) {
  const [selectedLanguage, setSelectedLanguage] = useState("eng");
  const [playerBase, setPlayerBase] = useState("https://web.screenscape.fun/embed");
  const [playerKey, setPlayerKey] = useState(0); // to force iframe refresh
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Construct documented ScreenScape embed URL
  const queryParams = new URLSearchParams({
    tmdb: String(tmdbId),
    type,
    ...(type === "tv" && {
      s: String(season),
      e: String(episode),
    }),
    lan: selectedLanguage,
  });

  const embedUrl = `${playerBase}?${queryParams.toString()}`;

  const handleReload = () => {
    setPlayerKey((prev) => prev + 1);
  };

  const handleToggleFullscreen = () => {
    const container = document.getElementById("player-container");
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div className="space-y-4">
      {/* Player Frame Container */}
      <div
        id="player-container"
        className={`relative w-full rounded-3xl overflow-hidden bg-black border border-surface-border shadow-2xl transition-all duration-300 ${
          isTheaterMode ? "aspect-[21/9] max-h-[80vh]" : "aspect-video"
        }`}
      >
        <iframe
          key={playerKey}
          src={embedUrl}
          title={`ScreenScape Player - ${title}`}
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
          referrerPolicy="origin-when-cross-origin"
          className="w-full h-full border-0 rounded-2xl"
        />
      </div>

      {/* Control Bar & Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-surface border border-surface-border">
        {/* Left: Stream Info & Server Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-brand-400" />
            <span className="text-xs font-semibold text-foreground">Mirror Server:</span>
            <select
              value={playerBase}
              onChange={(e) => setPlayerBase(e.target.value)}
              className="h-8 px-2.5 rounded-lg text-xs bg-surface-hover border border-surface-border text-foreground focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="https://web.screenscape.fun/embed">ScreenScape Core (Default)</option>
              <option value="https://nxsha.screenscape.me/embed">ScreenScape NXSHA (Mirror)</option>
            </select>
          </div>

          {/* Audio Language Preference */}
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-400" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="h-8 px-2.5 rounded-lg text-xs bg-surface-hover border border-surface-border text-foreground focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="eng">English (eng)</option>
              <option value="hindi">Hindi (hindi)</option>
              <option value="french">French (french)</option>
            </select>
          </div>
        </div>

        {/* Right: Theater Mode, Reload, Fullscreen Actions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleReload}
            title="Reload Video Stream"
            className="text-xs"
          >
            <RotateCw className="w-3.5 h-3.5 mr-1" />
            Reload
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onToggleTheaterMode}
            title="Toggle Theater Mode"
            className="text-xs hidden sm:inline-flex"
          >
            {isTheaterMode ? (
              <>
                <Minimize className="w-3.5 h-3.5 mr-1" />
                Standard View
              </>
            ) : (
              <>
                <Maximize className="w-3.5 h-3.5 mr-1" />
                Theater Mode
              </>
            )}
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={handleToggleFullscreen}
            title="Toggle Native Fullscreen"
            className="text-xs"
          >
            Fullscreen
          </Button>
        </div>
      </div>

      {/* Phase 1 Integration Banner */}
      <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-xs text-foreground-muted">
        <Sparkles className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-brand-300">
            Phase 1 Embedded Player Container
          </p>
          <p className="text-[11px] leading-relaxed">
            Playing via ScreenScape embed with TMDB ID <strong>{tmdbId}</strong>
            {type === "tv" && ` (Season ${season}, Episode ${episode})`}. The bidirectional postMessage watch-progress loop will be wired up in Phase 3.
          </p>
        </div>
      </div>
    </div>
  );
}
