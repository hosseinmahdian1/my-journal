"use client";

import React, { useState, useEffect, useMemo } from "react";
import { GlassCard } from "@/components/ui/glass/GlassCard";
import { GlassButton } from "@/components/ui/glass/GlassButton";
import { GlassBadge } from "@/components/ui/glass/GlassBadge";
import { loadTrades, loadJournals, loadAccounts, getActiveAccountId, INITIAL_ECONOMIC_EVENTS } from "@/lib/storage/store";
import { calculateAdvancedStatistics } from "@/lib/analytics/stats-calculator";
import { Trade, AdvancedStatistics, TradeJournal } from "@/types/trade";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Activity,
  Award,
  Zap,
  Flame,
  Brain,
  Newspaper,
  Sparkles,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { TradeDetailModal } from "@/components/journal/TradeDetailModal";

export default function DashboardPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [journals, setJournals] = useState<Record<string, TradeJournal>>({});
  const [stats, setStats] = useState<AdvancedStatistics | null>(null);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState<"all" | "day" | "week" | "month">("all");

  const refreshData = () => {
    const loadedTrades = loadTrades();
    const loadedJournals = loadJournals();
    const accounts = loadAccounts();
    const activeId = getActiveAccountId();
    const activeAccount = accounts.find(a => a.id === activeId) || accounts[0];
    const initialBal = activeAccount?.initialBalance || 10000;
    setTrades(loadedTrades);
    setJournals(loadedJournals);
    setStats(calculateAdvancedStatistics(loadedTrades, initialBal));
  };

  useEffect(() => {
    refreshData();
    window.addEventListener("storage", refreshData);
    window.addEventListener("focus", refreshData);
    return () => {
      window.removeEventListener("storage", refreshData);
      window.removeEventListener("focus", refreshData);
    };
  }, []);

  const filteredTrades = useMemo(() => {
    if (!trades) return [];
    const sortedTrades = [...trades].sort(
      (a, b) => new Date(b.closeTime || 0).getTime() - new Date(a.closeTime || 0).getTime()
    );
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return sortedTrades.filter((t) => {
      if (timeFilter === "all") return true;
      const closeDate = new Date(t.closeTime);
      if (timeFilter === "day") return closeDate >= startOfToday;
      if (timeFilter === "week") {
        const weekAgo = new Date(startOfToday);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return closeDate >= weekAgo;
      }
      if (timeFilter === "month") {
        const monthAgo = new Date(startOfToday);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return closeDate >= monthAgo;
      }
      return true;
    });
  }, [trades, timeFilter]);

  if (!stats) return null;

  const isProfitToday = stats.todayProfit >= 0;

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Overview */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-black tracking-tight dark:text-white text-slate-950">
              Forex Intelligence Journal
            </h1>
            <GlassBadge variant="cyan" className="font-bold">
              Obsidian Glass
            </GlassBadge>
          </div>
          <p className="mt-1 text-xs dark:text-slate-400 text-slate-600 font-medium">
            Real-time analytics, MT4/MT5 report parsing & Persian AI performance metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/import">
            <GlassButton variant="primary">
              <Zap className="h-4 w-4" />
              <span>Import Trades</span>
            </GlassButton>
          </Link>
          <Link href="/journal">
            <GlassButton variant="secondary">
              <span>View Journal</span>
              <ChevronRight className="h-4 w-4" />
            </GlassButton>
          </Link>
        </div>
      </div>

      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Account Balance */}
        <GlassCard glowColor="cyan">
          <div className="flex items-center justify-between dark:text-slate-400 text-slate-600">
            <span className="text-xs font-bold uppercase tracking-wider">Account Balance</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold dark:text-white text-slate-950">${stats.balance.toLocaleString()}</div>
            <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>+${stats.totalNetProfit.toLocaleString()} Net Gain</span>
            </div>
          </div>
        </GlassCard>

        {/* Today's P/L */}
        <GlassCard glowColor={isProfitToday ? "green" : "red"}>
          <div className="flex items-center justify-between dark:text-slate-400 text-slate-600">
            <span className="text-xs font-bold uppercase tracking-wider">Today&apos;s P/L</span>
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${isProfitToday ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"}`}>
              {isProfitToday ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-3xl font-extrabold ${isProfitToday ? "text-emerald-400" : "text-rose-400"}`}>
              {isProfitToday ? "+" : ""}${stats.todayProfit.toLocaleString()}
            </div>
            <div className="mt-1 text-xs dark:text-slate-400 text-slate-600">
              Weekly: <span className={stats.weeklyProfit >= 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>${stats.weeklyProfit}</span>
            </div>
          </div>
        </GlassCard>

        {/* Win Rate */}
        <GlassCard glowColor="purple">
          <div className="flex items-center justify-between dark:text-slate-400 text-slate-600">
            <span className="text-xs font-bold uppercase tracking-wider">Win Rate</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400">
              <PieChart className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold dark:text-white text-slate-950">{stats.winRate}%</div>
            <div className="mt-1 text-xs dark:text-slate-400 text-slate-600 font-medium">
              {stats.winningTrades} Wins / {stats.losingTrades} Losses
            </div>
          </div>
        </GlassCard>

        {/* Profit Factor & Sharpe */}
        <GlassCard glowColor="gold">
          <div className="flex items-center justify-between dark:text-slate-400 text-slate-600">
            <span className="text-xs font-bold uppercase tracking-wider">Profit Factor</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-amber-400">{stats.profitFactor}</div>
            <div className="mt-1 text-xs dark:text-slate-400 text-slate-600">
              Sharpe: <span className="font-bold dark:text-slate-200 text-slate-800">{stats.sharpeRatio}</span> | Max DD: <span className="text-rose-400 font-bold">{stats.maxDrawdownPercent}%</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Main Interactive Growth Chart & Persian AI Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance Growth Curve */}
        <GlassCard className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold dark:text-white text-slate-950 flex items-center gap-2">
                <Activity className="h-5 w-5 text-cyan-400" />
                <span>Account Equity Trajectory</span>
              </h2>
              <p className="text-xs dark:text-slate-400 text-slate-600 font-medium">Real-time cumulative trade growth</p>
            </div>
            <GlassBadge variant="cyan">Interactive</GlassBadge>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.equityCurve}>
                <defs>
                  <linearGradient id="balanceGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={["auto", "auto"]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(10,10,14,0.95)",
                    borderColor: "rgba(255,255,255,0.15)",
                    borderRadius: "14px",
                    color: "#fff",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#balanceGlow)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Persian AI Suggestions Card */}
        <GlassCard glowColor="purple" className="flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-400" />
                <h3 className="font-bold dark:text-white text-slate-950">توصیه‌های هوش مصنوعی</h3>
              </div>
              <GlassBadge variant="purple">AI فارسی</GlassBadge>
            </div>

            <div className="rounded-xl border dark:border-purple-500/30 border-purple-300 dark:bg-purple-950/20 bg-purple-50 p-3.5 text-xs dark:text-purple-200 text-purple-900 leading-relaxed font-persian space-y-2">
              <p className="font-bold dark:text-purple-300 text-purple-950 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                تحلیل عملکرد و روانشناسی معاملاتی:
              </p>
              <p>
                وین‌ریت شما در معاملات طلا (XAUUSD) در سشن نیویورک بیش از **٪۷۸** است. رعایت انضباط شخصیتی و مدیریت ریسک در سشن‌های پرحجم باعث حفظ بازدهی سود شما شده است.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t dark:border-white/10 border-black/10">
            <div className="flex items-center justify-between text-xs">
              <span className="dark:text-slate-400 text-slate-600 font-medium flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-amber-400" />
                Winning Streak
              </span>
              <span className="font-extrabold text-emerald-400">{stats.maxConsecutiveWinsCount} Trades</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="dark:text-slate-400 text-slate-600 font-medium flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
                Max Drawdown
              </span>
              <span className="font-extrabold text-rose-400">-{stats.maxDrawdownPercent}% (${stats.maxDrawdownAmount})</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Bottom Grid: Executions & Macro News */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Trades Table */}
        <GlassCard className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold dark:text-white text-slate-950">Recent Trade Executions</h2>
            <div className="flex items-center gap-2">
              {(["all", "day", "week", "month"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setTimeFilter(f)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${timeFilter === f ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40" : "dark:text-slate-400 text-slate-500 hover:bg-white/5"}`}
                >
                  {f === "all" ? "All" : f === "day" ? "Today" : f === "week" ? "This Week" : "This Month"}
                </button>
              ))}
              <Link href="/journal" className="text-xs text-cyan-400 hover:underline font-semibold ml-2">
                View All ({filteredTrades.length})
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b dark:border-white/10 border-black/10 dark:text-slate-400 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="pb-3 font-mono">Ticket #</th>
                  <th className="pb-3">Symbol</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Lots</th>
                  <th className="pb-3">Open Time</th>
                  <th className="pb-3">Close Time</th>
                  <th className="pb-3">Entry</th>
                  <th className="pb-3">Exit</th>
                  <th className="pb-3">R:R</th>
                  <th className="pb-3 text-right">Net Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-white/5 divide-black/5">
                {filteredTrades.slice(0, 10).map((trade) => {
                  const netProfit = trade.profit + (trade.commission || 0) + (trade.swap || 0);
                  const isWin = netProfit > 0;
                  const formatDateTime = (isoStr: string) => {
                    if (!isoStr) return "N/A";
                    const d = new Date(isoStr);
                    if (isNaN(d.getTime())) return isoStr;
                    return d.toLocaleDateString("en-GB", {
                      month: "short",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    });
                  };

                  return (
                    <tr
                      key={trade.id}
                      onClick={() => {
                        setSelectedTrade(trade);
                        setIsModalOpen(true);
                      }}
                      className="hover:bg-white/10 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      title="Click to view/edit strategy tags, upload screenshots, notes, commission & swap"
                    >
                      <td className="py-3 font-mono text-[11px] text-cyan-400 font-bold">#{trade.ticket}</td>
                      <td className="py-3 font-bold dark:text-white text-slate-900">{trade.symbol}</td>
                      <td className="py-3">
                        <GlassBadge variant={trade.orderType === "BUY" ? "profit" : "loss"}>
                          {trade.orderType}
                        </GlassBadge>
                      </td>
                      <td className="py-3 font-semibold dark:text-slate-300 text-slate-700">{trade.lotSize}</td>
                      <td className="py-3 text-[11px] dark:text-slate-300 text-slate-700 font-medium">
                        {formatDateTime(trade.openTime)}
                      </td>
                      <td className="py-3 text-[11px] dark:text-slate-300 text-slate-700 font-medium">
                        {formatDateTime(trade.closeTime)}
                      </td>
                      <td className="py-3 dark:text-slate-300 text-slate-700">{trade.entryPrice}</td>
                      <td className="py-3 dark:text-slate-300 text-slate-700">{trade.exitPrice}</td>
                      <td className="py-3 dark:text-slate-300 text-slate-700 font-semibold">{trade.rrRatio || "1:2"}</td>
                      <td className={`py-3 text-right font-black ${isWin ? "text-emerald-400" : "text-rose-400"}`}>
                        {isWin ? "+" : ""}${netProfit.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Economic Calendar Module */}
        <GlassCard className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-amber-400" />
              <h3 className="font-bold dark:text-white text-slate-950">Upcoming High Impact News</h3>
            </div>
            <Link href="/calendar" className="text-xs text-cyan-400 hover:underline font-semibold">
              Calendar
            </Link>
          </div>

          <div className="space-y-3">
            {INITIAL_ECONOMIC_EVENTS.slice(0, 3).map((event) => (
              <div key={event.id} className="rounded-xl border dark:border-white/10 border-black/10 dark:bg-zinc-950/60 bg-slate-50 p-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-400">{event.currency} • {event.title}</span>
                  <GlassBadge variant="loss">High Impact</GlassBadge>
                </div>
                <div className="flex items-center justify-between text-[11px] dark:text-slate-400 text-slate-600 font-medium">
                  <span>Forecast: {event.forecast}</span>
                  <span>Previous: {event.previous}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Trade Detail Modal */}
      <TradeDetailModal
        trade={selectedTrade}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTradeUpdated={refreshData}
      />
    </div>
  );
}
