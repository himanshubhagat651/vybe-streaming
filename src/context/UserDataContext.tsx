"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { MediaType, WatchlistItem, WatchHistoryItem } from "../lib/types";
import { useAuth } from "./AuthContext";
import { getSupabaseConfigStatus } from "../lib/supabase/config";
import { getSupabaseBrowserClient } from "../lib/supabase/client";

// Initial seed data for test accounts to verify multi-account isolation out-of-the-box
const INITIAL_DEMO_DATA: Record<string, { watchlist: WatchlistItem[]; history: WatchHistoryItem[] }> = {
  usr_alex_001: {
    watchlist: [
      {
        id: "wl_alex_1",
        userId: "usr_alex_001",
        tmdbId: 10195, // Iron Man
        mediaType: "movie",
        title: "Iron Man",
        posterPath: "/78lPtwv72eTNqFW9COBYI0dWDJa.jpg",
        backdropPath: "/cyecB7godJ6kNHGON0DGLLzJ9vP.jpg",
        voteAverage: 7.6,
        releaseYear: "2008",
        createdAt: "2026-10-20T12:00:00Z",
      },
      {
        id: "wl_alex_2",
        userId: "usr_alex_001",
        tmdbId: 27205, // Inception
        mediaType: "movie",
        title: "Inception",
        posterPath: "/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
        backdropPath: "/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
        voteAverage: 8.4,
        releaseYear: "2010",
        createdAt: "2026-10-21T09:30:00Z",
      },
    ],
    history: [
      {
        id: "wh_alex_1",
        userId: "usr_alex_001",
        tmdbId: 1396, // Breaking Bad
        mediaType: "tv",
        title: "Breaking Bad",
        posterPath: "/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg",
        backdropPath: "/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
        season: 1,
        episode: 1,
        progressSeconds: 1420,
        durationSeconds: 3480, // 41%
        completed: false,
        lastWatchedAt: "2026-10-23T16:00:00Z",
      },
      {
        id: "wh_alex_2",
        userId: "usr_alex_001",
        tmdbId: 10195, // Iron Man
        mediaType: "movie",
        title: "Iron Man",
        posterPath: "/78lPtwv72eTNqFW9COBYI0dWDJa.jpg",
        backdropPath: "/cyecB7godJ6kNHGON0DGLLzJ9vP.jpg",
        progressSeconds: 5120,
        durationSeconds: 7560, // 68%
        completed: false,
        lastWatchedAt: "2026-10-22T21:40:00Z",
      },
    ],
  },
  usr_jordan_002: {
    watchlist: [
      {
        id: "wl_jordan_1",
        userId: "usr_jordan_002",
        tmdbId: 157336, // Interstellar
        mediaType: "movie",
        title: "Interstellar",
        posterPath: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
        backdropPath: "/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
        voteAverage: 8.4,
        releaseYear: "2014",
        createdAt: "2026-10-22T15:00:00Z",
      },
    ],
    history: [
      {
        id: "wh_jordan_1",
        userId: "usr_jordan_002",
        tmdbId: 155, // The Dark Knight
        mediaType: "movie",
        title: "The Dark Knight",
        posterPath: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        backdropPath: "/dqK9Hag1054tghRQSqLSfrkvQnA.jpg",
        progressSeconds: 6100,
        durationSeconds: 9120, // 67%
        completed: false,
        lastWatchedAt: "2026-10-23T18:15:00Z",
      },
    ],
  },
};

interface UserDataContextType {
  watchlist: WatchlistItem[];
  history: WatchHistoryItem[];
  continueWatching: WatchHistoryItem[];
  isLoading: boolean;
  isInWatchlist: (tmdbId: number, mediaType: MediaType) => boolean;
  addToWatchlist: (item: {
    tmdbId: number;
    mediaType: MediaType;
    title: string;
    posterPath?: string | null;
    backdropPath?: string | null;
    voteAverage?: number;
    releaseYear?: string;
  }) => Promise<void>;
  removeFromWatchlist: (tmdbId: number, mediaType: MediaType) => Promise<void>;
  updateWatchProgress: (item: {
    tmdbId: number;
    mediaType: MediaType;
    title: string;
    posterPath?: string | null;
    backdropPath?: string | null;
    season?: number | null;
    episode?: number | null;
    progressSeconds: number;
    durationSeconds?: number | null;
  }) => Promise<void>;
  removeFromHistory: (
    tmdbId: number,
    mediaType: MediaType,
    season?: number | null,
    episode?: number | null
  ) => Promise<void>;
  clearHistory: () => Promise<void>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export function UserDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const activeUserId = user ? user.id : "guest";

  // Load user data whenever active user changes
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    const loadData = async () => {
      const config = getSupabaseConfigStatus();

      if (config.isConfigured && user) {
        const supabase = getSupabaseBrowserClient();
        if (supabase) {
          try {
            // Load Watchlist
            const { data: wlData, error: wlError } = await supabase
              .from("watchlists")
              .select("*")
              .eq("user_id", user.id)
              .order("created_at", { ascending: false });

            if (wlError) throw wlError;

            // Load Watch History
            const { data: histData, error: histError } = await supabase
              .from("watch_history")
              .select("*")
              .eq("user_id", user.id)
              .order("last_watched_at", { ascending: false });

            if (histError) throw histError;

            if (!isCancelled) {
              setWatchlist(
                (wlData || []).map((row: any) => ({
                  id: row.id,
                  userId: row.user_id,
                  tmdbId: row.tmdb_id,
                  mediaType: row.media_type,
                  title: row.title,
                  posterPath: row.poster_path,
                  backdropPath: row.backdrop_path,
                  voteAverage: Number(row.vote_average) || 0,
                  releaseYear: row.release_year,
                  createdAt: row.created_at,
                }))
              );

              setHistory(
                (histData || []).map((row: any) => ({
                  id: row.id,
                  userId: row.user_id,
                  tmdbId: row.tmdb_id,
                  mediaType: row.media_type,
                  title: row.title,
                  posterPath: row.poster_path,
                  backdropPath: row.backdrop_path,
                  season: row.season,
                  episode: row.episode,
                  progressSeconds: row.progress_seconds,
                  durationSeconds: row.duration_seconds,
                  completed: row.completed,
                  lastWatchedAt: row.last_watched_at,
                }))
              );
            }
          } catch (err) {
            console.error("Failed to load Supabase user data:", err);
          } finally {
            if (!isCancelled) setIsLoading(false);
          }
          return;
        }
      }

      // Local isolated storage partition for Demo / Guest mode
      try {
        const wlKey = `vybe_data_${activeUserId}_watchlist`;
        const histKey = `vybe_data_${activeUserId}_history`;

        const savedWl = localStorage.getItem(wlKey);
        const savedHist = localStorage.getItem(histKey);

        let initialWl: WatchlistItem[] = [];
        let initialHist: WatchHistoryItem[] = [];

        if (savedWl) {
          initialWl = JSON.parse(savedWl);
        } else if (INITIAL_DEMO_DATA[activeUserId]?.watchlist) {
          initialWl = INITIAL_DEMO_DATA[activeUserId].watchlist;
          localStorage.setItem(wlKey, JSON.stringify(initialWl));
        }

        if (savedHist) {
          initialHist = JSON.parse(savedHist);
        } else if (INITIAL_DEMO_DATA[activeUserId]?.history) {
          initialHist = INITIAL_DEMO_DATA[activeUserId].history;
          localStorage.setItem(histKey, JSON.stringify(initialHist));
        }

        if (!isCancelled) {
          setWatchlist(initialWl);
          setHistory(initialHist);
        }
      } catch {
        if (!isCancelled) {
          setWatchlist([]);
          setHistory([]);
        }
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [user, activeUserId]);

  // Derived Continue Watching list: items with active progress (< 95% complete), newest first
  const continueWatching = useMemo(() => {
    return history.filter((item) => {
      if (item.completed) return false;
      if (item.progressSeconds <= 0) return false;
      if (item.durationSeconds && item.durationSeconds > 0) {
        const pct = (item.progressSeconds / item.durationSeconds) * 100;
        return pct < 95;
      }
      return true;
    });
  }, [history]);

  const isInWatchlist = useCallback(
    (tmdbId: number, mediaType: MediaType) => {
      return watchlist.some(
        (item) => item.tmdbId === tmdbId && item.mediaType === mediaType
      );
    },
    [watchlist]
  );

  const addToWatchlist = useCallback(
    async (item: {
      tmdbId: number;
      mediaType: MediaType;
      title: string;
      posterPath?: string | null;
      backdropPath?: string | null;
      voteAverage?: number;
      releaseYear?: string;
    }) => {
      if (isInWatchlist(item.tmdbId, item.mediaType)) return;

      const newItem: WatchlistItem = {
        id: `wl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        userId: activeUserId,
        tmdbId: item.tmdbId,
        mediaType: item.mediaType,
        title: item.title,
        posterPath: item.posterPath,
        backdropPath: item.backdropPath,
        voteAverage: item.voteAverage,
        releaseYear: item.releaseYear,
        createdAt: new Date().toISOString(),
      };

      const updated = [newItem, ...watchlist];
      setWatchlist(updated);

      const config = getSupabaseConfigStatus();
      if (config.isConfigured && user) {
        const supabase = getSupabaseBrowserClient();
        if (supabase) {
          try {
            await supabase.from("watchlists").insert({
              user_id: user.id,
              tmdb_id: item.tmdbId,
              media_type: item.mediaType,
              title: item.title,
              poster_path: item.posterPath,
              backdrop_path: item.backdropPath,
              vote_average: item.voteAverage,
              release_year: item.releaseYear,
            });
          } catch (err) {
            console.error("Error writing to Supabase watchlist:", err);
          }
          return;
        }
      }

      // Local storage partition
      try {
        localStorage.setItem(`vybe_data_${activeUserId}_watchlist`, JSON.stringify(updated));
      } catch {
        // Storage access blocked
      }
    },
    [activeUserId, isInWatchlist, user, watchlist]
  );

  const removeFromWatchlist = useCallback(
    async (tmdbId: number, mediaType: MediaType) => {
      const updated = watchlist.filter(
        (item) => !(item.tmdbId === tmdbId && item.mediaType === mediaType)
      );
      setWatchlist(updated);

      const config = getSupabaseConfigStatus();
      if (config.isConfigured && user) {
        const supabase = getSupabaseBrowserClient();
        if (supabase) {
          try {
            await supabase
              .from("watchlists")
              .delete()
              .eq("user_id", user.id)
              .eq("tmdb_id", tmdbId)
              .eq("media_type", mediaType);
          } catch (err) {
            console.error("Error removing from Supabase watchlist:", err);
          }
          return;
        }
      }

      try {
        localStorage.setItem(`vybe_data_${activeUserId}_watchlist`, JSON.stringify(updated));
      } catch {
        // Storage access blocked
      }
    },
    [activeUserId, user, watchlist]
  );

  const updateWatchProgress = useCallback(
    async (item: {
      tmdbId: number;
      mediaType: MediaType;
      title: string;
      posterPath?: string | null;
      backdropPath?: string | null;
      season?: number | null;
      episode?: number | null;
      progressSeconds: number;
      durationSeconds?: number | null;
    }) => {
      const isCompleted =
        !!item.durationSeconds &&
        item.durationSeconds > 0 &&
        item.progressSeconds / item.durationSeconds >= 0.95;

      const existingIndex = history.findIndex((h) => {
        if (h.tmdbId !== item.tmdbId || h.mediaType !== item.mediaType) return false;
        if (item.mediaType === "tv") {
          return (
            (h.season ?? 1) === (item.season ?? 1) &&
            (h.episode ?? 1) === (item.episode ?? 1)
          );
        }
        return true;
      });

      const updatedHistory = [...history];
      const now = new Date().toISOString();

      if (existingIndex >= 0) {
        const existing = updatedHistory[existingIndex];
        const updatedItem: WatchHistoryItem = {
          ...existing,
          title: item.title || existing.title,
          posterPath: item.posterPath ?? existing.posterPath,
          backdropPath: item.backdropPath ?? existing.backdropPath,
          progressSeconds: Math.max(item.progressSeconds, 0),
          durationSeconds: item.durationSeconds ?? existing.durationSeconds,
          completed: isCompleted,
          lastWatchedAt: now,
        };
        // Move to top of history
        updatedHistory.splice(existingIndex, 1);
        updatedHistory.unshift(updatedItem);
      } else {
        const newItem: WatchHistoryItem = {
          id: `wh_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          userId: activeUserId,
          tmdbId: item.tmdbId,
          mediaType: item.mediaType,
          title: item.title,
          posterPath: item.posterPath,
          backdropPath: item.backdropPath,
          season: item.season ?? null,
          episode: item.episode ?? null,
          progressSeconds: Math.max(item.progressSeconds, 0),
          durationSeconds: item.durationSeconds ?? null,
          completed: isCompleted,
          lastWatchedAt: now,
        };
        updatedHistory.unshift(newItem);
      }

      setHistory(updatedHistory);

      const config = getSupabaseConfigStatus();
      if (config.isConfigured && user) {
        const supabase = getSupabaseBrowserClient();
        if (supabase) {
          try {
            await supabase.from("watch_history").upsert(
              {
                user_id: user.id,
                tmdb_id: item.tmdbId,
                media_type: item.mediaType,
                title: item.title,
                poster_path: item.posterPath,
                backdrop_path: item.backdropPath,
                season: item.season ?? null,
                episode: item.episode ?? null,
                progress_seconds: Math.max(item.progressSeconds, 0),
                duration_seconds: item.durationSeconds ?? null,
                completed: isCompleted,
                last_watched_at: now,
              },
              {
                onConflict: "user_id,tmdb_id,media_type,coalesce(season,0),coalesce(episode,0)",
              }
            );
          } catch (err) {
            console.error("Error updating Supabase watch progress:", err);
          }
          return;
        }
      }

      try {
        localStorage.setItem(`vybe_data_${activeUserId}_history`, JSON.stringify(updatedHistory));
      } catch {
        // Storage access blocked
      }
    },
    [activeUserId, history, user]
  );

  const removeFromHistory = useCallback(
    async (
      tmdbId: number,
      mediaType: MediaType,
      season?: number | null,
      episode?: number | null
    ) => {
      const updated = history.filter((item) => {
        if (item.tmdbId !== tmdbId || item.mediaType !== mediaType) return true;
        if (mediaType === "tv") {
          return !(
            (item.season ?? 1) === (season ?? 1) &&
            (item.episode ?? 1) === (episode ?? 1)
          );
        }
        return false;
      });

      setHistory(updated);

      const config = getSupabaseConfigStatus();
      if (config.isConfigured && user) {
        const supabase = getSupabaseBrowserClient();
        if (supabase) {
          try {
            let query = supabase
              .from("watch_history")
              .delete()
              .eq("user_id", user.id)
              .eq("tmdb_id", tmdbId)
              .eq("media_type", mediaType);

            if (mediaType === "tv" && season && episode) {
              query = query.eq("season", season).eq("episode", episode);
            }

            await query;
          } catch (err) {
            console.error("Error removing from Supabase history:", err);
          }
          return;
        }
      }

      try {
        localStorage.setItem(`vybe_data_${activeUserId}_history`, JSON.stringify(updated));
      } catch {
        // Storage access blocked
      }
    },
    [activeUserId, history, user]
  );

  const clearHistory = useCallback(async () => {
    setHistory([]);

    const config = getSupabaseConfigStatus();
    if (config.isConfigured && user) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        try {
          await supabase.from("watch_history").delete().eq("user_id", user.id);
        } catch (err) {
          console.error("Error clearing Supabase history:", err);
        }
        return;
      }
    }

    try {
      localStorage.setItem(`vybe_data_${activeUserId}_history`, JSON.stringify([]));
    } catch {
      // Storage access blocked
    }
  }, [activeUserId, user]);

  return (
    <UserDataContext.Provider
      value={{
        watchlist,
        history,
        continueWatching,
        isLoading,
        isInWatchlist,
        addToWatchlist,
        removeFromWatchlist,
        updateWatchProgress,
        removeFromHistory,
        clearHistory,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error("useUserData must be used within a UserDataProvider");
  }
  return context;
}
