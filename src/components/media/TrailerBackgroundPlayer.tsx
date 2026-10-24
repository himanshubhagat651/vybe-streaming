"use client";

import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Clapperboard, RefreshCw, Maximize2 } from "lucide-react";
import { playPop } from "@/lib/audio";
import { cn } from "@/lib/utils";

interface TrailerBackgroundPlayerProps {
  title: string;
  year?: string;
  className?: string;
  aspectRatio?: "banner" | "modal" | "card";
  onTrailerLoaded?: (provider: "youtube" | "dailymotion") => void;
}

export function TrailerBackgroundPlayer({
  title,
  year = "",
  className,
  aspectRatio = "banner",
  onTrailerLoaded,
}: TrailerBackgroundPlayerProps) {
  const [provider, setProvider] = useState<"youtube" | "dailymotion">("youtube");
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setHasError(false);

    const fetchTrailer = async () => {
      try {
        const queryParams = new URLSearchParams({
          title,
          year: year || "",
          provider,
          muted: isMuted ? "true" : "false",
          autoplay: "true",
        });

        const res = await fetch(`/api/trailer?${queryParams.toString()}`);
        if (!res.ok) throw new Error("Failed to resolve trailer");
        const data = await res.json();

        if (!isCancelled) {
          if (data.embedUrl) {
            setEmbedUrl(data.embedUrl);
            setProvider(data.provider || "youtube");
            if (data.fallbackUrl) setFallbackUrl(data.fallbackUrl);
            if (onTrailerLoaded) onTrailerLoaded(data.provider || "youtube");
          } else {
            throw new Error("No trailer embed URL returned");
          }
        }
      } catch (err) {
        console.warn(`Trailer fetch error for "${title}":`, err);
        if (!isCancelled) {
          // If YouTube failed, auto-fallback to DailyMotion search
          if (provider === "youtube") {
            setProvider("dailymotion");
            const dmFallback = `https://www.dailymotion.com/embed/video/?search=${encodeURIComponent(
              `${title} official trailer`
            )}&autoplay=1&mute=1&controls=0&ui-theme=dark&queue-enable=false`;
            setEmbedUrl(dmFallback);
          } else {
            // Guaranteed YouTube search embed as final resort
            setProvider("youtube");
            setEmbedUrl(
              `https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(
                `${title} official trailer`
              )}&autoplay=1&mute=1&controls=0&playsinline=1&disablekb=1&fs=0`
            );
          }
        }
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    fetchTrailer();

    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, year, provider, onTrailerLoaded]);

  const toggleSound = () => {
    playPop();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    // Update the embed URL with the new mute parameter without full refetch
    if (embedUrl) {
      try {
        const url = new URL(embedUrl);
        url.searchParams.set("mute", nextMuted ? "1" : "0");
        setEmbedUrl(url.toString());
      } catch {
        const updated = nextMuted
          ? embedUrl.replace("mute=0", "mute=1")
          : embedUrl.replace("mute=1", "mute=0");
        setEmbedUrl(updated);
      }
    }
  };

  const toggleFullscreen = () => {
    playPop();
    const iframe = iframeRef.current;
    if (!iframe) return;
    try {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      } else if (iframe.requestFullscreen) {
        iframe.requestFullscreen().catch(() => {});
      } else if ((iframe as any).webkitRequestFullscreen) {
        (iframe as any).webkitRequestFullscreen();
      }
    } catch (err) {
      console.warn("Fullscreen toggle error:", err);
    }
  };

  return (
    <div className={cn("relative w-full h-full overflow-hidden bg-black select-none", className)}>
      {/* Video Stream Iframe */}
      {embedUrl && !hasError ? (
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none">
          <iframe
            ref={iframeRef}
            key={`${provider}-${title}`}
            src={embedUrl}
            title={`${title} Official Trailer Preview (${provider})`}
            className="w-full h-full border-0 object-cover pointer-events-none scale-[1.02] sm:scale-[1.28] origin-center"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            onError={() => {
              if (provider === "youtube" && fallbackUrl) {
                setProvider("dailymotion");
                setEmbedUrl(fallbackUrl);
              } else {
                setHasError(true);
              }
            }}
          />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-950">
          <div className="flex flex-col items-center gap-2 text-zinc-500">
            <Clapperboard className="w-12 h-12 stroke-1 animate-pulse" />
            <span className="text-xs font-mono">Loading Trailer Preview...</span>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center transition-opacity duration-500 z-10 pointer-events-none">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 border border-white/10 text-white/80 text-xs font-mono">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-400" />
            <span>Streaming Trailer Preview...</span>
          </div>
        </div>
      )}

      {/* Cinematic Vignette Gradients */}
      {aspectRatio === "banner" && (
        <>
          {/* Vertical gradient: transparent at top so video is clear on mobile, dark at bottom for readability on desktop */}
          <div className="hidden sm:block absolute inset-0 bg-gradient-to-t from-background via-background/70 via-40% to-transparent pointer-events-none" />
          <div className="hidden sm:block absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent max-w-4xl 2xl:max-w-6xl pointer-events-none" />
          <div className="hidden sm:block absolute inset-0 bg-radial-gradient from-transparent to-background/30 pointer-events-none" />
        </>
      )}

      {aspectRatio === "modal" && (
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-black/40 pointer-events-none" />
      )}

      {/* Interactive Floating Video Controls */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 flex items-center gap-2 pointer-events-auto">
        {/* Fullscreen Video Toggle */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="w-9 h-9 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-md border border-white/15 text-white/80 hover:text-white hover:scale-105 active:scale-95 shadow-xl flex items-center justify-center transition-all"
          title="Fullscreen Trailer"
          aria-label="Fullscreen trailer video"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Sound Toggle (Mute / Unmute) */}
        <button
          type="button"
          onClick={toggleSound}
          className={cn(
            "w-9 h-9 rounded-full backdrop-blur-md border transition-all hover:scale-105 active:scale-95 shadow-xl flex items-center justify-center",
            isMuted
              ? "bg-black/70 hover:bg-black/90 border-white/15 text-white/80"
              : "bg-brand-600 text-white border-brand-400 shadow-brand-500/50"
          )}
          title={isMuted ? "Unmute Trailer Audio" : "Mute Trailer Audio"}
          aria-label={isMuted ? "Unmute trailer audio" : "Mute trailer audio"}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-pulse" />}
        </button>
      </div>
    </div>
  );
}
