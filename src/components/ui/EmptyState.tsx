import React from "react";
import Link from "next/link";
import { Film, Search, ArrowLeft } from "lucide-react";
import { Button } from "./Button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionText,
  actionHref = "/",
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 min-h-[360px] rounded-2xl border border-dashed border-surface-border bg-surface/50 max-w-xl mx-auto my-8">
      <div className="p-4 rounded-2xl bg-brand-500/10 text-brand-400 mb-4 ring-1 ring-brand-500/20">
        {icon || <Film className="w-10 h-10" />}
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-foreground-muted max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionText && (
        actionHref ? (
          <Link href={actionHref}>
            <Button variant="primary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {actionText}
            </Button>
          </Link>
        ) : (
          <Button variant="primary" onClick={onAction}>
            {actionText}
          </Button>
        )
      )}
    </div>
  );
}
