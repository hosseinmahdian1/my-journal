"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "gold" | "danger" | "sage";
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
      "bg-gradient-to-r from-[#00E5FF] to-[#00E5FF] text-[#050507] font-extrabold shadow-[0_4px_16px_rgba(0,229,255,0.35)] hover:shadow-[0_6px_22px_rgba(0,229,255,0.5)] hover:scale-[1.02]",
    secondary:
      "dark:bg-[#0F1016] dark:text-[#FFFFFF] dark:border-[#1E2028] dark:hover:bg-[#16171E] bg-slate-100 hover:bg-slate-200/90 text-slate-800 border border-slate-200/90 shadow-sm",
    outline:
      "dark:border-[#1E2028] border-slate-300 dark:bg-[#050507]/70 bg-white dark:text-[#FFFFFF] text-slate-700 hover:border-[#00E5FF] hover:text-[#00E5FF] shadow-sm backdrop-blur-xl",
    gold: "bg-gradient-to-r from-[#00E5FF] to-[#00E5FF] text-[#050507] font-extrabold shadow-[0_4px_16px_rgba(0,229,255,0.35)] hover:shadow-[0_6px_22px_rgba(0,229,255,0.5)] hover:scale-[1.02]",
    danger:
      "bg-gradient-to-r from-[#FF334B] to-[#FF334B] text-white shadow-[0_4px_14px_rgba(255,51,75,0.35)] hover:shadow-[0_6px_20px_rgba(255,51,75,0.45)]",
    sage: "bg-gradient-to-r from-[#00E676] to-[#00E676] text-[#050507] font-bold shadow-[0_4px_14px_rgba(0,230,118,0.35)] hover:shadow-[0_6px_20px_rgba(0,230,118,0.45)]",
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
