import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "brand" | "rating" | "quality" | "outline" | "genre";
  className?: string;
}

export function Badge({ children, variant = "outline", className }: BadgeProps) {
  const base =
    "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold tracking-wide transition-colors";

  const variants = {
    brand: "bg-brand-600/15 text-brand-400 border border-brand-500/30",
    rating: "bg-amber-500/15 text-amber-400 border border-amber-500/30 gap-1 font-bold",
    quality: "bg-white/10 text-foreground font-mono text-[10px] tracking-wider uppercase border border-white/10",
    outline: "bg-surface-hover text-foreground-muted border border-surface-border",
    genre: "bg-surface hover:bg-surface-hover text-foreground-muted hover:text-foreground border border-surface-border text-xs px-2.5 py-1 rounded-full cursor-pointer",
  };

  return <span className={cn(base, variants[variant], className)}>{children}</span>;
}
