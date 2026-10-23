"use client";

import React from "react";
import Link from "next/link";
import { Play, Info, Star, Sparkles, Volume2, Bookmark, Check } from "lucide-react";
import { MediaItem } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface HeroBannerProps {
  media: MediaItem;
  onOpenInfo?: (media: MediaItem) => void;
}

export function HeroBanner({ media, onOpenInfo }: HeroBannerProps) {
  const watchUrl = `/watch/${media.type}/${media.tmdbId}`;

  return (
    <div className="relative w-full h-[540px] md:h-[620px] rounded-3xl overflow-hidden mb-8 border border-surface-border shadow-2xl select-none">
      {/* Background Cinematic Image */}
      <img
        src={media.backdropUrl}
        alt={media.title}
        className="w-full h-full object-cover object-center transform scale-100 animate-fadeIn"
      />

      {/* Gradients to blend smoothly with dark/light background */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent max-w-4xl" />

      {/* Hero Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 max-w-3xl space-y-4">
        {/* Top Feature Pill */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500 text-white shadow-lg shadow-brand-500/40">
            <Sparkles className="w-3.5 h-3.5" />
            Spotlight Premiere
          </span>
          <Badge variant="rating">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {media.rating.toFixed(1)} Rating
          </Badge>
          <Badge variant="quality">{media.quality || "4K Ultra HD"}</Badge>
          {media.ageRating && <Badge variant="outline">{media.ageRating}</Badge>}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white drop-shadow-md">
          {media.title}
        </h1>

        {/* Tagline or Overview */}
        {media.tagline && (
          <p className="text-sm md:text-base font-medium text-brand-300 italic">
            &ldquo;{media.tagline}&rdquo;
          </p>
        )}

        <p className="text-xs sm:text-sm md:text-base text-gray-200 line-clamp-3 leading-relaxed max-w-2xl drop-shadow">
          {media.overview}
        </p>

        {/* Genres & Director */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-gray-300">
          <span className="font-semibold text-white">Genres:</span>
          {media.genres.map((g) => (
            <span
              key={g}
              className="px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-sm border border-white/10"
            >
              {g}
            </span>
          ))}
          {media.director && (
            <>
              <span className="mx-1">•</span>
              <span>Directed by <strong className="text-white">{media.director}</strong></span>
            </>
          )}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-3">
          <Link href={watchUrl}>
            <Button size="lg" variant="primary" className="shadow-2xl">
              <Play className="w-5 h-5 fill-current mr-1" />
              Watch Now
            </Button>
          </Link>

          {onOpenInfo && (
            <Button
              size="lg"
              variant="glass"
              onClick={() => onOpenInfo(media)}
              className="bg-white/15 hover:bg-white/25 text-white"
            >
              <Info className="w-5 h-5 mr-1" />
              More Details
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
