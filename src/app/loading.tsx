import React from "react";
import { Skeleton, MediaCardSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-10 animate-fadeIn py-4">
      {/* Hero Skeleton */}
      <Skeleton className="w-full h-[500px] rounded-3xl" />

      {/* Row Skeletons */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <MediaCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
