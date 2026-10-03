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
      "dark:bg-emerald-500/10 bg-emerald-50/90 dark:border-emerald-500/30 border-emerald-200 dark:text-emerald-400 text-emerald-700 shadow-sm",
    loss: "dark:bg-rose-500/10 bg-rose-50/90 dark:border-rose-500/30 border-rose-200 dark:text-rose-400 text-rose-700 shadow-sm",
    neutral:
      "dark:bg-white/5 bg-slate-100 dark:border-white/10 border-slate-200 dark:text-slate-300 text-slate-700",
    cyan: "dark:bg-cyan-500/10 bg-sky-50/90 dark:border-cyan-500/30 border-sky-200 dark:text-cyan-400 text-sky-700 shadow-sm",
    gold: "dark:bg-amber-500/10 bg-amber-50/90 dark:border-amber-500/30 border-amber-200 dark:text-amber-400 text-amber-800 shadow-sm",
    purple:
      "dark:bg-purple-500/10 bg-indigo-50/90 dark:border-purple-500/30 border-indigo-200 dark:text-purple-400 text-indigo-700 shadow-sm",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-extrabold tracking-wide backdrop-blur-md transition-all",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full animate-pulse",
          variant === "profit" && "bg-emerald-500 dark:shadow-[0_0_6px_#10b981]",
          variant === "loss" && "bg-rose-500 dark:shadow-[0_0_6px_#f43f5e]",
          variant === "cyan" && "bg-sky-500 dark:shadow-[0_0_6px_#06b6d4]",
          variant === "gold" && "bg-amber-500 dark:shadow-[0_0_6px_#f59e0b]",
          variant === "purple" && "bg-indigo-500 dark:shadow-[0_0_6px_#a855f7]",
          variant === "neutral" && "bg-slate-400"
        )}
      />
      {children}
    </span>
  );
}
