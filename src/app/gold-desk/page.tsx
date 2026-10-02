"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/glass/GlassCard";
import { GlassButton } from "@/components/ui/glass/GlassButton";
import { GlassBadge } from "@/components/ui/glass/GlassBadge";
import {
  Sparkles,
  ExternalLink,
  Maximize2,
  Minimize2,
  RotateCcw,
  Zap,
  TrendingUp,
  ShieldCheck,
  Globe,
} from "lucide-react";
import Link from "next/link";

export default function GoldDeskPage() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(Date.now());

  const handleRefresh = () => {
    setIframeKey(Date.now());
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`space-y-4 pb-10 transition-all duration-300 ${isFullscreen ? "fixed inset-0 z-50 p-4 bg-[#0D1B2A]/95 overflow-hidden" : ""}`}>
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-[#1B263B]/80 p-4 rounded-2xl border dark:border-[#415A77]/30 border-slate-200 shadow-sm backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#D4C4A8]/15 border border-[#D4C4A8]/30 flex items-center justify-center text-[#D4C4A8] shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black dark:text-[#F4F1DE] text-slate-900 font-sans">
                میز تحلیل و اطلاعات چندایجنت طلا
              </h1>
              <GlassBadge variant="gold" className="text-[10px] font-black">
                XAUUSD LIVE TERMINAL
              </GlassBadge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-[#8FA0B5] hover:bg-slate-100 dark:hover:bg-[#0D1B2A] transition-colors border dark:border-[#415A77]/30 border-slate-200 cursor-pointer"
            title="به‌روزرسانی میز تحلیل"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>به‌روزرسانی</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-[#8FA0B5] hover:bg-slate-100 dark:hover:bg-[#0D1B2A] transition-colors border dark:border-[#415A77]/30 border-slate-200 cursor-pointer"
            title={isFullscreen ? "خروج از تمام صفحه" : "مشاهده در حالت تمام صفحه"}
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            <span>{isFullscreen ? "خروج از تمام‌صفحه" : "تمام‌صفحه"}</span>
          </button>

          <a
            href="/xauusd-desk/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black bg-[#D4C4A8] text-[#0D1B2A] shadow-md hover:brightness-105 transition-all cursor-pointer"
          >
            <span>باز کردن در تب جداگانه</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* Embedded Terminal Frame */}
      <div
        className={`w-full rounded-2xl overflow-hidden border dark:border-[#415A77]/30 border-slate-200 shadow-2xl bg-[#0D1B2A] ${
          isFullscreen ? "h-[calc(100vh-100px)]" : "h-[85vh] min-h-[750px]"
        }`}
      >
        <iframe
          key={iframeKey}
          src="/xauusd-desk/index.html"
          title="XAUUSD Multi-Agent Intelligence Terminal"
          className="w-full h-full border-0"
          allow="clipboard-read; clipboard-write"
        />
      </div>
    </div>
  );
}
