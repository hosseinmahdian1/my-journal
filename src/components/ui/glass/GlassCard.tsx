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
    cyan: "hover:border-[#00E5FF]/50 hover:shadow-[0_0_30px_rgba(0,229,255,0.2)]",
    purple: "hover:border-[#00E5FF]/40 hover:shadow-[0_0_30px_rgba(0,229,255,0.15)]",
    green: "hover:border-[#00E676]/50 hover:shadow-[0_0_30px_rgba(0,230,118,0.2)]",
    gold: "hover:border-[#FFB800]/50 hover:shadow-[0_0_30px_rgba(255,184,0,0.2)]",
    red: "hover:border-[#FF334B]/50 hover:shadow-[0_0_30px_rgba(255,51,75,0.2)]",
    neutral: "hover:border-[#1E2028] hover:shadow-[0_0_25px_rgba(0,0,0,0.4)]",
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
      <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[#00E5FF]/5 blur-3xl" />
      {children}
    </div>
  );
}
