"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Film,
  Tv,
  Flame,
  Bookmark,
  History,
  Compass,
  Sparkles,
  Globe,
} from "lucide-react";
import { DEMO_GENRES } from "@/lib/demoData";
import { cn } from "@/lib/utils";
import { useUserData } from "@/context/UserDataContext";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { watchlist, history } = useUserData();

  const mainLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "Movies", href: "/browse?type=movie", icon: Film },
    { name: "TV Series", href: "/browse?type=tv", icon: Tv },
    { name: "Indian Cinema", href: "/browse?region=IN", icon: Flame },
    { name: "Anime", href: "/anime", icon: Sparkles },
    { name: "Regions", href: "/browse?region=IN", icon: Globe },
    { name: "Trending", href: "/browse?sort=trending", icon: Flame },
  ];

  const libraryLinks = [
    { name: "Watchlist", href: "/watchlist", icon: Bookmark, badge: watchlist.length },
    { name: "History", href: "/history", icon: History, badge: history.length },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-16 bottom-0 left-0 z-40 flex flex-col bg-background/95 backdrop-blur-xl border-r border-surface-border transition-all duration-300 ease-in-out",
          // Mobile: slide in/out
          isOpen ? "translate-x-0 w-64 shadow-2xl" : "-translate-x-full md:translate-x-0",
          // Desktop: compact rail if !isOpen, full drawer if isOpen
          isOpen ? "md:w-60" : "md:w-20"
        )}
      >
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-none">
          {/* Main Navigation */}
          <div className="space-y-1">
            {mainLinks.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href.split("?")[0]) &&
                    (item.href.includes("?") ? pathname.includes(item.href) : true);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={cn(
                    "flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                    isActive
                      ? "bg-brand-600/15 text-brand-400 font-semibold"
                      : "text-foreground-muted hover:text-foreground hover:bg-surface-hover",
                    !isOpen && "md:justify-center md:px-0 md:py-3 md:flex-col md:gap-1"
                  )}
                  title={!isOpen ? item.name : undefined}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 shrink-0 transition-transform group-hover:scale-110",
                      isActive ? "text-brand-500" : "text-foreground-muted"
                    )}
                  />
                  <span
                    className={cn(
                      "truncate transition-opacity duration-200",
                      !isOpen && "md:text-[10px] md:font-normal"
                    )}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>

          <hr className="border-surface-border/60" />

          {/* Library Section */}
          <div className="space-y-1">
            {isOpen && (
              <h4 className="px-3 text-xs font-semibold uppercase tracking-wider text-foreground-muted/60 mb-2">
                Library
              </h4>
            )}
            {libraryLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                    isActive
                      ? "bg-brand-600/15 text-brand-400 font-semibold"
                      : "text-foreground-muted hover:text-foreground hover:bg-surface-hover",
                    !isOpen && "md:justify-center md:px-0 md:py-3 md:flex-col md:gap-1"
                  )}
                  title={!isOpen ? item.name : undefined}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon
                      className={cn(
                        "w-5 h-5 shrink-0 transition-transform group-hover:scale-110",
                        isActive ? "text-brand-500" : "text-foreground-muted"
                      )}
                    />
                    <span
                      className={cn(
                        "truncate transition-opacity duration-200",
                        !isOpen && "md:text-[10px] md:font-normal"
                      )}
                    >
                      {item.name}
                    </span>
                  </div>
                  {isOpen && item.badge !== undefined && item.badge > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/20 text-brand-400">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Explore Genres (Expanded only) */}
          {isOpen && (
            <>
              <hr className="border-surface-border/60" />
              <div className="space-y-1">
                <h4 className="px-3 text-xs font-semibold uppercase tracking-wider text-foreground-muted/60 mb-2 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  Top Genres
                </h4>
                <div className="flex flex-wrap gap-1.5 px-2">
                  {DEMO_GENRES.slice(1).map((genre) => (
                    <Link
                      key={genre.id}
                      href={`/browse?genre=${genre.slug}`}
                      onClick={() => {
                        if (window.innerWidth < 768) onClose();
                      }}
                      className="px-2.5 py-1 text-xs rounded-lg bg-surface border border-surface-border text-foreground-muted hover:text-brand-400 hover:border-brand-500/30 transition-colors"
                    >
                      {genre.name}
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
