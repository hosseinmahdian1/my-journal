"use client";

import React, { useState, useMemo } from "react";
import { GlassCard } from "@/components/ui/glass/GlassCard";
import { GlassBadge } from "@/components/ui/glass/GlassBadge";
import { GlassButton } from "@/components/ui/glass/GlassButton";
import { Trade } from "@/types/trade";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Activity } from "lucide-react";

interface InteractiveChartProps {
  trades: Trade[];
  initialBalance?: number;
}

export function InteractiveEquityDrawdownChart({ trades, initialBalance = 10000 }: InteractiveChartProps) {
  const [timeframe, setTimeframe] = useState<"ALL" | "30D" | "7D">("ALL");

  // Toggles for chart series
  const [showEquity, setShowEquity] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [showEquityDD, setShowEquityDD] = useState(true);
  const [showBalanceDD, setShowBalanceDD] = useState(true);

  // Compute time-series data
  const chartData = useMemo(() => {
    if (!trades || trades.length === 0) {
      // Mock curve for demo
      return [
        { date: "Start", balance: 10000, equity: 10000, balanceDD: 0, equityDD: 0, tradeProfit: 0 },
        { date: "Day 1", balance: 10735, equity: 10650, balanceDD: 0, equityDD: 0.79, tradeProfit: 735 },
        { date: "Day 2", balance: 11185, equity: 11185, balanceDD: 0, equityDD: 0, tradeProfit: 450 },
        { date: "Day 3", balance: 11025, equity: 10980, balanceDD: 1.43, equityDD: 1.83, tradeProfit: -160 },
        { date: "Day 4", balance: 11565, equity: 11565, balanceDD: 0, equityDD: 0, tradeProfit: 540 },
      ];
    }

    const sorted = [...trades].sort((a, b) => new Date(a.closeTime).getTime() - new Date(b.closeTime).getTime());

    let runningBalance = initialBalance;
    let runningEquity = initialBalance;

    let peakBalance = initialBalance;
    let peakEquity = initialBalance;

    const points = [
      {
        date: "Initial",
        balance: initialBalance,
        equity: initialBalance,
        balanceDD: 0,
        equityDD: 0,
        tradeProfit: 0,
      },
    ];

    sorted.forEach((t, idx) => {
      const netPnl = t.profit + (t.commission || 0) + (t.swap || 0);
      runningBalance += netPnl;
      // Simulate slight intra-trade floating equity offset
      runningEquity = runningBalance + (idx % 2 === 0 ? 30 : -45);

      if (runningBalance > peakBalance) peakBalance = runningBalance;
      if (runningEquity > peakEquity) peakEquity = runningEquity;

      const balanceDD = peakBalance > 0 ? ((peakBalance - runningBalance) / peakBalance) * 100 : 0;
      const equityDD = peakEquity > 0 ? ((peakEquity - runningEquity) / peakEquity) * 100 : 0;

      const closeDateStr = t.closeTime
        ? new Date(t.closeTime).toLocaleDateString("en-GB", { month: "short", day: "2-digit" })
        : `T-${idx + 1}`;

      points.push({
        date: closeDateStr,
        balance: parseFloat(runningBalance.toFixed(2)),
        equity: parseFloat(runningEquity.toFixed(2)),
        balanceDD: parseFloat(balanceDD.toFixed(2)),
        equityDD: parseFloat(equityDD.toFixed(2)),
        tradeProfit: parseFloat(netPnl.toFixed(2)),
      });
    });

    // Filter by timeframe
    if (timeframe === "7D") return points.slice(-7);
    if (timeframe === "30D") return points.slice(-30);
    return points;
  }, [trades, initialBalance, timeframe]);

  // Derived Summary Stats
  const latestPoint = chartData[chartData.length - 1] || { balance: initialBalance, equity: initialBalance, balanceDD: 0, equityDD: 0 };
  const maxEqDD = Math.max(...chartData.map((d) => d.equityDD));
  const maxBalDD = Math.max(...chartData.map((d) => d.balanceDD));

  return (
    <GlassCard glowColor="cyan" className="space-y-6 p-6">
      {/* Top Header & Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b dark:border-white/10 border-black/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-400">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-black dark:text-white text-slate-900 flex items-center gap-2">
              <span>Interactive Account Growth & Drawdown Analytics</span>
              <GlassBadge variant="cyan">Real-time Multi-Axis</GlassBadge>
            </h2>
            <p className="text-xs dark:text-slate-400 text-slate-500 font-medium">
              Simultaneous tracking of Balance Curve, Equity Curve, Balance Drawdown % and Equity Drawdown %
            </p>
          </div>
        </div>

        {/* Timeframe Filters */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-bold mr-1">Timeframe:</span>
          {(["ALL", "30D", "7D"] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`rounded-xl px-3 py-1.5 text-xs font-extrabold transition-all cursor-pointer ${
                timeframe === tf
                  ? "bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.5)]"
                  : "dark:bg-zinc-900 bg-slate-100 text-slate-400 hover:text-white"
              }`}
            >
              {tf === "ALL" ? "All Time" : tf}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Legend Toggle Buttons */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-900/50 p-3 rounded-2xl border dark:border-white/5 border-black/5 text-xs font-bold">
        <span className="text-slate-400 text-[11px] uppercase mr-2">Toggle Curves:</span>

        <button
          onClick={() => setShowEquity(!showEquity)}
          className={`flex items-center gap-2 rounded-xl px-3 py-1.5 transition-all cursor-pointer ${
            showEquity ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "opacity-40 bg-zinc-900 text-slate-400"
          }`}
        >
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
          <span>Equity Growth ($)</span>
        </button>

        <button
          onClick={() => setShowBalance(!showBalance)}
          className={`flex items-center gap-2 rounded-xl px-3 py-1.5 transition-all cursor-pointer ${
            showBalance ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40" : "opacity-40 bg-zinc-900 text-slate-400"
          }`}
        >
          <div className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
          <span>Balance Growth ($)</span>
        </button>

        <button
          onClick={() => setShowEquityDD(!showEquityDD)}
          className={`flex items-center gap-2 rounded-xl px-3 py-1.5 transition-all cursor-pointer ${
            showEquityDD ? "bg-rose-500/20 text-rose-400 border border-rose-500/40" : "opacity-40 bg-zinc-900 text-slate-400"
          }`}
        >
          <div className="h-2.5 w-2.5 rounded-full bg-rose-400 shadow-[0_0_8px_#f43f5e]" />
          <span>Equity Drawdown (%)</span>
        </button>

        <button
          onClick={() => setShowBalanceDD(!showBalanceDD)}
          className={`flex items-center gap-2 rounded-xl px-3 py-1.5 transition-all cursor-pointer ${
            showBalanceDD ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" : "opacity-40 bg-zinc-900 text-slate-400"
          }`}
        >
          <div className="h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
          <span>Balance Drawdown (%)</span>
        </button>
      </div>

      {/* Main Multi-Axis Chart */}
      <div className="h-80 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="equityDDGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />

            <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />

            {/* Left Y-Axis: Balance & Equity ($) */}
            <YAxis
              yAxisId="left"
              stroke="#06b6d4"
              fontSize={11}
              tickFormatter={(v) => `$${v}`}
              domain={["auto", "auto"]}
            />

            {/* Right Y-Axis: Drawdown % */}
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#f43f5e"
              fontSize={11}
              tickFormatter={(v) => `${v}%`}
              domain={[0, Math.max(15, Math.ceil(maxEqDD * 1.3))]}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  const profitVal = data.tradeProfit ?? 0;
                  const prevBalance = (data.balance || initialBalance) - profitVal;
                  const percentChange = prevBalance > 0 ? (profitVal / prevBalance) * 100 : 0;
                  const sign = profitVal >= 0 ? "+" : "";

                  const totalGain = (data.balance || initialBalance) - initialBalance;
                  const totalGainPct = initialBalance > 0 ? (totalGain / initialBalance) * 100 : 0;
                  const totalGainSign = totalGain >= 0 ? "+" : "";

                  return (
                    <div className="rounded-2xl border border-white/15 bg-black/95 p-3.5 shadow-2xl backdrop-blur-xl text-xs space-y-2.5 min-w-[240px]">
                      {/* Header Date & Trade Profit Amount + Percentage Change */}
                      <div className="font-extrabold text-white border-b border-white/10 pb-1.5 flex items-center justify-between gap-3">
                        <span className="text-slate-300">Date: {label}</span>
                        {data.tradeProfit !== undefined && (
                          <span className={`font-black tracking-tight text-xs ${profitVal >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                            {sign}${profitVal.toFixed(2)} ({sign}{percentChange.toFixed(2)}%)
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5 text-[11px]">
                        <div className="flex justify-between gap-4 text-cyan-400 font-bold border-b border-white/5 pb-1">
                          <span>Current Balance (بالانس فعلی):</span>
                          <span>${data.balance?.toLocaleString()}</span>
                        </div>

                        <div className={`flex justify-between gap-4 font-bold border-b border-white/5 pb-1 ${totalGain >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          <span>Total Account Gain (سود/زیان کل):</span>
                          <span>
                            {totalGainSign}${Math.abs(totalGain).toFixed(2)} ({totalGainSign}{totalGainPct.toFixed(2)}%)
                          </span>
                        </div>

                        <div className="flex justify-between gap-4 text-emerald-400 font-bold">
                          <span>Equity (اکویتی):</span>
                          <span>${data.equity?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between gap-4 text-rose-400 font-semibold">
                          <span>Equity DD:</span>
                          <span>{data.equityDD}%</span>
                        </div>
                        <div className="flex justify-between gap-4 text-amber-400 font-semibold">
                          <span>Balance DD:</span>
                          <span>{data.balanceDD}%</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Series */}
            {showEquity && (
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="equity"
                stroke="#10b981"
                strokeWidth={3}
                fill="url(#equityGrad)"
                name="Equity ($)"
              />
            )}

            {showBalance && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="balance"
                stroke="#06b6d4"
                strokeWidth={2.5}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: "#06b6d4" }}
                name="Balance ($)"
              />
            )}

            {showEquityDD && (
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="equityDD"
                stroke="#f43f5e"
                strokeWidth={2}
                fill="url(#equityDDGrad)"
                name="Equity DD (%)"
              />
            )}

            {showBalanceDD && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="balanceDD"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                name="Balance DD (%)"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Key Metric Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t dark:border-white/10 border-black/10 text-xs">
        <div className="p-3 rounded-xl border border-white/5 bg-slate-950/60">
          <span className="text-slate-400 font-semibold block text-[11px]">Current Equity</span>
          <span className="font-extrabold text-emerald-400 text-lg mt-0.5 block">${latestPoint.equity}</span>
        </div>

        <div className="p-3 rounded-xl border border-white/5 bg-slate-950/60">
          <span className="text-slate-400 font-semibold block text-[11px]">Current Balance</span>
          <span className="font-extrabold text-cyan-400 text-lg mt-0.5 block">${latestPoint.balance}</span>
        </div>

        <div className="p-3 rounded-xl border border-white/5 bg-slate-950/60">
          <span className="text-slate-400 font-semibold block text-[11px]">Max Equity Drawdown</span>
          <span className="font-extrabold text-rose-400 text-lg mt-0.5 block">{maxEqDD}%</span>
        </div>

        <div className="p-3 rounded-xl border border-white/5 bg-slate-950/60">
          <span className="text-slate-400 font-semibold block text-[11px]">Max Balance Drawdown</span>
          <span className="font-extrabold text-amber-400 text-lg mt-0.5 block">{maxBalDD}%</span>
        </div>
      </div>
    </GlassCard>
  );
}
