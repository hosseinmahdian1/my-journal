"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface GlassBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: "profit" | "loss" | "neutral" | "cyan" | "gold" | "purple";
  className?: string;
}

export function GlassBadge({
  children,
  variant = "cyan",
  className,
  ...props
}: GlassBadgeProps) {
  const variantStyles = {
    profit:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    loss: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    neutral:
      "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700/60",
    cyan: "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-300 dark:border-zinc-700",
    gold: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25",
    purple:
      "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-tight transition-all",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          variant === "profit" && "bg-emerald-500",
          variant === "loss" && "bg-rose-500",
          variant === "cyan" && "bg-zinc-400 dark:bg-zinc-500",
          variant === "gold" && "bg-amber-500",
          variant === "purple" && "bg-zinc-400",
          variant === "neutral" && "bg-zinc-400"
        )}
      />
      {children}
    </span>
  );
}

