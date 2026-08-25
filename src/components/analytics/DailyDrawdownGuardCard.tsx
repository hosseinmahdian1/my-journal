"use client";

import React, { useState } from "react";
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
  Flame,
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
  const [activeTab, setActiveTab] = useState<"drawdown" | "profit_target">("drawdown");

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

  // 6. Drawdown Status
  let ddStatus: "PASS" | "WARNING" | "BREACHED" = "PASS";
  let ddBadgeVariant: "profit" | "gold" | "loss" = "profit";
  let ddStatusLabel = "IN PROFIT";

  if (todayLossPercent >= maxDailyPct) {
    ddStatus = "BREACHED";
    ddBadgeVariant = "loss";
    ddStatusLabel = "BREACHED";
  } else if (todayLossPercent >= maxDailyPct * 0.7) {
    ddStatus = "WARNING";
    ddBadgeVariant = "gold";
    ddStatusLabel = "WARNING";
  } else if (todayActualLossAmount > 0) {
    ddStatus = "PASS";
    ddBadgeVariant = "gold";
    ddStatusLabel = "ACTIVE LOSS";
  }

  // 7. Profit Target Status
  let targetStatusLabel = isTargetAchieved ? "TARGET LOCKED" : todayProfit > 0 ? "IN PROGRESS" : "READY";
  let targetBadgeVariant: "profit" | "gold" | "cyan" = isTargetAchieved ? "profit" : todayProfit > 0 ? "cyan" : "gold";

  return (
    <GlassCard
      glowColor={isTargetAchieved ? "green" : ddStatus === "PASS" ? "cyan" : ddStatus === "WARNING" ? "gold" : "red"}
      className={`flex flex-col justify-between p-5 sm:p-6 dark:bg-zinc-950 bg-white border dark:border-white/10 border-slate-200 shadow-md space-y-4 ${className}`}
    >
      {/* Top Header & Tab Pill Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {activeTab === "drawdown" ? (
              ddStatus === "PASS" ? (
                <div className="h-9 w-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              ) : ddStatus === "WARNING" ? (
                <div className="h-9 w-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              ) : (
                <div className="h-9 w-9 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20">
                  <AlertOctagon className="h-5 w-5" />
                </div>
              )
            ) : isTargetAchieved ? (
              <div className="h-9 w-9 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.3)] animate-pulse">
                <Lock className="h-5 w-5" />
              </div>
            ) : (
              <div className="h-9 w-9 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                <Target className="h-5 w-5" />
              </div>
            )}

            <div>
              <h3 className="text-sm font-black dark:text-white text-slate-900 tracking-tight">
                {activeTab === "drawdown" ? "Max Daily Drawdown" : "Daily Profit Target & Cap"}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {activeTab === "drawdown" ? "5% Daily Loss Guard" : "5% Daily Profit & Overtrading Shield"}
              </p>
            </div>
          </div>

          <GlassBadge
            variant={activeTab === "drawdown" ? ddBadgeVariant : targetBadgeVariant}
            className="font-extrabold px-2.5 py-0.5 text-[11px]"
          >
            {activeTab === "drawdown" ? ddStatusLabel : targetStatusLabel}
          </GlassBadge>
        </div>

        {/* Tab Switcher Pills */}
        <div className="grid grid-cols-2 gap-1 p-1 rounded-xl dark:bg-zinc-900 bg-slate-100 border dark:border-white/5 border-slate-200 text-xs font-bold shadow-inner">
          <button
            onClick={() => setActiveTab("drawdown")}
            className={`py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "drawdown"
                ? "bg-white dark:bg-zinc-800 dark:text-cyan-400 text-sky-700 shadow-sm font-extrabold"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Loss Guard (5%)</span>
          </button>

          <button
            onClick={() => setActiveTab("profit_target")}
            className={`py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "profit_target"
                ? "bg-white dark:bg-zinc-800 dark:text-emerald-400 text-emerald-700 shadow-sm font-extrabold"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <Target className="h-3.5 w-3.5" />
            <span>Profit Cap (5%)</span>
          </button>
        </div>
      </div>

      {/* Overtrading Warning Banner when 5% Daily Target is Hit */}
      {isTargetAchieved && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs space-y-1 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-1.5 font-black">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>تارگت ۵٪ روزانه محقق شد! (سقف سود روزانه)</span>
          </div>
          <p className="text-[11px] leading-relaxed dark:text-slate-300 text-slate-700 font-medium">
            برای محافظت از سود کسب‌شده و جلوگیری از تله اورتریدینگ (Overtrading)، معاملات امروز را ببندید.
          </p>
        </div>
      )}

      {/* TAB 1: DRAWDOWN VIEW */}
      {activeTab === "drawdown" && (
        <>
          {/* Two Metric Numbers */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-0.5">
              <div className="text-xl sm:text-2xl font-black dark:text-white text-slate-900 font-mono">
                $ {maxAllowedDailyLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Max Allowed Daily Loss (5%)
              </div>
            </div>

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

          {/* Segmented Loss Progress Track Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="relative h-3 w-full rounded-full bg-slate-100 dark:bg-zinc-800/80 border dark:border-white/5 border-slate-200 overflow-hidden p-0.5">
              <div
                style={{ width: `${lossLimitUsagePct}%` }}
                className={`h-full rounded-full transition-all duration-700 ${
                  todayLossPercent === 0
                    ? "bg-emerald-500 w-1"
                    : ddStatus === "PASS"
                    ? "bg-gradient-to-r from-emerald-400 to-rose-500"
                    : ddStatus === "WARNING"
                    ? "bg-gradient-to-r from-amber-400 to-rose-500 shadow-[0_0_10px_#f59e0b]"
                    : "bg-rose-600 shadow-[0_0_12px_#e11d48]"
                }`}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-mono font-bold dark:text-slate-400 text-slate-600">
              <span className="dark:text-slate-300 text-slate-700 font-extrabold">{maxDailyPct}%</span>
              <span
                className={`font-black text-xs ${
                  todayLossPercent === 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : ddStatus === "PASS"
                    ? "dark:text-white text-slate-900"
                    : ddStatus === "WARNING"
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {todayLossPercent.toFixed(2)}%
              </span>
              <span className="text-slate-400">0%</span>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: PROFIT TARGET & CAP VIEW */}
      {activeTab === "profit_target" && (
        <>
          {/* Two Metric Numbers */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-0.5">
              <div className="text-xl sm:text-2xl font-black dark:text-emerald-400 text-emerald-700 font-mono">
                +${dailyProfitTargetAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Daily Profit Cap (5%)
              </div>
            </div>

            <div className="space-y-0.5 text-right">
              <div
                className={`text-xl sm:text-2xl font-black font-mono ${
                  todayActualProfitAmount > 0 ? "dark:text-emerald-400 text-emerald-600" : "dark:text-slate-400 text-slate-600"
                }`}
              >
                +${todayActualProfitAmount.toFixed(2)}
              </div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Today&apos;s Profit
              </div>
            </div>
          </div>

          {/* Target Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="relative h-3 w-full rounded-full bg-slate-100 dark:bg-zinc-800/80 border dark:border-white/5 border-slate-200 overflow-hidden p-0.5">
              <div
                style={{ width: `${targetProgressPct}%` }}
                className={`h-full rounded-full transition-all duration-700 ${
                  isTargetAchieved
                    ? "bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 shadow-[0_0_12px_#10b981]"
                    : "bg-gradient-to-r from-sky-500 to-emerald-500"
                }`}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-mono font-bold dark:text-slate-400 text-slate-600">
              <span className="text-slate-400">0%</span>
              <span className="font-black text-xs dark:text-emerald-400 text-emerald-600">
                {todayProfitPercent.toFixed(2)}% ({targetProgressPct.toFixed(0)}% of goal)
              </span>
              <span className="dark:text-emerald-400 text-emerald-700 font-extrabold">+{dailyTargetPct}%</span>
            </div>
          </div>
        </>
      )}

      {/* Start-of-Day Context & Remaining Buffer Footer */}
      <div className="space-y-2 pt-2 border-t dark:border-white/10 border-slate-100 text-xs">
        <div className="flex items-center justify-between text-slate-500 font-medium">
          <span>Start-of-Day Balance:</span>
          <span className="font-mono font-bold dark:text-slate-200 text-slate-800">
            ${startOfDayBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {activeTab === "drawdown" ? (
          <div className="flex items-center justify-between p-2 rounded-xl dark:bg-zinc-900/60 bg-slate-50 border dark:border-white/5 border-slate-200">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <Info className="h-3.5 w-3.5 text-sky-500" />
              <span>Remaining Loss Buffer:</span>
            </span>
            <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
              ${remainingLossBuffer.toFixed(2)} ({remainingLossBufferPct.toFixed(2)}%)
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between p-2 rounded-xl dark:bg-zinc-900/60 bg-slate-50 border dark:border-white/5 border-slate-200">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <Target className="h-3.5 w-3.5 text-emerald-500" />
              <span>{isTargetAchieved ? "Profit Protected:" : "Remaining to 5% Cap:"}</span>
            </span>
            <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
              {isTargetAchieved ? "TARGET COMPLETED" : `$${remainingProfitToTarget.toFixed(2)}`}
            </span>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
