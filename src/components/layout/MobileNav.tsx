"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Film, Tv, Sparkles, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();

  const links = [
    { name: "Home", href: "/", icon: Home },
    { name: "Movies", href: "/browse?type=movie", icon: Film },
    { name: "Series", href: "/browse?type=tv", icon: Tv },
    { name: "Anime", href: "/anime", icon: Sparkles },
    { name: "Saved", href: "/watchlist", icon: Bookmark },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-background/90 backdrop-blur-2xl border-t border-surface-border/80 px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-2xl">
      <div className="flex items-center justify-around h-13 max-w-md mx-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href.split("?")[0]);

          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "relative flex flex-col items-center justify-center w-14 h-12 gap-1 rounded-2xl transition-all duration-200 active:scale-90",
                isActive
                  ? "text-brand-400 font-bold"
                  : "text-foreground-muted hover:text-foreground"
              )}
            >
              {isActive && (
                <div className="absolute inset-0 bg-brand-500/10 rounded-2xl -z-10 animate-scaleUp" />
              )}
              <Icon
                className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  isActive ? "scale-110 text-brand-400" : ""
                )}
              />
              <span className="text-[10px] tracking-tight">{link.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
