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
      "dark:bg-[#34D399]/15 bg-emerald-50/90 dark:border-[#34D399]/35 border-emerald-200 dark:text-[#34D399] text-emerald-700 shadow-sm",
    loss: "dark:bg-[#F87171]/15 bg-rose-50/90 dark:border-[#F87171]/35 border-rose-200 dark:text-[#F87171] text-rose-700 shadow-sm",
    neutral:
      "dark:bg-[#141414]/60 bg-slate-100 dark:border-[#2A2A2A]/30 border-slate-200 dark:text-[#9A9A9A] text-slate-700",
    cyan: "dark:bg-[#2A2A2A]/20 bg-sky-50/90 dark:border-[#2A2A2A]/40 border-sky-200 dark:text-[#9A9A9A] text-sky-700 shadow-sm",
    gold: "dark:bg-[#0284C7]/15 bg-amber-50/90 dark:border-[#0284C7]/40 border-amber-200 dark:text-[#0284C7] text-amber-800 shadow-sm",
    purple:
      "dark:bg-[#2A2A2A]/20 bg-indigo-50/90 dark:border-[#2A2A2A]/40 border-indigo-200 dark:text-[#0284C7] text-indigo-700 shadow-sm",
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
          variant === "profit" && "bg-[#34D399] dark:shadow-[0_0_6px_rgba(52,211,153,0.6)]",
          variant === "loss" && "bg-[#F87171] dark:shadow-[0_0_6px_rgba(248,113,113,0.6)]",
          variant === "cyan" && "bg-[#22D3EE] dark:shadow-[0_0_6px_rgba(34,211,238,0.6)]",
          variant === "gold" && "bg-[#0284C7] dark:shadow-[0_0_6px_rgba(2, 132, 199,0.6)]",
          variant === "purple" && "bg-[#2A2A2A] dark:shadow-[0_0_6px_rgba(42, 42, 42,0.6)]",
          variant === "neutral" && "bg-slate-400"
        )}
      />
      {children}
    </span>
  );
}
