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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b dark:border-zinc-800/80 border-zinc-200 dark:bg-zinc-950/85 bg-white/95 px-6 backdrop-blur-xl transition-colors duration-200 shadow-sm">
      {/* Sidebar Toggle, Search Bar & Multi-Account Switcher */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-xl border dark:border-zinc-800 border-zinc-200 dark:bg-zinc-900 bg-zinc-100 text-zinc-400 hover:text-zinc-100 transition-all cursor-pointer shadow-sm"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <PanelLeftOpen className="h-4 w-4 text-zinc-300" /> : <PanelLeftClose className="h-4 w-4 text-zinc-400" />}
        </button>

        <AccountSwitcher />

        <div className="relative hidden md:flex items-center">
          <Search className="absolute left-3.5 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search trades, journal notes, SMC tags..."
            className="h-9 w-60 rounded-xl border dark:border-zinc-800 border-zinc-200 dark:bg-zinc-900 bg-zinc-100 pl-9 pr-4 text-xs dark:text-zinc-100 text-zinc-900 placeholder-zinc-400 shadow-sm transition-all focus:w-72 focus:border-zinc-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Right Controls: Manual Add Trade, Theme Toggle, Dual Calendar & Import */}
      <div className="flex items-center gap-2.5">
        {/* Manual Add Trade Button */}
        <GlassButton size="sm" variant="primary" onClick={() => setIsAddTradeOpen(true)}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          <span>Add Trade</span>
        </GlassButton>

        {/* Dark / Light Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-xl border dark:border-zinc-800 border-zinc-200 dark:bg-zinc-900 bg-zinc-100 text-zinc-400 hover:text-zinc-100 transition-all cursor-pointer shadow-sm"
          title={`Current Theme: ${theme.toUpperCase()}. Click to switch mode.`}
        >
          {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-zinc-600" />}
        </button>

        {/* Dual Calendar Toggle */}
        <button
          onClick={toggleCalendarMode}
          className="hidden sm:flex items-center gap-2 rounded-xl border dark:border-zinc-800 border-zinc-200 dark:bg-zinc-900 bg-zinc-100 px-3 py-1.5 text-xs font-semibold dark:text-zinc-200 text-zinc-800 shadow-sm hover:border-zinc-400 transition-all cursor-pointer font-persian"
        >
          <Calendar className="h-3.5 w-3.5 text-amber-500" />
          <span>{currentDateStr || "Loading Date..."}</span>
        </button>

        {/* Quick Import Button */}
        <Link href="/import">
          <GlassButton size="sm" variant="secondary">
            <UploadCloud className="h-3.5 w-3.5 mr-1" />
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
