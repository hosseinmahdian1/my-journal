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
    cyan: "hover:border-[#597599]/50 hover:shadow-[0_0_30px_rgba(89,117,153,0.2)]",
    purple: "hover:border-[#415A77]/50 hover:shadow-[0_0_30px_rgba(65,90,119,0.2)]",
    green: "hover:border-[#778D7A]/50 hover:shadow-[0_0_30px_rgba(119,141,122,0.2)]",
    gold: "hover:border-[#D4C4A8]/50 hover:shadow-[0_0_30px_rgba(212,196,168,0.25)]",
    red: "hover:border-[#C06C58]/50 hover:shadow-[0_0_30px_rgba(192,108,88,0.25)]",
    neutral: "hover:border-[#415A77]/50 hover:shadow-[0_0_25px_rgba(65,90,119,0.2)]",
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
      <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[#D4C4A8]/5 blur-3xl" />
      {children}
    </div>
  );
}
