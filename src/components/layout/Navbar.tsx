"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Sun,
  Moon,
  Menu,
  Bookmark,
  History,
  SlidersHorizontal,
  X,
  PlayCircle,
  Star,
  Film,
  Tv,
  LogIn,
  LogOut,
  Globe,
  Check,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useUserData } from "@/context/UserDataContext";
import { fetchSearch } from "@/lib/metadata/client";
import { MediaItem, SupportedLanguage } from "@/lib/types";
import { ALL_GENRES } from "@/lib/genres";
import { cn } from "@/lib/utils";

interface NavbarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export function Navbar({ onToggleSidebar }: NavbarProps) {
  const router = useRouter();
  const { theme, toggleTheme, setTheme } = useTheme();
  const {
    user,
    isAuthenticated,
    openAuthModal,
    signOut,
    updateProfile,
  } = useAuth();
  const { watchlist, continueWatching } = useUserData();

  const [searchQuery, setSearchQuery] = useState("");
  const [autocompleteResults, setAutocompleteResults] = useState<MediaItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isGenreOpen, setIsGenreOpen] = useState(false);
  const [isSearchOpenMobile, setIsSearchOpenMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const genreDropdownRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      } else if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      } else if (e.key === "Escape") {
        setShowDropdown(false);
        setIsGenreOpen(false);
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Debounced search for live autocomplete
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setAutocompleteResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const data = await fetchSearch(searchQuery.trim(), "all", 1);
        setAutocompleteResults((data.results || []).slice(0, 5));
        setShowDropdown(true);
      } catch {
        setAutocompleteResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener for search & profile
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (genreDropdownRef.current && !genreDropdownRef.current.contains(e.target as Node)) {
        setIsGenreOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowDropdown(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpenMobile(false);
    }
  };

  const handleLanguageChange = async (lang: SupportedLanguage) => {
    if (user) {
      await updateProfile({ preferredLanguage: lang });
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
      <div className="flex items-center justify-between h-16 px-3.5 sm:px-6 md:px-8 2xl:px-12 max-w-[1920px] 2xl:max-w-[2100px] 3xl:max-w-[2400px] mx-auto gap-4">
        {/* Left: Sidebar toggle, Brand Logo & Upper Navigation Tabs */}
        <div className="flex items-center gap-3 xl:gap-5 shrink-0">
          <button
            onClick={onToggleSidebar}
            aria-label="Toggle Navigation Sidebar"
            className="p-2 rounded-xl text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors hidden md:flex items-center justify-center"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/" className="flex items-center gap-2.5 group mr-1">
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

          {/* Upper Tab Navigation (Movies, TV Shows, Anime, Genres Dropdown, Regions) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-xl text-xs xl:text-sm font-semibold text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors"
            >
              Home
            </Link>
            <Link
              href="/browse?type=movie"
              className="px-3 py-1.5 rounded-xl text-xs xl:text-sm font-semibold text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors"
            >
              Movies
            </Link>
            <Link
              href="/browse?type=tv"
              className="px-3 py-1.5 rounded-xl text-xs xl:text-sm font-semibold text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors"
            >
              TV Series
            </Link>
            <Link
              href="/anime"
              className="px-3 py-1.5 rounded-xl text-xs xl:text-sm font-semibold text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors"
            >
              Anime
            </Link>

            {/* 🇮🇳 Indian Cinema Upper Tab */}
            <Link
              href="/browse?region=IN"
              className="px-3 py-1.5 rounded-xl text-xs xl:text-sm font-semibold text-amber-400/90 hover:text-amber-300 hover:bg-amber-500/10 transition-colors flex items-center gap-1.5 border border-amber-500/20"
            >
              <span>🇮🇳 Indian Cinema</span>
            </Link>

            {/* GENRES Upper Tab with Interactive Popover */}
            <div className="relative" ref={genreDropdownRef}>
              <button
                type="button"
                onClick={() => setIsGenreOpen(!isGenreOpen)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs xl:text-sm font-semibold transition-all",
                  isGenreOpen
                    ? "bg-brand-600/20 text-brand-400 border border-brand-500/40 shadow-sm"
                    : "text-foreground-muted hover:text-foreground hover:bg-surface-hover"
                )}
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                <span>Genres</span>
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 transition-transform duration-200",
                    isGenreOpen && "rotate-180 text-brand-400"
                  )}
                />
              </button>

              {/* Genres Popover Menu */}
              {isGenreOpen && (
                <div className="absolute top-11 left-0 w-80 sm:w-96 p-3.5 rounded-3xl glass-panel shadow-2xl border border-surface-border bg-surface/95 backdrop-blur-2xl z-50 animate-fadeIn space-y-2">
                  <div className="flex items-center justify-between px-2 pb-2 border-b border-surface-border/60">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-brand-400" />
                      <span className="text-xs font-bold text-foreground font-mono uppercase tracking-wider">
                        Browse By Genre
                      </span>
                    </div>
                    <Link
                      href="/browse"
                      onClick={() => setIsGenreOpen(false)}
                      className="text-[11px] font-semibold text-brand-400 hover:text-brand-300"
                    >
                      View All &rarr;
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 max-h-80 overflow-y-auto no-scrollbar pt-1">
                    {ALL_GENRES.map((genre) => (
                      <Link
                        key={genre.id}
                        href={
                          genre.slug === "all"
                            ? "/browse"
                            : `/browse?genre=${genre.slug}`
                        }
                        onClick={() => setIsGenreOpen(false)}
                        className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-surface-hover transition-colors group"
                      >
                        <span className="text-lg shrink-0 group-hover:scale-110 transition-transform">
                          {genre.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-foreground group-hover:text-brand-400 truncate">
                            {genre.name}
                          </p>
                          <p className="text-[10px] text-foreground-muted truncate">
                            {genre.description}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/browse?region=IN"
              className="px-3 py-1.5 rounded-xl text-xs xl:text-sm font-semibold text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5 text-brand-400" />
              <span>Regions</span>
            </Link>
          </nav>
        </div>

        {/* Center: Search Bar with Autocomplete Dropdown (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-md xl:max-w-lg mx-2 xl:mx-4 relative" ref={searchContainerRef}>
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (autocompleteResults.length > 0) setShowDropdown(true);
              }}
              placeholder="Search movies, TV series, actors... (Press ⌘K or /)"
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

          {/* Autocomplete Dropdown Popover */}
          {showDropdown && autocompleteResults.length > 0 && (
            <div className="absolute top-12 inset-x-0 rounded-2xl glass-panel shadow-2xl border border-surface-border p-2 z-50 animate-fadeIn">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground-muted/60 border-b border-surface-border/60">
                Top Matches
              </div>
              <div className="py-1 space-y-1">
                {autocompleteResults.map((item) => (
                  <Link
                    key={item.id}
                    href={`/watch/${item.type}/${item.tmdbId}`}
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-hover transition-colors group"
                  >
                    <div className="w-9 h-12 rounded-lg bg-surface-hover shrink-0 overflow-hidden">
                      {item.posterUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {item.type === "tv" ? <Tv className="w-4 h-4 text-foreground-muted" /> : <Film className="w-4 h-4 text-foreground-muted" />}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-mono font-bold text-brand-400">
                          {item.type === "tv" ? "TV" : "Movie"}
                        </span>
                        {item.rating > 0 && (
                          <span className="flex items-center gap-0.5 text-[10px] text-amber-400 font-semibold">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            {item.rating.toFixed(1)}
                          </span>
                        )}
                        {item.releaseYear && (
                          <span className="text-[10px] text-foreground-muted">{item.releaseYear}</span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-foreground truncate group-hover:text-brand-400">
                        {item.title}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <button
                onClick={handleSearchSubmit}
                className="w-full py-2 text-center text-xs font-semibold text-brand-400 hover:text-brand-300 border-t border-surface-border/60 mt-1 block"
              >
                See all results for &ldquo;{searchQuery}&rdquo; &rarr;
              </button>
            </div>
          )}
        </div>

        {/* Right: Actions, Theme Switcher & Profile Dropdown */}
        <div className="flex items-center gap-2.5">
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
            onClick={() => {
              const next = theme === "dark" ? "light" : "dark";
              toggleTheme();
              if (user) {
                updateProfile({ preferredTheme: next });
              }
            }}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="p-2 rounded-xl text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-500 hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* User Profile / Sign In Menu */}
          {isAuthenticated && user ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-brand-500/50 transition-all"
                aria-label="User Profile Menu"
                aria-expanded={isProfileOpen}
              >
                {user.avatarUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-500/30"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-purple-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-surface-border">
                    {user.username.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl glass-panel shadow-2xl p-2 z-50 animate-fadeIn border border-surface-border bg-surface text-foreground">
                  {/* User Header */}
                  <div className="p-3 border-b border-surface-border/60">
                    <div className="flex items-center gap-3">
                      {user.avatarUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={user.avatarUrl}
                          alt={user.username}
                          className="w-10 h-10 rounded-full object-cover border border-brand-500/40"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-brand-600/20 text-brand-400 flex items-center justify-center font-bold text-sm">
                          {user.username.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-foreground truncate">{user.username}</p>
                        <p className="text-xs text-foreground-muted truncate">{user.email || "No email"}</p>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-brand-500/10 text-brand-400 mt-0.5">
                          VYBE Member
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Primary Navigation Links */}
                  <div className="py-1">
                    <Link
                      href="/watchlist"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center justify-between px-3 py-2 text-xs font-medium text-foreground-muted hover:text-foreground hover:bg-surface-hover rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Bookmark className="w-4 h-4 text-brand-400" />
                        <span>My Watchlist</span>
                      </div>
                      {watchlist.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/20 text-brand-400">
                          {watchlist.length}
                        </span>
                      )}
                    </Link>

                    <Link
                      href="/history"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center justify-between px-3 py-2 text-xs font-medium text-foreground-muted hover:text-foreground hover:bg-surface-hover rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <History className="w-4 h-4 text-indigo-400" />
                        <span>Continue Watching</span>
                      </div>
                      {continueWatching.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-400">
                          {continueWatching.length}
                        </span>
                      )}
                    </Link>

                    <Link
                      href="/browse"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground-muted hover:text-foreground hover:bg-surface-hover rounded-xl transition-colors"
                    >
                      <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
                      <span>Browse All Titles</span>
                    </Link>
                  </div>

                  {/* Preferences Section: Audio Language */}
                  <div className="py-2 px-3 border-t border-surface-border/60">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-foreground-muted mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-brand-400" />
                        Audio Language
                      </span>
                      <span className="text-[10px] uppercase font-mono text-brand-400">
                        {user.preferredLanguage}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {(["eng", "hindi", "french"] as SupportedLanguage[]).map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => handleLanguageChange(lang)}
                          className={`py-1 text-[11px] rounded-lg border text-center transition-colors ${
                            user.preferredLanguage === lang
                              ? "bg-brand-600 text-white border-brand-500 font-semibold"
                              : "bg-surface-hover border-surface-border text-foreground-muted hover:text-foreground"
                          }`}
                        >
                          {lang === "eng" ? "English" : lang === "hindi" ? "Hindi" : "French"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sign Out Button */}
                  <div className="p-2 border-t border-surface-border/60">
                    <button
                      type="button"
                      onClick={() => {
                        signOut();
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-xl hover:bg-red-500/10 transition-colors font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-all hover:scale-105"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
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
