"use client";

import React, { useState, useEffect } from "react";
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
  const [filterRes, setFilterRes] = useState<string>("all");

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

  if (!isOpen) return null;

  const handleCopy = (hash: string, magnetUrl: string) => {
    navigator.clipboard.writeText(magnetUrl);
    setCopiedHash(hash);
    setTimeout(() => {
      setCopiedHash((prev) => (prev === hash ? null : prev));
    }, 2000);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-md animate-fadeIn select-none">
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
              return (
                <div
                  key={s.infoHash}
                  className="p-3.5 rounded-xl bg-surface-hover/50 hover:bg-surface-hover border border-surface-border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
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

                  <div className="flex items-center gap-2 sm:self-center shrink-0">
                    <button
                      onClick={() => handleCopy(s.infoHash, s.magnetUrl)}
                      className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-semibold border transition-all ${
                        isCopied
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : "bg-surface text-foreground-muted hover:text-foreground border-surface-border hover:bg-surface-border/50"
                      }`}
                      title="Copy Magnet Link to Clipboard"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? "Copied!" : "Copy Magnet"}</span>
                    </button>

                    <a
                      href={s.magnetUrl}
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold bg-surface-hover hover:bg-surface-border text-foreground border border-surface-border transition-colors"
                      title="Open directly in torrent client (qBittorrent, Stremio, or VLC)"
                    >
                      <Magnet className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Open in App</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
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
    </div>
  );
}
