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
      "dark:bg-[#10B981]/15 bg-emerald-50/90 dark:border-[#10B981]/35 border-emerald-200 dark:text-[#10B981] text-emerald-700 shadow-sm",
    loss: "dark:bg-[#EF4444]/15 bg-rose-50/90 dark:border-[#EF4444]/35 border-rose-200 dark:text-[#EF4444] text-rose-700 shadow-sm",
    neutral:
      "dark:bg-[#14161D]/60 bg-slate-100 dark:border-[#232734] border-slate-200 dark:text-[#94A3B8] text-slate-700",
    cyan: "dark:bg-[#F59E0B]/15 bg-amber-50/90 dark:border-[#F59E0B]/35 border-amber-200 dark:text-[#F59E0B] text-amber-800 shadow-sm",
    gold: "dark:bg-[#F59E0B]/15 bg-amber-50/90 dark:border-[#F59E0B]/35 border-amber-200 dark:text-[#F59E0B] text-amber-800 shadow-sm",
    purple:
      "dark:bg-[#F59E0B]/10 bg-amber-50/90 dark:border-[#F59E0B]/30 border-amber-200 dark:text-[#F59E0B] text-amber-700 shadow-sm",
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
          variant === "profit" && "bg-[#10B981] dark:shadow-[0_0_6px_rgba(16,185,129,0.6)]",
          variant === "loss" && "bg-[#EF4444] dark:shadow-[0_0_6px_rgba(239,68,68,0.6)]",
          variant === "cyan" && "bg-[#F59E0B] dark:shadow-[0_0_6px_rgba(245,158,11,0.6)]",
          variant === "gold" && "bg-[#F59E0B] dark:shadow-[0_0_6px_rgba(245,158,11,0.6)]",
          variant === "purple" && "bg-[#F59E0B] dark:shadow-[0_0_6px_rgba(245,158,11,0.6)]",
          variant === "neutral" && "bg-slate-400"
        )}
      />
      {children}
    </span>
  );
}
