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
    cyan: "hover:border-[#38BDF8]/50 hover:shadow-[0_0_30px_rgba(56,189,248,0.2)]",
    purple: "hover:border-[#232732]/50 hover:shadow-[0_0_30px_rgba(35,39,50,0.2)]",
    green: "hover:border-[#10B981]/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]",
    gold: "hover:border-[#F59E0B]/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.25)]",
    red: "hover:border-[#EF4444]/50 hover:shadow-[0_0_30px_rgba(239,68,68,0.25)]",
    neutral: "hover:border-[#232732]/50 hover:shadow-[0_0_25px_rgba(35,39,50,0.2)]",
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
      <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[#F59E0B]/5 blur-3xl" />
      {children}
    </div>
  );
}
