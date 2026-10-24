"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Maximize,
  Minimize,
  RotateCw,
  Globe,
  Server,
  AlertTriangle,
  Download,
  Loader2,
  Info,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Magnet,
} from "lucide-react";
import { TorrentFallbackModal } from "./TorrentFallbackModal";
import { MediaType, SupportedLanguage } from "@/lib/types";
import {
  buildScreenScapeEmbedUrl,
  buildScreenScapeDownloadUrl,
  PLAYER_SERVERS,
  SUPPORTED_LANGUAGES,
  DEFAULT_PLAYER_BASE_URL,
} from "@/lib/player/url";
import {
  isPermittedOrigin,
  requestProgressFromEmbed,
  sendProgressToEmbed,
} from "@/lib/player/postmessage";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useUserData } from "@/context/UserDataContext";

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
  const { history, updateWatchProgress } = useUserData();

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("vybe_preferred_audio");
      if (saved) return saved;
    }
    return user?.preferredLanguage || "hindi";
  });
  const [selectedServer, setSelectedServer] = useState<string>(DEFAULT_PLAYER_BASE_URL);
  const [isLoadingIframe, setIsLoadingIframe] = useState<boolean>(true);
  const [reloadKey, setReloadKey] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // postMessage Bridge State
  const [isEmbedReady, setIsEmbedReady] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isTorrentModalOpen, setIsTorrentModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (user?.preferredLanguage) {
      setSelectedLanguage(user.preferredLanguage);
    }
  }, [user?.preferredLanguage]);

  const handleLanguageChange = (newLang: string) => {
    setSelectedLanguage(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("vybe_preferred_audio", newLang);
    }
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

  const numericTmdbId = validation.sanitizedTmdbId;
  const numericSeason = type === "tv" ? validation.sanitizedSeason : undefined;
  const numericEpisode = type === "tv" ? validation.sanitizedEpisode : undefined;

  // Find any previously saved progress in VYBE for this title
  const savedItem = history.find((h) => {
    if (h.tmdbId !== numericTmdbId || h.mediaType !== type) return false;
    if (type === "tv") {
      return (
        (h.season ?? 1) === (numericSeason ?? 1) &&
        (h.episode ?? 1) === (numericEpisode ?? 1)
      );
    }
    return true;
  });

  // Reset loading & ready state when the source URL changes
  useEffect(() => {
    setIsLoadingIframe(true);
    setIsEmbedReady(false);
    setSyncStatus(null);
  }, [embedUrl, reloadKey]);

  // postMessage Listener for SCREENSCAPE_EMBED_READY handshake
  useEffect(() => {
    const handleEmbedMessage = (event: MessageEvent) => {
      // Validate origin strictly against permitted endpoints
      if (!isPermittedOrigin(event.origin)) return;

      const data = event.data;
      if (
        data?.type === "SCREENSCAPE_EMBED_READY" ||
        data?.type === "VIDPLUS_EMBED_READY"
      ) {
        setIsEmbedReady(true);
        setSyncStatus("Bridge Ready");

        // Automatically dispatch saved progress if available in VYBE
        if (numericTmdbId && savedItem && savedItem.progressSeconds > 0) {
          if (iframeRef.current?.contentWindow) {
            sendProgressToEmbed(
              iframeRef.current.contentWindow,
              selectedServer,
              {
                tmdbId: numericTmdbId,
                progressSeconds: savedItem.progressSeconds,
                season: numericSeason,
                episode: numericEpisode,
              },
              4000
            ).then((res) => {
              if (res.success) {
                setSyncStatus(`Restored position: ${savedItem.progressSeconds}s`);
              }
            });
          }
        }
      }
    };

    window.addEventListener("message", handleEmbedMessage);
    return () => {
      window.removeEventListener("message", handleEmbedMessage);
    };
  }, [numericTmdbId, numericSeason, numericEpisode, savedItem, selectedServer]);

  // Request progress from embed iframe manually or periodically
  const handleSyncFromEmbed = useCallback(async () => {
    if (!numericTmdbId || !iframeRef.current?.contentWindow) return;

    setIsSyncing(true);
    setSyncStatus("Requesting embed progress...");

    try {
      const res = await requestProgressFromEmbed(
        iframeRef.current.contentWindow,
        selectedServer,
        {
          tmdbId: numericTmdbId,
          season: numericSeason,
          episode: numericEpisode,
        },
        5000
      );

      if (res.success && res.progressSeconds !== undefined) {
        setSyncStatus(`Synced: ${res.progressSeconds}s`);
        await updateWatchProgress({
          tmdbId: numericTmdbId,
          mediaType: type,
          title,
          season: numericSeason,
          episode: numericEpisode,
          progressSeconds: res.progressSeconds,
          durationSeconds: savedItem?.durationSeconds || 5400,
        });
      } else {
        setSyncStatus(res.error || "Embed progress query timed out");
      }
    } catch (err: unknown) {
      setSyncStatus(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setIsSyncing(false);
      setTimeout(() => {
        setSyncStatus(null);
      }, 6000);
    }
  }, [numericTmdbId, numericSeason, numericEpisode, selectedServer, title, type, savedItem, updateWatchProgress]);

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
    setIsEmbedReady(false);
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
              ref={iframeRef}
              key={`${embedUrl}-${reloadKey}`}
              src={embedUrl}
              title={`Watch ${title} - ScreenScape Player`}
              width="100%"
              height="100%"
              frameBorder="0"
              allowFullScreen
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media; clipboard-write"
              onLoad={() => setIsLoadingIframe(false)}
              className="w-full h-full border-0 rounded-2xl"
            />
          </>
        )}
      </div>

      {/* Hindi Audio Server Tip Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-surface to-brand-500/10 border border-amber-500/30 text-xs animate-fadeIn">
        <div className="flex items-start sm:items-center gap-2.5">
          <span className="text-base shrink-0 mt-0.5 sm:mt-0">🇮🇳</span>
          <div className="space-y-0.5 leading-snug">
            <span className="font-bold text-amber-300">How to listen in Hindi:</span>
            <span className="text-foreground-muted ml-1.5">
              Inside the video player, click the <strong>Server menu (top-left corner of video)</strong> and select <strong>HDHub</strong>, <strong>CineHindi</strong>, or <strong>HindiBox</strong>, or click the <strong>Audio / Settings gear icon</strong> on multi-audio streams.
            </span>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsTorrentModalOpen(true)}
          className="text-[11px] h-7 text-amber-300 hover:text-amber-200 border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 shrink-0 self-start sm:self-auto"
        >
          <Magnet className="w-3 h-3 mr-1" />
          <span>Dual Audio Torrents</span>
        </Button>
      </div>

      {/* Responsive Player Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-surface border border-surface-border">
        {/* Left: Mirror Server, Audio Language, & postMessage Bridge Status */}
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

          {/* Audio Language Option with One-Click Hindi Force */}
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

            {/* One-Click Hindi Force Toggle Button */}
            <button
              onClick={() => handleLanguageChange(selectedLanguage === "hindi" ? "eng" : "hindi")}
              title="Force Hindi Audio: Automatically picks Hindi audio tracks (HLS/DASH) and Hindi servers"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                selectedLanguage === "hindi"
                  ? "bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-emerald-500/15 text-amber-300 border-amber-500/40 shadow-sm"
                  : "bg-surface-hover text-foreground-muted border-surface-border hover:text-foreground"
              }`}
            >
              <span className="text-xs">🇮🇳</span>
              <span>{selectedLanguage === "hindi" ? "Hindi Forced (Active)" : "Force Hindi"}</span>
            </button>
          </div>

          {/* postMessage Bridge Badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border ${
              isEmbedReady
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                : "bg-surface-hover text-foreground-muted border-surface-border"
            }`}
            title="postMessage bridge to ScreenScape embed"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isEmbedReady ? "bg-emerald-400 animate-pulse" : "bg-foreground-muted/40"
              }`}
            />
            <span>{isEmbedReady ? "Bridge Connected" : "Bridge Initializing"}</span>
          </div>
        </div>

        {/* Right: Sync Progress, Theater Mode, Fullscreen & Stream Reload */}
        <div className="flex items-center gap-2">
          {/* postMessage Progress Query Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleSyncFromEmbed}
            disabled={isSyncing}
            title="Query progress via postMessage"
            className="text-xs h-8 text-brand-400 hover:text-brand-300 border-brand-500/30 hover:bg-brand-500/10"
          >
            {isSyncing ? (
              <RefreshCw className="w-3 h-3 animate-spin mr-1" />
            ) : (
              <Sparkles className="w-3 h-3 mr-1" />
            )}
            <span>Sync Progress</span>
          </Button>

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

          {/* Torrent / Magnet Fallback Stream Sources */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsTorrentModalOpen(true)}
            title="Explore decentralized torrent streams & magnets"
            className="text-xs h-8 text-indigo-400 hover:text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/10"
          >
            <Magnet className="w-3 h-3 mr-1" />
            <span>Torrents</span>
          </Button>

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

      {/* Dynamic postMessage Sync Feedback Banner */}
      {syncStatus && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/30 text-xs text-brand-300 animate-fadeIn">
          <CheckCircle2 className="w-3.5 h-3.5 text-brand-400 shrink-0" />
          <span>{syncStatus}</span>
        </div>
      )}

      {/* Documented Integration Info Bar */}
      <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-surface-hover/70 border border-surface-border text-[11px] text-foreground-muted">
        <Info className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Audio &amp; Streaming:</strong> Audio preference is forced to{" "}
          <code className="bg-black/30 px-1 py-0.5 rounded text-amber-300 font-mono">
            lan={selectedLanguage}
          </code>
          {selectedLanguage === "hindi"
            ? " (ScreenScape automatically detects and auto-selects Hindi audio tracks across multi-audio HLS/DASH streams and prioritizes Hindi servers)"
            : ""}. Multi-server playback, audio tracks, subtitles, and progress postMessage protocol verified against upstream spec.
        </p>
      </div>
      {/* Torrent Stream & Magnet Modal */}
      <TorrentFallbackModal
        isOpen={isTorrentModalOpen}
        onClose={() => setIsTorrentModalOpen(false)}
        title={title}
        type={type}
        season={numericSeason}
        episode={numericEpisode}
      />
    </div>
  );
}
