"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "gold" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function GlassButton({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}: GlassButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-xs",
    md: "px-5 py-2.5 text-xs tracking-wide",
    lg: "px-7 py-3.5 text-sm tracking-wide font-extrabold",
  };

  const variantStyles = {
    primary:
      "bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600 text-white shadow-[0_4px_14px_rgba(14,165,233,0.35)] hover:shadow-[0_6px_20px_rgba(14,165,233,0.45)] hover:scale-[1.02]",
    secondary:
      "dark:bg-white/10 dark:text-white dark:border-white/10 dark:hover:bg-white/15 bg-slate-100 hover:bg-slate-200/90 text-slate-800 border border-slate-200/90 shadow-sm",
    outline:
      "dark:border-white/15 border-slate-300 dark:bg-zinc-950/60 bg-white dark:text-slate-200 text-slate-700 hover:border-sky-500 hover:text-sky-600 shadow-sm backdrop-blur-xl",
    gold: "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-[0_4px_14px_rgba(245,158,11,0.35)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.45)] hover:scale-[1.02]",
    danger:
      "bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-[0_4px_14px_rgba(244,63,94,0.35)] hover:shadow-[0_6px_20px_rgba(244,63,94,0.45)]",
  };

  return (
    <button
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}
