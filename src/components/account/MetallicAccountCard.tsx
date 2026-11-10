"use client";

import React, { useState } from "react";
import { CreditCard, RotateCcw, ShieldCheck, Zap, Sparkles, TrendingUp, TrendingDown, Award } from "lucide-react";
import { Account } from "@/types/trade";

interface MetallicAccountCardProps {
  account?: Account | null;
  totalBalance?: number;
  equity?: number;
  todayPnL?: number;
  todayPnLPercent?: number;
  winRate?: number;
  activeStreak?: number;
}

export function MetallicAccountCard({
  account,
  totalBalance = 100000,
  equity = 104850,
  todayPnL = 850,
  todayPnLPercent = 0.82,
  winRate = 68.4,
  activeStreak = 4,
}: MetallicAccountCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const accountName = account?.name || "Master Prop Portfolio";
  const brokerName = account?.broker || "FTMO Global Liquid";
  const currency = account?.currency || "USD";
  const initialBal = account?.initialBalance || 100000;
  const isProfitToday = todayPnL >= 0;

  return (
    <div className="relative w-full max-w-md mx-auto perspective-1000 h-[220px] select-none">
      <div
        className={`relative w-full h-full transition-transform duration-700 transform-style-3d cursor-pointer ${
          isFlipped ? "rotate-y-180" : ""
        }`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* ================= FRONT SIDE ================= */}
        <div className="absolute inset-0 w-full h-full rounded-2xl p-5 backface-hidden shadow-metallic-dark border dark:border-white/15 border-slate-300 dark:bg-gradient-to-br dark:from-zinc-900 dark:via-slate-900 dark:to-zinc-950 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white flex flex-col justify-between overflow-hidden">
          {/* Subtle Metallic Brushed Shimmer */}
          <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-gradient-to-br from-cyan-500/20 to-transparent blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-56 h-56 rounded-full bg-gradient-to-tr from-amber-500/15 to-transparent blur-3xl pointer-events-none" />

          {/* Top Bar: Chip + Account Type + Flip Prompt */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2.5">
              {/* Golden EMV Chip Simulation */}
              <div className="w-9 h-7 rounded-md bg-gradient-to-tr from-amber-300 via-amber-400 to-yellow-600 border border-amber-200/50 shadow-inner flex items-center justify-center">
                <div className="w-5 h-4 border border-amber-800/40 rounded-[2px] grid grid-cols-2 gap-0.5 opacity-60">
                  <div className="border-b border-amber-800/40" />
                  <div className="border-b border-amber-800/40" />
                </div>
              </div>
              <div>
                <h3 className="text-xs font-extrabold tracking-wide text-slate-100 flex items-center gap-1.5">
                  {accountName}
                  <Sparkles className="h-3 w-3 text-amber-400 fill-amber-400" />
                </h3>
                <p className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">
                  {brokerName}
                </p>
              </div>
            </div>

            <button
              type="button"
              className="flex items-center gap-1 text-[10px] font-semibold text-cyan-300 hover:text-cyan-200 bg-white/10 hover:bg-white/15 px-2 py-1 rounded-lg backdrop-blur-sm transition-all"
              title="Click to flip for risk limits"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Specs</span>
            </button>
          </div>

          {/* Center: Large Balance & Equity */}
          <div className="my-auto z-10">
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
              Total Equity Balance
            </p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-2xl font-black font-mono tracking-tight text-white">
                ${equity.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <span className="text-xs font-bold text-slate-400">{currency}</span>
            </div>
          </div>

          {/* Bottom Row: Today PnL & Win Rate Badge */}
          <div className="flex items-center justify-between z-10 pt-2 border-t border-white/10 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400 uppercase font-sans">Today:</span>
              <span
                className={`font-bold flex items-center ${
                  isProfitToday ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {isProfitToday ? (
                  <TrendingUp className="h-3 w-3 mr-0.5 inline" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-0.5 inline" />
                )}
                {isProfitToday ? "+" : ""}${todayPnL.toLocaleString("en-US", { minimumFractionDigits: 2 })} ({isProfitToday ? "+" : ""}{todayPnLPercent}%)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-sans font-bold flex items-center gap-1">
                <Award className="h-2.5 w-2.5" />
                {winRate}% Win
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-sans font-bold">
                {activeStreak}D Streak
              </span>
            </div>
          </div>
        </div>

        {/* ================= BACK SIDE (RISK RULES) ================= */}
        <div className="absolute inset-0 w-full h-full rounded-2xl p-5 backface-hidden rotate-y-180 shadow-metallic-dark border dark:border-white/15 border-slate-300 dark:bg-gradient-to-bl dark:from-zinc-950 dark:via-slate-900 dark:to-zinc-900 bg-gradient-to-bl from-slate-950 via-slate-900 to-indigo-950 text-white flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Risk Guard & Prop Limits
              </span>
            </div>
            <span className="text-[10px] text-cyan-300 font-mono">Leverage 1:100</span>
          </div>

          <div className="grid grid-cols-2 gap-3 my-auto py-1 text-xs">
            <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
              <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                Initial Balance
              </p>
              <p className="text-sm font-black font-mono text-slate-100">
                ${initialBal.toLocaleString()}
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
              <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                Max Daily Loss
              </p>
              <p className="text-sm font-black font-mono text-rose-400">
                5.0% (${(initialBal * 0.05).toLocaleString()})
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
              <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                Max Trailing DD
              </p>
              <p className="text-sm font-black font-mono text-amber-400">
                10.0% (${(initialBal * 0.1).toLocaleString()})
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
              <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                Target Milestone
              </p>
              <p className="text-sm font-black font-mono text-emerald-400">
                +10.0% (${(initialBal * 0.1).toLocaleString()})
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] text-slate-400">
            <span>Click anywhere to flip back</span>
            <span className="text-cyan-300 font-semibold">Active Protection ON</span>
          </div>
        </div>
      </div>
    </div>
  );
}
