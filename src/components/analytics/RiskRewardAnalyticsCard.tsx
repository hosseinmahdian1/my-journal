"use client";

import React, { useMemo } from "react";
import { Trade, AdvancedStatistics } from "@/types/trade";
import { GlassCard } from "@/components/ui/glass/GlassCard";
import { GlassBadge } from "@/components/ui/glass/GlassBadge";
import { Scale, Target, TrendingUp, CheckCircle, AlertCircle, ArrowUpRight, Zap, Layers } from "lucide-react";

interface RiskRewardCardProps {
  trades: Trade[];
  stats: AdvancedStatistics;
  className?: string;
}

export function RiskRewardAnalyticsCard({ trades, stats, className = "" }: RiskRewardCardProps) {
  // Calculate average realized R:R and trade distributions
  const rrData = useMemo(() => {
    let totalRealizedRR = 0;
    let validRRCount = 0;

    let below1Count = 0;
    let between1and2Count = 0;
    let between2and3Count = 0;
    let above3Count = 0;

    trades.forEach((t) => {
      let rr = t.rrRatio;

      // If rrRatio is not explicitly set, estimate from TP/SL or Win/Loss
      if (!rr || rr <= 0) {
        if (t.takeProfit && t.stopLoss && t.entryPrice) {
          const risk = Math.abs(t.entryPrice - t.stopLoss);
          const reward = Math.abs(t.takeProfit - t.entryPrice);
          if (risk > 0) rr = reward / risk;
        } else {
          const net = (t.profit || 0) + (t.commission || 0) + (t.swap || 0);
          if (net > 0 && stats.averageLossTrade > 0) {
            rr = net / stats.averageLossTrade;
          } else if (net < 0 && stats.averageProfitTrade > 0) {
            rr = stats.averageProfitTrade / Math.abs(net);
          }
        }
      }

      if (rr && rr > 0 && rr < 50) {
        totalRealizedRR += rr;
        validRRCount++;

        if (rr < 1) below1Count++;
        else if (rr >= 1 && rr < 2) between1and2Count++;
        else if (rr >= 2 && rr < 3) between2and3Count++;
        else above3Count++;
      }
    });

    // Average Realized R:R
    const avgRealizedRR = validRRCount > 0
      ? totalRealizedRR / validRRCount
      : stats.rewardToRiskRatio || 1.65;

    // Required Win Rate for this R:R to breakeven: 1 / (1 + RR) * 100
    const requiredWinRate = (1 / (1 + Math.max(0.1, avgRealizedRR))) * 100;
    const currentWinRate = stats.winRate || 50;
    const winRateEdge = currentWinRate - requiredWinRate;

    // Payoff Ratio = Avg Win / Avg Loss
    const payoffRatio = stats.averageLossTrade > 0
      ? stats.averageProfitTrade / stats.averageLossTrade
      : stats.averageProfitTrade > 0 ? 2.5 : 1;

    const totalCalculated = below1Count + between1and2Count + between2and3Count + above3Count || trades.length || 1;

    return {
      avgRealizedRR: parseFloat(avgRealizedRR.toFixed(2)),
      requiredWinRate: parseFloat(requiredWinRate.toFixed(1)),
      currentWinRate: parseFloat(currentWinRate.toFixed(1)),
      winRateEdge: parseFloat(winRateEdge.toFixed(1)),
      payoffRatio: parseFloat(payoffRatio.toFixed(2)),
      distribution: [
        { label: "< 1:1", count: below1Count, pct: Math.round((below1Count / totalCalculated) * 100), color: "bg-[#F87171]", text: "text-[#F87171]" },
        { label: "1:1 - 1:2", count: between1and2Count, pct: Math.round((between1and2Count / totalCalculated) * 100), color: "bg-[#2A2A2A]", text: "text-[#2A2A2A] dark:text-[#9A9A9A]" },
        { label: "1:2 - 1:3", count: between2and3Count, pct: Math.round((between2and3Count / totalCalculated) * 100), color: "bg-[#8B5CF6]", text: "text-[#7C3AED] dark:text-[#8B5CF6]" },
        { label: "1:3+", count: above3Count, pct: Math.round((above3Count / totalCalculated) * 100), color: "bg-[#34D399]", text: "text-[#34D399]" },
      ],
    };
  }, [trades, stats]);

  return (
    <GlassCard
      glowColor="gold"
      className={`p-5 sm:p-6 dark:bg-[#141414]/90 bg-white border dark:border-[#2A2A2A]/35 border-slate-200 shadow-md space-y-5 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b dark:border-[#2A2A2A]/30 border-slate-200 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl dark:bg-[#8B5CF6]/15 text-[#7C3AED] dark:text-[#8B5CF6] flex items-center justify-center border dark:border-[#8B5CF6]/30 border-[#8B5CF6]/40">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-black dark:text-[#EDEDED] text-slate-900 tracking-tight">
              Overall Risk-to-Reward (R:R)
            </h3>
            <p className="text-[11px] dark:text-[#9A9A9A] text-slate-500 font-medium">Account Reward-to-Risk Payoff & Edge</p>
          </div>
        </div>

        <GlassBadge variant={rrData.winRateEdge >= 0 ? "profit" : "loss"} className="font-extrabold px-3 py-1 text-xs">
          {rrData.winRateEdge >= 0 ? `+${rrData.winRateEdge}% Edge` : `${rrData.winRateEdge}% Drag`}
        </GlassBadge>
      </div>

      {/* Main R:R Ratio Numbers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Realized R:R Ratio */}
        <div className="rounded-xl border dark:border-[#2A2A2A]/30 border-slate-200 dark:bg-[#0A0A0A]/80 bg-slate-50/90 p-3 shadow-sm space-y-0.5">
          <span className="text-[11px] font-bold text-slate-500 dark:text-[#9A9A9A] block">Average Realized R:R</span>
          <div className="text-2xl font-black text-[#7C3AED] dark:text-[#8B5CF6] font-mono">
            1 : {rrData.avgRealizedRR}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-[#9A9A9A]/80 font-medium block">Risk $1 to Gain ${rrData.avgRealizedRR}</span>
        </div>

        {/* Payoff Ratio (Avg Win / Avg Loss) */}
        <div className="rounded-xl border dark:border-[#2A2A2A]/30 border-slate-200 dark:bg-[#0A0A0A]/80 bg-slate-50/90 p-3 shadow-sm space-y-0.5">
          <span className="text-[11px] font-bold text-slate-500 dark:text-[#9A9A9A] block">Payoff Ratio</span>
          <div className="text-2xl font-black text-slate-700 dark:text-[#EDEDED] font-mono">
            {rrData.payoffRatio}x
          </div>
          <span className="text-[10px] text-slate-500 dark:text-[#9A9A9A]/80 font-medium block">Avg Win (${stats.averageProfitTrade}) ÷ Avg Loss</span>
        </div>

        {/* Current Win Rate */}
        <div className="rounded-xl border dark:border-[#2A2A2A]/30 border-slate-200 dark:bg-[#0A0A0A]/80 bg-slate-50/90 p-3 shadow-sm space-y-0.5">
          <span className="text-[11px] font-bold text-slate-500 dark:text-[#9A9A9A] block">Current Win Rate</span>
          <div className="text-2xl font-black text-[#34D399] font-mono">
            {rrData.currentWinRate}%
          </div>
          <span className="text-[10px] text-slate-500 dark:text-[#9A9A9A]/80 font-medium block">{stats.winningTrades} Wins / {stats.losingTrades} Losses</span>
        </div>

        {/* Required Win Rate for Breakeven */}
        <div className="rounded-xl border dark:border-[#2A2A2A]/30 border-slate-200 dark:bg-[#0A0A0A]/80 bg-slate-50/90 p-3 shadow-sm space-y-0.5">
          <span className="text-[11px] font-bold text-slate-500 dark:text-[#9A9A9A] block">Required Breakeven Win%</span>
          <div className="text-2xl font-black text-[#F87171] font-mono">
            {rrData.requiredWinRate}%
          </div>
          <span className="text-[10px] text-slate-500 dark:text-[#9A9A9A]/80 font-medium block">Minimum Win% to not lose money</span>
        </div>
      </div>

      {/* R:R Distribution Visual Segments */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold dark:text-[#EDEDED] text-slate-700">
          <span className="flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-[#8B5CF6]" />
            <span>Risk-to-Reward Bracket Distribution</span>
          </span>
          <span className="text-slate-400 dark:text-[#9A9A9A] font-normal">{trades.length} Total Trades Analyzed</span>
        </div>

        {/* Segmented multi-color progress bar */}
        <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-[#0A0A0A] overflow-hidden flex p-0.5 border dark:border-[#2A2A2A]/30 border-slate-200">
          {rrData.distribution.map((d, idx) => (
            <div
              key={idx}
              style={{ width: `${Math.max(d.pct > 0 ? 5 : 0, d.pct)}%` }}
              className={`${d.color} h-full first:rounded-l-full last:rounded-r-full transition-all`}
              title={`${d.label}: ${d.count} trades (${d.pct}%)`}
            />
          ))}
        </div>

        {/* Bracket Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {rrData.distribution.map((d, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl border dark:border-[#2A2A2A]/30 border-slate-200 dark:bg-[#0A0A0A]/60 bg-slate-50 text-center space-y-0.5"
            >
              <div className="flex items-center justify-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${d.color}`} />
                <span className="text-xs font-extrabold text-slate-700 dark:text-[#EDEDED]">{d.label}</span>
              </div>
              <div className={`text-sm font-black font-mono ${d.text}`}>{d.count} Trades</div>
              <div className="text-[10px] text-slate-500 dark:text-[#9A9A9A] font-semibold">{d.pct}% of account</div>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
