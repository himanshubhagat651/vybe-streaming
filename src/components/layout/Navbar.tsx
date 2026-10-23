"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Sun,
  Moon,
  Menu,
  Bell,
  User,
  Bookmark,
  History,
  Sparkles,
  SlidersHorizontal,
  X,
  PlayCircle,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/Button";

interface NavbarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export function Navbar({ onToggleSidebar, isSidebarOpen }: NavbarProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpenMobile, setIsSearchOpenMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpenMobile(false);
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-surface-border shadow-md"
          : "bg-gradient-to-b from-background via-background/60 to-transparent"
      }`}
    >
      <div className="flex items-center justify-between h-16 px-4 md:px-6 max-w-7xl mx-auto gap-4">
        {/* Left: Sidebar toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            aria-label="Toggle Navigation Sidebar"
            className="p-2 rounded-xl text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors hidden md:flex items-center justify-center"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform">
              <PlayCircle className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-foreground via-foreground to-brand-400 bg-clip-text text-transparent leading-none font-sans">
                VYBE
              </span>
              <span className="text-[10px] tracking-widest text-brand-400 font-semibold uppercase leading-none mt-0.5">
                STREAM
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Search Bar (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-xl mx-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movies, TV series, actors, genres... (Press Enter)"
              className="w-full h-10 pl-10 pr-24 rounded-full bg-surface/80 border border-surface-border text-sm text-foreground placeholder:text-foreground-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all shadow-inner"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              <kbd className="hidden lg:inline-flex items-center px-2 py-0.5 text-[10px] font-mono text-foreground-muted/70 bg-surface-hover rounded border border-surface-border">
                ⌘K
              </kbd>
              <button
                type="submit"
                aria-label="Submit search"
                className="h-7 px-3 text-xs font-semibold rounded-full bg-brand-600 text-white hover:bg-brand-700 transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-2">
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setIsSearchOpenMobile(!isSearchOpenMobile)}
            className="md:hidden p-2 rounded-xl text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors"
            aria-label="Open search bar"
          >
            {isSearchOpenMobile ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </button>

          {/* Theme Switcher Toggle */}
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="p-2 rounded-xl text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-500 hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Notifications Demo Button */}
          <button
            aria-label="Notifications"
            className="p-2 rounded-xl text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors relative hidden sm:flex"
            onClick={() => alert("VYBE Phase 1 Notice: Notifications will sync in Phase 4.")}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
          </button>

          {/* User Profile Menu */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-full hover:ring-2 hover:ring-brand-500/50 transition-all"
              aria-label="User Profile Menu"
              aria-expanded={isProfileOpen}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-purple-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-surface-border">
                VY
              </div>
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl glass-panel shadow-2xl p-2 z-50 animate-fadeIn border border-surface-border">
                <div className="px-3 py-2 border-b border-surface-border/60">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand-600/20 text-brand-400 flex items-center justify-center font-bold text-xs">
                      GS
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Guest Explorer</p>
                      <p className="text-xs text-brand-400 font-mono">Phase 1 Demo Mode</p>
                    </div>
                  </div>
                </div>

                <div className="py-1">
                  <Link
                    href="/watchlist"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-foreground-muted hover:text-foreground hover:bg-surface-hover rounded-xl transition-colors"
                  >
                    <Bookmark className="w-4 h-4 text-brand-400" />
                    <span>My Watchlist</span>
                  </Link>
                  <Link
                    href="/history"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-foreground-muted hover:text-foreground hover:bg-surface-hover rounded-xl transition-colors"
                  >
                    <History className="w-4 h-4 text-indigo-400" />
                    <span>Continue Watching</span>
                  </Link>
                  <Link
                    href="/browse"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-foreground-muted hover:text-foreground hover:bg-surface-hover rounded-xl transition-colors"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
                    <span>Browse All Titles</span>
                  </Link>
                </div>

                <div className="pt-2 border-t border-surface-border/60 px-1">
                  <div className="p-2.5 rounded-xl bg-brand-500/10 text-xs text-foreground-muted">
                    <p className="font-semibold text-brand-400 mb-0.5">Cloud Sync & Auth</p>
                    <p className="text-[11px] leading-tight">
                      Supabase account synchronization is planned for Phase 4.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Overlay Bar */}
      {isSearchOpenMobile && (
        <div className="md:hidden px-4 py-3 bg-surface border-b border-surface-border animate-fadeIn">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movies, TV shows..."
              autoFocus
              className="w-full h-11 pl-10 pr-20 rounded-xl bg-background border border-surface-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-3 text-xs font-semibold rounded-lg bg-brand-600 text-white"
            >
              Search
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
