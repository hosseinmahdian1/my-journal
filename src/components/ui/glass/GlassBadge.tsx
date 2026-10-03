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
      "dark:bg-[#00C48C]/15 bg-emerald-50 dark:border-[#00C48C]/35 border-emerald-200 dark:text-[#00C48C] text-emerald-700 shadow-sm",
    loss: "dark:bg-[#F43F5E]/15 bg-rose-50 dark:border-[#F43F5E]/35 border-rose-200 dark:text-[#F43F5E] text-rose-700 shadow-sm",
    neutral:
      "dark:bg-[#161928]/60 bg-slate-100 dark:border-[#22283E] border-slate-200 dark:text-[#8E98B0] text-slate-700",
    cyan: "dark:bg-[#4F46E5]/15 bg-indigo-50 dark:border-[#4F46E5]/35 border-indigo-200 dark:text-[#4F46E5] text-indigo-700 shadow-sm",
    gold: "dark:bg-[#4F46E5]/15 bg-indigo-50 dark:border-[#4F46E5]/35 border-indigo-200 dark:text-[#4F46E5] text-indigo-800 shadow-sm",
    purple:
      "dark:bg-[#4F46E5]/15 bg-indigo-50 dark:border-[#4F46E5]/30 border-indigo-200 dark:text-[#4F46E5] text-indigo-700 shadow-sm",
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
          variant === "profit" && "bg-[#00C48C] dark:shadow-[0_0_6px_rgba(0,196,140,0.6)]",
          variant === "loss" && "bg-[#F43F5E] dark:shadow-[0_0_6px_rgba(244,63,94,0.6)]",
          variant === "cyan" && "bg-[#4F46E5] dark:shadow-[0_0_6px_rgba(79,70,229,0.6)]",
          variant === "gold" && "bg-[#4F46E5] dark:shadow-[0_0_6px_rgba(79,70,229,0.6)]",
          variant === "purple" && "bg-[#4F46E5] dark:shadow-[0_0_6px_rgba(79,70,229,0.6)]",
          variant === "neutral" && "bg-slate-400"
        )}
      />
      {children}
    </span>
  );
}
