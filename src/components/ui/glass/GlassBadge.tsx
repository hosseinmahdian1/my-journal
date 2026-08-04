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
      "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]",
    loss: "bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.2)]",
    neutral:
      "dark:bg-white/5 bg-black/5 dark:border-white/10 border-black/10 dark:text-slate-300 text-slate-700",
    cyan: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]",
    gold: "bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]",
    purple:
      "bg-purple-500/10 border-purple-500/30 text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.2)]",
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
          variant === "profit" && "bg-emerald-400 shadow-[0_0_6px_#10b981]",
          variant === "loss" && "bg-rose-400 shadow-[0_0_6px_#f43f5e]",
          variant === "cyan" && "bg-cyan-400 shadow-[0_0_6px_#06b6d4]",
          variant === "gold" && "bg-amber-400 shadow-[0_0_6px_#f59e0b]",
          variant === "purple" && "bg-purple-400 shadow-[0_0_6px_#a855f7]",
          variant === "neutral" && "bg-slate-400"
        )}
      />
      {children}
    </span>
  );
}
