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
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r dark:border-zinc-800/80 border-zinc-200 dark:bg-zinc-950 bg-white p-3.5 backdrop-blur-xl transition-all duration-300 shadow-sm",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3.5 top-6 z-50 flex h-7 w-7 items-center justify-center rounded-full border dark:border-zinc-700 border-zinc-300 dark:bg-zinc-900 bg-white dark:text-zinc-200 text-zinc-700 shadow-sm hover:scale-110 transition-all cursor-pointer"
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* Brand Logo & Title */}
      <div className="flex items-center gap-3 px-2 py-2 overflow-hidden">
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border dark:border-zinc-800 border-zinc-200 shadow-sm">
          <Image
            src="/logo.jpg"
            alt="My Journal Logo"
            width={40}
            height={40}
            className="h-full w-full object-cover"
            priority
          />
        </div>

        {!isCollapsed && (
          <div className="transition-opacity duration-300">
            <h1 className="text-sm font-extrabold tracking-tight dark:text-white text-zinc-900 flex items-center gap-1.5 font-sans whitespace-nowrap">
              My Journal <Sparkles className="h-3 w-3 text-amber-400 fill-amber-400" />
            </h1>
            <p className="text-[10px] font-bold dark:text-zinc-400 text-zinc-500 tracking-wider uppercase whitespace-nowrap font-mono">
              Fintech Intelligence
            </p>
          </div>
        )}
      </div>

      <div className="my-2.5 h-px w-full bg-zinc-200 dark:bg-zinc-800" />

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 py-1 overflow-x-hidden">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl p-2.5 text-xs font-semibold transition-all duration-200",
                isCollapsed ? "justify-center" : "px-3.5 py-2.5",
                isActive
                  ? "dark:bg-zinc-900 bg-zinc-100 dark:text-white text-zinc-950 border dark:border-zinc-800 border-zinc-200 shadow-sm font-bold"
                  : "dark:text-zinc-400 text-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-100"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors duration-200",
                  isActive ? "dark:text-white text-zinc-950" : "dark:text-zinc-500 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200"
                )}
              />
              {!isCollapsed && <span className="whitespace-nowrap truncate">{item.name}</span>}

              {isActive && !isCollapsed && (
                <div className="absolute right-3 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Persian AI Status Box */}
      <div
        className={cn(
          "rounded-xl border dark:border-zinc-800 border-zinc-200 dark:bg-zinc-900/50 bg-zinc-50/80 backdrop-blur-sm transition-all duration-200 overflow-hidden",
          isCollapsed ? "p-2 text-center" : "p-3"
        )}
      >
        <div className={cn("flex items-center gap-2 text-xs font-bold dark:text-zinc-200 text-zinc-900", isCollapsed && "justify-center")}>
          <Bot className="h-4 w-4 text-emerald-500 shrink-0" />
          {!isCollapsed && <span className="font-persian text-xs">تحلیل هوشمند فارسی</span>}
        </div>
        {!isCollapsed && (
          <p className="mt-1 text-[10px] dark:text-zinc-400 text-zinc-500 leading-relaxed font-persian font-medium">
            روانشناسی معاملات، انضباط و ستاپ‌های پرایس اکشن.
          </p>
        )}
      </div>
    </aside>

  );
}
