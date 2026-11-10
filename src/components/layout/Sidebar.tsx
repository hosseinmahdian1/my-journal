"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "./SidebarContext";
import { loadAccounts, getActiveAccountId } from "@/lib/storage/store";
import { Account } from "@/types/trade";
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
  ShieldCheck,
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, badge: "Overview" },
  { name: "XAUUSD Gold Desk", href: "/gold-desk", icon: Sparkles, badge: "Special" },
  { name: "Trade Journal", href: "/journal", icon: BookOpen, badge: "Notes" },
  { name: "Advanced Analytics", href: "/analytics", icon: LineChart },
  { name: "Trade Importer", href: "/import", icon: Upload },
  { name: "Market Sentiment", href: "/sentiment", icon: Globe },
  { name: "Economic Calendar", href: "/calendar", icon: Newspaper },
  { name: "Settings & AI", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [activeAccount, setActiveAccount] = useState<Account | null>(null);

  useEffect(() => {
    const refreshAccount = () => {
      const accounts = loadAccounts();
      const activeId = getActiveAccountId();
      const current = accounts.find((a) => a.id === activeId) || accounts[0] || null;
      setActiveAccount(current);
    };
    refreshAccount();
    window.addEventListener("storage", refreshAccount);
    window.addEventListener("focus", refreshAccount);
    return () => {
      window.removeEventListener("storage", refreshAccount);
      window.removeEventListener("focus", refreshAccount);
    };
  }, []);

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
        className="absolute -right-3.5 top-6 z-50 flex h-7 w-7 items-center justify-center rounded-full border dark:border-white/20 border-slate-300 dark:bg-zinc-900 bg-white dark:text-cyan-400 text-sky-600 shadow-md hover:scale-110 transition-all cursor-pointer"
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* Brand Logo & Title */}
      <div className="flex items-center gap-3 px-2 py-2 overflow-hidden">
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl border dark:border-cyan-500/40 border-cyan-600 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
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
            <h1 className="text-sm font-extrabold tracking-tight dark:text-white text-slate-900 flex items-center gap-1.5 font-sans whitespace-nowrap">
              My Journal <Sparkles className="h-3 w-3 text-amber-400 fill-amber-400" />
            </h1>
            <p className="text-[9px] font-extrabold dark:text-cyan-400 text-sky-600 tracking-wider uppercase whitespace-nowrap font-mono">
              Fintech & Editorial AI
            </p>
          </div>
        )}
      </div>

      <div className="my-2.5 h-px w-full bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent" />

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 py-1 overflow-x-hidden overflow-y-auto no-scrollbar">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl p-2.5 text-xs font-bold transition-all duration-300",
                isCollapsed ? "justify-center" : "px-3.5 py-2.5",
                isActive
                  ? "dark:bg-white/10 bg-sky-50 dark:text-white text-sky-950 border dark:border-white/15 border-sky-200 shadow-sm font-extrabold"
                  : "dark:text-slate-300 text-slate-700 hover:bg-slate-100 dark:hover:bg-white/5 dark:hover:text-white"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-all duration-300",
                  isActive
                    ? "dark:text-cyan-400 text-sky-600 scale-110"
                    : "dark:text-slate-400 text-slate-500 group-hover:text-sky-600"
                )}
              />
              {!isCollapsed && (
                <div className="flex flex-1 items-center justify-between overflow-hidden">
                  <span className="whitespace-nowrap truncate">{item.name}</span>
                  {item.badge && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-md dark:bg-white/5 bg-slate-200/80 text-slate-400 dark:text-slate-400">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}

              {isActive && !isCollapsed && (
                <div className="absolute right-2 h-1.5 w-1.5 rounded-full dark:bg-cyan-400 bg-sky-600 shadow-[0_0_10px_#06b6d4]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Live Account Status Pill in Sidebar */}
      {!isCollapsed && activeAccount && (
        <div className="mb-2 p-2.5 rounded-xl border dark:border-white/10 border-slate-200 dark:bg-zinc-950/70 bg-slate-50/90 text-xs font-mono">
          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-sans font-bold mb-1">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="h-3 w-3" />
              {activeAccount.broker || "Prop Live"}
            </span>
            <span>{activeAccount.currency || "USD"}</span>
          </div>
          <p className="font-bold text-slate-200 truncate font-sans text-[11px]">
            {activeAccount.name}
          </p>
          <p className="text-xs font-black text-emerald-400 mt-0.5">
            ${(activeAccount.initialBalance || 100000).toLocaleString()}
          </p>
        </div>
      )}

      {/* Persian AI Status Box */}
      <div
        className={cn(
          "rounded-2xl border dark:border-purple-500/30 border-purple-200 dark:bg-purple-950/20 bg-purple-50/80 backdrop-blur-xl transition-all duration-300 overflow-hidden",
          isCollapsed ? "p-2 text-center" : "p-3"
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2 text-xs font-bold dark:text-purple-300 text-purple-950",
            isCollapsed && "justify-center"
          )}
        >
          <Bot className="h-3.5 w-3.5 dark:text-purple-400 text-purple-700 shrink-0" />
          {!isCollapsed && <span className="font-persian text-xs">هوش مصنوعی ژورنال</span>}
        </div>
        {!isCollapsed && (
          <p className="mt-1 text-[10px] dark:text-slate-300 text-slate-700 leading-relaxed font-persian font-medium">
            تحلیل هوشمند ستاپ‌های SMC و سوگیری‌های روانی با فونت فارسی.
          </p>
        )}
      </div>
    </aside>
  );
}
