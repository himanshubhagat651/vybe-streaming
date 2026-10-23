"use client";

import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { X, Lock, Mail, User, ShieldCheck, ArrowRight } from "lucide-react";

export function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    signIn,
    signUp,
  } = useAuth();

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

        {/* Form Tabs */}
        <div className="flex border-b border-white/10 mb-5">
          <button
            type="button"
            onClick={() => {
              setTab("signin");
              setErrorMsg(null);
            }}
            className={`flex-1 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
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
            className={`flex-1 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
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

        <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
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
                className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
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
                className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
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

        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-center text-[11px] text-white/40">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
            Secure Encrypted Streaming Account
          </span>
        </div>
      </div>
    </div>
  );
}
