import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-xl bg-surface-hover/80 shimmer border border-surface-border/40",
        className
      )}
      {...props}
    />
  );
}

export function MediaCardSkeleton() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="w-full aspect-poster rounded-2xl" />
      <Skeleton className="h-4 w-3/4 rounded-md" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-3 w-1/3 rounded-md" />
        <Skeleton className="h-3 w-1/4 rounded-md" />
      </div>
    </div>
  );
}
