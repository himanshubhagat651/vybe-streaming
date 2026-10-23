import React from "react";
import Link from "next/link";
import { Film, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-brand-600/15 text-brand-400 flex items-center justify-center border border-brand-500/20 shadow-xl shadow-brand-500/10">
        <Film className="w-8 h-8" />
      </div>

      <div className="space-y-2 max-w-md">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-400">
          404 — Title Missing
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-foreground">
          Page Lost in the Stars
        </h1>
        <p className="text-sm text-foreground-muted leading-relaxed">
          The movie, show, or destination you are searching for does not exist in our catalog or may have moved.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Link href="/">
          <Button variant="primary" size="md">
            <Home className="w-4 h-4 mr-2" />
            Return Home
          </Button>
        </Link>
        <Link href="/browse">
          <Button variant="outline" size="md">
            Browse All Titles
          </Button>
        </Link>
      </div>
    </div>
  );
}
