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
      "bg-gradient-to-r from-[#D4C4A8] via-[#DFD3BE] to-[#C2B092] text-[#0D1B2A] shadow-[0_4px_14px_rgba(212,196,168,0.35)] hover:shadow-[0_6px_20px_rgba(212,196,168,0.5)] hover:scale-[1.02]",
    secondary:
      "dark:bg-[#1B263B] dark:text-[#F4F1DE] dark:border-[#415A77]/40 dark:hover:bg-[#1B263B]/80 bg-slate-100 hover:bg-slate-200/90 text-slate-800 border border-slate-200/90 shadow-sm",
    outline:
      "dark:border-[#415A77]/40 border-slate-300 dark:bg-[#0D1B2A]/70 bg-white dark:text-[#F4F1DE] text-slate-700 hover:border-[#D4C4A8] hover:text-[#D4C4A8] shadow-sm backdrop-blur-xl",
    gold: "bg-gradient-to-r from-[#D4C4A8] to-[#C4B294] text-[#0D1B2A] shadow-[0_4px_14px_rgba(212,196,168,0.35)] hover:shadow-[0_6px_20px_rgba(212,196,168,0.5)] hover:scale-[1.02]",
    danger:
      "bg-gradient-to-r from-[#C06C58] to-[#9C4C3B] text-white shadow-[0_4px_14px_rgba(192,108,88,0.35)] hover:shadow-[0_6px_20px_rgba(192,108,88,0.45)]",
    sage: "bg-gradient-to-r from-[#778D7A] to-[#5A6F5D] text-white shadow-[0_4px_14px_rgba(119,141,122,0.35)] hover:shadow-[0_6px_20px_rgba(119,141,122,0.45)]",
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
