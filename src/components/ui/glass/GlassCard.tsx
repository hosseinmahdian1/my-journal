"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowColor?: "cyan" | "purple" | "green" | "gold" | "red" | "neutral" | "none";
}

export function GlassCard({
  children,
  className,
  glowColor = "none",
  ...props
}: GlassCardProps) {
  const glowStyles = {
    none: "",
    cyan: "hover:border-[#22D3EE]/50 hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]",
    purple: "hover:border-[#2A3050]/50 hover:shadow-[0_0_30px_rgba(42,48,80,0.2)]",
    green: "hover:border-[#34D399]/50 hover:shadow-[0_0_30px_rgba(52,211,153,0.2)]",
    gold: "hover:border-[#7C5CFF]/50 hover:shadow-[0_0_30px_rgba(124,92,255,0.25)]",
    red: "hover:border-[#F87171]/50 hover:shadow-[0_0_30px_rgba(248,113,113,0.25)]",
    neutral: "hover:border-[#2A3050]/50 hover:shadow-[0_0_25px_rgba(42,48,80,0.2)]",
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
      <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[#7C5CFF]/5 blur-3xl" />
      {children}
    </div>
  );
}
