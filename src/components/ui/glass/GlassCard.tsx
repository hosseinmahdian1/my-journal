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
    cyan: "hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]",
    purple: "hover:border-purple-500/40 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]",
    green: "hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]",
    gold: "hover:border-amber-500/40 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]",
    red: "hover:border-rose-500/40 hover:shadow-[0_0_30px_rgba(244,63,94,0.15)]",
  };

  return (
    <div
      className={cn(
        "starlight-card relative overflow-hidden p-6 transition-all duration-300",
        glowStyles[glowColor],
        className
      )}
      {...props}
    >
      {/* Subtle Starlight Accent Glow Gradient */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-cyan-500/5 blur-3xl" />
      {children}
    </div>
  );
}
