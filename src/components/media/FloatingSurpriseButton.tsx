"use client";

import React, { useState } from "react";
import { Dices, Sparkles } from "lucide-react";
import { SurpriseMeModal } from "./SurpriseMeModal";
import { playDice } from "@/lib/audio";

export function FloatingSurpriseButton() {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    playDice();
    setIsOpen(true);
  };

  return (
    <>
      <div className="fixed bottom-20 md:bottom-8 right-4 sm:right-6 md:right-8 z-40 animate-fadeIn">
        <button
          onClick={handleClick}
          aria-label="Surprise me with a random movie or series"
          className="group relative flex items-center gap-2 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-full bg-gradient-to-r from-brand-600 via-indigo-600 to-amber-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-brand-500/30 hover:shadow-brand-500/60 hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20 select-none"
        >
          {/* Animated glow ring */}
          <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-brand-500 to-amber-400 opacity-40 blur group-hover:opacity-80 transition duration-300 -z-10 animate-pulse" />

          <Dices className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-500 group-hover:rotate-180" />
          <span className="tracking-tight hidden xs:inline">Surprise Me!</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse hidden sm:inline" />
        </button>
      </div>

      <SurpriseMeModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
