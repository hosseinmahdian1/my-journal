"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowColor?: "cyan" | "purple" | "green" | "gold" | "red" | "none";
}

export function GlassCard({
  children,
  className,
  glowColor = "none",
  ...props
}: GlassCardProps) {
  const glowStyles = {
    none: "",
    cyan: "hover:border-zinc-400 dark:hover:border-zinc-600",
    purple: "hover:border-zinc-400 dark:hover:border-zinc-600",
    green: "hover:border-emerald-500/50",
    gold: "hover:border-amber-500/50",
    red: "hover:border-rose-500/50",
  };

  return (
    <div
      className={cn(
        "starlight-card relative p-6 transition-all duration-200",
        glowStyles[glowColor],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

