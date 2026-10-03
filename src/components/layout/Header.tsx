"use client";

import React, { useState, useEffect } from "react";
import { formatDualDate } from "@/lib/calendar/jalali";
import { GlassBadge } from "@/components/ui/glass/GlassBadge";
import { GlassButton } from "@/components/ui/glass/GlassButton";
import { AccountSwitcher } from "@/components/account/AccountSwitcher";
import { AddTradeModal } from "@/components/journal/AddTradeModal";
import { useSidebar } from "./SidebarContext";
import { ShieldCheck, Calendar, Search, UploadCloud, Sun, Moon, Plus, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import { loadSettings, saveSettings } from "@/lib/storage/store";

export function Header() {
  const [currentDateStr, setCurrentDateStr] = useState("");
  const [calendarMode, setCalendarMode] = useState<"Gregorian" | "Jalali" | "Both">("Both");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isAddTradeOpen, setIsAddTradeOpen] = useState(false);
  const { isCollapsed, toggleSidebar } = useSidebar();

  const applyTheme = (t: "dark" | "light") => {
    if (t === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      document.body.classList.add("dark");
      document.body.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
      document.body.classList.add("light");
      document.body.classList.remove("dark");
    }
  };

  useEffect(() => {
    const savedTheme = (localStorage.getItem("tj_ai_theme") as "dark" | "light") || "dark";
    setTheme(savedTheme);
    applyTheme(savedTheme);

    const settings = loadSettings();
    setCalendarMode(settings.calendarMode || "Both");

    const updateDate = () => {
      setCurrentDateStr(formatDualDate(new Date(), settings.calendarMode || "Both"));
    };
    updateDate();
    const interval = setInterval(updateDate, 60000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("tj_ai_theme", nextTheme);
    applyTheme(nextTheme);
  };

  const toggleCalendarMode = () => {
    const nextMode = calendarMode === "Both" ? "Jalali" : calendarMode === "Jalali" ? "Gregorian" : "Both";
    setCalendarMode(nextMode);
    setCurrentDateStr(formatDualDate(new Date(), nextMode));
    const settings = loadSettings();
    saveSettings({ ...settings, calendarMode: nextMode });
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b dark:border-white/10 border-slate-200 dark:bg-black/80 bg-white/90 px-6 backdrop-blur-2xl transition-colors duration-300 shadow-sm">
      {/* Sidebar Toggle, Search Bar & Multi-Account Switcher */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-xl border dark:border-white/15 border-slate-300 dark:bg-zinc-900/80 bg-slate-100 text-slate-400 hover:text-cyan-400 transition-all cursor-pointer shadow-sm"
          title={isCollapsed ? "Expand Sidebar (باز کردن منوی کشویی)" : "Collapse Sidebar (بستن منوی کشویی)"}
        >
          {isCollapsed ? <PanelLeftOpen className="h-4 w-4 text-cyan-400" /> : <PanelLeftClose className="h-4 w-4 text-slate-400" />}
        </button>

        <AccountSwitcher />

        <div className="relative hidden md:flex items-center">
          <Search className="absolute left-3.5 h-4 w-4 dark:text-slate-400 text-slate-500" />
          <input
            type="text"
            placeholder="Search trades, journal notes, SMC tags, news..."
            className="h-10 w-64 rounded-xl border dark:border-white/10 border-slate-300 dark:bg-zinc-950/80 bg-white pl-10 pr-4 text-xs dark:text-slate-200 text-slate-900 placeholder-slate-400 shadow-sm transition-all focus:w-80 focus:border-sky-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Right Controls: Manual Add Trade, Theme Toggle, Dual Calendar & Import */}
      <div className="flex items-center gap-3">
        {/* Manual Add Trade Button */}
        <GlassButton size="sm" variant="gold" onClick={() => setIsAddTradeOpen(true)}>
          <Plus className="h-4 w-4" />
          <span>Add Trade</span>
        </GlassButton>

        {/* Dark / Light Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          className="flex h-10 w-10 items-center justify-center rounded-xl border dark:border-white/15 border-slate-300 dark:bg-zinc-900/80 bg-slate-100 dark:text-amber-400 text-amber-600 transition-all hover:scale-105 cursor-pointer shadow-sm"
          title={`Current Theme: ${theme.toUpperCase()}. Click to switch mode.`}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Dual Calendar Toggle */}
        <button
          onClick={toggleCalendarMode}
          className="hidden sm:flex items-center gap-2 rounded-xl border dark:border-white/10 border-slate-300 dark:bg-zinc-900/80 bg-white px-3.5 py-2 text-xs font-bold dark:text-slate-200 text-slate-900 shadow-sm hover:border-sky-500 transition-all cursor-pointer"
        >
          <Calendar className="h-3.5 w-3.5 text-amber-500" />
          <span>{currentDateStr || "Loading Date..."}</span>
        </button>

        {/* Quick Import Button */}
        <Link href="/import">
          <GlassButton size="sm" variant="primary">
            <UploadCloud className="h-3.5 w-3.5" />
            <span>Import</span>
          </GlassButton>
        </Link>
      </div>

      {/* Manual Add Trade Modal */}
      <AddTradeModal
        isOpen={isAddTradeOpen}
        onClose={() => setIsAddTradeOpen(false)}
        onTradeAdded={() => window.location.reload()}
      />
    </header>
  );
}
