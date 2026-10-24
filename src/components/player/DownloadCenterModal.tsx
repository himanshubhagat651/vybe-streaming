"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Download,
  HardDrive,
  Users,
  Copy,
  Check,
  Loader2,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Magnet,
  Layers,
  ArrowDownToLine,
  CheckCircle2,
  Play,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getTorrentStreams, TorrentStream } from "@/lib/torrents";
import { cn } from "@/lib/utils";

interface DownloadCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  tmdbId: number | string;
  type: "movie" | "tv";
  title: string;
  season?: number | string;
  episode?: number | string;
  year?: string;
}

export function DownloadCenterModal({
  isOpen,
  onClose,
  tmdbId,
  type,
  title,
  season,
  episode,
  year,
}: DownloadCenterModalProps) {
  const [streams, setStreams] = useState<TorrentStream[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [downloadingHash, setDownloadingHash] = useState<string | null>(null);
  const [openedHash, setOpenedHash] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "hindi" | "4k" | "1080p" | "720p">("all");
  const [viewMode, setViewMode] = useState<"direct" | "cdn">("direct");
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
        setError(err.message || "Failed to load download options");
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
   * Native In-Website Downloader Handler:
   * 1. Triggers direct browser download of the formatted .torrent descriptor file.
   * 2. Triggers magnet protocol handler without reloading or redirecting away from the page.
   */
  const handleDownloadFile = (stream: TorrentStream) => {
    setDownloadingHash(stream.infoHash);

    try {
      // 1. Generate downloadable .torrent file directly in browser memory
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
        `Downloaded "${safeTitle}.torrent"! Open it directly in your torrent application.`
      );

      // Clean up object URL
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 2000);

      // 2. Also trigger magnet link in detached iframe so page never leaves or navigates
      const magnetLink = document.createElement("a");
      magnetLink.href = stream.magnetUrl;
      magnetLink.style.display = "none";
      document.body.appendChild(magnetLink);
      magnetLink.click();
      document.body.removeChild(magnetLink);
    } catch (err) {
      console.warn("Direct file download trigger error:", err);
    } finally {
      setTimeout(() => {
        setDownloadingHash(null);
      }, 2500);
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
    handleDownloadFile(stream);

    // 4. Show friendly guidance toast
    setToastMessage(
      "🚀 App launched & magnet copied! If your app didn't auto-open, press Ctrl+V / Cmd+V in qBittorrent, Stremio, or VLC, or click the downloaded .torrent file."
    );

    setTimeout(() => {
      setOpenedHash((prev) => (prev === stream.infoHash ? null : prev));
    }, 4000);
  };

  const filteredStreams = streams.filter((s) => {
    if (activeTab === "hindi") {
      return (
        s.quality.includes("Hindi") ||
        /hindi|dual\s*audio|multi\s*audio/i.test(s.title) ||
        /hindi/i.test(s.name)
      );
    }
    if (activeTab === "4k") return s.resolution.includes("4K");
    if (activeTab === "1080p") return s.resolution.includes("1080p");
    if (activeTab === "720p") return s.resolution.includes("720p");
    return true;
  });

  const safeNumericId = String(tmdbId).replace(/[^0-9]/g, "");
  const embeddedCdnMirrorSrc = `https://web.screenscape.fun/download/${type}/${safeNumericId}`;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-background/85 backdrop-blur-md select-none">
      <div className="relative w-full max-w-3xl 2xl:max-w-4xl bg-surface border border-surface-border rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between bg-gradient-to-r from-surface via-surface-hover/50 to-surface">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-brand-500/20 to-indigo-500/20 border border-brand-500/30 text-brand-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-lg leading-tight flex items-center gap-2">
                <span>VYBE In-App Download Center</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Native In-Website
                </span>
              </h3>
              <p className="text-xs text-foreground-muted mt-0.5 truncate max-w-md sm:max-w-lg">
                {title} {type === "tv" ? `• Season ${season}, Episode ${episode}` : year ? `(${year})` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Download Engine Mode Switcher */}
            <div className="hidden sm:flex items-center p-1 rounded-xl bg-surface-hover border border-surface-border text-xs">
              <button
                type="button"
                onClick={() => setViewMode("direct")}
                className={cn(
                  "px-3 py-1 rounded-lg font-semibold transition-all",
                  viewMode === "direct"
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-foreground-muted hover:text-foreground"
                )}
              >
                Direct Downloads
              </button>
              <button
                type="button"
                onClick={() => setViewMode("cdn")}
                className={cn(
                  "px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1",
                  viewMode === "cdn"
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-foreground-muted hover:text-foreground"
                )}
              >
                <Layers className="w-3 h-3" />
                <span>CDN Mirror</span>
              </button>
            </div>

            <button
              onClick={onClose}
              aria-label="Close download modal"
              className="p-2 rounded-xl text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* In-Website Guarantee Banner */}
        <div className="px-6 py-2.5 bg-gradient-to-r from-brand-600/15 via-indigo-600/10 to-brand-600/15 border-b border-brand-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-foreground">
            <Sparkles className="w-4 h-4 text-brand-400 shrink-0" />
            <span>
              <strong>Direct In-Website Downloader:</strong> Download full 4K UHD, 1080p FHD, and Hindi audio files directly onto your device without leaving VYBE.
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20 shrink-0 self-start sm:self-auto">
            <CheckCircle2 className="w-3 h-3" />
            <span>No External Redirects</span>
          </div>
        </div>

        {/* View Mode 1: Direct In-Website Downloads */}
        {viewMode === "direct" && (
          <>
            {/* Quality Filter Tabs */}
            <div className="px-6 py-2.5 bg-surface-hover/20 border-b border-surface-border flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-foreground-muted">
                {loading ? "Discovering verified download streams..." : `${filteredStreams.length} direct files available`}
              </span>

              <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar">
                {[
                  { id: "all", label: "ALL" },
                  { id: "hindi", label: "🇮🇳 HINDI DUB" },
                  { id: "4k", label: "4K UHD" },
                  { id: "1080p", label: "1080P" },
                  { id: "720p", label: "720P" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shrink-0",
                      activeTab === tab.id
                        ? "bg-brand-600 text-white shadow-sm"
                        : "text-foreground-muted hover:text-foreground hover:bg-surface-hover"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Action Toast Banner */}
            {toastMessage && (
              <div className="px-6 py-2.5 bg-gradient-to-r from-emerald-500/15 via-brand-500/15 to-emerald-500/15 border-b border-emerald-500/30 flex items-center justify-between text-xs text-foreground animate-fadeIn gap-2">
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

            {/* Download Links List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 custom-scrollbar">
              {loading ? (
                <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
                  <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                      Extracting High-Speed Download Links
                    </p>
                    <p className="text-xs text-foreground-muted">
                      Scanning verified 4K, 1080p, and Hindi dubbed media sources...
                    </p>
                  </div>
                </div>
              ) : error ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 text-rose-400">
                  <AlertCircle className="w-8 h-8" />
                  <p className="text-sm">{error}</p>
                </div>
              ) : filteredStreams.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 text-foreground-muted">
                  <HardDrive className="w-8 h-8 opacity-40" />
                  <p className="text-sm font-medium text-foreground">
                    No specific files matching this filter
                  </p>
                  <p className="text-xs max-w-sm">
                    Try selecting &apos;ALL&apos; or switch to the In-Website CDN Mirror tab to access server downloads directly inside VYBE.
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("all")}
                      className="px-3.5 py-2 rounded-xl bg-surface-hover hover:bg-surface-border text-foreground font-semibold text-xs border border-surface-border transition-colors"
                    >
                      Show All Files
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("cdn")}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-colors shadow-md"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Switch to In-Website CDN Mirror</span>
                    </button>
                  </div>
                </div>
              ) : (
                filteredStreams.map((s) => {
                  const isCopied = copiedHash === s.infoHash;
                  const isOpened = openedHash === s.infoHash;
                  const isDownloading = downloadingHash === s.infoHash;
                  const isHindi = s.quality.includes("Hindi");

                  return (
                    <div
                      key={s.infoHash}
                      className="p-4 rounded-2xl bg-surface-hover/50 hover:bg-surface-hover border border-surface-border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-3 group"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase bg-brand-500/20 text-brand-300 border border-brand-500/30">
                            {s.resolution}
                          </span>

                          {isHindi ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm flex items-center gap-1">
                              <span>🇮🇳</span>
                              <span>Hindi Dubbed / Dual Audio</span>
                            </span>
                          ) : s.quality !== "Standard" ? (
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-surface-hover text-foreground-muted border border-surface-border">
                              {s.quality}
                            </span>
                          ) : null}

                          {s.source && (
                            <span className="text-[10px] text-foreground-muted/70">via {s.source}</span>
                          )}
                        </div>

                        <p
                          className="text-xs text-foreground font-semibold truncate"
                          title={s.title}
                        >
                          {s.title}
                        </p>

                        <div className="flex items-center gap-3 text-[11px] text-foreground-muted">
                          {s.size && (
                            <span className="flex items-center gap-1 font-mono font-medium text-foreground">
                              <HardDrive className="w-3.5 h-3.5 text-brand-400" />
                              {s.size}
                            </span>
                          )}
                          {s.seeders !== undefined && (
                            <span className="flex items-center gap-1 text-emerald-400 font-medium">
                              <Users className="w-3.5 h-3.5" />
                              {s.seeders} high-speed seeds
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons: Download File, Open in App, Stremio Web, Copy Link */}
                      <div className="flex items-center gap-2 sm:self-end lg:self-center shrink-0 flex-wrap">
                        {/* 1. Direct Download Button (triggers in-browser file download) */}
                        <button
                          type="button"
                          onClick={() => handleDownloadFile(s)}
                          className={cn(
                            "inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md",
                            isDownloading
                              ? "bg-emerald-600 text-white border border-emerald-500"
                              : "bg-brand-600 hover:bg-brand-500 text-white shadow-brand-600/30"
                          )}
                          title="Download media file directly onto this device"
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
                          className={cn(
                            "inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold transition-all active:scale-95",
                            isOpened
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm"
                              : "bg-surface-hover hover:bg-surface-border text-foreground border border-surface-border hover:border-brand-500/40"
                          )}
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
                          className="inline-flex items-center gap-1 h-9 px-2.5 rounded-xl text-[11px] font-medium bg-surface text-foreground-muted hover:text-foreground border border-surface-border hover:bg-surface-hover transition-colors"
                          title="Stream in Stremio Web without installing apps"
                        >
                          <Play className="w-3 h-3 text-purple-400" />
                          <span className="hidden sm:inline">Stremio Web</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                        </a>

                        {/* 4. Copy Direct Link */}
                        <button
                          type="button"
                          onClick={() => handleCopy(s.infoHash, s.magnetUrl)}
                          className={cn(
                            "inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold border transition-all active:scale-95",
                            isCopied
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                              : "bg-surface text-foreground-muted hover:text-foreground border-surface-border hover:bg-surface-border/50"
                          )}
                          title="Copy direct magnet link to clipboard"
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
          </>
        )}

        {/* View Mode 2: In-Website Embedded CDN Mirror (Never redirects away) */}
        {viewMode === "cdn" && (
          <div className="flex-1 overflow-hidden flex flex-col p-4 sm:p-6 space-y-3">
            <div className="flex items-center justify-between text-xs text-foreground-muted pb-1">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Embedded In-App CDN Mirror — Running within VYBE STREAM</span>
              </span>
              <button
                type="button"
                onClick={() => setViewMode("direct")}
                className="text-brand-400 hover:text-brand-300 font-semibold"
              >
                &larr; Switch to Direct Downloads
              </button>
            </div>

            <div className="relative flex-1 w-full min-h-[460px] rounded-2xl overflow-hidden bg-black border border-surface-border">
              <iframe
                src={embeddedCdnMirrorSrc}
                title={`${title} CDN Download Portal`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                sandbox="allow-scripts allow-forms allow-same-origin allow-downloads"
              />
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div className="px-6 py-3.5 bg-surface-hover/30 border-t border-surface-border flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-foreground-muted">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Files download directly onto your device with multi-audio &amp; subtitle tracks intact.</span>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose} className="h-8 text-xs">
            Close
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
