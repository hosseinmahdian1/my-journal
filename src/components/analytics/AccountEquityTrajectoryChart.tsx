"use client";

import React, { useState, useEffect, useMemo } from "react";
import { GlassBadge } from "@/components/ui/glass/GlassBadge";
import { Trade } from "@/types/trade";
import { parseCloseTime } from "@/lib/utils/date-utils";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { Activity, TrendingUp, TrendingDown, Maximize2, Sparkles, Layers, Eye } from "lucide-react";

interface AccountEquityTrajectoryChartProps {
  trades: Trade[];
  initialBalance?: number;
  currentBalance?: number;
}

export function AccountEquityTrajectoryChart({
  trades,
  initialBalance = 10000,
  currentBalance,
}: AccountEquityTrajectoryChartProps) {
  const [mounted, setMounted] = useState(false);
  const [timeframe, setTimeframe] = useState<"ALL" | "30D" | "7D">("ALL");
  const [hoveredData, setHoveredData] = useState<any | null>(null);
  const [curveMode, setCurveMode] = useState<"monotone" | "step">("monotone");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Compute clean time-series data
  const { chartData, peakBalance, lowestBalance, totalGrowthPct, isPositiveTotal } = useMemo(() => {
    if (!trades || trades.length === 0) {
      const demoData = [
        { date: "Start", timestamp: 0, balance: 10000, pnl: 0, pnlPct: 0, change: 0, fullDate: "Initial Capital" },
        { date: "Aug 18", timestamp: 1, balance: 10735, pnl: 735, pnlPct: 7.35, change: 735, fullDate: "Trade #1" },
        { date: "Aug 19", timestamp: 2, balance: 11185, pnl: 1185, pnlPct: 11.85, change: 450, fullDate: "Trade #2" },
        { date: "Aug 20", timestamp: 3, balance: 11025, pnl: 1025, pnlPct: 10.25, change: -160, fullDate: "Trade #3" },
        { date: "Aug 21", timestamp: 4, balance: 11565, pnl: 1565, pnlPct: 15.65, change: 540, fullDate: "Trade #4" },
        { date: "Aug 25", timestamp: 5, balance: 11980, pnl: 1980, pnlPct: 19.8, change: 415, fullDate: "Trade #5" },
      ];
      return {
        chartData: demoData,
        peakBalance: 11980,
        lowestBalance: 10000,
        totalGrowthPct: 19.8,
        isPositiveTotal: true,
      };
    }

    const sorted = [...trades].sort(
      (a, b) => parseCloseTime(a.closeTime || a.openTime) - parseCloseTime(b.closeTime || b.openTime)
    );

    let runningBal = initialBalance;
    let peak = initialBalance;
    let lowest = initialBalance;

    const points: any[] = [
      {
        date: "Start",
        fullDate: "Initial Capital Deposit",
        timestamp: sorted[0] ? parseCloseTime(sorted[0].closeTime || sorted[0].openTime) - 86400000 : 0,
        balance: initialBalance,
        pnl: 0,
        pnlPct: 0,
        change: 0,
      },
    ];

    const dateCounts: Record<string, number> = {};

    sorted.forEach((t, i) => {
      const netPnl = (t.profit || 0) + (t.commission || 0) + (t.swap || 0);
      runningBal += netPnl;
      if (runningBal > peak) peak = runningBal;
      if (runningBal < lowest) lowest = runningBal;

      const totalPnl = runningBal - initialBalance;
      const totalPnlPct = initialBalance > 0 ? (totalPnl / initialBalance) * 100 : 0;

      const ts = parseCloseTime(t.closeTime || t.openTime);
      const d = new Date(ts);
      const rawDateStr = isNaN(d.getTime())
        ? `T-${i + 1}`
        : d.toLocaleDateString("en-GB", { month: "short", day: "numeric" });

      dateCounts[rawDateStr] = (dateCounts[rawDateStr] || 0) + 1;
      const displayDate = dateCounts[rawDateStr] > 1 ? `${rawDateStr} #${dateCounts[rawDateStr]}` : rawDateStr;

      const fullLabel = isNaN(d.getTime())
        ? `Trade #${i + 1}`
        : `${d.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" })} ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} • ${t.symbol || "Trade"}`;

      points.push({
        date: displayDate,
        fullDate: fullLabel,
        symbol: t.symbol,
        ticket: t.ticket || t.id,
        timestamp: ts,
        balance: parseFloat(runningBal.toFixed(2)),
        pnl: parseFloat(totalPnl.toFixed(2)),
        pnlPct: parseFloat(totalPnlPct.toFixed(2)),
        change: parseFloat(netPnl.toFixed(2)),
      });
    });

    // Timeframe filtering
    let filtered = points;
    const now = Date.now();
    if (timeframe === "7D") {
      const cutoff = now - 7 * 86400000;
      const recent = points.filter((p) => p.timestamp >= cutoff);
      filtered = recent.length > 1 ? recent : points.slice(-7);
    } else if (timeframe === "30D") {
      const cutoff = now - 30 * 86400000;
      const recent = points.filter((p) => p.timestamp >= cutoff);
      filtered = recent.length > 1 ? recent : points.slice(-30);
    }

    const last = filtered[filtered.length - 1] || points[points.length - 1];
    const totalGrowth = initialBalance > 0 ? ((last.balance - initialBalance) / initialBalance) * 100 : 0;

    return {
      chartData: filtered,
      peakBalance: peak,
      lowestBalance: lowest,
      totalGrowthPct: parseFloat(totalGrowth.toFixed(2)),
      isPositiveTotal: totalGrowth >= 0,
    };
  }, [trades, initialBalance, timeframe]);

  // Display active point or latest point
  const activePoint = hoveredData || chartData[chartData.length - 1] || { balance: initialBalance, pnl: 0, pnlPct: 0, change: 0, date: "Latest" };
  const isPointPos = (activePoint.pnl ?? 0) >= 0;

  return (
    <div className="space-y-4">
      {/* Chart Top Header with Real-Time HUD Metrics & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl dark:bg-cyan-500/15 bg-sky-50 dark:text-cyan-400 text-sky-600 border dark:border-cyan-500/30 border-sky-200 shadow-sm">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight dark:text-white text-slate-950">
                Account Equity Trajectory
              </h2>
              <GlassBadge variant={isPositiveTotal ? "cyan" : "loss"}>
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  {isPositiveTotal ? "Account Growth" : "Drawdown Active"}
                </span>
              </GlassBadge>
            </div>
            <p className="text-xs dark:text-slate-400 text-slate-500 font-medium">
              Interactive tick-by-tick cumulative equity curve with dynamic hover HUD
            </p>
          </div>
        </div>

        {/* Timeframe Pill Selectors & Curve Style Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-xl dark:bg-slate-950/80 bg-slate-100 border dark:border-white/10 border-slate-200 shadow-inner">
            {(["ALL", "30D", "7D"] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 text-xs font-black rounded-lg transition-all duration-200 cursor-pointer ${
                  timeframe === tf
                    ? "bg-gradient-to-r from-sky-500 to-cyan-500 text-white dark:text-slate-950 shadow-[0_2px_8px_rgba(14,165,233,0.4)]"
                    : "dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tf === "ALL" ? "All Time" : tf}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurveMode(curveMode === "monotone" ? "step" : "monotone")}
            title="Toggle Smooth vs Step Curve"
            className="p-2 rounded-xl dark:bg-slate-950/80 bg-slate-100 border dark:border-white/10 border-slate-200 dark:text-slate-400 text-slate-600 hover:text-cyan-400 transition-all cursor-pointer"
          >
            <Layers className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Live Interactive Floating HUD Card */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl dark:bg-slate-950/60 bg-gradient-to-r from-sky-50/70 via-slate-50 to-emerald-50/60 border dark:border-white/10 border-slate-200 backdrop-blur-md shadow-sm">
        <div>
          <span className="text-[10px] uppercase font-bold dark:text-slate-400 text-slate-500 tracking-wider block">
            {hoveredData ? "Point Balance" : "Current Balance"}
          </span>
          <span className="text-xl font-black dark:text-white text-slate-950 font-mono">
            ${activePoint.balance?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold dark:text-slate-400 text-slate-500 tracking-wider block">
            Net Account P/L
          </span>
          <span
            className={`text-xl font-black font-mono flex items-center gap-1 ${
              isPointPos ? "dark:text-emerald-400 text-emerald-600" : "dark:text-rose-400 text-rose-600"
            }`}
          >
            {isPointPos ? "+" : "-"}${Math.abs(activePoint.pnl || 0).toFixed(2)}{" "}
            <span className="text-xs font-bold opacity-85">
              ({isPointPos ? "+" : ""}{activePoint.pnlPct || 0}%)
            </span>
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold dark:text-slate-400 text-slate-500 tracking-wider block">
            All-Time Peak Equity
          </span>
          <span className="text-xl font-black dark:text-cyan-400 text-sky-700 font-mono">
            ${peakBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold dark:text-slate-400 text-slate-500 tracking-wider block">
            Point Marker / Date
          </span>
          <span className="text-xs font-bold dark:text-slate-300 text-slate-700 font-mono block truncate mt-1">
            {activePoint.fullDate || activePoint.date}
          </span>
        </div>
      </div>

      {/* Main High-End SVG Chart Canvas */}
      <div className="w-full relative h-[320px] min-h-[320px]">
        {mounted && (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart
              data={chartData}
              onMouseMove={(state) => {
                if (state && state.activePayload && state.activePayload.length) {
                  setHoveredData(state.activePayload[0].payload);
                }
              }}
              onMouseLeave={() => setHoveredData(null)}
              margin={{ top: 15, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                {/* Dynamic Neon Cyan-Emerald Gradient */}
                <linearGradient id="equitySuperGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.45} />
                  <stop offset="40%" stopColor="#0ea5e9" stopOpacity={0.20} />
                  <stop offset="85%" stopColor="#10b981" stopOpacity={0.05} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>

                <filter id="neonCurveGlow" height="300%" width="300%" x="-75%" y="-75%">
                  <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#06b6d4" floodOpacity="0.4" />
                  <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#38bdf8" floodOpacity="0.8" />
                </filter>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(148, 163, 184, 0.12)"
                vertical={false}
              />

              <XAxis
                dataKey="date"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "rgba(148, 163, 184, 0.2)" }}
              />

              <YAxis
                stroke="#64748b"
                fontSize={11}
                domain={["auto", "auto"]}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v.toLocaleString()}`}
              />

              <ReferenceLine
                y={initialBalance}
                stroke="rgba(148, 163, 184, 0.4)"
                strokeDasharray="4 4"
                label={{
                  value: "Deposit: $" + initialBalance.toLocaleString(),
                  position: "insideTopLeft",
                  fill: "#94a3b8",
                  fontSize: 10,
                  fontWeight: "bold",
                }}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const isGain = (data.pnl ?? 0) >= 0;
                    const stepGain = (data.change ?? 0) >= 0;

                    return (
                      <div className="rounded-2xl border dark:border-cyan-500/30 border-slate-300 dark:bg-slate-950/95 bg-white/95 p-3.5 shadow-2xl backdrop-blur-xl text-xs space-y-2 min-w-[210px] animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b dark:border-white/10 border-slate-200 pb-1.5">
                          <span className="font-extrabold dark:text-white text-slate-900 font-mono">
                            {data.fullDate || data.date}
                          </span>
                          {data.symbol && (
                            <GlassBadge variant="cyan" className="text-[10px] font-mono font-bold">
                              {data.symbol}
                            </GlassBadge>
                          )}
                        </div>

                        <div className="space-y-1.5 font-mono text-[11px]">
                          <div className="flex justify-between items-center text-cyan-400 font-black">
                            <span className="dark:text-slate-400 text-slate-600 font-sans">Balance:</span>
                            <span className="text-sm dark:text-cyan-300 text-sky-700">
                              ${data.balance?.toLocaleString()}
                            </span>
                          </div>

                          {data.change !== undefined && data.change !== 0 && (
                            <div className="flex justify-between items-center font-bold">
                              <span className="dark:text-slate-400 text-slate-600 font-sans">Trade Profit:</span>
                              <span className={stepGain ? "dark:text-emerald-400 text-emerald-600" : "dark:text-rose-400 text-rose-600"}>
                                {stepGain ? "+" : ""}${data.change?.toFixed(2)}
                              </span>
                            </div>
                          )}

                          <div className="flex justify-between items-center font-bold border-t dark:border-white/10 border-slate-100 pt-1">
                            <span className="dark:text-slate-400 text-slate-600 font-sans">Total Net Gain:</span>
                            <span className={isGain ? "dark:text-emerald-400 text-emerald-600" : "dark:text-rose-400 text-rose-600"}>
                              {isGain ? "+" : ""}${data.pnl?.toFixed(2)} ({isGain ? "+" : ""}{data.pnlPct}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Area
                type={curveMode}
                dataKey="balance"
                stroke="#06b6d4"
                strokeWidth={3.5}
                fillOpacity={1}
                fill="url(#equitySuperGlow)"
                filter="url(#neonCurveGlow)"
                activeDot={{
                  r: 6,
                  fill: "#38bdf8",
                  stroke: "#ffffff",
                  strokeWidth: 2,
                  className: "animate-pulse",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
