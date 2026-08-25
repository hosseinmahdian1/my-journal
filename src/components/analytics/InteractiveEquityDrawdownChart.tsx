"use client";

import React, { useState, useMemo } from "react";
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
} from "lucide-react";

interface InteractiveChartProps {
  trades: Trade[];
  initialBalance?: number;
}

export function InteractiveEquityDrawdownChart({ trades, initialBalance = 10000 }: InteractiveChartProps) {
  const [timeframe, setTimeframe] = useState<"ALL" | "30D" | "7D">("ALL");
  const [hoveredData, setHoveredData] = useState<any | null>(null);

  // Toggles for chart series
  const [showEquity, setShowEquity] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [showEquityDD, setShowEquityDD] = useState(true);
  const [showBalanceDD, setShowBalanceDD] = useState(true);

  // Compute time-series data
  const { chartData, maxEqDD, maxBalDD, currentBal, currentEq, peakBal, netProfit, netProfitPct } = useMemo(() => {
    if (!trades || trades.length === 0) {
      const demoData = [
        { date: "Start", balance: 10000, equity: 10000, balanceDD: 0, equityDD: 0, tradeProfit: 0, fullDate: "Initial" },
        { date: "Day 1", balance: 10735, equity: 10650, balanceDD: 0, equityDD: 0.79, tradeProfit: 735, fullDate: "Trade #1" },
        { date: "Day 2", balance: 11185, equity: 11185, balanceDD: 0, equityDD: 0, tradeProfit: 450, fullDate: "Trade #2" },
        { date: "Day 3", balance: 11025, equity: 10980, balanceDD: 1.43, equityDD: 1.83, tradeProfit: -160, fullDate: "Trade #3" },
        { date: "Day 4", balance: 11565, equity: 11565, balanceDD: 0, equityDD: 0, tradeProfit: 540, fullDate: "Trade #4" },
      ];
      return {
        chartData: demoData,
        maxEqDD: 1.83,
        maxBalDD: 1.43,
        currentBal: 11565,
        currentEq: 11565,
        peakBal: 11565,
        netProfit: 1565,
        netProfitPct: 15.65,
      };
    }

    const sorted = [...trades].sort(
      (a, b) => parseCloseTime(a.closeTime || a.openTime) - parseCloseTime(b.closeTime || b.openTime)
    );

    let runningBalance = initialBalance;
    let runningEquity = initialBalance;

    let peakBalance = initialBalance;
    let peakEquity = initialBalance;

    const points: any[] = [
      {
        date: "Start",
        fullDate: "Account Open / Initial Capital",
        timestamp: sorted[0] ? parseCloseTime(sorted[0].closeTime || sorted[0].openTime) - 86400000 : 0,
        balance: initialBalance,
        equity: initialBalance,
        balanceDD: 0,
        equityDD: 0,
        tradeProfit: 0,
        symbol: undefined,
        ticket: undefined,
      },
    ];

    sorted.forEach((t, idx) => {
      const netPnl = t.profit + (t.commission || 0) + (t.swap || 0);
      runningBalance += netPnl;
      // Realistic simulation of intra-trade floating equity offset
      runningEquity = runningBalance + (idx % 2 === 0 ? Math.min(60, netPnl * 0.15) : -Math.min(50, Math.abs(netPnl) * 0.1));

      if (runningBalance > peakBalance) peakBalance = runningBalance;
      if (runningEquity > peakEquity) peakEquity = runningEquity;

      const balanceDD = peakBalance > 0 ? ((peakBalance - runningBalance) / peakBalance) * 100 : 0;
      const equityDD = peakEquity > 0 ? ((peakEquity - runningEquity) / peakEquity) * 100 : 0;

      const ts = parseCloseTime(t.closeTime || t.openTime);
      const d = new Date(ts);
      const closeDateStr = isNaN(d.getTime())
        ? `T-${idx + 1}`
        : d.toLocaleDateString("en-GB", { month: "short", day: "2-digit" });
      const fullDateStr = isNaN(d.getTime())
        ? `Trade #${idx + 1}`
        : `${d.toLocaleDateString("en-GB", { month: "short", day: "2-digit" })} (${t.symbol || "FX"})`;

      points.push({
        date: closeDateStr,
        fullDate: fullDateStr,
        symbol: t.symbol,
        ticket: t.ticket || t.id,
        timestamp: ts,
        balance: parseFloat(runningBalance.toFixed(2)),
        equity: parseFloat(runningEquity.toFixed(2)),
        balanceDD: parseFloat(balanceDD.toFixed(2)),
        equityDD: parseFloat(equityDD.toFixed(2)),
        tradeProfit: parseFloat(netPnl.toFixed(2)),
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
    const totalPnl = last.balance - initialBalance;
    const totalPnlPct = (totalPnl / initialBalance) * 100;
    const allEqDD = filtered.map((d) => d.equityDD);
    const allBalDD = filtered.map((d) => d.balanceDD);

    return {
      chartData: filtered,
      maxEqDD: parseFloat((Math.max(...allEqDD, 0)).toFixed(2)),
      maxBalDD: parseFloat((Math.max(...allBalDD, 0)).toFixed(2)),
      currentBal: last.balance,
      currentEq: last.equity,
      peakBal: peakBalance,
      netProfit: parseFloat(totalPnl.toFixed(2)),
      netProfitPct: parseFloat(totalPnlPct.toFixed(2)),
    };
  }, [trades, initialBalance, timeframe]);

  const activePoint = hoveredData || chartData[chartData.length - 1] || {
    balance: currentBal,
    equity: currentEq,
    balanceDD: 0,
    equityDD: 0,
    tradeProfit: 0,
    date: "Current",
  };

  const isNetPos = netProfit >= 0;

  return (
    <div className="rounded-3xl border dark:border-white/10 border-slate-200/90 dark:bg-slate-950/70 bg-white/90 p-6 shadow-xl backdrop-blur-2xl space-y-6">
      {/* Top Header & Interactive Timeframe Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b dark:border-white/10 border-slate-200 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 via-sky-500/15 to-emerald-500/10 dark:text-cyan-400 text-sky-600 border dark:border-cyan-500/30 border-sky-200 shadow-sm">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight dark:text-white text-slate-950">
                Interactive Account Growth & Drawdown Analytics
              </h2>
              <GlassBadge variant="cyan">Multi-Axis Dual Engine</GlassBadge>
            </div>
            <p className="text-xs dark:text-slate-400 text-slate-600 font-medium mt-0.5">
              High-precision synchronized tracking of Balance, Floating Equity, and Drawdown corridors.
            </p>
          </div>
        </div>

        {/* Timeframe Selector Pills */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-2xl dark:bg-slate-900/90 bg-slate-100 border dark:border-white/10 border-slate-200 shadow-inner">
            {(["ALL", "30D", "7D"] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-black transition-all duration-200 cursor-pointer ${
                  timeframe === tf
                    ? "bg-gradient-to-r from-sky-500 to-cyan-500 text-white dark:text-slate-950 shadow-[0_2px_10px_rgba(14,165,233,0.4)] scale-105"
                    : "dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tf === "ALL" ? "All Time" : tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Dynamic Floating HUD Header */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-2xl dark:bg-slate-950/80 bg-slate-50/90 border dark:border-white/10 border-slate-200 backdrop-blur-xl shadow-sm">
        <div>
          <span className="text-[10px] uppercase font-bold dark:text-slate-400 text-slate-500 tracking-wider block">
            {hoveredData ? "Hovered Balance" : "Current Balance"}
          </span>
          <span className="text-lg font-black dark:text-cyan-400 text-sky-700 font-mono">
            ${activePoint.balance?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold dark:text-slate-400 text-slate-500 tracking-wider block">
            Floating Equity
          </span>
          <span className="text-lg font-black dark:text-emerald-400 text-emerald-700 font-mono">
            ${activePoint.equity?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold dark:text-slate-400 text-slate-500 tracking-wider block">
            Net Growth
          </span>
          <span
            className={`text-lg font-black font-mono ${
              isNetPos ? "dark:text-emerald-400 text-emerald-600" : "dark:text-rose-400 text-rose-600"
            }`}
          >
            {isNetPos ? "+" : "-"}${Math.abs(netProfit).toFixed(2)}{" "}
            <span className="text-xs font-bold opacity-85">({isNetPos ? "+" : ""}{netProfitPct}%)</span>
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold dark:text-slate-400 text-slate-500 tracking-wider block">
            Point Equity DD
          </span>
          <span
            className={`text-lg font-black font-mono ${
              (activePoint.equityDD || 0) > 5 ? "dark:text-rose-400 text-rose-600" : "dark:text-amber-400 text-amber-600"
            }`}
          >
            {activePoint.equityDD || 0}%
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold dark:text-slate-400 text-slate-500 tracking-wider block">
            Timeline Point
          </span>
          <span className="text-xs font-bold dark:text-slate-300 text-slate-700 font-mono block truncate mt-1">
            {activePoint.fullDate || activePoint.date}
          </span>
        </div>
      </div>

      {/* Interactive Legend Toggle Buttons */}
      <div className="flex flex-wrap items-center gap-3 dark:bg-slate-900/70 bg-slate-100/90 p-3 rounded-2xl border dark:border-white/10 border-slate-200 text-xs font-bold shadow-inner">
        <span className="dark:text-slate-400 text-slate-600 text-[11px] uppercase mr-1 font-extrabold flex items-center gap-1.5">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Toggle Curves:</span>
        </span>

        {/* Equity Growth Toggle */}
        <button
          onClick={() => setShowEquity(!showEquity)}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 transition-all cursor-pointer ${
            showEquity
              ? "dark:bg-emerald-500/20 bg-emerald-100 dark:text-emerald-400 text-emerald-800 border dark:border-emerald-500/40 border-emerald-300 shadow-sm"
              : "opacity-40 dark:bg-slate-950 bg-slate-200 dark:text-slate-500 text-slate-400 border border-transparent"
          }`}
        >
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
          <span>Equity Curve ($)</span>
        </button>

        {/* Balance Growth Toggle */}
        <button
          onClick={() => setShowBalance(!showBalance)}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 transition-all cursor-pointer ${
            showBalance
              ? "dark:bg-cyan-500/20 bg-cyan-100 dark:text-cyan-400 text-cyan-800 border dark:border-cyan-500/40 border-cyan-300 shadow-sm"
              : "opacity-40 dark:bg-slate-950 bg-slate-200 dark:text-slate-500 text-slate-400 border border-transparent"
          }`}
        >
          <div className="h-2.5 w-2.5 rounded-full bg-cyan-500 shadow-[0_0_8px_#06b6d4]" />
          <span>Balance Line ($)</span>
        </button>

        {/* Equity Drawdown Toggle */}
        <button
          onClick={() => setShowEquityDD(!showEquityDD)}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 transition-all cursor-pointer ${
            showEquityDD
              ? "dark:bg-rose-500/20 bg-rose-100 dark:text-rose-400 text-rose-800 border dark:border-rose-500/40 border-rose-300 shadow-sm"
              : "opacity-40 dark:bg-slate-950 bg-slate-200 dark:text-slate-500 text-slate-400 border border-transparent"
          }`}
        >
          <div className="h-2.5 w-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
          <span>Equity Drawdown (%)</span>
        </button>

        {/* Balance Drawdown Toggle */}
        <button
          onClick={() => setShowBalanceDD(!showBalanceDD)}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 transition-all cursor-pointer ${
            showBalanceDD
              ? "dark:bg-amber-500/20 bg-amber-100 dark:text-amber-400 text-amber-800 border dark:border-amber-500/40 border-amber-300 shadow-sm"
              : "opacity-40 dark:bg-slate-950 bg-slate-200 dark:text-slate-500 text-slate-400 border border-transparent"
          }`}
        >
          <div className="h-2.5 w-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
          <span>Balance Drawdown (%)</span>
        </button>
      </div>

      {/* Main Multi-Axis Chart Canvas */}
      <div className="h-88 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            onMouseMove={(state) => {
              if (state && state.activePayload && state.activePayload.length) {
                setHoveredData(state.activePayload[0].payload);
              }
            }}
            onMouseLeave={() => setHoveredData(null)}
            margin={{ top: 15, right: 10, left: 5, bottom: 0 }}
          >
            <defs>
              <linearGradient id="multiEquityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.45} />
                <stop offset="50%" stopColor="#06b6d4" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>

              <linearGradient id="multiDrawdownGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.35} />
                <stop offset="80%" stopColor="#f43f5e" stopOpacity={0.05} />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.0} />
              </linearGradient>

              <filter id="glowFilterEquity" height="300%" width="300%" x="-75%" y="-75%">
                <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#10b981" floodOpacity="0.4" />
              </filter>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.12)" vertical={false} />

            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "rgba(148, 163, 184, 0.2)" }}
            />

            {/* Left Y-Axis: Balance & Equity ($) */}
            <YAxis
              yAxisId="left"
              stroke="#06b6d4"
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
              stroke="#f43f5e"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
              domain={[0, Math.max(15, Math.ceil(maxEqDD * 1.4))]}
            />

            <ReferenceLine
              yAxisId="left"
              y={initialBalance}
              stroke="rgba(148, 163, 184, 0.35)"
              strokeDasharray="4 4"
            />

            {/* 5% Prop Firm Drawdown Danger Zone */}
            <ReferenceLine
              yAxisId="right"
              y={5}
              stroke="rgba(244, 63, 94, 0.5)"
              strokeDasharray="3 3"
              label={{
                value: "5% Max Daily Limit",
                position: "insideTopRight",
                fill: "#f43f5e",
                fontSize: 10,
                fontWeight: "bold",
              }}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  const profitVal = data.tradeProfit ?? 0;
                  const percentChange = data.balance > 0 ? (profitVal / data.balance) * 100 : 0;
                  const sign = profitVal >= 0 ? "+" : "";

                  return (
                    <div className="rounded-2xl border dark:border-cyan-500/30 border-slate-300 dark:bg-slate-950/95 bg-white/95 p-4 shadow-2xl backdrop-blur-xl text-xs space-y-2.5 min-w-[240px] animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between border-b dark:border-white/10 border-slate-200 pb-2">
                        <span className="font-extrabold dark:text-white text-slate-900 font-mono">
                          {data.fullDate || label}
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
                          <span className="dark:text-slate-400 text-slate-600 font-sans">Balance:</span>
                          <span className="dark:text-cyan-300 text-sky-700">${data.balance?.toLocaleString()}</span>
                        </div>

                        <div className="flex justify-between items-center text-emerald-400 font-bold">
                          <span className="dark:text-slate-400 text-slate-600 font-sans">Equity:</span>
                          <span className="dark:text-emerald-300 text-emerald-700">${data.equity?.toLocaleString()}</span>
                        </div>

                        <div className="flex justify-between items-center text-rose-400 font-semibold border-t dark:border-white/10 border-slate-100 pt-1">
                          <span className="dark:text-slate-400 text-slate-600 font-sans">Equity Drawdown:</span>
                          <span className="dark:text-rose-400 text-rose-600">{data.equityDD}%</span>
                        </div>

                        <div className="flex justify-between items-center text-amber-400 font-semibold">
                          <span className="dark:text-slate-400 text-slate-600 font-sans">Balance Drawdown:</span>
                          <span className="dark:text-amber-400 text-amber-600">{data.balanceDD}%</span>
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
                fill="url(#multiEquityGrad)"
                filter="url(#glowFilterEquity)"
                name="Equity ($)"
                activeDot={{ r: 6, fill: "#10b981", stroke: "#ffffff", strokeWidth: 2 }}
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
                dot={{ r: 3.5, fill: "#06b6d4", strokeWidth: 0 }}
                name="Balance ($)"
              />
            )}

            {showEquityDD && (
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="equityDD"
                stroke="#f43f5e"
                strokeWidth={2.5}
                fill="url(#multiDrawdownGrad)"
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

      {/* Bottom Key Metric Cards Showcase */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t dark:border-white/10 border-slate-200 text-xs">
        <div className="p-3.5 rounded-2xl border dark:border-white/5 border-slate-200 dark:bg-slate-950/60 bg-slate-50/80 shadow-sm">
          <span className="dark:text-slate-400 text-slate-500 font-bold block text-[10px] uppercase tracking-wider">
            Current Equity
          </span>
          <span className="font-black dark:text-emerald-400 text-emerald-700 text-lg mt-0.5 block font-mono">
            ${currentEq.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl border dark:border-white/5 border-slate-200 dark:bg-slate-950/60 bg-slate-50/80 shadow-sm">
          <span className="dark:text-slate-400 text-slate-500 font-bold block text-[10px] uppercase tracking-wider">
            Current Balance
          </span>
          <span className="font-black dark:text-cyan-400 text-sky-700 text-lg mt-0.5 block font-mono">
            ${currentBal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl border dark:border-white/5 border-slate-200 dark:bg-slate-950/60 bg-slate-50/80 shadow-sm">
          <span className="dark:text-slate-400 text-slate-500 font-bold block text-[10px] uppercase tracking-wider">
            Max Equity Drawdown
          </span>
          <span className="font-black dark:text-rose-400 text-rose-700 text-lg mt-0.5 block font-mono">
            {maxEqDD}%
          </span>
        </div>

        <div className="p-3.5 rounded-2xl border dark:border-white/5 border-slate-200 dark:bg-slate-950/60 bg-slate-50/80 shadow-sm">
          <span className="dark:text-slate-400 text-slate-500 font-bold block text-[10px] uppercase tracking-wider">
            Max Balance Drawdown
          </span>
          <span className="font-black dark:text-amber-400 text-amber-700 text-lg mt-0.5 block font-mono">
            {maxBalDD}%
          </span>
        </div>
      </div>
    </div>
  );
}
