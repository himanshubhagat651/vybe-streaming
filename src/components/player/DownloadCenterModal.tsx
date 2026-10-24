"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Download,
  HardDrive,
  Users,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  Film,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  PlayCircle,
  Sliders,
  Magnet,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getTorrentStreams, TorrentStream } from "@/lib/torrents";

interface DownloadCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  tmdbId: number | string;
  type: "movie" | "tv";
  title: string;
  season?: number | string;
  episode?: number | string;
  year?: string;
  officialDownloadUrl?: string | null;
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
  officialDownloadUrl,
}: DownloadCenterModalProps) {
  const [streams, setStreams] = useState<TorrentStream[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "hindi" | "4k" | "1080p" | "720p">("all");

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

  if (!isOpen) return null;

  const handleCopy = (hash: string, magnetUrl: string) => {
    navigator.clipboard.writeText(magnetUrl);
    setCopiedHash(hash);
    setTimeout(() => {
      setCopiedHash((prev) => (prev === hash ? null : prev));
    }, 2000);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-2xl 2xl:max-w-3xl bg-surface border border-surface-border rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-surface-border flex items-center justify-between bg-gradient-to-r from-surface via-surface-hover/50 to-surface">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-brand-500/20 to-indigo-500/20 border border-brand-500/30 text-brand-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-lg leading-tight flex items-center gap-2">
                <span>Download Center</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Direct &amp; Fast
                </span>
              </h3>
              <p className="text-xs text-foreground-muted mt-0.5">
                {title} {type === "tv" ? `• Season ${season}, Episode ${episode}` : year ? `(${year})` : ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close download modal"
            className="p-2 rounded-xl text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Official Mirror Quick Launch Banner */}
        {officialDownloadUrl && (
          <div className="px-6 py-3 bg-brand-500/10 border-b border-brand-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-foreground">
              <Sparkles className="w-4 h-4 text-brand-400 shrink-0" />
              <span>
                <strong>ScreenScape Official CDN:</strong> Direct high-speed browser downloads across multiple servers (HDHub, Sealx, CineFreak).
              </span>
            </div>
            <a
              href={officialDownloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md shadow-brand-600/20 transition-all shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Open CDN Portal</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          </div>
        )}

        {/* Quality Filters Bar */}
        <div className="px-6 py-2.5 bg-surface-hover/20 border-b border-surface-border flex items-center justify-between gap-3 text-xs">
          <span className="text-foreground-muted">
            {loading ? "Discovering download streams..." : `${streams.length} download options ready`}
          </span>

          <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
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
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shrink-0 ${
                  activeTab === tab.id
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-foreground-muted hover:text-foreground hover:bg-surface-hover"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Download Links Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">Extracting High-Speed Download Links</p>
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
              <p className="text-sm font-medium text-foreground">No specific files matching this filter</p>
              <p className="text-xs max-w-sm">
                Try selecting &apos;ALL&apos; or use the Official CDN Portal button above to download directly from ScreenScape&apos;s mirror servers.
              </p>
              {officialDownloadUrl && (
                <a
                  href={officialDownloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Launch Official ScreenScape Downloader</span>
                </a>
              )}
            </div>
          ) : (
            filteredStreams.map((s) => {
              const isCopied = copiedHash === s.infoHash;
              const isHindi = s.quality.includes("Hindi");

              return (
                <div
                  key={s.infoHash}
                  className="p-4 rounded-2xl bg-surface-hover/50 hover:bg-surface-hover border border-surface-border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
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

                  <div className="flex items-center gap-2 sm:self-center shrink-0">
                    <button
                      onClick={() => handleCopy(s.infoHash, s.magnetUrl)}
                      className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold border transition-all ${
                        isCopied
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : "bg-surface text-foreground-muted hover:text-foreground border-surface-border hover:bg-surface-border/50"
                      }`}
                      title="Copy direct magnet link"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? "Copied!" : "Copy Link"}</span>
                    </button>

                    <a
                      href={s.magnetUrl}
                      className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-xs font-semibold bg-surface-hover hover:bg-surface-border text-foreground border border-surface-border transition-all"
                      title="Open in torrent application (qBittorrent, Stremio, or VLC)"
                    >
                      <Magnet className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Open in Torrent App</span>
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Note */}
        <div className="px-6 py-3.5 bg-surface-hover/30 border-t border-surface-border flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-foreground-muted">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Files download in native MKV/MP4 formats with multi-audio &amp; subtitle tracks intact.</span>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose} className="h-8 text-xs">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
