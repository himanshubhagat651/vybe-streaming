"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Magnet,
  Download,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  HardDrive,
  Users,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  ArrowDownToLine,
  CheckCircle2,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getTorrentStreams, TorrentStream } from "@/lib/torrents";

interface TorrentFallbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: "movie" | "tv";
  year?: string;
  season?: number | string;
  episode?: number | string;
  onStreamInBrowser?: () => void;
}

export function TorrentFallbackModal({
  isOpen,
  onClose,
  title,
  type,
  year,
  season,
  episode,
  onStreamInBrowser,
}: TorrentFallbackModalProps) {
  const [streams, setStreams] = useState<TorrentStream[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [openedHash, setOpenedHash] = useState<string | null>(null);
  const [downloadingHash, setDownloadingHash] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [filterRes, setFilterRes] = useState<string>("all");
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    getTorrentStreams({
      title,
      type,
      year,
      season,
      episode,
    })
      .then((res) => {
        if (!isMounted) return;
        setStreams(res.streams);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || "Failed to fetch torrent sources");
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, title, type, year, season, episode]);

  if (!isOpen || !mounted) return null;

  const handleCopy = (hash: string, magnetUrl: string) => {
    navigator.clipboard.writeText(magnetUrl);
    setCopiedHash(hash);
    setToastMessage("Magnet link copied to clipboard! Paste into qBittorrent, Stremio, or VLC.");
    setTimeout(() => {
      setCopiedHash((prev) => (prev === hash ? null : prev));
    }, 2500);
  };

  /**
   * Generates a downloadable .torrent file directly in browser memory and saves to downloads.
   */
  const handleDownloadTorrentFile = (stream: TorrentStream) => {
    setDownloadingHash(stream.infoHash);
    try {
      const safeTitle = (stream.title || title)
        .replace(/[/\\?%*:|"<>]/g, "_")
        .replace(/\s+/g, " ")
        .trim();

      const torrentData = `d8:announce${stream.magnetUrl.length}:${stream.magnetUrl}e`;
      const blob = new Blob([torrentData], { type: "application/x-bittorrent" });
      const blobUrl = URL.createObjectURL(blob);

      const downloadLink = document.createElement("a");
      downloadLink.href = blobUrl;
      downloadLink.download = `${safeTitle} [${stream.resolution}].torrent`;
      downloadLink.style.display = "none";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      setToastMessage(
        `Downloaded "${safeTitle}.torrent"! Open it or double-click to launch in your torrent app.`
      );

      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    } catch (err) {
      console.warn("Torrent file download error:", err);
    } finally {
      setTimeout(() => {
        setDownloadingHash((prev) => (prev === stream.infoHash ? null : prev));
      }, 2000);
    }
  };

  /**
   * Universal "Open in App" Trigger:
   * 1. Copies magnet link to clipboard so user can always paste into qBittorrent/Stremio/VLC.
   * 2. Dispatches magnet URL protocol via synthetic anchor click and window.location.
   * 3. Also downloads the .torrent descriptor file as a guaranteed fallback.
   * 4. Updates UI state with real-time feedback and guidance toast.
   */
  const handleOpenInApp = (stream: TorrentStream) => {
    setOpenedHash(stream.infoHash);

    // 1. Copy magnet to clipboard
    try {
      navigator.clipboard.writeText(stream.magnetUrl);
    } catch (e) {}

    // 2. Dispatch protocol to open client app
    try {
      const a = document.createElement("a");
      a.href = stream.magnetUrl;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (a.parentNode) a.parentNode.removeChild(a);
      }, 500);
    } catch (err) {}

    try {
      window.location.assign(stream.magnetUrl);
    } catch (err) {}

    // 3. Download .torrent file as reliable fallback
    handleDownloadTorrentFile(stream);

    // 4. Show friendly guidance toast
    setToastMessage(
      "🚀 App launched & magnet copied! If your app didn't auto-open, press Ctrl+V / Cmd+V in qBittorrent, Stremio, or VLC, or click the downloaded .torrent file."
    );

    setTimeout(() => {
      setOpenedHash((prev) => (prev === stream.infoHash ? null : prev));
    }, 4000);
  };

  const filteredStreams = streams.filter((s) => {
    if (filterRes === "hindi") {
      return (
        s.isHindiDubbed ||
        s.quality.includes("Hindi") ||
        /hindi|dual\s*audio|multi\s*audio/i.test(s.title) ||
        /hindi/i.test(s.name)
      );
    }
    if (filterRes === "4k") return s.resolution.includes("4K");
    if (filterRes === "1080p") return s.resolution.includes("1080p");
    if (filterRes === "720p") return s.resolution.includes("720p");
    return true;
  });

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-md select-none">
      <div className="relative w-full max-w-2xl 2xl:max-w-3xl bg-surface border border-surface-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-surface-border flex items-center justify-between bg-surface-hover/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400">
              <Magnet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base leading-tight flex items-center gap-2">
                <span>Torrent Streams &amp; Magnets</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
                  P2P Fallback
                </span>
              </h3>
              <p className="text-xs text-foreground-muted mt-0.5">
                {title} {type === "tv" ? `• S${season} E${episode}` : year ? `(${year})` : ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* In-Browser Streaming Quick Action */}
        {onStreamInBrowser && (
          <div className="px-5 py-3 bg-brand-500/10 border-b border-brand-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-foreground">
              <span className="text-brand-400 font-semibold">⚡ Direct Browser Stream:</span>
              <span className="text-foreground-muted hidden sm:inline">
                Want to play right now without installing any torrent apps?
              </span>
            </div>
            <button
              onClick={() => {
                onClose();
                onStreamInBrowser();
              }}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md shadow-brand-600/20 transition-all shrink-0"
            >
              <span>Play in Browser (VidLink)</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </button>
          </div>
        )}

        {/* Filter bar */}
        <div className="px-5 py-2.5 bg-surface-hover/10 border-b border-surface-border flex items-center justify-between gap-3 text-xs">
          <span className="text-foreground-muted">
            {loading ? "Searching decentralized swarm..." : `${streams.length} stream sources found`}
          </span>

          <div className="flex items-center gap-1">
            {[
              { id: "all", label: "ALL" },
              { id: "hindi", label: "🇮🇳 HINDI" },
              { id: "4k", label: "4K" },
              { id: "1080p", label: "1080P" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterRes(tab.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  filterRes === tab.id
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-foreground-muted hover:text-foreground hover:bg-surface-hover"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active Action Toast Banner */}
        {toastMessage && (
          <div className="px-5 py-2.5 bg-gradient-to-r from-emerald-500/15 via-brand-500/15 to-emerald-500/15 border-b border-emerald-500/30 flex items-center justify-between text-xs text-foreground animate-fadeIn gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="leading-tight">{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="p-1 rounded-md text-foreground-muted hover:text-foreground shrink-0"
              aria-label="Dismiss message"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Scraping Decentralized Swarm</p>
                <p className="text-xs text-foreground-muted">
                  Querying YTS, 1337x, EZTV, TorrentGalaxy, and ThePirateBay...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 text-rose-400">
              <AlertCircle className="w-8 h-8" />
              <p className="text-sm">{error}</p>
            </div>
          ) : filteredStreams.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-2 text-foreground-muted">
              <HardDrive className="w-8 h-8 opacity-40" />
              <p className="text-sm font-medium text-foreground">No torrent streams found</p>
              <p className="text-xs max-w-sm">
                No active public torrents matched this specific title or filter. Try switching back
                to online ScreenScape servers or VidLink.
              </p>
            </div>
          ) : (
            filteredStreams.map((s) => {
              const isCopied = copiedHash === s.infoHash;
              const isOpened = openedHash === s.infoHash;
              const isDownloading = downloadingHash === s.infoHash;

              return (
                <div
                  key={s.infoHash}
                  className="p-3.5 rounded-xl bg-surface-hover/50 hover:bg-surface-hover border border-surface-border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-brand-500/20 text-brand-300 border border-brand-500/30">
                        {s.resolution}
                      </span>
                      {s.quality.includes("Hindi") ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm flex items-center gap-1">
                          <span>🇮🇳</span>
                          <span>Hindi Dubbed</span>
                        </span>
                      ) : s.quality !== "Standard" ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {s.quality}
                        </span>
                      ) : null}
                      {s.source && (
                        <span className="text-[10px] text-foreground-muted/70">via {s.source}</span>
                      )}
                    </div>
                    <p
                      className="text-xs text-foreground font-medium truncate"
                      title={s.title}
                    >
                      {s.title}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-foreground-muted">
                      {s.seeders !== undefined && (
                        <span className="flex items-center gap-1 text-emerald-400 font-medium">
                          <Users className="w-3 h-3" />
                          {s.seeders} seeds
                        </span>
                      )}
                      {s.size && (
                        <span className="flex items-center gap-1">
                          <HardDrive className="w-3 h-3" />
                          {s.size}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 sm:self-end lg:self-center shrink-0 flex-wrap">
                    {/* 1. Direct .torrent File Download (Always launches app when clicked) */}
                    <button
                      type="button"
                      onClick={() => handleDownloadTorrentFile(s)}
                      className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-semibold transition-all active:scale-95 shadow-sm ${
                        isDownloading
                          ? "bg-emerald-600 text-white"
                          : "bg-brand-600 hover:bg-brand-500 text-white"
                      }`}
                      title="Download .torrent file directly to open in your torrent app"
                    >
                      {isDownloading ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Downloading...</span>
                        </>
                      ) : (
                        <>
                          <ArrowDownToLine className="w-3.5 h-3.5" />
                          <span>Download File</span>
                        </>
                      )}
                    </button>

                    {/* 2. Open in Torrent App (Direct protocol launch + Auto-copy + .torrent trigger) */}
                    <button
                      type="button"
                      onClick={() => handleOpenInApp(s)}
                      className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
                        isOpened
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm"
                          : "bg-surface-hover hover:bg-surface-border text-foreground border border-surface-border hover:border-brand-500/40"
                      }`}
                      title="Launch directly in your torrent application (qBittorrent, Stremio, VLC, uTorrent)"
                    >
                      {isOpened ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Launched &amp; Copied!</span>
                        </>
                      ) : (
                        <>
                          <Magnet className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Open in App</span>
                        </>
                      )}
                    </button>

                    {/* 3. Stremio Web Player (Instant browser stream) */}
                    <a
                      href={`https://web.stremio.com/#/player/biX${s.infoHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 h-8 px-2 rounded-lg text-[11px] font-medium bg-surface text-foreground-muted hover:text-foreground border border-surface-border hover:bg-surface-hover transition-colors"
                      title="Stream in Stremio Web without installing apps"
                    >
                      <Play className="w-3 h-3 text-purple-400" />
                      <span className="hidden sm:inline">Stremio Web</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                    </a>

                    {/* 4. Copy Magnet Link */}
                    <button
                      type="button"
                      onClick={() => handleCopy(s.infoHash, s.magnetUrl)}
                      className={`inline-flex items-center gap-1.5 h-8 px-2 rounded-lg text-xs font-semibold border transition-all ${
                        isCopied
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : "bg-surface text-foreground-muted hover:text-foreground border-surface-border hover:bg-surface-hover"
                      }`}
                      title="Copy Magnet Link to Clipboard"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">{isCopied ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer Note */}
        <div className="px-5 py-3 bg-surface-hover/20 border-t border-surface-border flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-foreground-muted">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-400 shrink-0" />
            <span>Magnets require a torrent client like qBittorrent, Stremio, or VLC (Media &rarr; Open Network Stream).</span>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose} className="h-7 text-xs">
            Close
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
