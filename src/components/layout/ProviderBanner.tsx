"use client";

import React, { useEffect, useState } from "react";
import { fetchProviderStatus } from "@/lib/metadata/client";
import { ProviderStatus } from "@/lib/types";
import { AlertCircle, CheckCircle, Database, X } from "lucide-react";

export function ProviderBanner() {
  const [status, setStatus] = useState<ProviderStatus | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetchProviderStatus().then((s) => setStatus(s)).catch(() => {});
  }, []);

  if (!status || dismissed) return null;

  if (status.isConfigured) {
    return (
      <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-1.5 text-xs text-emerald-400 flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>
            <strong>Live Catalog Active:</strong> Connected to official The Movie Database (TMDB) API v3/v4.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-300 flex items-center justify-between">
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
        <div className="flex-1">
          <span>
            <strong>Metadata Provider Notice:</strong> TMDB API credentials are not yet set in <code className="bg-black/30 px-1.5 py-0.5 rounded text-amber-200">.env.local</code>. Running on curated mock catalog.
          </span>
          <span className="hidden sm:inline text-amber-400/80 ml-2">
            Add <code className="bg-black/30 px-1 py-0.5 rounded text-amber-200">TMDB_API_KEY</code> to enable live search and 1M+ titles.
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-amber-500/20 rounded-lg text-amber-300"
          aria-label="Dismiss provider notice"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
