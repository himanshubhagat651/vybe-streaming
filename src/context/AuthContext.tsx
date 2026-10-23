"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { UserProfile, SupportedLanguage, SupportedTheme, SupabaseConfigStatus } from "../lib/types";
import { getSupabaseConfigStatus } from "../lib/supabase/config";
import { getSupabaseBrowserClient } from "../lib/supabase/client";

// Pre-defined test accounts for testing multi-account isolation across page reloads
export const TEST_ACCOUNTS: Record<string, UserProfile> = {
  alex: {
    id: "usr_alex_001",
    email: "alex@vybe.tv",
    username: "Alex Vance",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop&crop=faces",
    preferredLanguage: "eng",
    preferredTheme: "dark",
    createdAt: "2026-10-01T10:00:00Z",
  },
  jordan: {
    id: "usr_jordan_002",
    email: "jordan@vybe.tv",
    username: "Jordan Reed",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop&crop=faces",
    preferredLanguage: "french",
    preferredTheme: "light",
    createdAt: "2026-10-15T14:30:00Z",
  },
};

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  configStatus: SupabaseConfigStatus;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  signIn: (email: string, password?: string) => Promise<{ error?: string }>;
  signUp: (email: string, password?: string, username?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  switchTestAccount: (key: "alex" | "jordan") => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = "vybe_auth_session";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [configStatus, setConfigStatus] = useState<SupabaseConfigStatus>(() => getSupabaseConfigStatus());

  // Load session on startup
  useEffect(() => {
    const status = getSupabaseConfigStatus();
    setConfigStatus(status);

    if (status.isConfigured) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        // Fetch Supabase session
        supabase.auth.getSession().then(({ data }: { data: { session: any } }) => {
          const session = data?.session;
          if (session?.user) {
            fetchSupabaseProfile(session.user.id, session.user.email || null);
          } else {
            setUser(null);
            setIsLoading(false);
          }
        });

        // Listen for auth state changes
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (_event: unknown, session: any) => {
            if (session?.user) {
              await fetchSupabaseProfile(session.user.id, session.user.email || null);
            } else {
              setUser(null);
            }
          }
        );

        return () => {
          authListener?.subscription.unsubscribe();
        };
      }
    } else {
      // Local isolated session persistence for demo mode
      try {
        const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          if (parsed && parsed.id) {
            // Check for saved profile customisations
            const profileKey = `vybe_profile_${parsed.id}`;
            const customProfile = localStorage.getItem(profileKey);
            if (customProfile) {
              setUser(JSON.parse(customProfile));
            } else {
              setUser(parsed);
            }
          }
        } else {
          // Default to Account A (Alex) initially so user can test immediate signed-in state
          const defaultAccount = TEST_ACCOUNTS.alex;
          setUser(defaultAccount);
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(defaultAccount));
        }
      } catch {
        setUser(TEST_ACCOUNTS.alex);
      }
      setIsLoading(false);
    }
  }, []);

  const fetchSupabaseProfile = async (userId: string, email: string | null) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Failed to load user profile:", error);
      }

      if (data) {
        setUser({
          id: data.id,
          email: data.email || email,
          username: data.username || email?.split("@")[0] || "User",
          avatarUrl: data.avatar_url,
          preferredLanguage: (data.preferred_language as SupportedLanguage) || "eng",
          preferredTheme: (data.preferred_theme as SupportedTheme) || "dark",
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        });
      } else {
        // Fallback profile if row trigger hasn't fired yet
        setUser({
          id: userId,
          email: email,
          username: email?.split("@")[0] || "User",
          preferredLanguage: "eng",
          preferredTheme: "dark",
        });
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password?: string): Promise<{ error?: string }> => {
    const status = getSupabaseConfigStatus();

    if (status.isConfigured) {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return { error: "Supabase client not initialized" };
      if (!password) return { error: "Password is required" };

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        await fetchSupabaseProfile(data.user.id, data.user.email || null);
        setIsAuthModalOpen(false);
        return {};
      }
      return { error: "Failed to sign in" };
    }

    // Demo Mode Sign In
    const normalized = email.toLowerCase().trim();
    let accountToUse: UserProfile;

    if (normalized.includes("jordan")) {
      accountToUse = TEST_ACCOUNTS.jordan;
    } else if (normalized.includes("alex")) {
      accountToUse = TEST_ACCOUNTS.alex;
    } else {
      // Create new ad-hoc demo user
      const customId = `usr_${normalized.replace(/[^a-z0-9]/g, "_").slice(0, 12)}_${Date.now().toString(36)}`;
      accountToUse = {
        id: customId,
        email: email,
        username: email.split("@")[0],
        preferredLanguage: "eng",
        preferredTheme: "dark",
        createdAt: new Date().toISOString(),
      };
    }

    // Retrieve any persisted profile for this user
    try {
      const profileKey = `vybe_profile_${accountToUse.id}`;
      const customProfile = localStorage.getItem(profileKey);
      const finalUser = customProfile ? JSON.parse(customProfile) : accountToUse;
      setUser(finalUser);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(finalUser));
    } catch {
      setUser(accountToUse);
    }

    setIsAuthModalOpen(false);
    return {};
  };

  const signUp = async (
    email: string,
    password?: string,
    username?: string
  ): Promise<{ error?: string }> => {
    const status = getSupabaseConfigStatus();

    if (status.isConfigured) {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return { error: "Supabase client not initialized" };
      if (!password) return { error: "Password is required" };

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username || email.split("@")[0],
            preferred_language: "eng",
            preferred_theme: "dark",
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        await fetchSupabaseProfile(data.user.id, data.user.email || null);
        setIsAuthModalOpen(false);
        return {};
      }
      return { error: "Sign up successful. Please check your email to confirm." };
    }

    // Demo Mode Sign Up
    const normalized = email.toLowerCase().trim();
    const customId = `usr_${normalized.replace(/[^a-z0-9]/g, "_").slice(0, 12)}_${Date.now().toString(36)}`;
    const newDemoUser: UserProfile = {
      id: customId,
      email: email,
      username: username || email.split("@")[0],
      preferredLanguage: "eng",
      preferredTheme: "dark",
      createdAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(`vybe_profile_${newDemoUser.id}`, JSON.stringify(newDemoUser));
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newDemoUser));
    } catch {
      // Storage access blocked
    }

    setUser(newDemoUser);
    setIsAuthModalOpen(false);
    return {};
  };

  const signOut = async () => {
    const status = getSupabaseConfigStatus();

    if (status.isConfigured) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    } else {
      try {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      } catch {
        // Storage access blocked
      }
    }

    setUser(null);
  };

  const switchTestAccount = useCallback(async (key: "alex" | "jordan") => {
    const target = TEST_ACCOUNTS[key];
    if (!target) return;

    try {
      const profileKey = `vybe_profile_${target.id}`;
      const customProfile = localStorage.getItem(profileKey);
      const finalUser = customProfile ? JSON.parse(customProfile) : target;
      setUser(finalUser);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(finalUser));
    } catch {
      setUser(target);
    }
  }, []);

  const updateProfile = async (updates: Partial<UserProfile>): Promise<{ error?: string }> => {
    if (!user) return { error: "User is not authenticated" };

    const updated: UserProfile = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const status = getSupabaseConfigStatus();

    if (status.isConfigured) {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return { error: "Supabase client not initialized" };

      const { error } = await supabase
        .from("profiles")
        .update({
          username: updated.username,
          avatar_url: updated.avatarUrl,
          preferred_language: updated.preferredLanguage,
          preferred_theme: updated.preferredTheme,
          updated_at: updated.updatedAt,
        })
        .eq("id", user.id);

      if (error) {
        return { error: error.message };
      }
    } else {
      try {
        localStorage.setItem(`vybe_profile_${user.id}`, JSON.stringify(updated));
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Storage access blocked
      }
    }

    setUser(updated);
    return {};
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        configStatus,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        signIn,
        signUp,
        signOut,
        switchTestAccount,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
