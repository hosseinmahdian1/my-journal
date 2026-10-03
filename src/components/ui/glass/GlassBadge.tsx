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
      "dark:bg-[#00E676]/15 bg-emerald-50/90 dark:border-[#00E676]/35 border-emerald-200 dark:text-[#00E676] text-emerald-700 shadow-sm",
    loss: "dark:bg-[#FF334B]/15 bg-rose-50/90 dark:border-[#FF334B]/35 border-rose-200 dark:text-[#FF334B] text-rose-700 shadow-sm",
    neutral:
      "dark:bg-[#0F1016]/60 bg-slate-100 dark:border-[#1E2028] border-slate-200 dark:text-[#8E92A4] text-slate-700",
    cyan: "dark:bg-[#00E5FF]/15 bg-sky-50/90 dark:border-[#00E5FF]/35 border-sky-200 dark:text-[#00E5FF] text-sky-700 shadow-sm",
    gold: "dark:bg-[#FFB800]/15 bg-amber-50/90 dark:border-[#FFB800]/35 border-amber-200 dark:text-[#FFB800] text-amber-800 shadow-sm",
    purple:
      "dark:bg-[#00E5FF]/10 bg-indigo-50/90 dark:border-[#00E5FF]/30 border-indigo-200 dark:text-[#00E5FF] text-indigo-700 shadow-sm",
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
          variant === "profit" && "bg-[#00E676] dark:shadow-[0_0_6px_rgba(0,230,118,0.6)]",
          variant === "loss" && "bg-[#FF334B] dark:shadow-[0_0_6px_rgba(255,51,75,0.6)]",
          variant === "cyan" && "bg-[#00E5FF] dark:shadow-[0_0_6px_rgba(0,229,255,0.6)]",
          variant === "gold" && "bg-[#FFB800] dark:shadow-[0_0_6px_rgba(255,184,0,0.6)]",
          variant === "purple" && "bg-[#00E5FF] dark:shadow-[0_0_6px_rgba(0,229,255,0.6)]",
          variant === "neutral" && "bg-slate-400"
        )}
      />
      {children}
    </span>
  );
}
