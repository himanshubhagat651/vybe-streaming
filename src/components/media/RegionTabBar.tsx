"use client";

import React, { useState, useEffect } from "react";
import { Plus, X, Globe, Check, Search, Sparkles } from "lucide-react";
import {
  Region,
  ALL_REGIONS,
  DEFAULT_TAB_CODES,
  getRegionByCode,
  getStoredTabRegionCodes,
  saveStoredTabRegionCodes,
} from "@/lib/regions";
import { cn } from "@/lib/utils";

interface RegionTabBarProps {
  selectedRegion: string;
  onSelectRegion: (code: string) => void;
  className?: string;
  title?: string;
}

export function RegionTabBar({
  selectedRegion,
  onSelectRegion,
  className,
  title = "Explore By Region",
}: RegionTabBarProps) {
  const [tabCodes, setTabCodes] = useState<string[]>(DEFAULT_TAB_CODES);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalSearch, setModalSearch] = useState("");

  useEffect(() => {
    const loaded = getStoredTabRegionCodes();
    setTabCodes(loaded);
  }, []);

  const handleAddRegion = (code: string) => {
    if (!tabCodes.includes(code)) {
      const next = [...tabCodes, code];
      setTabCodes(next);
      saveStoredTabRegionCodes(next);
    }
    onSelectRegion(code);
    setIsAddModalOpen(false);
    setModalSearch("");
  };

  const handleRemoveTab = (e: React.MouseEvent, code: string) => {
    e.stopPropagation();
    if (code === "all" || code === "IN") return; // Keep core defaults
    const next = tabCodes.filter((c) => c !== code);
    setTabCodes(next);
    saveStoredTabRegionCodes(next);
    if (selectedRegion === code) {
      onSelectRegion("IN");
    }
  };

  const activeRegions = tabCodes
    .map((code) => getRegionByCode(code))
    .filter((r): r is Region => !!r);

  const availableToAdd = ALL_REGIONS.filter(
    (r) =>
      !tabCodes.includes(r.code) &&
      (modalSearch.trim() === "" ||
        r.name.toLowerCase().includes(modalSearch.toLowerCase()) ||
        r.alias?.toLowerCase().includes(modalSearch.toLowerCase()) ||
        r.code.toLowerCase().includes(modalSearch.toLowerCase()))
  );

  return (
    <div className={cn("space-y-3 select-none", className)}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-brand-400" />
          <span className="text-xs sm:text-sm font-bold text-foreground tracking-wide uppercase font-mono">
            {title}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 font-semibold">
            Country Specific
          </span>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-surface-hover hover:bg-surface-border text-brand-400 hover:text-brand-300 border border-surface-border transition-all active:scale-95 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Region</span>
        </button>
      </div>

      {/* Horizontal Scrollable Region Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar scrollbar-none scroll-smooth">
        {activeRegions.map((region) => {
          const isSelected = selectedRegion.toUpperCase() === region.code.toUpperCase();
          const isRemovable = region.code !== "all" && region.code !== "IN";

          return (
            <button
              key={region.code}
              onClick={() => onSelectRegion(region.code)}
              className={cn(
                "group relative inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-200 border shrink-0 active:scale-95",
                isSelected
                  ? "bg-gradient-to-r from-brand-600 to-indigo-600 text-white border-brand-500/50 shadow-lg shadow-brand-600/30 font-bold scale-[1.02]"
                  : "bg-surface hover:bg-surface-hover text-foreground-muted hover:text-foreground border-surface-border hover:border-surface-border/80"
              )}
            >
              <span className="text-base">{region.flag}</span>
              <span>{region.name}</span>
              {region.alias && (
                <span
                  className={cn(
                    "text-[10px] font-mono px-1.5 py-0.5 rounded-md hidden sm:inline",
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-surface-hover text-foreground-muted/70 group-hover:text-foreground-muted"
                  )}
                >
                  {region.alias}
                </span>
              )}

              {/* Remove Tab Option (For custom added tabs) */}
              {isRemovable && (
                <span
                  onClick={(e) => handleRemoveTab(e, region.code)}
                  title="Remove tab"
                  className={cn(
                    "ml-0.5 p-0.5 rounded-full hover:bg-white/20 opacity-40 hover:opacity-100 transition-opacity",
                    isSelected ? "text-white" : "text-foreground-muted"
                  )}
                >
                  <X className="w-3 h-3" />
                </span>
              )}
            </button>
          );
        })}

        {/* "+ Add Region" Tab Pill */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap bg-surface-hover/60 hover:bg-brand-600/10 text-brand-400 hover:text-brand-300 border border-dashed border-brand-500/40 transition-all shrink-0 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>More Regions...</span>
        </button>
      </div>

      {/* Add Region Modal Dialog */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-surface border border-surface-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-surface-border flex items-center justify-between bg-surface-hover/30">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-base leading-tight">
                    Add Region Content Tab
                  </h3>
                  <p className="text-xs text-foreground-muted mt-0.5">
                    Select a country to discover movies and shows from that region
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-surface-border/60 bg-surface">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                <input
                  type="text"
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  placeholder="Search countries, Bollywood, K-Drama, Anime..."
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-surface-hover border border-surface-border text-xs text-foreground placeholder:text-foreground-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                  autoFocus
                />
              </div>
            </div>

            {/* Region List */}
            <div className="p-4 overflow-y-auto space-y-2 no-scrollbar max-h-96">
              {availableToAdd.length === 0 ? (
                <div className="py-8 text-center text-xs text-foreground-muted">
                  No additional regions matching your search.
                </div>
              ) : (
                availableToAdd.map((region) => (
                  <button
                    key={region.code}
                    onClick={() => handleAddRegion(region.code)}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-surface-hover/50 hover:bg-surface-hover border border-surface-border hover:border-brand-500/40 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{region.flag}</span>
                      <div>
                        <p className="text-xs font-bold text-foreground group-hover:text-brand-400 transition-colors">
                          {region.name}
                        </p>
                        {region.alias && (
                          <p className="text-[11px] text-foreground-muted mt-0.5">
                            {region.alias}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-400 group-hover:text-brand-300">
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Tab</span>
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-surface-border bg-surface-hover/30 flex items-center justify-between text-xs text-foreground-muted">
              <span>Added tabs persist automatically across sessions.</span>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-foreground hover:bg-surface-hover"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
