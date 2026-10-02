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
      "dark:bg-[#778D7A]/15 bg-emerald-50/90 dark:border-[#778D7A]/35 border-emerald-200 dark:text-[#778D7A] text-emerald-700 shadow-sm",
    loss: "dark:bg-[#C06C58]/15 bg-rose-50/90 dark:border-[#C06C58]/35 border-rose-200 dark:text-[#C06C58] text-rose-700 shadow-sm",
    neutral:
      "dark:bg-[#1B263B]/60 bg-slate-100 dark:border-[#415A77]/30 border-slate-200 dark:text-[#8FA0B5] text-slate-700",
    cyan: "dark:bg-[#415A77]/20 bg-sky-50/90 dark:border-[#415A77]/40 border-sky-200 dark:text-[#9BAEC2] text-sky-700 shadow-sm",
    gold: "dark:bg-[#D4C4A8]/15 bg-amber-50/90 dark:border-[#D4C4A8]/40 border-amber-200 dark:text-[#D4C4A8] text-amber-800 shadow-sm",
    purple:
      "dark:bg-[#415A77]/20 bg-indigo-50/90 dark:border-[#415A77]/40 border-indigo-200 dark:text-[#D4C4A8] text-indigo-700 shadow-sm",
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
          variant === "profit" && "bg-[#778D7A] dark:shadow-[0_0_6px_rgba(119,141,122,0.6)]",
          variant === "loss" && "bg-[#C06C58] dark:shadow-[0_0_6px_rgba(192,108,88,0.6)]",
          variant === "cyan" && "bg-[#597599] dark:shadow-[0_0_6px_rgba(89,117,153,0.6)]",
          variant === "gold" && "bg-[#D4C4A8] dark:shadow-[0_0_6px_rgba(212,196,168,0.6)]",
          variant === "purple" && "bg-[#415A77] dark:shadow-[0_0_6px_rgba(65,90,119,0.6)]",
          variant === "neutral" && "bg-slate-400"
        )}
      />
      {children}
    </span>
  );
}
