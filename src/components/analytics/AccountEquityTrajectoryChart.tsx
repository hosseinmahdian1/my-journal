"use client";

import React, { useState, useEffect, useMemo } from "react";
import { GlassBadge } from "@/components/ui/glass/GlassBadge";
import { Trade } from "@/types/trade";
import { parseCloseTime } from "@/lib/utils/date-utils";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import {
  Activity,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Layers,
  Zap,
  SlidersHorizontal,
} from "lucide-react";

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
  const [is3DIsometric, setIs3DIsometric] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 100% Authentic Time-Series Computation with Clean Date Milestones
  const { chartData, peakBalance, lowestBalance, totalGrowthPct, isPositiveTotal } = useMemo(() => {
    if (!trades || trades.length === 0) {
      const demoData = [
        { date: "Start", rawDate: "Start", timestamp: 0, balance: 10000, pnl: 0, pnlPct: 0, change: 0, fullDate: "Initial Capital" },
        { date: "Aug 18", rawDate: "Aug 18", timestamp: 1, balance: 10735, pnl: 735, pnlPct: 7.35, change: 735, fullDate: "Trade #1 (XAUUSD)" },
        { date: "Aug 19", rawDate: "Aug 19", timestamp: 2, balance: 11185, pnl: 1185, pnlPct: 11.85, change: 450, fullDate: "Trade #2 (EURUSD)" },
        { date: "Aug 20", rawDate: "Aug 20", timestamp: 3, balance: 11025, pnl: 1025, pnlPct: 10.25, change: -160, fullDate: "Trade #3 (GBPUSD)" },
        { date: "Aug 21", rawDate: "Aug 21", timestamp: 4, balance: 11565, pnl: 1565, pnlPct: 15.65, change: 540, fullDate: "Trade #4 (XAUUSD)" },
        { date: "Aug 25", rawDate: "Aug 25", timestamp: 5, balance: 11980, pnl: 1980, pnlPct: 19.8, change: 415, fullDate: "Trade #5 (USDJPY)" },
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
        rawDate: "Start",
        fullDate: "Initial Capital Deposit",
        timestamp: sorted[0] ? parseCloseTime(sorted[0].closeTime || sorted[0].openTime) - 86400000 : 0,
        balance: initialBalance,
        pnl: 0,
        pnlPct: 0,
        change: 0,
      },
    ];

    let lastSeenDate = "";

    sorted.forEach((t, i) => {
      const netPnl = (t.profit || 0) + (t.commission || 0) + (t.swap || 0);
      runningBal += netPnl;
      if (runningBal > peak) peak = runningBal;
      if (runningBal < lowest) lowest = runningBal;

      const totalPnl = runningBal - initialBalance;
      const totalPnlPct = initialBalance > 0 ? (totalPnl / initialBalance) * 100 : 0;

      const ts = parseCloseTime(t.closeTime || t.openTime);
      const d = new Date(ts);
      const dayStr = isNaN(d.getTime())
        ? `T-${i + 1}`
        : d.toLocaleDateString("en-GB", { month: "short", day: "numeric" });

      // Clean X-Axis: only label when the calendar date advances to prevent duplicate cluttered text
      const axisLabel = dayStr !== lastSeenDate ? dayStr : "";
      lastSeenDate = dayStr;

      const fullLabel = isNaN(d.getTime())
        ? `Trade #${i + 1}`
        : `${d.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" })} ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} • ${t.symbol || "Trade"}`;

      points.push({
        date: axisLabel || `T-${i + 1}`,
        displayDate: dayStr,
        tradeNumber: i + 1,
        fullDate: fullLabel,
        symbol: t.symbol,
        ticket: t.ticket || t.id,
        timestamp: ts,
        balance: parseFloat(runningBal.toFixed(2)),
        // 3D Depth Shadow offset values
        balanceDepth3D: parseFloat((runningBal * 0.985).toFixed(2)),
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

  // Active Point HUD
  const activePoint = hoveredData || chartData[chartData.length - 1] || { balance: initialBalance, pnl: 0, pnlPct: 0, change: 0, date: "Latest" };
  const isPointPos = (activePoint.pnl ?? 0) >= 0;

  return (
    <div className="rounded-3xl border dark:border-cyan-500/20 border-slate-200 dark:bg-slate-950/85 bg-white p-6 shadow-xl backdrop-blur-2xl space-y-6 relative overflow-hidden">
      {/* CSS Styles for Live Cyber Shimmer and 3D Wave Pulse */}
      <style jsx>{`
        @keyframes livePhotonWave {
          0% { stroke-dashoffset: 1200; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes liveBeaconPulse {
          0%, 100% { r: 6px; opacity: 1; filter: drop-shadow(0 0 6px #00f2fe); }
          50% { r: 9px; opacity: 0.8; filter: drop-shadow(0 0 16px #38bdf8); }
        }
        .animate-live-photon {
          stroke-dasharray: 20 60;
          animation: livePhotonWave 20s linear infinite;
        }
        .animate-beacon-dot {
          animation: liveBeaconPulse 2s ease-in-out infinite;
        }
      `}</style>

      {/* Background 3D Ambient Depth Orbs */}
      <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

      {/* Top Header & Interactive Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 via-sky-500/15 to-emerald-500/15 dark:text-cyan-400 text-sky-600 border dark:border-cyan-500/40 border-sky-300 shadow-[0_0_20px_rgba(6,182,212,0.25)]">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black tracking-tight dark:text-white text-slate-950">
                Account Equity Trajectory
              </h2>
              <GlassBadge variant={isPositiveTotal ? "cyan" : "loss"}>
                <span className="flex items-center gap-1.5 font-bold">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                  <span>3D Extruded Ribbon</span>
                </span>
              </GlassBadge>
            </div>
            <p className="text-xs dark:text-slate-400 text-slate-600 font-medium mt-0.5">
              Live animated 3D volumetric ribbon curve with synchronized real-time HUD metrics
            </p>
          </div>
        </div>

        {/* Timeframe & 3D Isometric View Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Timeframe Selector */}
          <div className="flex items-center p-1 rounded-2xl dark:bg-slate-900/90 bg-slate-100 border dark:border-white/10 border-slate-200 shadow-inner">
            {(["ALL", "30D", "7D"] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3.5 py-1.5 text-xs font-black rounded-xl transition-all duration-200 cursor-pointer ${
                  timeframe === tf
                    ? "bg-gradient-to-r from-cyan-500 via-sky-500 to-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)] font-bold scale-105"
                    : "dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tf === "ALL" ? "All Time" : tf}
              </button>
            ))}
          </div>

          {/* 3D Isometric Extrusion Toggle */}
          <button
            onClick={() => setIs3DIsometric(!is3DIsometric)}
            title="Toggle 3D Volumetric Extrusion"
            className={`px-3 py-1.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
              is3DIsometric
                ? "dark:bg-cyan-500/20 bg-cyan-100 dark:text-cyan-400 text-cyan-800 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                : "dark:bg-slate-900 bg-slate-100 dark:text-slate-400 text-slate-600 border-slate-200 dark:border-white/10"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>3D Ribbon</span>
          </button>
        </div>
      </div>

      {/* Floating HUD Header Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 p-4 rounded-2xl dark:bg-slate-900/80 bg-slate-50 border dark:border-cyan-500/25 border-cyan-200/80 backdrop-blur-xl shadow-sm relative z-10">
        <div className="space-y-0.5">
          <span className="text-[10px] uppercase font-extrabold dark:text-cyan-400 text-sky-700 tracking-wider flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            {hoveredData ? "Point Balance" : "Current Balance"}
          </span>
          <span className="text-2xl font-black dark:text-white text-slate-950 font-mono tracking-tight block">
            ${activePoint.balance?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="space-y-0.5">
          <span className="text-[10px] uppercase font-extrabold dark:text-slate-400 text-slate-500 tracking-wider block">
            Net Account P/L
          </span>
          <span
            className={`text-2xl font-black font-mono tracking-tight flex items-center gap-1 ${
              isPointPos ? "dark:text-emerald-400 text-emerald-600" : "dark:text-rose-400 text-rose-600"
            }`}
          >
            {isPointPos ? "+" : "-"}${Math.abs(activePoint.pnl || 0).toFixed(2)}
            <span className="text-xs font-bold opacity-85">
              ({isPointPos ? "+" : ""}{activePoint.pnlPct || 0}%)
            </span>
          </span>
        </div>

        <div className="space-y-0.5">
          <span className="text-[10px] uppercase font-extrabold dark:text-emerald-400 text-emerald-700 tracking-wider block">
            All-Time Peak Equity
          </span>
          <span className="text-2xl font-black dark:text-emerald-300 text-emerald-700 font-mono tracking-tight block">
            ${peakBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="space-y-0.5">
          <span className="text-[10px] uppercase font-extrabold dark:text-slate-400 text-slate-500 tracking-wider block">
            Execution Marker
          </span>
          <span className="text-xs font-bold dark:text-slate-200 text-slate-800 font-mono block truncate mt-1.5">
            {activePoint.fullDate || activePoint.date}
          </span>
        </div>
      </div>

      {/* 3D High-End SVG Chart Canvas */}
      <div className="w-full relative h-[360px] min-h-[360px] z-10">
        {mounted && (
          <ResponsiveContainer width="100%" height={360}>
            <ComposedChart
              data={chartData}
              onMouseMove={(state) => {
                if (state && state.activePayload && state.activePayload.length) {
                  setHoveredData(state.activePayload[0].payload);
                }
              }}
              onMouseLeave={() => setHoveredData(null)}
              margin={{ top: 20, right: 15, left: -5, bottom: 5 }}
            >
              <defs>
                {/* 3D Volumetric Area Gradient (Face of the 3D Ribbon) */}
                <linearGradient id="curve3dRibbonFront" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00f2fe" stopOpacity={0.45} />
                  <stop offset="25%" stopColor="#38bdf8" stopOpacity={0.25} />
                  <stop offset="60%" stopColor="#0284c7" stopOpacity={0.10} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>

                {/* 3D Extruded Depth Underbelly Gradient */}
                <linearGradient id="curve3dRibbonDepth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0369a1" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#082f49" stopOpacity={0.0} />
                </linearGradient>

                {/* Top Specular Neon Core Stroke */}
                <linearGradient id="neonCoreSpecular" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#00f2fe" />
                  <stop offset="35%" stopColor="#38bdf8" />
                  <stop offset="70%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>

                {/* 3D Glow Filter */}
                <filter id="neonGlow3D" height="250%" width="250%" x="-50%" y="-50%">
                  <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#00f2fe" floodOpacity="0.45" />
                </filter>
              </defs>

              {/* 3D Floor Perspective Grid */}
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="rgba(148, 163, 184, 0.14)"
                vertical={false}
              />

              <XAxis
                dataKey="date"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "rgba(148, 163, 184, 0.25)" }}
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
                stroke="rgba(148, 163, 184, 0.45)"
                strokeDasharray="4 4"
                label={{
                  value: `Initial Deposit: $${initialBalance.toLocaleString()}`,
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
                      <div className="rounded-2xl border dark:border-cyan-400/40 border-cyan-300 dark:bg-slate-950/95 bg-white/95 p-4 shadow-[0_10px_35px_rgba(0,0,0,0.5)] backdrop-blur-2xl text-xs space-y-2.5 min-w-[230px] animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b dark:border-white/10 border-slate-200 pb-2">
                          <span className="font-black dark:text-white text-slate-900 font-mono">
                            {data.fullDate || data.displayDate || data.date}
                          </span>
                          {data.symbol && (
                            <GlassBadge variant="cyan" className="text-[10px] font-mono font-bold">
                              {data.symbol}
                            </GlassBadge>
                          )}
                        </div>

                        <div className="space-y-1.5 font-mono text-[11px]">
                          <div className="flex justify-between items-center text-cyan-400 font-black">
                            <span className="dark:text-slate-400 text-slate-600 font-sans">Account Balance:</span>
                            <span className="text-sm dark:text-cyan-300 text-sky-700">
                              ${data.balance?.toLocaleString()}
                            </span>
                          </div>

                          {data.change !== undefined && data.change !== 0 && (
                            <div className="flex justify-between items-center font-bold">
                              <span className="dark:text-slate-400 text-slate-600 font-sans">Trade Delta:</span>
                              <span className={stepGain ? "dark:text-emerald-400 text-emerald-600" : "dark:text-rose-400 text-rose-600"}>
                                {stepGain ? "+" : ""}${data.change?.toFixed(2)}
                              </span>
                            </div>
                          )}

                          <div className="flex justify-between items-center font-bold border-t dark:border-white/10 border-slate-100 pt-1.5">
                            <span className="dark:text-slate-400 text-slate-600 font-sans">Cumulative P/L:</span>
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

              {/* 3D Extruded Depth Underbelly Layer */}
              {is3DIsometric && (
                <Area
                  type="monotone"
                  dataKey="balanceDepth3D"
                  stroke="#0284c7"
                  strokeWidth={1.5}
                  strokeOpacity={0.6}
                  fill="url(#curve3dRibbonDepth)"
                  isAnimationActive={true}
                  name="3D Depth Layer"
                />
              )}

              {/* Main 3D Volumetric Area Ribbon */}
              <Area
                type="monotone"
                dataKey="balance"
                stroke="url(#neonCoreSpecular)"
                strokeWidth={3.5}
                fillOpacity={1}
                fill="url(#curve3dRibbonFront)"
                filter="url(#neonGlow3D)"
                isAnimationActive={true}
                activeDot={{
                  r: 7,
                  fill: "#00f2fe",
                  stroke: "#ffffff",
                  strokeWidth: 2.5,
                  className: "animate-beacon-dot",
                }}
              />

              {/* Live Shimmering Photon Stream */}
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#ffffff"
                strokeWidth={2}
                strokeOpacity={0.8}
                dot={false}
                isAnimationActive={false}
                className="animate-live-photon"
                name="Live Photon Stream"
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
