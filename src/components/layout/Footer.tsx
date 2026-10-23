import React from "react";
import Link from "next/link";
import { PlayCircle, ShieldCheck, ExternalLink, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-surface-border bg-surface/30 mt-20 pt-12 pb-24 md:pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
              <PlayCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-foreground font-sans">
                VYBE
              </span>
              <p className="text-xs text-foreground-muted">
                Premium Movie & TV Series Streaming Experience
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-foreground-muted">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/browse?type=movie" className="hover:text-foreground transition-colors">
              Movies
            </Link>
            <Link href="/browse?type=tv" className="hover:text-foreground transition-colors">
              TV Shows
            </Link>
            <Link href="/watchlist" className="hover:text-foreground transition-colors">
              Watchlist
            </Link>
            <a
              href="https://web.screenscape.fun/embed"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-brand-400 transition-colors"
            >
              <span>ScreenScape Embed Docs</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <hr className="border-surface-border/60" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-foreground-muted/70">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-400 shrink-0" />
            <span>
              Stream playback provided via verified ScreenScape embed player.
            </span>
          </div>

          <p className="flex items-center gap-1">
            Crafted for <span className="font-semibold text-foreground">VYBE</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
