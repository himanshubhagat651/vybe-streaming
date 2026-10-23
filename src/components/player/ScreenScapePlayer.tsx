"use client";

import React, { useState, useEffect } from "react";
import {
  Maximize,
  Minimize,
  RotateCw,
  Globe,
  Server,
  AlertTriangle,
  Download,
  Loader2,
  Film,
  Info,
} from "lucide-react";
import { MediaType } from "@/lib/types";
import {
  buildScreenScapeEmbedUrl,
  buildScreenScapeDownloadUrl,
  PLAYER_SERVERS,
  SUPPORTED_LANGUAGES,
  DEFAULT_PLAYER_BASE_URL,
} from "@/lib/player/url";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { SupportedLanguage } from "@/lib/types";

interface ScreenScapePlayerProps {
  tmdbId: number | string;
  type: MediaType;
  season?: number | string;
  episode?: number | string;
  title: string;
  isTheaterMode?: boolean;
  onToggleTheaterMode?: () => void;
  className?: string;
}

export function ScreenScapePlayer({
  tmdbId,
  type,
  season = 1,
  episode = 1,
  title,
  isTheaterMode = false,
  onToggleTheaterMode,
  className = "",
}: ScreenScapePlayerProps) {
  const { user, updateProfile } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    user?.preferredLanguage || "eng"
  );
  const [selectedServer, setSelectedServer] = useState<string>(DEFAULT_PLAYER_BASE_URL);
  const [isLoadingIframe, setIsLoadingIframe] = useState<boolean>(true);
  const [reloadKey, setReloadKey] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    if (user?.preferredLanguage) {
      setSelectedLanguage(user.preferredLanguage);
    }
  }, [user?.preferredLanguage]);

  const handleLanguageChange = (newLang: string) => {
    setSelectedLanguage(newLang);
    if (user && (newLang === "eng" || newLang === "hindi" || newLang === "french")) {
      updateProfile({ preferredLanguage: newLang as SupportedLanguage });
    }
  };

  // Validate parameters and generate the documented ScreenScape URL
  const { url: embedUrl, validation } = buildScreenScapeEmbedUrl({
    tmdbId,
    type,
    season,
    episode,
    language: selectedLanguage,
    baseUrl: selectedServer,
  });

  // Reset loading state when the source URL changes
  useEffect(() => {
    setIsLoadingIframe(true);
  }, [embedUrl, reloadKey]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleToggleFullscreen = () => {
    const container = document.getElementById("screenscape-player-container");
    if (!container) return;

    if (!document.fullscreenElement) {
      container
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => {});
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(() => {});
    }
  };

  const handleReload = () => {
    setIsLoadingIframe(true);
    setReloadKey((prev) => prev + 1);
  };

  const downloadUrl = validation.isValid && validation.sanitizedTmdbId
    ? buildScreenScapeDownloadUrl(validation.sanitizedTmdbId, type)
    : null;

  return (
    <div className={`space-y-3.5 select-none ${className}`}>
      {/* Player Viewport Container */}
      <div
        id="screenscape-player-container"
        className={`relative w-full rounded-3xl overflow-hidden bg-black border border-surface-border shadow-2xl transition-all duration-300 ${
          isTheaterMode ? "aspect-[21/9] max-h-[82vh]" : "aspect-video"
        }`}
      >
        {/* Input Validation Error State */}
        {!validation.isValid ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-surface/95 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-danger/10 text-danger flex items-center justify-center ring-1 ring-danger/20">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="max-w-md space-y-1">
              <h3 className="text-base font-bold text-foreground">
                Invalid Media Identifier
              </h3>
              <p className="text-xs text-foreground-muted">
                {validation.errorMessage || "A valid numeric TMDB ID is required to request ScreenScape streams."}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Loading Shimmer Overlay while Iframe Loads */}
            {isLoadingIframe && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm space-y-3 animate-fadeIn">
                <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
                <p className="text-xs text-gray-400 font-mono tracking-wide">
                  Connecting to ScreenScape stream...
                </p>
              </div>
            )}

            {/* Documented ScreenScape Iframe */}
            <iframe
              key={`${embedUrl}-${reloadKey}`}
              src={embedUrl}
              title={`Watch ${title} - ScreenScape Player`}
              width="100%"
              height="100%"
              frameBorder="0"
              allowFullScreen
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
              referrerPolicy="origin-when-cross-origin"
              onLoad={() => setIsLoadingIframe(false)}
              className="w-full h-full border-0 rounded-2xl"
            />
          </>
        )}
      </div>

      {/* Responsive Player Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-surface border border-surface-border">
        {/* Left: Mirror Server & Language Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Mirror Server */}
          <div className="flex items-center gap-2">
            <Server className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-xs font-semibold text-foreground">Server:</span>
            <select
              value={selectedServer}
              onChange={(e) => setSelectedServer(e.target.value)}
              aria-label="Select Mirror Server"
              className="h-8 px-2.5 rounded-lg text-xs bg-surface-hover border border-surface-border text-foreground focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
            >
              {PLAYER_SERVERS.map((server) => (
                <option key={server.id} value={server.url}>
                  {server.name}
                </option>
              ))}
            </select>
          </div>

          {/* Audio Language Option */}
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs font-semibold text-foreground">Audio:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              aria-label="Select Preferred Audio Language"
              className="h-8 px-2.5 rounded-lg text-xs bg-surface-hover border border-surface-border text-foreground focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Theater Mode, Fullscreen & Stream Reload */}
        <div className="flex items-center gap-2">
          {downloadUrl && (
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Browse direct download links on ScreenScape"
              className="hidden sm:inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold rounded-xl bg-surface-hover hover:bg-surface-border text-foreground-muted hover:text-brand-400 border border-surface-border transition-colors"
            >
              <Download className="w-3 h-3" />
              <span>Downloads</span>
            </a>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={handleReload}
            title="Reload Video Player Frame"
            className="text-xs h-8"
          >
            <RotateCw className="w-3 h-3 mr-1" />
            Reload
          </Button>

          {onToggleTheaterMode && (
            <Button
              size="sm"
              variant="outline"
              onClick={onToggleTheaterMode}
              title="Toggle Theater / Cinema Mode"
              className="text-xs h-8 hidden sm:inline-flex"
            >
              {isTheaterMode ? (
                <>
                  <Minimize className="w-3 h-3 mr-1" />
                  Standard
                </>
              ) : (
                <>
                  <Maximize className="w-3 h-3 mr-1" />
                  Theater
                </>
              )}
            </Button>
          )}

          <Button
            size="sm"
            variant="secondary"
            onClick={handleToggleFullscreen}
            title="Toggle Native Fullscreen"
            className="text-xs h-8"
          >
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </Button>
        </div>
      </div>

      {/* Documented Integration Info Bar */}
      <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-surface-hover/70 border border-surface-border text-[11px] text-foreground-muted">
        <Info className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>ScreenScape Integration:</strong> Streaming via documented endpoint{" "}
          <code className="bg-black/30 px-1 py-0.5 rounded text-brand-300 font-mono">
            {type === "tv"
              ? `?tmdb=${validation.sanitizedTmdbId}&type=tv&s=${validation.sanitizedSeason}&e=${validation.sanitizedEpisode}`
              : `?tmdb=${validation.sanitizedTmdbId}&type=movie`}
          </code>
          . Multi-server playback, audio tracks, and subtitles are aggregated directly by ScreenScape.
        </p>
      </div>
    </div>
  );
}
