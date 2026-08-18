"use client";

import React from "react";
import { GlassCard } from "@/components/ui/glass/GlassCard";
import { GlassBadge } from "@/components/ui/glass/GlassBadge";
import { ShieldCheck, AlertTriangle, AlertOctagon, ShieldAlert, Info } from "lucide-react";

interface DailyDrawdownGuardProps {
  currentBalance: number;
  todayProfit: number;
  initialBalance?: number;
  trades?: any[];
  maxDailyPct?: number; // default 5%
  className?: string;
}

export function DailyDrawdownGuardCard({
  currentBalance,
  todayProfit,
  initialBalance = 10000,
  trades = [],
  maxDailyPct = 5,
  className = "",
}: DailyDrawdownGuardProps) {
  // 1. Calculate Start of Day Balance
  const startOfDayBalance = currentBalance - todayProfit || initialBalance;

  // 2. Max Allowed Daily Loss (5% of start of day balance)
  const maxAllowedDailyLoss = parseFloat(((startOfDayBalance * maxDailyPct) / 100).toFixed(2));

  // 3. Find worst single-day loss observed across all historical days
  const dailyPnlMap: Record<string, number> = {};
  trades.forEach((t) => {
    const rawTime = t.closeTime || t.openTime;
    if (!rawTime) return;
    const dateKey = rawTime.includes("T") ? rawTime.split("T")[0] : rawTime.split(" ")[0];
    const netPnl = (t.profit || 0) + (t.commission || 0) + (t.swap || 0);
    dailyPnlMap[dateKey] = (dailyPnlMap[dateKey] || 0) + netPnl;
  });

  let worstHistoricalDailyLoss = 0;
  Object.values(dailyPnlMap).forEach((pnl) => {
    if (pnl < 0 && Math.abs(pnl) > worstHistoricalDailyLoss) {
      worstHistoricalDailyLoss = Math.abs(pnl);
    }
  });

  // Current active daily loss today (if negative)
  const activeTodayLoss = todayProfit < 0 ? Math.abs(todayProfit) : 0;

  // Observed daily loss (shows today's loss if active, or worst observed loss)
  const observedDailyLoss = activeTodayLoss > 0 ? activeTodayLoss : worstHistoricalDailyLoss || 0;
  const observedDailyLossPct = startOfDayBalance > 0 ? (observedDailyLoss / startOfDayBalance) * 100 : 0;

  // Percentage of the 5% limit consumed (0% to 100%)
  const limitUsagePct = Math.min(100, Math.max(0, (observedDailyLossPct / maxDailyPct) * 100));

  // Remaining daily buffer
  const remainingBuffer = Math.max(0, maxAllowedDailyLoss - observedDailyLoss);
  const remainingBufferPct = Math.max(0, maxDailyPct - observedDailyLossPct);

  // Status computation
  let status: "PASS" | "WARNING" | "BREACHED" = "PASS";
  let badgeVariant: "profit" | "gold" | "loss" = "profit";
  let statusLabel = "STABLE";

  if (observedDailyLossPct >= maxDailyPct) {
    status = "BREACHED";
    badgeVariant = "loss";
    statusLabel = "BREACHED";
  } else if (observedDailyLossPct >= maxDailyPct * 0.7) {
    status = "WARNING";
    badgeVariant = "gold";
    statusLabel = "WARNING";
  }

  return (
    <GlassCard
      glowColor={status === "PASS" ? "cyan" : status === "WARNING" ? "gold" : "red"}
      className={`p-5 sm:p-6 dark:bg-zinc-950 bg-white border dark:border-white/10 border-slate-200 shadow-md space-y-4 ${className}`}
    >
      {/* Header with Title and Status Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {status === "PASS" ? (
            <div className="h-8 w-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <ShieldCheck className="h-4 w-4" />
            </div>
          ) : status === "WARNING" ? (
            <div className="h-8 w-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
              <AlertTriangle className="h-4 w-4" />
            </div>
          ) : (
            <div className="h-8 w-8 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20">
              <AlertOctagon className="h-4 w-4" />
            </div>
          )}
          <div>
            <h3 className="text-base font-black dark:text-white text-slate-900 tracking-tight">
              Max Daily Drawdown
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">5% Daily Prop Firm Loss Guard</p>
          </div>
        </div>

        <GlassBadge variant={badgeVariant} className="font-extrabold px-3 py-1 text-xs">
          {statusLabel}
        </GlassBadge>
      </div>

      {/* Two Main Metric Columns */}
      <div className="grid grid-cols-2 gap-4 pt-1">
        {/* Max Allowed Daily Loss (5%) */}
        <div className="space-y-1">
          <div className="text-2xl sm:text-3xl font-black dark:text-white text-slate-900 font-mono">
            $ {maxAllowedDailyLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Max Allowed Daily Loss (5%)
          </div>
        </div>

        {/* Max Observed Daily Loss */}
        <div className="space-y-1 text-right">
          <div className="text-2xl sm:text-3xl font-black dark:text-rose-400 text-rose-600 font-mono">
            $ {observedDailyLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Max Observed Daily Loss
          </div>
        </div>
      </div>

      {/* Segmented Progress Track Bar (Matching exact user image style) */}
      <div className="space-y-1.5 pt-2">
        <div className="relative h-3 w-full rounded-full bg-slate-100 dark:bg-zinc-800/80 border dark:border-white/5 border-slate-200 overflow-hidden p-0.5">
          {/* Subtle striped background */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:8px_8px]" />

          {/* Active filled loss progress bar */}
          <div
            style={{ width: `${limitUsagePct}%` }}
            className={`h-full rounded-full transition-all duration-700 ${
              status === "PASS"
                ? "bg-gradient-to-r from-emerald-400 to-rose-500"
                : status === "WARNING"
                ? "bg-gradient-to-r from-amber-400 to-rose-500 shadow-[0_0_10px_#f59e0b]"
                : "bg-rose-600 shadow-[0_0_12px_#e11d48]"
            }`}
          />
        </div>

        {/* Labels underneath the progress bar: 5%, Current %, 0% */}
        <div className="flex items-center justify-between text-xs font-mono font-bold dark:text-slate-400 text-slate-600 pt-0.5">
          <span className="dark:text-slate-300 text-slate-700 font-extrabold">{maxDailyPct}%</span>
          <span
            className={`font-black text-xs ${
              status === "PASS"
                ? "dark:text-white text-slate-900"
                : status === "WARNING"
                ? "text-amber-600 dark:text-amber-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {observedDailyLossPct.toFixed(2)}%
          </span>
          <span className="text-slate-400">0%</span>
        </div>
      </div>

      {/* Bottom Buffer Summary Box */}
      <div className="flex items-center justify-between p-2.5 rounded-xl dark:bg-zinc-900/60 bg-slate-50 border dark:border-white/5 border-slate-200 text-xs">
        <span className="text-slate-500 font-medium flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-sky-500" />
          <span>Remaining Loss Buffer:</span>
        </span>
        <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
          ${remainingBuffer.toFixed(2)} ({remainingBufferPct.toFixed(2)}%)
        </span>
      </div>
    </GlassCard>
  );
}
