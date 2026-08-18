"use client";

import React, { useState, useEffect, useMemo } from "react";
import { GlassCard } from "@/components/ui/glass/GlassCard";
import { GlassButton } from "@/components/ui/glass/GlassButton";
import { GlassBadge } from "@/components/ui/glass/GlassBadge";
import { loadTrades, loadJournals, loadAccounts, getActiveAccountId } from "@/lib/storage/store";
import { calculateAdvancedStatistics } from "@/lib/analytics/stats-calculator";
import { parseCloseTime } from "@/lib/utils/date-utils";
import { Trade, AdvancedStatistics, TradeJournal } from "@/types/trade";
import { DailyDrawdownGuardCard } from "@/components/analytics/DailyDrawdownGuardCard";
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
  ArrowUpDown,
  Filter,
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
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "highest_profit" | "largest_loss" | "highest_rr" | "symbol"
  >("newest");
  const [displayCount, setDisplayCount] = useState<number>(30);

  const refreshData = () => {
    const loadedTrades = loadTrades();
    const loadedJournals = loadJournals();
    const accounts = loadAccounts();
    const activeId = getActiveAccountId();
    const activeAccount = accounts.find((a) => a.id === activeId) || accounts[0];
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

  // Filter & Sort Trades
  const { filteredTrades, counts } = useMemo(() => {
    if (!trades || trades.length === 0) {
      return { filteredTrades: [], counts: { all: 0, day: 0, week: 0, month: 0 } };
    }

    const realNow = new Date();
    const realTodayYear = realNow.getFullYear();
    const realTodayMonth = realNow.getMonth();
    const realTodayDate = realNow.getDate();

    const weekCutoff = new Date(realTodayYear, realTodayMonth, realTodayDate - 7).getTime();
    const monthCutoff = new Date(realTodayYear, realTodayMonth - 1, realTodayDate).getTime();

    const realTodayList: Trade[] = [];
    const weekList: Trade[] = [];
    const monthList: Trade[] = [];

    trades.forEach((t) => {
      const closeTs = parseCloseTime(t.closeTime || t.openTime);
      if (closeTs === 0) return;
      const d = new Date(closeTs);

      if (d.getFullYear() === realTodayYear && d.getMonth() === realTodayMonth && d.getDate() === realTodayDate) {
        realTodayList.push(t);
      }
      if (closeTs >= weekCutoff) weekList.push(t);
      if (closeTs >= monthCutoff) monthList.push(t);
    });

    let selectedList = [...trades];

    // Filter by Time Tab
    if (timeFilter === "day") selectedList = realTodayList;
    else if (timeFilter === "week") selectedList = weekList;
    else if (timeFilter === "month") selectedList = monthList;

    // Apply Advanced Sorting
    selectedList.sort((a, b) => {
      const netA = a.profit + (a.commission || 0) + (a.swap || 0);
      const netB = b.profit + (b.commission || 0) + (b.swap || 0);

      if (sortBy === "newest") {
        return parseCloseTime(b.closeTime || b.openTime) - parseCloseTime(a.closeTime || a.openTime);
      }
      if (sortBy === "oldest") {
        return parseCloseTime(a.closeTime || a.openTime) - parseCloseTime(b.closeTime || b.openTime);
      }
      if (sortBy === "highest_profit") return netB - netA;
      if (sortBy === "largest_loss") return netA - netB;
      if (sortBy === "highest_rr") return (b.rrRatio || 0) - (a.rrRatio || 0);
      if (sortBy === "symbol") return a.symbol.localeCompare(b.symbol);
      return 0;
    });

    return {
      filteredTrades: selectedList,
      counts: {
        all: trades.length,
        day: realTodayList.length,
        week: weekList.length,
        month: monthList.length,
      },
    };
  }, [trades, timeFilter, sortBy]);

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
        {(() => {
          const isNetProfitPos = stats.totalNetProfit >= 0;
          const initialBal = stats.balance - stats.totalNetProfit || 10000;
          const netProfitPct = (stats.totalNetProfit / initialBal) * 100;
          const pctSign = isNetProfitPos ? "+" : "";

          return (
            <GlassCard glowColor={isNetProfitPos ? "cyan" : "red"}>
              <div className="flex items-center justify-between dark:text-slate-400 text-slate-600">
                <span className="text-xs font-bold uppercase tracking-wider">Account Balance</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl dark:bg-cyan-500/15 bg-sky-50 dark:text-cyan-400 text-sky-600 border dark:border-transparent border-sky-200">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-extrabold dark:text-white text-slate-950">${stats.balance.toLocaleString()}</div>
                <div className={`mt-1 flex items-center gap-1.5 text-xs font-bold ${isNetProfitPos ? "dark:text-emerald-400 text-emerald-600" : "dark:text-rose-400 text-rose-600"}`}>
                  {isNetProfitPos ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  <span>
                    {isNetProfitPos ? "+" : "-"}${Math.abs(stats.totalNetProfit).toFixed(2)} ({pctSign}{netProfitPct.toFixed(2)}%) {isNetProfitPos ? "Net Gain" : "Net Loss"}
                  </span>
                </div>
              </div>
            </GlassCard>
          );
        })()}

        {/* Today's P/L */}
        {(() => {
          const prevBalToday = stats.balance - stats.todayProfit || 10000;
          const todayPct = (stats.todayProfit / prevBalToday) * 100;
          const todaySign = isProfitToday ? "+" : "-";
          const todayPctSign = isProfitToday ? "+" : "";

          const isWeeklyPos = stats.weeklyProfit >= 0;
          const prevBalWeekly = stats.balance - stats.weeklyProfit || 10000;
          const weeklyPct = (stats.weeklyProfit / prevBalWeekly) * 100;
          const weeklySign = isWeeklyPos ? "+" : "-";
          const weeklyPctSign = isWeeklyPos ? "+" : "";

          return (
            <GlassCard glowColor={isProfitToday ? "green" : "red"}>
              <div className="flex items-center justify-between dark:text-slate-400 text-slate-600">
                <span className="text-xs font-bold uppercase tracking-wider">Today&apos;s P/L</span>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${isProfitToday ? "dark:bg-emerald-500/15 bg-emerald-50 dark:text-emerald-400 text-emerald-600 border dark:border-transparent border-emerald-200" : "dark:bg-rose-500/15 bg-rose-50 dark:text-rose-400 text-rose-600 border dark:border-transparent border-rose-200"}`}>
                  {isProfitToday ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                </div>
              </div>
              <div className="mt-3">
                <div className={`text-2xl sm:text-3xl font-extrabold ${isProfitToday ? "dark:text-emerald-400 text-emerald-600" : "dark:text-rose-400 text-rose-600"}`}>
                  {todaySign}${Math.abs(stats.todayProfit).toFixed(2)} <span className="text-xs font-bold opacity-90">({todayPctSign}{todayPct.toFixed(2)}%)</span>
                </div>
                <div className="mt-1 text-xs dark:text-slate-400 text-slate-600">
                  Weekly:{" "}
                  <span className={`font-bold ${isWeeklyPos ? "dark:text-emerald-400 text-emerald-600" : "dark:text-rose-400 text-rose-600"}`}>
                    {weeklySign}${Math.abs(stats.weeklyProfit).toFixed(2)} ({weeklyPctSign}{weeklyPct.toFixed(2)}%)
                  </span>
                </div>
              </div>
            </GlassCard>
          );
        })()}

        {/* Win Rate */}
        <GlassCard glowColor="purple">
          <div className="flex items-center justify-between dark:text-slate-400 text-slate-600">
            <span className="text-xs font-bold uppercase tracking-wider">Win Rate</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl dark:bg-purple-500/15 bg-indigo-50 dark:text-purple-400 text-indigo-600 border dark:border-transparent border-indigo-200">
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
            <div className="flex h-9 w-9 items-center justify-center rounded-xl dark:bg-amber-500/15 bg-amber-50 dark:text-amber-400 text-amber-700 border dark:border-transparent border-amber-200">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold dark:text-amber-400 text-amber-700">{stats.profitFactor}</div>
            <div className="mt-1 text-xs dark:text-slate-400 text-slate-600">
              Sharpe: <span className="font-bold dark:text-slate-200 text-slate-800">{stats.sharpeRatio}</span> | Max DD: <span className="dark:text-rose-400 text-rose-600 font-bold">{stats.maxDrawdownPercent}%</span>
            </div>
          </div>
        </GlassCard>
      </div>

      <DailyDrawdownGuardCard
        currentBalance={stats.balance}
        todayProfit={stats.todayProfit}
        initialBalance={stats.balance - stats.totalNetProfit || 10000}
        trades={trades}
        maxDailyPct={5}
      />

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
              <span className="dark:text-slate-400 text-slate-600 font-semibold">استراتژی طلایی سشن نیویورک:</span>
              <span className="font-bold text-cyan-400">NY FVG Liquidity Sweep</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="dark:text-slate-400 text-slate-600 font-semibold">توصیه مدیریت ریسک:</span>
              <span className="font-bold text-amber-400">حداکثر ۱٪ در هر معامله</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Trades Table Section */}
      <GlassCard className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold dark:text-white text-slate-950 flex items-center gap-2">
              <span>Recent Executed Trades</span>
              <GlassBadge variant="cyan">{filteredTrades.length} Trades</GlassBadge>
            </h2>
            <p className="text-xs dark:text-slate-400 text-slate-600 font-medium">
              Executed positions filtered by session time window and sort controls.
            </p>
          </div>

          {/* Time Filter Tabs & Advanced Sorting */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center p-1 rounded-2xl dark:bg-zinc-950/80 bg-slate-100 border dark:border-white/10 border-black/10 text-xs">
              {[
                { id: "all", label: `All (${counts.all})` },
                { id: "day", label: `Today (${counts.day})` },
                { id: "week", label: `This Week (${counts.week})` },
                { id: "month", label: `This Month (${counts.month})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTimeFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    timeFilter === tab.id
                      ? "bg-cyan-500 text-black shadow-neon-cyan"
                      : "dark:text-slate-400 text-slate-600 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Advanced Sort Dropdown */}
            <div className="flex items-center gap-1.5 rounded-xl border dark:border-white/10 border-black/10 dark:bg-zinc-950 bg-slate-100 px-3 py-2 text-xs font-semibold">
              <ArrowUpDown className="h-3.5 w-3.5 text-cyan-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-bold dark:text-white text-slate-900 focus:outline-none cursor-pointer"
              >
                <option value="newest" className="dark:bg-slate-900 text-slate-900 dark:text-white">Sort: Newest First</option>
                <option value="oldest" className="dark:bg-slate-900 text-slate-900 dark:text-white">Sort: Oldest First</option>
                <option value="highest_profit" className="dark:bg-slate-900 text-slate-900 dark:text-white">Sort: Highest Profit</option>
                <option value="largest_loss" className="dark:bg-slate-900 text-slate-900 dark:text-white">Sort: Largest Loss</option>
                <option value="highest_rr" className="dark:bg-slate-900 text-slate-900 dark:text-white">Sort: Highest R:R Ratio</option>
                <option value="symbol" className="dark:bg-slate-900 text-slate-900 dark:text-white">Sort: Symbol A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Content */}
        {filteredTrades.length === 0 ? (
          <div className="py-12 text-center text-xs dark:text-slate-400 text-slate-600 font-semibold">
            No trades match the selected filter criteria.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b dark:border-white/10 border-black/10 text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-2">Ticket / Pair</th>
                    <th className="py-3 px-2">Type</th>
                    <th className="py-3 px-2">Lots</th>
                    <th className="py-3 px-2">Open Time</th>
                    <th className="py-3 px-2">Entry Price</th>
                    <th className="py-3 px-2">Exit Price</th>
                    <th className="py-3 px-2 text-right">Net Profit</th>
                    <th className="py-3 px-2 text-center">Setup Tag</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-white/5 divide-black/5 font-mono">
                  {filteredTrades.slice(0, displayCount).map((trade) => {
                    const jKey = trade.journalId || `journal-${trade.id}`;
                    const j = journals[jKey];
                    const netP = trade.profit + (trade.commission || 0) + (trade.swap || 0);
                    const isWin = netP > 0;

                    return (
                      <tr
                        key={trade.id}
                        onClick={() => {
                          setSelectedTrade(trade);
                          setIsModalOpen(true);
                        }}
                        className="hover:dark:bg-white/5 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <td className="py-3 px-2 font-sans">
                          <div className="font-extrabold text-sm dark:text-white text-slate-900">{trade.symbol}</div>
                          <div className="text-[10px] text-slate-400">#{trade.ticket}</div>
                        </td>
                        <td className="py-3 px-2 font-sans font-extrabold">
                          <span className={trade.orderType === "BUY" ? "text-emerald-400" : "text-rose-400"}>
                            {trade.orderType}
                          </span>
                        </td>
                        <td className="py-3 px-2 font-bold">{trade.lotSize}</td>
                        <td className="py-3 px-2 text-slate-400 text-[11px]">
                          {trade.openTime.replace("T", " ").slice(0, 16)}
                        </td>
                        <td className="py-3 px-2">{trade.entryPrice}</td>
                        <td className="py-3 px-2">{trade.exitPrice}</td>
                        <td className={`py-3 px-2 text-right font-black text-sm ${isWin ? "text-emerald-400" : "text-rose-400"}`}>
                          {isWin ? "+" : ""}${netP.toFixed(2)}
                        </td>
                        <td className="py-3 px-2 text-center font-sans">
                          <GlassBadge variant="cyan" className="text-[10px]">
                            {j?.setupName || "Unassigned"}
                          </GlassBadge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredTrades.length > displayCount && (
              <div className="pt-2 text-center">
                <GlassButton variant="secondary" size="sm" onClick={() => setDisplayCount((prev) => prev + 30)}>
                  <span>Load More Trades ({filteredTrades.length - displayCount} Remaining)</span>
                </GlassButton>
              </div>
            )}
          </div>
        )}
      </GlassCard>

      {/* Trade Detail Modal */}
      {selectedTrade && (
        <TradeDetailModal
          trade={selectedTrade}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTrade(null);
          }}
          onTradeUpdated={refreshData}
        />
      )}
    </div>
  );
}
