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
      "bg-gradient-to-r from-[#F59E0B] via-[#FBBF24] to-[#B45309] text-[#0B0C10] shadow-[0_4px_14px_rgba(245,158,11,0.35)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.5)] hover:scale-[1.02]",
    secondary:
      "dark:bg-[#15171E] dark:text-[#FFFFFF] dark:border-[#232732]/40 dark:hover:bg-[#15171E]/80 bg-slate-100 hover:bg-slate-200/90 text-slate-800 border border-slate-200/90 shadow-sm",
    outline:
      "dark:border-[#232732]/40 border-slate-300 dark:bg-[#0B0C10]/70 bg-white dark:text-[#FFFFFF] text-slate-700 hover:border-[#F59E0B] hover:text-[#F59E0B] shadow-sm backdrop-blur-xl",
    gold: "bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-[#0B0C10] shadow-[0_4px_14px_rgba(245,158,11,0.35)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.5)] hover:scale-[1.02]",
    danger:
      "bg-gradient-to-r from-[#EF4444] to-[#DC2626] text-white shadow-[0_4px_14px_rgba(239,68,68,0.35)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.45)]",
    sage: "bg-gradient-to-r from-[#10B981] to-[#059669] text-white shadow-[0_4px_14px_rgba(16,185,129,0.35)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.45)]",
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
