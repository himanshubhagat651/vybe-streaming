"use client";

import React, { useState } from "react";
import { useAuth, TEST_ACCOUNTS } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { X, Lock, Mail, User, ShieldCheck, Database, ArrowRight, Sparkles } from "lucide-react";

export function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    signIn,
    signUp,
    switchTestAccount,
    configStatus,
    user,
  } = useAuth();
  const { setTheme } = useTheme();

  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (tab === "signin") {
        const res = await signIn(email, password);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          closeAuthModal();
        }
      } else {
        const res = await signUp(email, password, username);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          closeAuthModal();
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSwitch = async (key: "alex" | "jordan") => {
    setErrorMsg(null);
    await switchTestAccount(key);
    // Sync theme
    const target = TEST_ACCOUNTS[key];
    if (target.preferredTheme) {
      setTheme(target.preferredTheme);
    }
    closeAuthModal();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
    >
      <div className="relative w-full max-w-md bg-vybe-surface border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden text-vybe-fg">
        {/* Glow Accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 text-white/50 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
              <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-sm font-black shadow-lg shadow-violet-600/30">
                V
              </span>
              VYBE
            </span>
          </div>
          <h2 id="auth-modal-title" className="text-xl font-bold text-white">
            {tab === "signin" ? "Sign in to your account" : "Create your VYBE account"}
          </h2>
          <p className="text-xs text-white/60 mt-1">
            {tab === "signin"
              ? "Access your saved watchlist, playback progress, and preferences."
              : "Synchronize your streaming experience across devices."}
          </p>
        </div>

        {/* Backend Status Badge */}
        <div
          className={`mb-5 p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
            configStatus.isConfigured
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-amber-500/10 border-amber-500/30 text-amber-200"
          }`}
        >
          <Database className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">
            <div className="font-semibold flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  configStatus.isConfigured ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                }`}
              />
              {configStatus.isConfigured
                ? "Supabase Live Backend Connected"
                : "Demo Mode: Isolated Multi-Account Storage"}
            </div>
            {!configStatus.isConfigured && (
              <p className="mt-1 text-[11px] text-amber-200/80">
                Each account has private isolated persistence in storage. Real Supabase can be
                connected by setting <code className="bg-black/30 px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
                <code className="bg-black/30 px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
              </p>
            )}
          </div>
        </div>

        {/* Quick Test Account Switcher */}
        <div className="mb-5 p-3.5 bg-white/5 border border-white/10 rounded-xl">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-white/50 mb-2 flex items-center justify-between">
            <span>Instant Test Accounts (Verify Isolation)</span>
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickSwitch("alex")}
              className={`p-2.5 rounded-lg border text-left flex items-center gap-2.5 transition-all text-xs ${
                user?.id === TEST_ACCOUNTS.alex.id
                  ? "bg-violet-600/20 border-violet-500/50 text-white shadow-sm shadow-violet-600/20 ring-1 ring-violet-500/30"
                  : "bg-white/5 border-white/5 text-white/80 hover:bg-white/10 hover:border-white/20"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={TEST_ACCOUNTS.alex.avatarUrl || ""}
                alt="Alex"
                className="w-7 h-7 rounded-full object-cover border border-white/20"
              />
              <div className="truncate">
                <div className="font-semibold text-white truncate">Alex Vance</div>
                <div className="text-[10px] text-white/50 truncate">Dark • English</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickSwitch("jordan")}
              className={`p-2.5 rounded-lg border text-left flex items-center gap-2.5 transition-all text-xs ${
                user?.id === TEST_ACCOUNTS.jordan.id
                  ? "bg-violet-600/20 border-violet-500/50 text-white shadow-sm shadow-violet-600/20 ring-1 ring-violet-500/30"
                  : "bg-white/5 border-white/5 text-white/80 hover:bg-white/10 hover:border-white/20"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={TEST_ACCOUNTS.jordan.avatarUrl || ""}
                alt="Jordan"
                className="w-7 h-7 rounded-full object-cover border border-white/20"
              />
              <div className="truncate">
                <div className="font-semibold text-white truncate">Jordan Reed</div>
                <div className="text-[10px] text-white/50 truncate">Light • French</div>
              </div>
            </button>
          </div>
        </div>

        {/* Form Tabs */}
        <div className="flex border-b border-white/10 mb-4">
          <button
            type="button"
            onClick={() => {
              setTab("signin");
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-colors ${
              tab === "signin"
                ? "border-violet-500 text-violet-400"
                : "border-transparent text-white/50 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("signup");
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-colors ${
              tab === "signup"
                ? "border-violet-500 text-violet-400"
                : "border-transparent text-white/50 hover:text-white"
            }`}
          >
            Create Account
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {tab === "signup" && (
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Cinephile99"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-white/30 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-white/30 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-white/30 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{tab === "signin" ? "Sign In" : "Create Account"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Row Level Security Active
          </span>
          <span>Single-device private partition</span>
        </div>
      </div>
    </div>
  );
}
