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
      "bg-gradient-to-r from-[#7C5CFF] to-[#22D3EE] text-white shadow-[0_4px_14px_rgba(124,92,255,0.4)] hover:shadow-[0_6px_20px_rgba(124,92,255,0.55)] hover:scale-[1.02]",
    secondary:
      "dark:bg-[#141829] dark:text-[#E6E8F2] dark:border-[#2A3050] dark:hover:bg-[#1C2138] bg-slate-100 hover:bg-slate-200/90 text-slate-800 border border-slate-200/90 shadow-sm",
    outline:
      "dark:border-[#2A3050] border-slate-300 dark:bg-[#0B0E1A]/70 bg-white dark:text-[#E6E8F2] text-slate-700 hover:border-[#7C5CFF] hover:text-[#7C5CFF] shadow-sm backdrop-blur-xl",
    gold: "bg-gradient-to-r from-[#7C5CFF] to-[#6344E0] text-white shadow-[0_4px_14px_rgba(124,92,255,0.4)] hover:shadow-[0_6px_20px_rgba(124,92,255,0.55)] hover:scale-[1.02]",
    danger:
      "bg-gradient-to-r from-[#F87171] to-[#F87171] text-white shadow-[0_4px_14px_rgba(248,113,113,0.35)] hover:shadow-[0_6px_20px_rgba(248,113,113,0.45)]",
    sage: "bg-gradient-to-r from-[#34D399] to-[#34D399] text-white shadow-[0_4px_14px_rgba(52,211,153,0.35)] hover:shadow-[0_6px_20px_rgba(52,211,153,0.45)]",
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
