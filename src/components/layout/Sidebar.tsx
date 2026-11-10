"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "./SidebarContext";
import {
  LayoutDashboard,
  Upload,
  BookOpen,
  LineChart,
  Newspaper,
  Globe,
  Settings,
  Sparkles,
  Bot,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "XAUUSD Gold Desk", href: "/gold-desk", icon: Sparkles },
  { name: "Trade Importer", href: "/import", icon: Upload },
  { name: "Trade Journal", href: "/journal", icon: BookOpen },
  { name: "Advanced Stats & Strategy", href: "/analytics", icon: LineChart },
  { name: "Market Sentiment", href: "/sentiment", icon: Globe },
  { name: "Economic Calendar", href: "/calendar", icon: Newspaper },
  { name: "Settings & AI", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r dark:border-white/10 border-slate-200 dark:bg-black/90 bg-white/95 p-3.5 backdrop-blur-3xl transition-all duration-300 shadow-sm",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3.5 top-7 z-50 flex h-7 w-7 items-center justify-center rounded-full border dark:border-white/20 border-slate-300 dark:bg-zinc-900 bg-white dark:text-cyan-400 text-sky-600 shadow-md hover:scale-110 transition-all cursor-pointer"
        title={isCollapsed ? "Expand Sidebar (باز کردن منو)" : "Collapse Sidebar (بستن کشویی منو)"}
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* Brand Logo & Title */}
      <div className="flex items-center gap-3 px-2 py-3 overflow-hidden">
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border dark:border-cyan-500/40 border-cyan-600 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
          <Image
            src="/logo.jpg"
            alt="My Journal Logo"
            width={44}
            height={44}
            className="h-full w-full object-cover"
            priority
          />
        </div>

        {!isCollapsed && (
          <div className="transition-opacity duration-300">
            <h1 className="text-base font-extrabold tracking-tight dark:text-white text-slate-900 flex items-center gap-1.5 font-sans whitespace-nowrap">
              My Journal <Sparkles className="h-3.5 w-3.5 dark:text-cyan-400 text-sky-600 fill-cyan-400" />
            </h1>
            <p className="text-[10px] font-extrabold dark:text-cyan-400 text-sky-600 tracking-wider uppercase whitespace-nowrap">
              Trading Intelligence AI
            </p>
          </div>
        )}
      </div>

      <div className="my-3 h-px w-full bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent" />

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 py-2 overflow-x-hidden">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              className={cn(
                "group relative flex items-center gap-3.5 rounded-2xl p-3 text-xs font-bold transition-all duration-300",
                isCollapsed ? "justify-center" : "px-4 py-3",
                isActive
                  ? "dark:bg-white/10 bg-sky-50 dark:text-white text-sky-950 border dark:border-white/15 border-sky-200 shadow-sm font-extrabold"
                  : "dark:text-slate-300 text-slate-700 hover:bg-slate-100 dark:hover:bg-white/5 dark:hover:text-white"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-all duration-300",
                  isActive ? "dark:text-cyan-400 text-sky-600 scale-110" : "dark:text-slate-400 text-slate-600 group-hover:text-sky-600"
                )}
              />
              {!isCollapsed && <span className="whitespace-nowrap truncate">{item.name}</span>}

              {isActive && !isCollapsed && (
                <div className="absolute right-3 h-2 w-2 rounded-full dark:bg-cyan-400 bg-sky-600 shadow-[0_0_12px_#06b6d4]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Persian AI Status Box */}
      <div
        className={cn(
          "rounded-2xl border dark:border-purple-500/30 border-purple-200 dark:bg-purple-950/20 bg-purple-50/80 backdrop-blur-xl transition-all duration-300 overflow-hidden",
          isCollapsed ? "p-2.5 text-center" : "p-3.5"
        )}
      >
        <div className={cn("flex items-center gap-2 text-xs font-bold dark:text-purple-300 text-purple-950", isCollapsed && "justify-center")}>
          <Bot className="h-4 w-4 dark:text-purple-400 text-purple-700 shrink-0" />
          {!isCollapsed && <span>موتور هوش مصنوعی فارسی</span>}
        </div>
        {!isCollapsed && (
          <p className="mt-1 text-[11px] dark:text-slate-300 text-slate-700 leading-relaxed font-persian font-medium">
            تحلیل روانشناسی، روانشناسی بازار و ستاپ‌های SMC کاملاً فارسی.
          </p>
        )}
      </div>
    </aside>
  );
}
