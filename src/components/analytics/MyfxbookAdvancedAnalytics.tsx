"use client";

import React, { useState, useMemo } from "react";
import { Trade, AdvancedStatistics } from "@/types/trade";
import { GlassCard } from "@/components/ui/glass/GlassCard";
import { GlassBadge } from "@/components/ui/glass/GlassBadge";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
} from "recharts";
import {
  BarChart2,
  Table as TableIcon,
  Clock,
  Calendar,
  AlertTriangle,
  Timer,
  Compass,
  FileSpreadsheet,
  Globe,
} from "lucide-react";

interface MyfxbookProps {
  trades: Trade[];
  stats: AdvancedStatistics;
  initialBalance?: number;
}

// Custom High-Contrast Tooltip for MAE/MFE Scatter Chart
const CustomScatterTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isWin = data.profit >= 0;
    return (
      <div className="rounded-xl border dark:border-white/15 border-slate-200 dark:bg-slate-950/95 bg-white p-3.5 shadow-2xl backdrop-blur-md text-xs space-y-2 min-w-[190px] z-50">
        <div className="flex items-center justify-between border-b dark:border-white/10 border-slate-200 pb-1.5">
          <span className="font-extrabold dark:text-white text-slate-900 text-sm">{data.trade}</span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-black ${
              isWin
                ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30"
                : "bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30"
            }`}
          >
            {isWin ? "WIN" : "LOSS"}
          </span>
        </div>
        <div className="space-y-1.5 font-mono text-[11px]">
          <div className="flex justify-between items-center">
            <span className="dark:text-slate-400 text-slate-600 font-sans font-medium">MAE (Drawdown):</span>
            <span className="font-bold text-rose-600 dark:text-rose-400">${data.mae}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="dark:text-slate-400 text-slate-600 font-sans font-medium">MFE (Peak Run):</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">${data.mfe}</span>
          </div>
          <div className="flex justify-between items-center pt-1.5 border-t dark:border-white/10 border-slate-100">
            <span className="dark:text-slate-300 text-slate-700 font-sans font-bold">Net P/L:</span>
            <span
              className={`font-black text-xs ${
                isWin ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {isWin ? "+" : ""}${data.profit}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Custom High-Contrast Tooltip for Hourly and Daily Bar Charts
const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const winners = payload.find((p: any) => p.dataKey === "winners")?.value || 0;
    const losers = payload.find((p: any) => p.dataKey === "losers")?.value || 0;
    const total = winners + losers;
    const winRate = total > 0 ? Math.round((winners / total) * 100) : 0;

    return (
      <div className="rounded-xl border dark:border-white/15 border-slate-200 dark:bg-slate-950/95 bg-white p-3.5 shadow-2xl backdrop-blur-md text-xs space-y-2 min-w-[170px] z-50">
        <div className="flex items-center justify-between border-b dark:border-white/10 border-slate-200 pb-1.5">
          <span className="font-extrabold dark:text-white text-slate-900 text-sm">
            {typeof label === "number" ? `${label}:00` : label}
          </span>
          <span className="text-[10px] font-bold dark:text-slate-400 text-slate-600">
            {total} Trades
          </span>
        </div>
        <div className="space-y-1 text-[11px] font-mono">
          <div className="flex justify-between items-center text-emerald-700 dark:text-emerald-400">
            <span className="font-sans font-medium">Winners:</span>
            <span className="font-bold">{winners}</span>
          </div>
          <div className="flex justify-between items-center text-purple-700 dark:text-purple-400">
            <span className="font-sans font-medium">Losers:</span>
            <span className="font-bold">{losers}</span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t dark:border-white/10 border-slate-100 text-slate-900 dark:text-white font-sans font-bold">
            <span>Win Rate:</span>
            <span>{winRate}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function MyfxbookAdvancedAnalytics({
  trades,
  stats,
  initialBalance = 10000,
}: MyfxbookProps) {
  const [activeTab, setActiveTab] = useState<
    | "advanced"
    | "trades"
    | "summary"
    | "hourly"
    | "daily"
    | "risk_of_ruin"
    | "duration"
    | "mae_mfe"
  >("advanced");

  // Timezone toggle for Hourly & Daily analysis
  const [timezoneMode, setTimezoneMode] = useState<"server" | "tehran" | "utc" | "ny">("server");

  // Helper to calculate pips for any symbol
  const getTradePips = (t: Trade): number => {
    if (t.pipsGained !== undefined && t.pipsGained !== 0) return t.pipsGained;
    const sym = (t.symbol || "XAUUSD").toUpperCase();
    const entry = t.entryPrice || 0;
    const exit = t.exitPrice || 0;
    if (entry === 0 || exit === 0) return 0;

    let multiplier = 10000;
    if (sym.includes("JPY")) multiplier = 100;
    else if (sym.includes("XAU") || sym.includes("GOLD")) multiplier = 10;
    else if (
      sym.includes("BTC") ||
      sym.includes("ETH") ||
      sym.includes("US30") ||
      sym.includes("NAS") ||
      sym.includes("SPX")
    )
      multiplier = 1;

    const diff = (exit - entry) * (t.orderType === "BUY" ? 1 : -1);
    return Math.round(diff * multiplier * 10) / 10;
  };

  // Helper date format: "Jul 08" or "Aug 14"
  const formatShortDate = (isoStr?: string) => {
    if (!isoStr) return "";
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
  };

  // Comprehensive analytics calculation
  const computedData = useMemo(() => {
    let totalPips = 0;
    let totalLots = 0;
    let totalCommissions = 0;

    let bestTradeDollar: { profit: number; date: string } = { profit: -Infinity, date: "" };
    let worstTradeDollar: { profit: number; date: string } = { profit: Infinity, date: "" };
    let bestTradePips: { pips: number; date: string } = { pips: -Infinity, date: "" };
    let worstTradePips: { pips: number; date: string } = { pips: Infinity, date: "" };

    let winPipsTotal = 0;
    let lossPipsTotal = 0;
    let winningTradesCount = 0;
    let losingTradesCount = 0;

    // Symbol Summary aggregation
    const symbolMap: Record<
      string,
      {
        longTrades: number;
        longPips: number;
        longProfit: number;
        longWins: number;
        shortTrades: number;
        shortPips: number;
        shortProfit: number;
        shortWins: number;
      }
    > = {};

    // Hourly Distribution (0 to 23)
    const hourlyCounts: Record<number, { hour: number; winners: number; losers: number }> = {};
    for (let h = 0; h < 24; h++) {
      hourlyCounts[h] = { hour: h, winners: 0, losers: 0 };
    }

    // Daily Distribution (Monday to Friday)
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dailyCounts: Record<string, { day: string; winners: number; losers: number; total: number }> = {
      Monday: { day: "Monday", winners: 0, losers: 0, total: 0 },
      Tuesday: { day: "Tuesday", winners: 0, losers: 0, total: 0 },
      Wednesday: { day: "Wednesday", winners: 0, losers: 0, total: 0 },
      Thursday: { day: "Thursday", winners: 0, losers: 0, total: 0 },
      Friday: { day: "Friday", winners: 0, losers: 0, total: 0 },
    };

    // Duration brackets
    const durationBuckets = [
      { label: "< 5m", count: 0, profit: 0 },
      { label: "5m - 15m", count: 0, profit: 0 },
      { label: "15m - 1h", count: 0, profit: 0 },
      { label: "1h - 4h", count: 0, profit: 0 },
      { label: "4h - 24h", count: 0, profit: 0 },
      { label: "> 1d", count: 0, profit: 0 },
    ];

    trades.forEach((t) => {
      const netProfit = (t.profit || 0) + (t.commission || 0) + (t.swap || 0);
      const pips = getTradePips(t);
      const lots = t.lotSize || 0.1;
      const comm = (t.commission || 0) + (t.swap || 0);
      const dateStr = formatShortDate(t.closeTime || t.openTime);

      totalPips += pips;
      totalLots += lots;
      totalCommissions += comm;

      // Best / Worst
      if (netProfit > bestTradeDollar.profit) bestTradeDollar = { profit: netProfit, date: dateStr };
      if (netProfit < worstTradeDollar.profit) worstTradeDollar = { profit: netProfit, date: dateStr };
      if (pips > bestTradePips.pips) bestTradePips = { pips, date: dateStr };
      if (pips < worstTradePips.pips) worstTradePips = { pips, date: dateStr };

      if (netProfit > 0) {
        winningTradesCount++;
        winPipsTotal += pips;
      } else if (netProfit < 0) {
        losingTradesCount++;
        lossPipsTotal += pips;
      }

      // Symbol stats
      const sym = (t.symbol || "XAUUSD").toUpperCase();
      if (!symbolMap[sym]) {
        symbolMap[sym] = {
          longTrades: 0,
          longPips: 0,
          longProfit: 0,
          longWins: 0,
          shortTrades: 0,
          shortPips: 0,
          shortProfit: 0,
          shortWins: 0,
        };
      }

      if (t.orderType === "BUY") {
        symbolMap[sym].longTrades++;
        symbolMap[sym].longPips += pips;
        symbolMap[sym].longProfit += netProfit;
        if (netProfit > 0) symbolMap[sym].longWins++;
      } else {
        symbolMap[sym].shortTrades++;
        symbolMap[sym].shortPips += pips;
        symbolMap[sym].shortProfit += netProfit;
        if (netProfit > 0) symbolMap[sym].shortWins++;
      }

      // Hourly & Daily Calculation with Timezone conversion
      const rawDate = t.openTime || t.closeTime;
      if (rawDate) {
        let hr = 0;
        let dayName = "Monday";
        const d = new Date(rawDate);

        // 1. Extract raw server hour from timestamp string (e.g. "06:12")
        let rawServerHour = d.getHours();
        const timeMatch = String(rawDate).match(/[T\s](\d{2}):/);
        if (timeMatch) {
          rawServerHour = parseInt(timeMatch[1], 10);
        }

        if (!isNaN(d.getTime())) {
          if (timezoneMode === "server") {
            // Raw Broker Server Time (MT4/MT5 as recorded on ticket)
            hr = rawServerHour % 24;
            dayName = dayNames[d.getDay()];
          } else if (timezoneMode === "tehran") {
            // Broker Server (US Eastern UTC-4 / Prop Firm Server) to Tehran (UTC+3:30):
            // Difference is +7.5 hours (e.g. 06:00 AM Server = 13:30 / 14:00 PM Tehran afternoon)
            const tehranShift = (rawServerHour + 7.5) % 24;
            hr = Math.floor(tehranShift); // 13:00, 14:00, 15:00, 16:00 (Afternoon Iran)
            dayName = dayNames[(d.getDay() + (rawServerHour + 7.5 >= 24 ? 1 : 0)) % 7];
          } else if (timezoneMode === "utc") {
            // UTC (Greenwich): Server (UTC-4) + 4 hours -> 10:00, 11:00, 12:00
            hr = (rawServerHour + 4) % 24;
            dayName = dayNames[(d.getDay() + (rawServerHour + 4 >= 24 ? 1 : 0)) % 7];
          } else if (timezoneMode === "ny") {
            // New York Session (EDT UTC-4): Matches raw server hour directly
            hr = rawServerHour % 24;
            dayName = dayNames[d.getDay()];
          }

          if (hourlyCounts[hr]) {
            if (netProfit > 0) hourlyCounts[hr].winners++;
            else hourlyCounts[hr].losers++;
          }

          if (dailyCounts[dayName]) {
            if (netProfit > 0) dailyCounts[dayName].winners++;
            else dailyCounts[dayName].losers++;
            dailyCounts[dayName].total++;
          }
        }
      }

      // Duration Bucket
      const dur = t.durationMinutes || 15;
      if (dur < 5) {
        durationBuckets[0].count++;
        durationBuckets[0].profit += netProfit;
      } else if (dur < 15) {
        durationBuckets[1].count++;
        durationBuckets[1].profit += netProfit;
      } else if (dur < 60) {
        durationBuckets[2].count++;
        durationBuckets[2].profit += netProfit;
      } else if (dur < 240) {
        durationBuckets[3].count++;
        durationBuckets[3].profit += netProfit;
      } else if (dur < 1440) {
        durationBuckets[4].count++;
        durationBuckets[4].profit += netProfit;
      } else {
        durationBuckets[5].count++;
        durationBuckets[5].profit += netProfit;
      }
    });

    const totalTrades = trades.length;
    const avgWinPips = winningTradesCount > 0 ? winPipsTotal / winningTradesCount : 0;
    const avgLossPips = losingTradesCount > 0 ? lossPipsTotal / losingTradesCount : 0;

    // Filter active hours for cleaner chart
    const activeHourly = Object.values(hourlyCounts).filter(
      (h) => h.winners > 0 || h.losers > 0
    );

    // Z-Score probability calculation
    const z = stats.zScore || 0;
    const zProb = (1 / (1 + Math.exp(-0.07056 * Math.pow(z, 3) - 1.5976 * z))) * 100;
    const probabilityScore = z === 0 ? 50 : Math.min(99.99, Math.max(0.01, Math.abs(zProb)));

    // Risk of Ruin Matrix calculation
    const winProb = totalTrades > 0 ? winningTradesCount / totalTrades : 0.5;
    const lossProb = 1 - winProb;
    const payoffRatio = stats.rewardToRiskRatio || 1;

    const lossSizes = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10];
    const riskOfRuinMatrix = lossSizes.map((lossPct) => {
      const riskPerTradePct = 1.5;
      const tradesToRuin = Math.round(lossPct / riskPerTradePct);

      let ruinProb = 0;
      if (winProb <= 0.5 && payoffRatio <= 1) {
        ruinProb = 99.99;
      } else {
        const a = (winProb * payoffRatio - lossProb) / (winProb * payoffRatio + lossProb);
        if (a <= 0) ruinProb = 99.99;
        else {
          const raw = Math.pow((1 - a) / (1 + a), tradesToRuin) * 100;
          ruinProb = parseFloat(Math.min(99.99, Math.max(0.01, raw)).toFixed(2));
        }
      }

      return {
        lossSize: `${lossPct}%`,
        probability: `${ruinProb.toFixed(2)}%`,
        consecutiveLosses: tradesToRuin,
      };
    });

    // MAE/MFE scatter points
    const maeMfeData = trades.slice(0, 60).map((t, idx) => {
      const netPnl = (t.profit || 0) + (t.commission || 0) + (t.swap || 0);
      const mae = Math.abs(
        t.stopLoss && t.entryPrice
          ? (t.stopLoss - t.entryPrice) * (t.orderType === "BUY" ? -1 : 1)
          : netPnl < 0
          ? Math.abs(netPnl)
          : 12.5
      );
      const mfe = Math.abs(
        t.takeProfit && t.entryPrice
          ? (t.takeProfit - t.entryPrice) * (t.orderType === "BUY" ? 1 : -1)
          : netPnl > 0
          ? netPnl * 1.25
          : 18.0
      );
      return {
        trade: `#${t.ticket || idx + 1}`,
        mae: parseFloat(mae.toFixed(1)),
        mfe: parseFloat(mfe.toFixed(1)),
        profit: parseFloat(netPnl.toFixed(2)),
        isWin: netPnl >= 0,
      };
    });

    return {
      totalPips,
      totalLots,
      totalCommissions,
      avgWinPips,
      avgLossPips,
      bestTradeDollar: bestTradeDollar.profit === -Infinity ? { profit: 0, date: "-" } : bestTradeDollar,
      worstTradeDollar: worstTradeDollar.profit === Infinity ? { profit: 0, date: "-" } : worstTradeDollar,
      bestTradePips: bestTradePips.pips === -Infinity ? { pips: 0, date: "-" } : bestTradePips,
      worstTradePips: worstTradePips.pips === Infinity ? { pips: 0, date: "-" } : worstTradePips,
      symbolMap,
      activeHourly: activeHourly.length > 0 ? activeHourly : Object.values(hourlyCounts).slice(6, 20),
      dailyCounts: Object.values(dailyCounts),
      durationBuckets,
      probabilityScore,
      riskOfRuinMatrix,
      maeMfeData,
    };
  }, [trades, stats, timezoneMode]);

  const tabs = [
    { id: "advanced", label: "Advanced Statistics", icon: BarChart2 },
    { id: "trades", label: "Trades", icon: FileSpreadsheet },
    { id: "summary", label: "Summary", icon: TableIcon },
    { id: "hourly", label: "Hourly", icon: Clock },
    { id: "daily", label: "Daily", icon: Calendar },
    { id: "risk_of_ruin", label: "Risk of Ruin", icon: AlertTriangle },
    { id: "duration", label: "Duration", icon: Timer },
    { id: "mae_mfe", label: "MAE/MFE", icon: Compass },
  ] as const;

  return (
    <div className="space-y-4">
      {/* Top Tab Navigation Bar */}
      <div className="flex items-center gap-1 overflow-x-auto border-b dark:border-white/10 border-slate-300 pb-px scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black transition-all rounded-t-xl cursor-pointer border-t border-x whitespace-nowrap ${
                isActive
                  ? "dark:bg-zinc-900 bg-white dark:text-cyan-400 text-sky-700 dark:border-white/10 border-slate-300 border-b-transparent shadow-sm"
                  : "dark:bg-black/40 bg-slate-100/70 dark:text-slate-400 text-slate-600 dark:border-transparent border-transparent hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "dark:text-cyan-400 text-sky-600" : "opacity-70"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: Advanced Statistics 3-Column Table                     */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "advanced" && (
        <GlassCard className="p-0 overflow-hidden dark:bg-zinc-950 bg-white border dark:border-white/10 border-slate-200 shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x dark:divide-white/10 divide-slate-200 text-xs">
            {/* Column 1 */}
            <div className="divide-y dark:divide-white/5 divide-slate-100">
              <div className="flex items-center justify-between p-3">
                <span className="text-slate-500 font-medium">Trades:</span>
                <span className="font-extrabold dark:text-white text-slate-900">{stats.totalTrades}</span>
              </div>

              <div className="flex items-center justify-between p-3">
                <span className="text-slate-500 font-medium">Profitability:</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-3 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden flex">
                    <div
                      style={{ width: `${stats.winRate}%` }}
                      className="bg-emerald-500 h-full"
                      title={`Won: ${stats.winningTrades} (${stats.winRate}%)`}
                    />
                    <div
                      style={{ width: `${100 - stats.winRate}%` }}
                      className="bg-rose-500 h-full"
                      title={`Lost: ${stats.losingTrades} (${(100 - stats.winRate).toFixed(1)}%)`}
                    />
                  </div>
                  <span className="font-bold text-[11px] dark:text-slate-300 text-slate-700">
                    {stats.winRate}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3">
                <span className="text-slate-500 font-medium">Pips:</span>
                <span
                  className={`font-black ${
                    computedData.totalPips >= 0
                      ? "dark:text-emerald-400 text-emerald-600"
                      : "dark:text-rose-400 text-rose-600"
                  }`}
                >
                  {computedData.totalPips >= 0 ? "+" : ""}
                  {computedData.totalPips.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between p-3">
                <span className="text-slate-500 font-medium">Average Win:</span>
                <span className="font-bold dark:text-emerald-400 text-emerald-700">
                  {computedData.avgWinPips.toFixed(2)} pips / ${stats.averageProfitTrade}
                </span>
              </div>

              <div className="flex items-center justify-between p-3">
                <span className="text-slate-500 font-medium">Average Loss:</span>
                <span className="font-bold dark:text-rose-400 text-rose-700">
                  {computedData.avgLossPips.toFixed(2)} pips / -${Math.abs(stats.averageLossTrade)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3">
                <span className="text-slate-500 font-medium">Lots:</span>
                <span className="font-extrabold dark:text-white text-slate-900">
                  {computedData.totalLots.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3">
                <span className="text-slate-500 font-medium">Commissions:</span>
                <span className="font-bold text-slate-600 dark:text-slate-300">
                  -${Math.abs(computedData.totalCommissions).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Column 2 */}
            <div className="divide-y dark:divide-white/5 divide-slate-100">
              <div className="flex items-center justify-between p-3">
                <span className="text-slate-500 font-medium">Longs Won:</span>
                <span className="font-extrabold dark:text-white text-slate-900">
                  ({Math.round((stats.longWinRate * stats.longTradesCount) / 100)}/{stats.longTradesCount}){" "}
                  <strong className="text-emerald-600 dark:text-emerald-400">{stats.longWinRate}%</strong>
                </span>
              </div>

              <div className="flex items-center justify-between p-3">
                <span className="text-slate-500 font-medium">Shorts Won:</span>
                <span className="font-extrabold dark:text-white text-slate-900">
                  ({Math.round((stats.shortWinRate * stats.shortTradesCount) / 100)}/{stats.shortTradesCount}){" "}
                  <strong className="text-emerald-600 dark:text-emerald-400">{stats.shortWinRate}%</strong>
                </span>
              </div>

              <div className="flex items-center justify-between p-3">
                <span className="text-slate-500 font-medium">Best Trade ($):</span>
                <span className="font-extrabold dark:text-emerald-400 text-emerald-700">
                  <span className="text-slate-400 font-normal text-[11px] mr-1">
                    ({computedData.bestTradeDollar.date})
                  </span>
                  ${computedData.bestTradeDollar.profit.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3">
                <span className="text-slate-500 font-medium">Worst Trade ($):</span>
                <span className="font-extrabold dark:text-rose-400 text-rose-700">
                  <span className="text-slate-400 font-normal text-[11px] mr-1">
                    ({computedData.worstTradeDollar.date})
                  </span>
                  -${Math.abs(computedData.worstTradeDollar.profit).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3">
                <span className="text-slate-500 font-medium">Best Trade (Pips):</span>
                <span className="font-extrabold dark:text-emerald-400 text-emerald-700">
                  <span className="text-slate-400 font-normal text-[11px] mr-1">
                    ({computedData.bestTradePips.date})
                  </span>
                  +{computedData.bestTradePips.pips.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between p-3">
                <span className="text-slate-500 font-medium">Worst Trade (Pips):</span>
                <span className="font-extrabold dark:text-rose-400 text-rose-700">
                  <span className="text-slate-400 font-normal text-[11px] mr-1">
                    ({computedData.worstTradePips.date})
                  </span>
                  {computedData.worstTradePips.pips.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between p-3">
                <span className="text-slate-500 font-medium">Avg. Trade Length:</span>
                <span className="font-extrabold dark:text-white text-slate-900">
                  {Math.floor(stats.avgTradeLengthMinutes / 60)}h {stats.avgTradeLengthMinutes % 60}m
                </span>
              </div>
            </div>

            {/* Column 3 */}
            <div className="divide-y dark:divide-white/5 divide-slate-100">
              <div className="flex items-center justify-between p-3">
                <span
                  className="text-slate-500 font-medium underline decoration-dotted cursor-help"
                  title="Gross Profit ÷ Gross Loss"
                >
                  Profit Factor:
                </span>
                <span className="font-black text-amber-600 dark:text-amber-400 text-sm">{stats.profitFactor}</span>
              </div>

              <div className="flex items-center justify-between p-3">
                <span
                  className="text-slate-500 font-medium underline decoration-dotted cursor-help"
                  title="Standard Deviation of Returns"
                >
                  Standard Deviation:
                </span>
                <span className="font-bold dark:text-white text-slate-900">${stats.standardDeviation}</span>
              </div>

              <div className="flex items-center justify-between p-3">
                <span
                  className="text-slate-500 font-medium underline decoration-dotted cursor-help"
                  title="Risk-adjusted Return"
                >
                  Sharpe Ratio:
                </span>
                <span className="font-bold dark:text-sky-400 text-sky-700">{stats.sharpeRatio}</span>
              </div>

              <div className="flex items-center justify-between p-3">
                <span
                  className="text-slate-500 font-medium underline decoration-dotted cursor-help"
                  title="Z-Score Streak Probability"
                >
                  Z-Score (Probability):
                </span>
                <span className="font-bold dark:text-white text-slate-900">
                  {stats.zScore} ({computedData.probabilityScore.toFixed(2)}%)
                </span>
              </div>

              <div className="flex items-center justify-between p-3">
                <span
                  className="text-slate-500 font-medium underline decoration-dotted cursor-help"
                  title="Expected Value per Trade"
                >
                  Expectancy:
                </span>
                <span
                  className={`font-bold ${
                    stats.expectedPayoff >= 0
                      ? "dark:text-emerald-400 text-emerald-700"
                      : "dark:text-rose-400 text-rose-700"
                  }`}
                >
                  {stats.expectancyPips} Pips / ${stats.expectedPayoff}
                </span>
              </div>

              <div className="flex items-center justify-between p-3">
                <span
                  className="text-slate-500 font-medium underline decoration-dotted cursor-help"
                  title="Average Holding Period Return"
                >
                  AHPR:
                </span>
                <span
                  className={`font-bold ${
                    stats.ahpr >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {stats.ahpr >= 0 ? "+" : ""}
                  {stats.ahpr}%
                </span>
              </div>

              <div className="flex items-center justify-between p-3">
                <span
                  className="text-slate-500 font-medium underline decoration-dotted cursor-help"
                  title="Geometric Holding Period Return"
                >
                  GHPR:
                </span>
                <span
                  className={`font-bold ${
                    stats.ghpr >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {stats.ghpr >= 0 ? "+" : ""}
                  {stats.ghpr}%
                </span>
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: Trades Log Table                                        */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "trades" && (
        <GlassCard className="p-4 overflow-x-auto dark:bg-zinc-950 bg-white border dark:border-white/10 border-slate-200 shadow-md">
          <table className="w-full text-left text-xs">
            <thead className="border-b dark:border-white/10 border-slate-200 text-slate-500 uppercase font-black">
              <tr>
                <th className="pb-3 px-2">Ticket</th>
                <th className="pb-3 px-2">Open Time</th>
                <th className="pb-3 px-2">Type</th>
                <th className="pb-3 px-2">Size</th>
                <th className="pb-3 px-2">Item</th>
                <th className="pb-3 px-2">Open Price</th>
                <th className="pb-3 px-2">Close Price</th>
                <th className="pb-3 px-2">Pips</th>
                <th className="pb-3 px-2 text-right">Profit ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-white/5 divide-slate-100 font-mono">
              {trades.slice(0, 30).map((t, idx) => {
                const netProfit = (t.profit || 0) + (t.commission || 0) + (t.swap || 0);
                const pips = getTradePips(t);
                const isWin = netProfit >= 0;

                return (
                  <tr key={t.id || idx} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-2.5 px-2 text-slate-400 font-bold">#{t.ticket || idx + 1}</td>
                    <td className="py-2.5 px-2 text-slate-600 dark:text-slate-300">{formatShortDate(t.openTime)}</td>
                    <td className="py-2.5 px-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          t.orderType === "BUY"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                            : "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300"
                        }`}
                      >
                        {t.orderType}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 dark:text-white text-slate-900">{t.lotSize}</td>
                    <td className="py-2.5 px-2 font-sans font-bold dark:text-white text-slate-900">{t.symbol}</td>
                    <td className="py-2.5 px-2 text-slate-600 dark:text-slate-300">{t.entryPrice}</td>
                    <td className="py-2.5 px-2 text-slate-600 dark:text-slate-300">{t.exitPrice}</td>
                    <td
                      className={`py-2.5 px-2 font-bold ${
                        pips >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {pips >= 0 ? "+" : ""}
                      {pips}
                    </td>
                    <td
                      className={`py-2.5 px-2 text-right font-black ${
                        isWin ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {isWin ? "+" : ""}${netProfit.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </GlassCard>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: Summary (Symbol Breakdown Table)                       */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "summary" && (
        <GlassCard className="p-0 overflow-x-auto dark:bg-zinc-950 bg-white border dark:border-white/10 border-slate-200 shadow-md">
          <table className="w-full text-center text-xs">
            <thead className="bg-slate-50 dark:bg-zinc-900/80 border-b dark:border-white/10 border-slate-200 text-slate-500 font-bold">
              <tr>
                <th className="py-2.5 px-3 text-left border-r dark:border-white/10 border-slate-200">Currency</th>
                <th colSpan={3} className="py-2.5 px-3 border-r dark:border-white/10 border-slate-200 text-emerald-600 dark:text-emerald-400">
                  Longs
                </th>
                <th colSpan={3} className="py-2.5 px-3 border-r dark:border-white/10 border-slate-200 text-rose-600 dark:text-rose-400">
                  Shorts
                </th>
                <th colSpan={5} className="py-2.5 px-3 font-black text-slate-800 dark:text-white">
                  Total
                </th>
              </tr>
              <tr className="border-t dark:border-white/5 border-slate-200 text-[10px] uppercase text-slate-400">
                <th className="py-2 px-3 text-left border-r dark:border-white/10 border-slate-200">Symbol</th>
                <th className="py-2 px-2">Trades</th>
                <th className="py-2 px-2">Pips</th>
                <th className="py-2 px-2 border-r dark:border-white/10 border-slate-200">Profit($)</th>
                <th className="py-2 px-2">Trades</th>
                <th className="py-2 px-2">Pips</th>
                <th className="py-2 px-2 border-r dark:border-white/10 border-slate-200">Profit($)</th>
                <th className="py-2 px-2">Trades</th>
                <th className="py-2 px-2">Pips</th>
                <th className="py-2 px-2">Profit($)</th>
                <th className="py-2 px-2 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300">Won(%)</th>
                <th className="py-2 px-2 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300">Lost(%)</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-white/5 divide-slate-100 font-mono text-xs">
              {Object.entries(computedData.symbolMap).map(([sym, d]) => {
                const totalTr = d.longTrades + d.shortTrades;
                const totalP = d.longPips + d.shortPips;
                const totalProf = d.longProfit + d.shortProfit;
                const wonPct = totalTr > 0 ? Math.round(((d.longWins + d.shortWins) / totalTr) * 100) : 0;
                const lostPct = 100 - wonPct;

                return (
                  <tr key={sym} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 text-left font-sans font-black dark:text-white text-slate-900 border-r dark:border-white/10 border-slate-200">
                      {sym}
                    </td>
                    <td className="py-3 px-2 dark:text-slate-300 text-slate-700">{d.longTrades}</td>
                    <td
                      className={`py-3 px-2 font-bold ${
                        d.longPips >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {d.longPips.toLocaleString()}
                    </td>
                    <td
                      className={`py-3 px-2 font-bold border-r dark:border-white/10 border-slate-200 ${
                        d.longProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {d.longProfit.toFixed(2)}
                    </td>

                    <td className="py-3 px-2 dark:text-slate-300 text-slate-700">{d.shortTrades}</td>
                    <td
                      className={`py-3 px-2 font-bold ${
                        d.shortPips >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {d.shortPips.toLocaleString()}
                    </td>
                    <td
                      className={`py-3 px-2 font-bold border-r dark:border-white/10 border-slate-200 ${
                        d.shortProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {d.shortProfit.toFixed(2)}
                    </td>

                    <td className="py-3 px-2 font-black dark:text-white text-slate-900">{totalTr}</td>
                    <td
                      className={`py-3 px-2 font-black ${
                        totalP >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {totalP.toLocaleString()}
                    </td>
                    <td
                      className={`py-3 px-2 font-black ${
                        totalProf >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {totalProf.toFixed(2)}
                    </td>
                    <td className="py-3 px-2 bg-emerald-100/60 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-extrabold">
                      {d.longWins + d.shortWins} ({wonPct}%)
                    </td>
                    <td className="py-3 px-2 bg-rose-100/60 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 font-extrabold">
                      {totalTr - (d.longWins + d.shortWins)} ({lostPct}%)
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </GlassCard>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: Hourly Winners vs Losers                                */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "hourly" && (
        <GlassCard className="p-6 dark:bg-zinc-950 bg-white border dark:border-white/10 border-slate-200 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b dark:border-white/10 border-slate-200 pb-3">
            <div>
              <h3 className="text-base font-black dark:text-white text-slate-900">Winners Vs. Losers</h3>
              <p className="text-[11px] text-slate-500 font-medium">Hourly Execution Trade Distribution</p>
            </div>

            {/* Timezone Selector Controls */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl dark:bg-zinc-900 bg-slate-100 border dark:border-white/10 border-slate-200 text-xs self-start sm:self-auto">
              <Globe className="h-3.5 w-3.5 text-slate-400 ml-1" />
              <button
                onClick={() => setTimezoneMode("server")}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  timezoneMode === "server"
                    ? "bg-cyan-500 text-white shadow-sm font-black"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="Broker Server Time as exported from MetaTrader"
              >
                Broker Server Time
              </button>
              <button
                onClick={() => setTimezoneMode("tehran")}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  timezoneMode === "tehran"
                    ? "bg-cyan-500 text-white shadow-sm font-black"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="Iran / Tehran Time (UTC+3:30)"
              >
                Tehran (UTC+3:30)
              </button>
              <button
                onClick={() => setTimezoneMode("utc")}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  timezoneMode === "utc"
                    ? "bg-cyan-500 text-white shadow-sm font-black"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="Universal Coordinated Time"
              >
                UTC
              </button>
              <button
                onClick={() => setTimezoneMode("ny")}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  timezoneMode === "ny"
                    ? "bg-cyan-500 text-white shadow-sm font-black"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="New York Session (EDT UTC-4)"
              >
                New York (EDT)
              </button>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={computedData.activeHourly} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-white/5" />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} tickFormatter={(h) => `${h}:00`} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip content={<CustomBarTooltip />} />
                <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: "12px", fontSize: "12px", fontWeight: "bold" }} />
                <Bar dataKey="winners" name="Winners" fill="#84cc16" stackId="a" radius={[0, 0, 4, 4]} />
                <Bar dataKey="losers" name="Losers" fill="#c084fc" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 5: Daily Winners vs Losers                                 */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "daily" && (
        <GlassCard className="p-6 dark:bg-zinc-950 bg-white border dark:border-white/10 border-slate-200 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b dark:border-white/10 border-slate-200 pb-3">
            <div>
              <h3 className="text-base font-black dark:text-white text-slate-900">Winners Vs. Losers</h3>
              <p className="text-[11px] text-slate-500 font-medium">Day of Week Performance Distribution</p>
            </div>

            {/* Timezone Selector Controls */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl dark:bg-zinc-900 bg-slate-100 border dark:border-white/10 border-slate-200 text-xs self-start sm:self-auto">
              <Globe className="h-3.5 w-3.5 text-slate-400 ml-1" />
              <button
                onClick={() => setTimezoneMode("server")}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  timezoneMode === "server"
                    ? "bg-cyan-500 text-white shadow-sm font-black"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Broker Server Time
              </button>
              <button
                onClick={() => setTimezoneMode("tehran")}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  timezoneMode === "tehran"
                    ? "bg-cyan-500 text-white shadow-sm font-black"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Tehran (UTC+3:30)
              </button>
              <button
                onClick={() => setTimezoneMode("utc")}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  timezoneMode === "utc"
                    ? "bg-cyan-500 text-white shadow-sm font-black"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                UTC
              </button>
              <button
                onClick={() => setTimezoneMode("ny")}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  timezoneMode === "ny"
                    ? "bg-cyan-500 text-white shadow-sm font-black"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                New York (EDT)
              </button>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={computedData.dailyCounts} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-white/5" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip content={<CustomBarTooltip />} />
                <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: "12px", fontSize: "12px", fontWeight: "bold" }} />
                <Bar dataKey="winners" name="Winners" fill="#84cc16" stackId="a" radius={[0, 0, 4, 4]} />
                <Bar dataKey="losers" name="Losers" fill="#c084fc" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 6: Risk of Ruin Matrix Table                              */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "risk_of_ruin" && (
        <GlassCard className="p-0 overflow-x-auto dark:bg-zinc-950 bg-white border dark:border-white/10 border-slate-200 shadow-md space-y-3">
          <table className="w-full text-center text-xs">
            <tbody className="divide-y dark:divide-white/10 divide-slate-200 font-mono">
              {/* Row 1: Loss Size */}
              <tr className="dark:bg-zinc-900 bg-slate-50">
                <td className="py-3 px-4 text-left font-sans font-bold text-slate-500 border-r dark:border-white/10 border-slate-200 whitespace-nowrap">
                  Loss Size
                </td>
                {computedData.riskOfRuinMatrix.map((item, idx) => (
                  <td key={`loss-${idx}`} className="py-3 px-3 font-black text-rose-700 dark:text-rose-300 bg-rose-100/50 dark:bg-rose-950/30">
                    {item.lossSize}
                  </td>
                ))}
              </tr>

              {/* Row 2: Probability of Loss */}
              <tr>
                <td className="py-3 px-4 text-left font-sans font-bold text-slate-500 border-r dark:border-white/10 border-slate-200 whitespace-nowrap">
                  Probability of Loss
                </td>
                {computedData.riskOfRuinMatrix.map((item, idx) => (
                  <td key={`prob-${idx}`} className="py-3 px-3 font-black text-rose-600 dark:text-rose-400 bg-rose-50/60 dark:bg-rose-950/20">
                    {item.probability}
                  </td>
                ))}
              </tr>

              {/* Row 3: Consecutive Losing Trades */}
              <tr className="dark:bg-zinc-900 bg-slate-50">
                <td className="py-3 px-4 text-left font-sans font-bold text-slate-500 border-r dark:border-white/10 border-slate-200 whitespace-nowrap">
                  Consecutive Losing Trades
                </td>
                {computedData.riskOfRuinMatrix.map((item, idx) => (
                  <td key={`consec-${idx}`} className="py-3 px-3 font-black text-slate-800 dark:text-white bg-rose-100/40 dark:bg-rose-950/25">
                    {item.consecutiveLosses}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>

          <div className="p-3 text-center text-xs text-slate-400 font-medium">
            Hover over the desired column for a detailed explanation.
          </div>
        </GlassCard>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 7: Duration Analysis                                      */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "duration" && (
        <GlassCard className="p-6 dark:bg-zinc-950 bg-white border dark:border-white/10 border-slate-200 shadow-md space-y-4">
          <div className="text-center">
            <h3 className="text-sm font-black dark:text-white text-slate-900">Trade Holding Duration vs. Profitability</h3>
            <p className="text-[11px] text-slate-500 font-medium">Distribution of trades by holding length</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {computedData.durationBuckets.map((b, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border dark:border-white/10 border-slate-200 dark:bg-zinc-900/60 bg-slate-50 text-center space-y-1 shadow-sm"
              >
                <span className="text-[11px] font-extrabold text-slate-500 uppercase">{b.label}</span>
                <div className="text-lg font-black dark:text-white text-slate-900">{b.count} Trades</div>
                <div
                  className={`text-xs font-bold ${
                    b.profit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {b.profit >= 0 ? "+" : ""}${b.profit.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 8: MAE / MFE Analysis                                     */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "mae_mfe" && (
        <GlassCard className="p-6 dark:bg-zinc-950 bg-white border dark:border-white/10 border-slate-200 shadow-md space-y-4">
          <div className="text-center">
            <h3 className="text-sm font-black dark:text-white text-slate-900">
              Maximum Adverse (MAE) vs. Maximum Favorable Excursion (MFE)
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">Excursion analytics for SL / TP optimization</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-white/5" />
                <XAxis
                  type="number"
                  dataKey="mae"
                  name="MAE (Adverse $)"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickFormatter={(v) => `$${v}`}
                />
                <YAxis
                  type="number"
                  dataKey="mfe"
                  name="MFE (Favorable $)"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickFormatter={(v) => `$${v}`}
                />
                <ZAxis type="number" dataKey="profit" range={[60, 200]} />
                <Tooltip content={<CustomScatterTooltip />} cursor={{ strokeDasharray: "3 3" }} />
                <Scatter name="Trades" data={computedData.maeMfeData}>
                  {computedData.maeMfeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isWin ? "#06b6d4" : "#f43f5e"}
                      fillOpacity={0.85}
                      stroke={entry.isWin ? "#0891b2" : "#e11d48"}
                      strokeWidth={1.5}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
