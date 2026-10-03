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
      "dark:bg-[#15171E]/60 bg-slate-100 dark:border-[#232732]/30 border-slate-200 dark:text-[#94A3B8] text-slate-700",
    cyan: "dark:bg-[#232732]/20 bg-sky-50/90 dark:border-[#232732]/40 border-sky-200 dark:text-[#94A3B8] text-sky-700 shadow-sm",
    gold: "dark:bg-[#F59E0B]/15 bg-amber-50/90 dark:border-[#F59E0B]/40 border-amber-200 dark:text-[#F59E0B] text-amber-800 shadow-sm",
    purple:
      "dark:bg-[#232732]/20 bg-indigo-50/90 dark:border-[#232732]/40 border-indigo-200 dark:text-[#F59E0B] text-indigo-700 shadow-sm",
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
          variant === "cyan" && "bg-[#38BDF8] dark:shadow-[0_0_6px_rgba(56,189,248,0.6)]",
          variant === "gold" && "bg-[#F59E0B] dark:shadow-[0_0_6px_rgba(245,158,11,0.6)]",
          variant === "purple" && "bg-[#232732] dark:shadow-[0_0_6px_rgba(35,39,50,0.6)]",
          variant === "neutral" && "bg-slate-400"
        )}
      />
      {children}
    </span>
  );
}
