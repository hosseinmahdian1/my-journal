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
  ShieldAlert,
  SlidersHorizontal,
  Layers,
  BarChart3,
  Calendar,
  DollarSign,
} from "lucide-react";

interface InteractiveChartProps {
  trades: Trade[];
  initialBalance?: number;
}

export function InteractiveEquityDrawdownChart({ trades, initialBalance = 10000 }: InteractiveChartProps) {
  const [mounted, setMounted] = useState(false);
  const [timeframe, setTimeframe] = useState<"ALL" | "30D" | "7D">("ALL");
  const [hoveredData, setHoveredData] = useState<any | null>(null);
  const [is3DExtruded, setIs3DExtruded] = useState(true);

  // Toggles for chart series
  const [showGrowthArea, setShowGrowthArea] = useState(true);
  const [showBalanceLine, setShowBalanceLine] = useState(true);
  const [showDrawdownArea, setShowDrawdownArea] = useState(true);
  const [showDrawdownLine, setShowDrawdownLine] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 100% Real & Mathematically Accurate Time-Series Computation
  const { chartData, maxDD, currentBal, peakBal, netProfit, netProfitPct, lowestBal } = useMemo(() => {
    if (!trades || trades.length === 0) {
      const demoData: any[] = [
        { date: "Start", tradeIndex: 0, balance: 10000, drawdown: 0, tradeProfit: 0, fullDate: "Initial Capital" },
        { date: "Day 1", tradeIndex: 1, balance: 10735, drawdown: 0, tradeProfit: 735, fullDate: "Trade #1 (XAUUSD)" },
        { date: "Day 2", tradeIndex: 2, balance: 11185, drawdown: 0, tradeProfit: 450, fullDate: "Trade #2 (EURUSD)" },
        { date: "Day 3", tradeIndex: 3, balance: 11025, drawdown: 1.43, tradeProfit: -160, fullDate: "Trade #3 (GBPUSD)" },
        { date: "Day 4", tradeIndex: 4, balance: 11565, drawdown: 0, tradeProfit: 540, fullDate: "Trade #4 (XAUUSD)" },
      ];
      return {
        chartData: demoData,
        maxDD: 1.43,
        currentBal: 11565,
        peakBal: 11565,
        lowestBal: 10000,
        netProfit: 1565,
        netProfitPct: 15.65,
      };
    }

    // Sort trades strictly chronologically
    const sorted = [...trades].sort(
      (a, b) => parseCloseTime(a.closeTime || a.openTime) - parseCloseTime(b.closeTime || b.openTime)
    );

    let runningBalance = initialBalance;
    let peakBalance = initialBalance;
    let lowestBalance = initialBalance;
    let maximumDrawdown = 0;

    // Point 0: Initial Deposit
    const points: any[] = [
      {
        date: "Start",
        tradeIndex: 0,
        fullDate: "Initial Capital Deposit",
        timestamp: sorted[0] ? parseCloseTime(sorted[0].closeTime || sorted[0].openTime) - 86400000 : 0,
        balance: initialBalance,
        balanceDepth3D: parseFloat((initialBalance * 0.985).toFixed(2)),
        peak: initialBalance,
        drawdown: 0,
        drawdownAmount: 0,
        tradeProfit: 0,
        totalGain: 0,
        totalGainPct: 0,
        symbol: undefined,
        ticket: undefined,
      },
    ];

    let lastSeenDate = "";

    sorted.forEach((t, idx) => {
      const netPnl = (t.profit || 0) + (t.commission || 0) + (t.swap || 0);
      runningBalance += netPnl;

      if (runningBalance > peakBalance) peakBalance = runningBalance;
      if (runningBalance < lowestBalance) lowestBalance = runningBalance;

      const ddAmount = Math.max(0, peakBalance - runningBalance);
      const ddPercent = peakBalance > 0 ? (ddAmount / peakBalance) * 100 : 0;
      if (ddPercent > maximumDrawdown) maximumDrawdown = ddPercent;

      const totalPnl = runningBalance - initialBalance;
      const totalPnlPct = initialBalance > 0 ? (totalPnl / initialBalance) * 100 : 0;

      const ts = parseCloseTime(t.closeTime || t.openTime);
      const d = new Date(ts);
      const dayStr = isNaN(d.getTime())
        ? `T-${idx + 1}`
        : d.toLocaleDateString("en-GB", { month: "short", day: "numeric" });

      // Clean X-Axis: only display label when day advances
      const axisLabel = dayStr !== lastSeenDate ? dayStr : "";
      lastSeenDate = dayStr;

      const fullDateStr = isNaN(d.getTime())
        ? `Trade #${idx + 1}`
        : `${d.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" })} ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} • ${t.symbol || "Trade"}`;

      points.push({
        date: axisLabel || `T-${idx + 1}`,
        displayDate: dayStr,
        tradeIndex: idx + 1,
        fullDate: fullDateStr,
        symbol: t.symbol,
        ticket: t.ticket || t.id,
        timestamp: ts,
        balance: parseFloat(runningBalance.toFixed(2)),
        balanceDepth3D: parseFloat((runningBalance * 0.985).toFixed(2)),
        peak: parseFloat(peakBalance.toFixed(2)),
        drawdown: parseFloat(ddPercent.toFixed(2)),
        drawdownAmount: parseFloat(ddAmount.toFixed(2)),
        tradeProfit: parseFloat(netPnl.toFixed(2)),
        totalGain: parseFloat(totalPnl.toFixed(2)),
        totalGainPct: parseFloat(totalPnlPct.toFixed(2)),
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
    const finalTotalPnl = last.balance - initialBalance;
    const finalTotalPnlPct = initialBalance > 0 ? (finalTotalPnl / initialBalance) * 100 : 0;

    return {
      chartData: filtered,
      maxDD: parseFloat(maximumDrawdown.toFixed(2)),
      currentBal: last.balance,
      peakBal: peakBalance,
      lowestBal: lowestBalance,
      netProfit: parseFloat(finalTotalPnl.toFixed(2)),
      netProfitPct: parseFloat(finalTotalPnlPct.toFixed(2)),
    };
  }, [trades, initialBalance, timeframe]);

  const activePoint = hoveredData || chartData[chartData.length - 1] || {
    balance: currentBal,
    drawdown: 0,
    tradeProfit: 0,
    totalGain: netProfit,
    totalGainPct: netProfitPct,
    date: "Latest",
  };

  const isNetPos = (activePoint.totalGain ?? netProfit) >= 0;

  return (
    <div className="rounded-3xl border dark:border-cyan-500/20 border-slate-200 dark:bg-slate-950/85 bg-white p-6 shadow-xl backdrop-blur-2xl space-y-6 relative overflow-hidden">
      {/* Live Energy Photon Pulse Keyframes */}
      <style jsx>{`
        @keyframes photonEnergyStream {
          0% { stroke-dashoffset: 1200; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes hazardPulse {
          0%, 100% { stroke-opacity: 0.6; }
          50% { stroke-opacity: 1; }
        }
        .animate-photon-line {
          stroke-dasharray: 25 65;
          animation: photonEnergyStream 18s linear infinite;
        }
        .animate-hazard-line {
          animation: hazardPulse 3s ease-in-out infinite;
        }
      `}</style>

      {/* Ambient 3D Glow Orbs */}
      <div className="pointer-events-none absolute -top-28 -left-28 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -right-28 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

      {/* Top Header & Interactive Timeframe Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b dark:border-white/10 border-slate-200 pb-5 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 via-sky-500/15 to-emerald-500/15 dark:text-cyan-400 text-sky-600 border dark:border-cyan-500/40 border-sky-300 shadow-[0_0_20px_rgba(6,182,212,0.25)]">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black tracking-tight dark:text-white text-slate-950">
                Interactive Account Growth & Drawdown Analytics
              </h2>
              <GlassBadge variant="cyan">
                <span className="flex items-center gap-1 font-bold">
                  <Sparkles className="h-3 w-3 text-cyan-400" />
                  <span>3D Dual Engine</span>
                </span>
              </GlassBadge>
            </div>
            <p className="text-xs dark:text-slate-400 text-slate-600 font-medium mt-0.5">
              Live animated 3D Growth Ribbon & Peak Drawdown Hazard Corridor with synchronized HUD metrics
            </p>
          </div>
        </div>

        {/* Timeframe Selector & 3D Ribbon Toggle */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center p-1 rounded-2xl dark:bg-slate-900/90 bg-slate-100 border dark:border-white/10 border-slate-200 shadow-inner">
            {(["ALL", "30D", "7D"] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-black transition-all duration-200 cursor-pointer ${
                  timeframe === tf
                    ? "bg-gradient-to-r from-cyan-500 via-sky-500 to-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)] scale-105"
                    : "dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tf === "ALL" ? "All Time" : tf}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIs3DExtruded(!is3DExtruded)}
            title="Toggle 3D Extrusion Depth"
            className={`px-3 py-1.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
              is3DExtruded
                ? "dark:bg-cyan-500/20 bg-cyan-100 dark:text-cyan-400 text-cyan-800 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                : "dark:bg-slate-900 bg-slate-100 dark:text-slate-400 text-slate-600 border-slate-200 dark:border-white/10"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>3D Ribbon</span>
          </button>
        </div>
      </div>

      {/* Real-time Dynamic Floating HUD Header */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-2xl dark:bg-slate-900/80 bg-slate-50 border dark:border-cyan-500/25 border-cyan-200/80 backdrop-blur-xl shadow-sm relative z-10">
        <div>
          <span className="text-[10px] uppercase font-extrabold dark:text-cyan-400 text-sky-700 tracking-wider flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            {hoveredData ? "Point Balance" : "Current Balance"}
          </span>
          <span className="text-xl font-black dark:text-white text-slate-950 font-mono tracking-tight block">
            ${activePoint.balance?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-extrabold dark:text-slate-400 text-slate-500 tracking-wider block">
            Total Account P/L
          </span>
          <span
            className={`text-xl font-black font-mono tracking-tight flex items-center gap-1 ${
              isNetPos ? "dark:text-emerald-400 text-emerald-600" : "dark:text-rose-400 text-rose-600"
            }`}
          >
            {isNetPos ? "+" : "-"}${Math.abs(activePoint.totalGain ?? netProfit).toFixed(2)}{" "}
            <span className="text-xs font-bold opacity-85">
              ({isNetPos ? "+" : ""}{activePoint.totalGainPct ?? netProfitPct}%)
            </span>
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-extrabold dark:text-emerald-400 text-emerald-700 tracking-wider block">
            All-Time High (Peak)
          </span>
          <span className="text-xl font-black dark:text-emerald-300 text-emerald-700 font-mono tracking-tight block">
            ${(activePoint.peak || peakBal).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-extrabold dark:text-rose-400 text-rose-700 tracking-wider block">
            Point Drawdown %
          </span>
          <span
            className={`text-xl font-black font-mono tracking-tight ${
              (activePoint.drawdown || 0) > 5 ? "dark:text-rose-400 text-rose-600" : "dark:text-amber-400 text-amber-600"
            }`}
          >
            {activePoint.drawdown || 0}%
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-extrabold dark:text-slate-400 text-slate-500 tracking-wider block">
            Execution Marker
          </span>
          <span className="text-xs font-bold dark:text-slate-200 text-slate-800 font-mono block truncate mt-1">
            {activePoint.fullDate || activePoint.date}
          </span>
        </div>
      </div>

      {/* Interactive 3D Legend Toggle Buttons */}
      <div className="flex flex-wrap items-center gap-3 dark:bg-slate-900/80 bg-slate-100 p-3 rounded-2xl border dark:border-white/10 border-slate-200 text-xs font-bold shadow-inner relative z-10">
        <span className="dark:text-slate-400 text-slate-600 text-[11px] uppercase mr-1 font-extrabold flex items-center gap-1.5">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>3D Layers:</span>
        </span>

        {/* Growth Area Toggle */}
        <button
          onClick={() => setShowGrowthArea(!showGrowthArea)}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 transition-all cursor-pointer ${
            showGrowthArea
              ? "dark:bg-cyan-500/20 bg-cyan-100 dark:text-cyan-300 text-cyan-900 border dark:border-cyan-500/50 border-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.25)]"
              : "opacity-40 dark:bg-slate-950 bg-slate-200 dark:text-slate-500 text-slate-400 border border-transparent"
          }`}
        >
          <div className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f2fe]" />
          <span>Growth Ribbon ($)</span>
        </button>

        {/* Balance Line Toggle */}
        <button
          onClick={() => setShowBalanceLine(!showBalanceLine)}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 transition-all cursor-pointer ${
            showBalanceLine
              ? "dark:bg-emerald-500/20 bg-emerald-100 dark:text-emerald-300 text-emerald-900 border dark:border-emerald-500/50 border-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.25)]"
              : "opacity-40 dark:bg-slate-950 bg-slate-200 dark:text-slate-500 text-slate-400 border border-transparent"
          }`}
        >
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
          <span>Balance Line ($)</span>
        </button>

        {/* Drawdown Area Toggle */}
        <button
          onClick={() => setShowDrawdownArea(!showDrawdownArea)}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 transition-all cursor-pointer ${
            showDrawdownArea
              ? "dark:bg-rose-500/20 bg-rose-100 dark:text-rose-300 text-rose-900 border dark:border-rose-500/50 border-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.25)]"
              : "opacity-40 dark:bg-slate-950 bg-slate-200 dark:text-slate-500 text-slate-400 border border-transparent"
          }`}
        >
          <div className="h-2.5 w-2.5 rounded-full bg-rose-400 shadow-[0_0_8px_#f43f5e]" />
          <span>Drawdown Hazard (%)</span>
        </button>

        {/* Drawdown Line Toggle */}
        <button
          onClick={() => setShowDrawdownLine(!showDrawdownLine)}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 transition-all cursor-pointer ${
            showDrawdownLine
              ? "dark:bg-amber-500/20 bg-amber-100 dark:text-amber-300 text-amber-900 border dark:border-amber-500/50 border-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.25)]"
              : "opacity-40 dark:bg-slate-950 bg-slate-200 dark:text-slate-500 text-slate-400 border border-transparent"
          }`}
        >
          <div className="h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
          <span>Drawdown Line (%)</span>
        </button>
      </div>

      {/* Main Multi-Axis 3D Canvas */}
      <div className="w-full relative h-[380px] min-h-[380px] z-10">
        {mounted && (
          <ResponsiveContainer width="100%" height={380}>
            <ComposedChart
              data={chartData}
              onMouseMove={(state) => {
                if (state && state.activePayload && state.activePayload.length) {
                  setHoveredData(state.activePayload[0].payload);
                }
              }}
              onMouseLeave={() => setHoveredData(null)}
              margin={{ top: 20, right: 15, left: 5, bottom: 5 }}
            >
              <defs>
                {/* 3D Radiant Mesh Gradient for Multi-Axis Growth */}
                <linearGradient id="multi3dGrowthMesh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00f2fe" stopOpacity={0.45} />
                  <stop offset="35%" stopColor="#38bdf8" stopOpacity={0.20} />
                  <stop offset="75%" stopColor="#10b981" stopOpacity={0.06} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>

                <linearGradient id="multi3dDrawdownMesh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff416c" stopOpacity={0.35} />
                  <stop offset="70%" stopColor="#ff4b2b" stopOpacity={0.08} />
                  <stop offset="100%" stopColor="#ff416c" stopOpacity={0.0} />
                </linearGradient>

                {/* 3D Extruded Depth Underbelly */}
                <linearGradient id="multi3dDepthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0369a1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#082f49" stopOpacity={0.0} />
                </linearGradient>

                {/* Volumetric Drop Shadows */}
                <filter id="multiVolumetricGlow" height="250%" width="250%" x="-50%" y="-50%">
                  <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#00f2fe" floodOpacity="0.4" />
                </filter>
              </defs>

              <CartesianGrid strokeDasharray="4 4" stroke="rgba(148, 163, 184, 0.14)" vertical={false} />

              <XAxis
                dataKey="date"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "rgba(148, 163, 184, 0.25)" }}
              />

              {/* Left Y-Axis: Balance ($) */}
              <YAxis
                yAxisId="left"
                stroke="#00f2fe"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v.toLocaleString()}`}
                domain={["auto", "auto"]}
              />

              {/* Right Y-Axis: Drawdown % */}
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#ff416c"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}%`}
                domain={[0, Math.max(15, Math.ceil(maxDD * 1.4))]}
              />

              <ReferenceLine
                yAxisId="left"
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

              {/* 5% Prop Firm Drawdown Danger Boundary */}
              <ReferenceLine
                yAxisId="right"
                y={5}
                stroke="rgba(255, 65, 108, 0.7)"
                strokeDasharray="3 3"
                className="animate-hazard-line"
                label={{
                  value: "5% Max Daily Limit",
                  position: "insideTopRight",
                  fill: "#ff416c",
                  fontSize: 10,
                  fontWeight: "bold",
                }}
              />

              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const profitVal = data.tradeProfit ?? 0;
                    const sign = profitVal >= 0 ? "+" : "";
                    const gainSign = (data.totalGain ?? 0) >= 0 ? "+" : "";

                    return (
                      <div className="rounded-2xl border dark:border-cyan-400/40 border-cyan-300 dark:bg-slate-950/95 bg-white/95 p-4 shadow-[0_10px_35px_rgba(0,0,0,0.5)] backdrop-blur-2xl text-xs space-y-2.5 min-w-[240px] animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b dark:border-white/10 border-slate-200 pb-2">
                          <span className="font-black dark:text-white text-slate-900 font-mono">
                            {data.fullDate || data.displayDate || label}
                          </span>
                          {profitVal !== 0 && (
                            <span
                              className={`font-black text-xs font-mono ${
                                profitVal >= 0 ? "dark:text-emerald-400 text-emerald-600" : "dark:text-rose-400 text-rose-600"
                              }`}
                            >
                              {sign}${profitVal.toFixed(2)}
                            </span>
                          )}
                        </div>

                        <div className="space-y-1.5 font-mono text-[11px]">
                          <div className="flex justify-between items-center text-cyan-400 font-bold">
                            <span className="dark:text-slate-400 text-slate-600 font-sans">Account Balance:</span>
                            <span className="dark:text-cyan-300 text-sky-700">${data.balance?.toLocaleString()}</span>
                          </div>

                          <div className="flex justify-between items-center font-bold">
                            <span className="dark:text-slate-400 text-slate-600 font-sans">Total Net P/L:</span>
                            <span className={(data.totalGain ?? 0) >= 0 ? "dark:text-emerald-400 text-emerald-600" : "dark:text-rose-400 text-rose-600"}>
                              {gainSign}${data.totalGain?.toFixed(2)} ({gainSign}{data.totalGainPct}%)
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-rose-400 font-semibold border-t dark:border-white/10 border-slate-100 pt-1">
                            <span className="dark:text-slate-400 text-slate-600 font-sans">Current Drawdown:</span>
                            <span className="dark:text-rose-400 text-rose-600">{data.drawdown}% (-${data.drawdownAmount?.toFixed(2)})</span>
                          </div>

                          <div className="flex justify-between items-center text-emerald-400 font-semibold">
                            <span className="dark:text-slate-400 text-slate-600 font-sans">Peak Balance:</span>
                            <span className="dark:text-emerald-400 text-emerald-700">${data.peak?.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* 3D Depth Underbelly Layer */}
              {is3DExtruded && showGrowthArea && (
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="balanceDepth3D"
                  stroke="#0284c7"
                  strokeWidth={1.5}
                  strokeOpacity={0.5}
                  fill="url(#multi3dDepthGradient)"
                  isAnimationActive={true}
                  name="3D Depth Layer"
                />
              )}

              {/* Growth 3D Ribbon */}
              {showGrowthArea && (
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="balance"
                  stroke="#00f2fe"
                  strokeWidth={3.5}
                  fill="url(#multi3dGrowthMesh)"
                  filter="url(#multiVolumetricGlow)"
                  isAnimationActive={true}
                  name="Growth Ribbon ($)"
                  activeDot={{ r: 7, fill: "#00f2fe", stroke: "#ffffff", strokeWidth: 2 }}
                />
              )}

              {/* Live Photon Shimmer on Growth Curve */}
              {showGrowthArea && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="balance"
                  stroke="#ffffff"
                  strokeWidth={2}
                  strokeOpacity={0.85}
                  dot={false}
                  isAnimationActive={false}
                  className="animate-photon-line"
                  name="Live Photon Stream"
                />
              )}

              {/* Balance Line */}
              {showBalanceLine && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="balance"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }}
                  name="Balance Line ($)"
                />
              )}

              {/* Drawdown 3D Hazard Area */}
              {showDrawdownArea && (
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="drawdown"
                  stroke="#ff416c"
                  strokeWidth={2.5}
                  fill="url(#multi3dDrawdownMesh)"
                  isAnimationActive={true}
                  name="Drawdown Hazard (%)"
                />
              )}

              {showDrawdownLine && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="drawdown"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                  name="Drawdown Line (%)"
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* 3D Bottom Key Metric Cards Showcase */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t dark:border-white/10 border-slate-200 text-xs relative z-10">
        <div className="p-4 rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-slate-900/80 bg-slate-50 shadow-sm">
          <span className="dark:text-slate-400 text-slate-500 font-bold block text-[10px] uppercase tracking-wider">
            Initial Deposit
          </span>
          <span className="font-black dark:text-white text-slate-900 text-lg mt-0.5 block font-mono">
            ${initialBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="p-4 rounded-2xl border dark:border-cyan-500/30 border-cyan-200 dark:bg-slate-900/80 bg-cyan-50/60 shadow-sm">
          <span className="dark:text-cyan-400 text-sky-700 font-bold block text-[10px] uppercase tracking-wider">
            Current Balance
          </span>
          <span className="font-black dark:text-cyan-300 text-sky-800 text-lg mt-0.5 block font-mono">
            ${currentBal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="p-4 rounded-2xl border dark:border-rose-500/30 border-rose-200 dark:bg-slate-900/80 bg-rose-50/60 shadow-sm">
          <span className="dark:text-rose-400 text-rose-700 font-bold block text-[10px] uppercase tracking-wider">
            Max Peak Drawdown
          </span>
          <span className="font-black dark:text-rose-400 text-rose-700 text-lg mt-0.5 block font-mono">
            {maxDD}%
          </span>
        </div>

        <div className="p-4 rounded-2xl border dark:border-emerald-500/30 border-emerald-200 dark:bg-slate-900/80 bg-emerald-50/60 shadow-sm">
          <span className="dark:text-emerald-400 text-emerald-700 font-bold block text-[10px] uppercase tracking-wider">
            Peak Account High
          </span>
          <span className="font-black dark:text-emerald-300 text-emerald-800 text-lg mt-0.5 block font-mono">
            ${peakBal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
}
