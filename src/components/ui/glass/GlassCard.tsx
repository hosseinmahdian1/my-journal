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
    cyan: "hover:border-[#4F46E5]/50 hover:shadow-[0_0_30px_rgba(79,70,229,0.2)]",
    purple: "hover:border-[#4F46E5]/40 hover:shadow-[0_0_30px_rgba(79,70,229,0.15)]",
    green: "hover:border-[#00C48C]/50 hover:shadow-[0_0_30px_rgba(0,196,140,0.2)]",
    gold: "hover:border-[#4F46E5]/50 hover:shadow-[0_0_30px_rgba(79,70,229,0.2)]",
    red: "hover:border-[#F43F5E]/50 hover:shadow-[0_0_30px_rgba(244,63,94,0.2)]",
    neutral: "hover:border-[#22283E] hover:shadow-[0_0_25px_rgba(0,0,0,0.25)]",
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
      <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[#4F46E5]/5 blur-3xl" />
      {children}
    </div>
  );
}
