"use client";

import React from "react";
import { GlassCard } from "@/components/ui/glass/GlassCard";
import { GlassBadge } from "@/components/ui/glass/GlassBadge";
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Info,
  Target,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Lock,
  CheckCircle2,
} from "lucide-react";

interface DailyDrawdownGuardProps {
  currentBalance: number;
  todayProfit: number;
  initialBalance?: number;
  trades?: any[];
  maxDailyPct?: number; // default 5%
  dailyTargetPct?: number; // default 5%
  className?: string;
}

export function DailyDrawdownGuardCard({
  currentBalance,
  todayProfit,
  initialBalance = 10000,
  trades = [],
  maxDailyPct = 5,
  dailyTargetPct = 5,
  className = "",
}: DailyDrawdownGuardProps) {
  // 1. Calculate Start-of-Day Balance (Balance at 00:00 today)
  const startOfDayBalance = Math.max(1, currentBalance - todayProfit || initialBalance);

  // 2. Max Allowed Daily Loss (5% of Start-of-Day Balance)
  const maxAllowedDailyLoss = parseFloat(((startOfDayBalance * maxDailyPct) / 100).toFixed(2));

  // 3. Daily Profit Target (5% of Start-of-Day Balance)
  const dailyProfitTargetAmount = parseFloat(((startOfDayBalance * dailyTargetPct) / 100).toFixed(2));

  // 4. Today's Loss and Profit Calculations:
  const todayActualLossAmount = todayProfit < 0 ? Math.abs(todayProfit) : 0;
  const todayLossPercent = (todayActualLossAmount / startOfDayBalance) * 100;
  const lossLimitUsagePct = Math.min(100, Math.max(0, (todayLossPercent / maxDailyPct) * 100));

  const todayActualProfitAmount = todayProfit > 0 ? todayProfit : 0;
  const todayProfitPercent = (todayActualProfitAmount / startOfDayBalance) * 100;
  const targetProgressPct = Math.min(100, Math.max(0, (todayActualProfitAmount / dailyProfitTargetAmount) * 100));

  // 5. Remaining Buffers:
  const remainingLossBuffer = Math.max(0, maxAllowedDailyLoss - todayActualLossAmount);
  const remainingLossBufferPct = Math.max(0, maxDailyPct - todayLossPercent);

  const remainingProfitToTarget = Math.max(0, dailyProfitTargetAmount - todayActualProfitAmount);
  const isTargetAchieved = todayActualProfitAmount >= dailyProfitTargetAmount;

  // 6. Drawdown & Profit Status
  let statusBadgeVariant: "profit" | "gold" | "loss" = "profit";
  let statusBadgeLabel = "IN PROFIT";

  if (todayLossPercent >= maxDailyPct) {
    statusBadgeVariant = "loss";
    statusBadgeLabel = "BREACHED";
  } else if (todayLossPercent >= maxDailyPct * 0.7) {
    statusBadgeVariant = "gold";
    statusBadgeLabel = "LOSS WARNING";
  } else if (isTargetAchieved) {
    statusBadgeVariant = "profit";
    statusBadgeLabel = "🎯 TARGET LOCKED";
  } else if (todayActualLossAmount > 0) {
    statusBadgeVariant = "gold";
    statusBadgeLabel = "ACTIVE LOSS";
  }

  return (
    <GlassCard
      glowColor={isTargetAchieved ? "green" : todayLossPercent >= maxDailyPct ? "red" : todayLossPercent >= maxDailyPct * 0.7 ? "gold" : "cyan"}
      className={`flex flex-col justify-between p-5 sm:p-6 dark:bg-zinc-950 bg-white border dark:border-white/10 border-slate-200 shadow-md space-y-5 ${className}`}
    >
      {/* Card Header with Live Status Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-black dark:text-white text-slate-900 tracking-tight">
              Daily Risk & Profit Guard
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">5% Daily Loss & 5% Profit Cap</p>
          </div>
        </div>

        <GlassBadge variant={statusBadgeVariant} className="font-extrabold px-2.5 py-0.5 text-[11px]">
          {statusBadgeLabel}
        </GlassBadge>
      </div>

      {/* Target Locked Psychological Alert Banner */}
      {isTargetAchieved && (
        <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs space-y-1 shadow-sm animate-pulse">
          <div className="flex items-center gap-1.5 font-black">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>سقف سود ۵٪ روزانه تکمیل شد!</span>
          </div>
          <p className="text-[11px] leading-relaxed dark:text-slate-300 text-slate-700 font-medium">
            برای محافظت از سود و جلوگیری از اورتریدینگ (Overtrading)، معاملات امروز را متوقف کنید.
          </p>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTION 1: 5% MAX DAILY LOSS GUARD (میزان ضرر روزانه)         */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-2.5 p-3 rounded-2xl dark:bg-zinc-900/60 bg-slate-50/80 border dark:border-white/5 border-slate-200">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-0.5">
            <div className="text-lg sm:text-xl font-black dark:text-white text-slate-900 font-mono">
              $ {maxAllowedDailyLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
              Max Allowed Daily Loss (5%)
            </div>
          </div>

          <div className="space-y-0.5 text-right">
            <div
              className={`text-lg sm:text-xl font-black font-mono ${
                todayActualLossAmount > 0 ? "dark:text-rose-400 text-rose-600" : "dark:text-emerald-400 text-emerald-600"
              }`}
            >
              {todayActualLossAmount > 0 ? `-$${todayActualLossAmount.toFixed(2)}` : "$ 0.00"}
            </div>
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
              Today&apos;s Daily Loss
            </div>
          </div>
        </div>

        {/* Loss Track Bar */}
        <div className="space-y-1">
          <div className="relative h-2.5 w-full rounded-full bg-slate-200 dark:bg-zinc-800 border dark:border-white/5 border-slate-300 overflow-hidden p-0.5">
            <div
              style={{ width: `${lossLimitUsagePct}%` }}
              className={`h-full rounded-full transition-all duration-700 ${
                todayLossPercent === 0
                  ? "bg-emerald-500 w-1"
                  : todayLossPercent < maxDailyPct * 0.7
                  ? "bg-gradient-to-r from-emerald-400 to-amber-500"
                  : todayLossPercent < maxDailyPct
                  ? "bg-gradient-to-r from-amber-400 to-rose-500 shadow-[0_0_8px_#f59e0b]"
                  : "bg-rose-600 shadow-[0_0_10px_#e11d48]"
              }`}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono font-bold dark:text-slate-400 text-slate-600">
            <span className="dark:text-slate-300 text-slate-700 font-extrabold">{maxDailyPct}%</span>
            <span
              className={`font-black text-[11px] ${
                todayLossPercent === 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : todayLossPercent < maxDailyPct * 0.7
                  ? "dark:text-white text-slate-900"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {todayLossPercent.toFixed(2)}%
            </span>
            <span className="text-slate-400">0%</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 2: 5% DAILY PROFIT CAP & OVERTRADING TARGET (سقف سود) */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-2.5 p-3 rounded-2xl dark:bg-emerald-950/20 bg-emerald-50/60 border dark:border-emerald-500/20 border-emerald-200/80">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-0.5">
            <div className="text-lg sm:text-xl font-black dark:text-emerald-400 text-emerald-700 font-mono">
              +${dailyProfitTargetAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
              Daily Profit Cap (5%)
            </div>
          </div>

          <div className="space-y-0.5 text-right">
            <div
              className={`text-lg sm:text-xl font-black font-mono ${
                todayActualProfitAmount > 0 ? "dark:text-emerald-400 text-emerald-600" : "dark:text-slate-400 text-slate-600"
              }`}
            >
              +${todayActualProfitAmount.toFixed(2)}
            </div>
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
              Today&apos;s Profit
            </div>
          </div>
        </div>

        {/* Profit Progress Bar */}
        <div className="space-y-1">
          <div className="relative h-2.5 w-full rounded-full bg-emerald-100 dark:bg-zinc-800 border dark:border-white/5 border-emerald-200 overflow-hidden p-0.5">
            <div
              style={{ width: `${targetProgressPct}%` }}
              className={`h-full rounded-full transition-all duration-700 ${
                isTargetAchieved
                  ? "bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 shadow-[0_0_12px_#10b981]"
                  : "bg-gradient-to-r from-sky-500 to-emerald-500"
              }`}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono font-bold dark:text-slate-400 text-slate-600">
            <span className="text-slate-400">0%</span>
            <span className="font-black text-[11px] dark:text-emerald-400 text-emerald-600">
              {todayProfitPercent.toFixed(2)}% ({targetProgressPct.toFixed(0)}% of goal)
            </span>
            <span className="dark:text-emerald-400 text-emerald-700 font-extrabold">+{dailyTargetPct}%</span>
          </div>
        </div>
      </div>

      {/* Start-of-Day Context & Remaining Buffers Footer */}
      <div className="space-y-2 pt-1 border-t dark:border-white/10 border-slate-100 text-xs">
        <div className="flex items-center justify-between text-slate-500 font-medium text-[11px]">
          <span>Start-of-Day Balance:</span>
          <span className="font-mono font-bold dark:text-slate-200 text-slate-800">
            ${startOfDayBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-xl dark:bg-zinc-900/70 bg-slate-50 border dark:border-white/5 border-slate-200">
            <span className="text-slate-500 font-medium block text-[10px]">Remaining Loss Buffer:</span>
            <span className="font-mono font-black text-xs text-emerald-600 dark:text-emerald-400 block mt-0.5">
              ${remainingLossBuffer.toFixed(2)} ({remainingLossBufferPct.toFixed(2)}%)
            </span>
          </div>

          <div className="p-2 rounded-xl dark:bg-emerald-950/30 bg-emerald-50 border dark:border-emerald-500/20 border-emerald-200">
            <span className="text-slate-500 font-medium block text-[10px]">
              {isTargetAchieved ? "Daily Cap Status:" : "Remaining to 5% Cap:"}
            </span>
            <span className="font-mono font-black text-xs text-emerald-600 dark:text-emerald-400 block mt-0.5">
              {isTargetAchieved ? "TARGET LOCKED" : `$${remainingProfitToTarget.toFixed(2)}`}
            </span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
