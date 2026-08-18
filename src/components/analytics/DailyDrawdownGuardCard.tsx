"use client";

import React from "react";
import { GlassCard } from "@/components/ui/glass/GlassCard";
import { GlassBadge } from "@/components/ui/glass/GlassBadge";
import { ShieldCheck, AlertTriangle, AlertOctagon, Info, ArrowDownRight, TrendingDown } from "lucide-react";

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
  // 1. Calculate Start-of-Day Balance (Balance at 00:00 today)
  // Start-of-Day Balance = Current Balance - Today's Net Profit/Loss
  const startOfDayBalance = Math.max(1, currentBalance - todayProfit || initialBalance);

  // 2. Max Allowed Daily Loss (Exactly 5% of Start-of-Day Balance)
  const maxAllowedDailyLoss = parseFloat(((startOfDayBalance * maxDailyPct) / 100).toFixed(2));

  // 3. Today's Actual Loss Calculation:
  // If today is in profit (todayProfit >= 0), today's loss is $0.00 (0.00%)
  // If today is in loss (todayProfit < 0), today's loss is |todayProfit|
  const todayActualLossAmount = todayProfit < 0 ? Math.abs(todayProfit) : 0;
  const todayLossPercent = (todayActualLossAmount / startOfDayBalance) * 100;

  // 4. Percentage of the 5% limit consumed (0% to 100%)
  const limitUsagePct = Math.min(100, Math.max(0, (todayLossPercent / maxDailyPct) * 100));

  // 5. Remaining daily loss buffer before hitting the 5% limit
  const remainingBufferAmount = Math.max(0, maxAllowedDailyLoss - todayActualLossAmount);
  const remainingBufferPercent = Math.max(0, maxDailyPct - todayLossPercent);

  // 6. Status Badge calculation
  let status: "PASS" | "WARNING" | "BREACHED" = "PASS";
  let badgeVariant: "profit" | "gold" | "loss" = "profit";
  let statusLabel = "STABLE";

  if (todayLossPercent >= maxDailyPct) {
    status = "BREACHED";
    badgeVariant = "loss";
    statusLabel = "BREACHED";
  } else if (todayLossPercent >= maxDailyPct * 0.7) {
    status = "WARNING";
    badgeVariant = "gold";
    statusLabel = "WARNING";
  } else if (todayActualLossAmount === 0 && todayProfit > 0) {
    status = "PASS";
    badgeVariant = "profit";
    statusLabel = "IN PROFIT";
  }

  return (
    <GlassCard
      glowColor={status === "PASS" ? "cyan" : status === "WARNING" ? "gold" : "red"}
      className={`flex flex-col justify-between p-5 sm:p-6 dark:bg-zinc-950 bg-white border dark:border-white/10 border-slate-200 shadow-md space-y-4 ${className}`}
    >
      {/* Card Header with Status Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
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
            <h3 className="text-sm font-black dark:text-white text-slate-900 tracking-tight">
              Max Daily Drawdown
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">5% Daily Prop Firm Loss Guard</p>
          </div>
        </div>

        <GlassBadge variant={badgeVariant} className="font-extrabold px-2.5 py-0.5 text-[11px]">
          {statusLabel}
        </GlassBadge>
      </div>

      {/* Two Metric Numbers */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        {/* Max Allowed Daily Loss (5%) */}
        <div className="space-y-0.5">
          <div className="text-xl sm:text-2xl font-black dark:text-white text-slate-900 font-mono">
            $ {maxAllowedDailyLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
            Max Allowed Daily Loss (5%)
          </div>
        </div>

        {/* Today's Daily Loss */}
        <div className="space-y-0.5 text-right">
          <div
            className={`text-xl sm:text-2xl font-black font-mono ${
              todayActualLossAmount > 0 ? "dark:text-rose-400 text-rose-600" : "dark:text-emerald-400 text-emerald-600"
            }`}
          >
            {todayActualLossAmount > 0 ? `-$${todayActualLossAmount.toFixed(2)}` : "$ 0.00"}
          </div>
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
            Today&apos;s Daily Loss
          </div>
        </div>
      </div>

      {/* Segmented Progress Track Bar (Visual 0% to 5% loss bar) */}
      <div className="space-y-1.5 pt-1">
        <div className="relative h-3 w-full rounded-full bg-slate-100 dark:bg-zinc-800/80 border dark:border-white/5 border-slate-200 overflow-hidden p-0.5">
          {/* Subtle pattern background */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:8px_8px]" />

          {/* Active loss filled progress bar */}
          <div
            style={{ width: `${limitUsagePct}%` }}
            className={`h-full rounded-full transition-all duration-700 ${
              todayLossPercent === 0
                ? "bg-emerald-500 w-1"
                : status === "PASS"
                ? "bg-gradient-to-r from-emerald-400 to-rose-500"
                : status === "WARNING"
                ? "bg-gradient-to-r from-amber-400 to-rose-500 shadow-[0_0_10px_#f59e0b]"
                : "bg-rose-600 shadow-[0_0_12px_#e11d48]"
            }`}
          />
        </div>

        {/* Scale labels underneath: 5%, Current %, 0% */}
        <div className="flex items-center justify-between text-xs font-mono font-bold dark:text-slate-400 text-slate-600">
          <span className="dark:text-slate-300 text-slate-700 font-extrabold">{maxDailyPct}%</span>
          <span
            className={`font-black text-xs ${
              todayLossPercent === 0
                ? "text-emerald-600 dark:text-emerald-400"
                : status === "PASS"
                ? "dark:text-white text-slate-900"
                : status === "WARNING"
                ? "text-amber-600 dark:text-amber-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {todayLossPercent.toFixed(2)}%
          </span>
          <span className="text-slate-400">0%</span>
        </div>
      </div>

      {/* Start-of-Day Context & Remaining Buffer Footer */}
      <div className="space-y-2 pt-2 border-t dark:border-white/10 border-slate-100 text-xs">
        <div className="flex items-center justify-between text-slate-500 font-medium">
          <span>Start-of-Day Balance:</span>
          <span className="font-mono font-bold dark:text-slate-200 text-slate-800">
            ${startOfDayBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-xl dark:bg-zinc-900/60 bg-slate-50 border dark:border-white/5 border-slate-200">
          <span className="text-slate-500 font-medium flex items-center gap-1">
            <Info className="h-3.5 w-3.5 text-sky-500" />
            <span>Remaining Loss Buffer:</span>
          </span>
          <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
            ${remainingBufferAmount.toFixed(2)} ({remainingBufferPercent.toFixed(2)}%)
          </span>
        </div>
      </div>
    </GlassCard>
  );
}
