"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Film, Tv, Search, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();

  const links = [
    { name: "Home", href: "/", icon: Home },
    { name: "Movies", href: "/browse?type=movie", icon: Film },
    { name: "Series", href: "/browse?type=tv", icon: Tv },
    { name: "Search", href: "/search", icon: Search },
    { name: "Saved", href: "/watchlist", icon: Bookmark },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-background/90 backdrop-blur-xl border-t border-surface-border py-1 px-2">
      <div className="flex items-center justify-around h-14">
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
                "flex flex-col items-center justify-center w-14 h-full gap-1 rounded-xl transition-colors",
                isActive
                  ? "text-brand-500 font-semibold"
                  : "text-foreground-muted hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] tracking-tight">{link.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
