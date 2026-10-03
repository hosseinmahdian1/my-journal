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
import { Card3DTilt } from "@/components/3d/Card3DTilt";
import { AccountEquityTrajectoryChart } from "@/components/analytics/AccountEquityTrajectoryChart";
import Link from "next/link";

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
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight dark:text-white text-slate-950">
            Forex Intelligence Journal
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/gold-desk">
            <GlassButton variant="gold">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>XAUUSD Desk</span>
            </GlassButton>
          </Link>
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

      {/* Top Stat Cards Grid with 3D Parallax Tilt */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Account Balance */}
        {(() => {
          const isNetProfitPos = stats.totalNetProfit >= 0;
          const initialBal = stats.balance - stats.totalNetProfit || 10000;
          const netProfitPct = (stats.totalNetProfit / initialBal) * 100;
          const pctSign = isNetProfitPos ? "+" : "";

          return (
            <Card3DTilt glowColor="gold" intensity={12}>
              <GlassCard glowColor="gold" className="h-full">
                <div className="flex items-center justify-between dark:text-[#94A3B8] text-slate-600">
                  <span className="text-xs font-bold uppercase tracking-wider">Account Balance</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl dark:bg-[#F59E0B]/15 bg-amber-50 dark:text-[#F59E0B] text-[#D97706] border dark:border-[#F59E0B]/30 border-amber-200">
                    <DollarSign className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-extrabold dark:text-[#FFFFFF] text-slate-950">${stats.balance.toLocaleString()}</div>
                  <div className={`mt-1 flex items-center gap-1.5 text-xs font-bold ${isNetProfitPos ? "dark:text-[#10B981] text-emerald-600" : "dark:text-[#EF4444] text-rose-600"}`}>
                    {isNetProfitPos ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                    <span>
                      {isNetProfitPos ? "+" : "-"}${Math.abs(stats.totalNetProfit).toFixed(2)} ({pctSign}{netProfitPct.toFixed(2)}%) {isNetProfitPos ? "Net Gain" : "Net Loss"}
                    </span>
                  </div>
                </div>
              </GlassCard>
            </Card3DTilt>
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
            <Card3DTilt glowColor={isProfitToday ? "green" : "red"} intensity={12}>
              <GlassCard glowColor={isProfitToday ? "green" : "red"} className="h-full">
                <div className="flex items-center justify-between dark:text-[#94A3B8] text-slate-600">
                  <span className="text-xs font-bold uppercase tracking-wider">Today&apos;s P/L</span>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${isProfitToday ? "dark:bg-[#10B981]/20 bg-emerald-50 dark:text-[#10B981] text-emerald-600 border dark:border-[#10B981]/30 border-emerald-200" : "dark:bg-[#EF4444]/20 bg-rose-50 dark:text-[#EF4444] text-rose-600 border dark:border-[#EF4444]/30 border-rose-200"}`}>
                    {isProfitToday ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                  </div>
                </div>
                <div className="mt-3">
                  <div className={`text-2xl sm:text-3xl font-extrabold ${isProfitToday ? "dark:text-[#10B981] text-emerald-600" : "dark:text-[#EF4444] text-rose-600"}`}>
                    {todaySign}${Math.abs(stats.todayProfit).toFixed(2)} <span className="text-xs font-bold opacity-90">({todayPctSign}{todayPct.toFixed(2)}%)</span>
                  </div>
                  <div className="mt-1 text-xs dark:text-[#94A3B8] text-slate-600">
                    Weekly:{" "}
                    <span className={`font-bold ${isWeeklyPos ? "dark:text-[#10B981] text-emerald-600" : "dark:text-[#EF4444] text-rose-600"}`}>
                      {weeklySign}${Math.abs(stats.weeklyProfit).toFixed(2)} ({weeklyPctSign}{weeklyPct.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </GlassCard>
            </Card3DTilt>
          );
        })()}

        {/* Win Rate */}
        <Card3DTilt glowColor="gold" intensity={12}>
          <GlassCard glowColor="neutral" className="h-full">
            <div className="flex items-center justify-between dark:text-[#94A3B8] text-slate-600">
              <span className="text-xs font-bold uppercase tracking-wider">Win Rate</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl dark:bg-[#232734]/25 bg-slate-100 dark:text-[#94A3B8] text-slate-700 border dark:border-[#232734]/30 border-slate-200">
                <PieChart className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold dark:text-[#FFFFFF] text-slate-950">{stats.winRate}%</div>
              <div className="mt-1 text-xs dark:text-[#94A3B8] text-slate-600 font-medium">
                {stats.winningTrades} Wins / {stats.losingTrades} Losses
              </div>
            </div>
          </GlassCard>
        </Card3DTilt>

        {/* Profit Factor & Sharpe */}
        <Card3DTilt glowColor="gold" intensity={12}>
          <GlassCard glowColor="gold" className="h-full">
            <div className="flex items-center justify-between dark:text-[#94A3B8] text-slate-600">
              <span className="text-xs font-bold uppercase tracking-wider">Profit Factor</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl dark:bg-[#F59E0B]/15 bg-amber-50 dark:text-[#F59E0B] text-amber-700 border dark:border-[#F59E0B]/30 border-amber-200">
                <Award className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold dark:text-[#F59E0B] text-amber-700">{stats.profitFactor}</div>
              <div className="mt-1 text-xs dark:text-[#94A3B8] text-slate-600">
                Sharpe: <span className="font-bold dark:text-[#FFFFFF] text-slate-800">{stats.sharpeRatio}</span> | Max DD: <span className="dark:text-[#EF4444] text-rose-600 font-bold">{stats.maxDrawdownPercent}%</span>
              </div>
            </div>
          </GlassCard>
        </Card3DTilt>
      </div>

      {/* Main Interactive Growth Chart & Daily Drawdown Guard Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Modern Interactive Account Equity Trajectory Chart */}
        <GlassCard className="lg:col-span-2 p-6 shadow-xl">
          <AccountEquityTrajectoryChart
            trades={trades}
            initialBalance={stats.balance - stats.totalNetProfit || 10000}
            currentBalance={stats.balance}
          />
        </GlassCard>

        {/* 5% Daily Drawdown Limit Prop Firm Guard Card */}
        <DailyDrawdownGuardCard
          className="lg:col-span-1"
          currentBalance={stats.balance}
          todayProfit={stats.todayProfit}
          initialBalance={stats.balance - stats.totalNetProfit || 10000}
          trades={trades}
          maxDailyPct={5}
        />
      </div>

      {/* Trades Table Section */}
      <GlassCard className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold dark:text-[#FFFFFF] text-slate-950 flex items-center gap-2">
              <span>Recent Executed Trades</span>
              <GlassBadge variant="gold">{filteredTrades.length} Trades</GlassBadge>
            </h2>
          </div>

          {/* Time Filter Tabs & Advanced Sorting */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center p-1 rounded-2xl dark:bg-[#0B0C10]/90 bg-slate-100 border dark:border-[#232734]/30 border-black/10 text-xs">
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
                      ? "bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-[#0B0C10] shadow-sm font-black"
                      : "dark:text-[#94A3B8] text-slate-600 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Advanced Sort Dropdown */}
            <div className="flex items-center gap-1.5 rounded-xl border dark:border-[#232734]/30 border-black/10 dark:bg-[#0B0C10] bg-slate-100 px-3 py-2 text-xs font-semibold">
              <ArrowUpDown className="h-3.5 w-3.5 text-[#F59E0B]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-bold dark:text-[#FFFFFF] text-slate-900 focus:outline-none cursor-pointer"
              >
                <option value="newest" className="dark:bg-[#0B0C10] text-slate-900 dark:text-[#FFFFFF]">Sort: Newest First</option>
                <option value="oldest" className="dark:bg-[#0B0C10] text-slate-900 dark:text-[#FFFFFF]">Sort: Oldest First</option>
                <option value="highest_profit" className="dark:bg-[#0B0C10] text-slate-900 dark:text-[#FFFFFF]">Sort: Highest Profit</option>
                <option value="largest_loss" className="dark:bg-[#0B0C10] text-slate-900 dark:text-[#FFFFFF]">Sort: Largest Loss</option>
                <option value="highest_rr" className="dark:bg-[#0B0C10] text-slate-900 dark:text-[#FFFFFF]">Sort: Highest R:R Ratio</option>
                <option value="symbol" className="dark:bg-[#0B0C10] text-slate-900 dark:text-[#FFFFFF]">Sort: Symbol A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Content */}
        {filteredTrades.length === 0 ? (
          <div className="py-12 text-center text-xs dark:text-[#94A3B8] text-slate-600 font-semibold">
            No trades match the selected filter criteria.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b dark:border-[#232734]/30 border-black/10 text-slate-400 uppercase tracking-wider">
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
                <tbody className="divide-y dark:divide-[#232734]/20 divide-black/5 font-mono">
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
                          <div className="font-extrabold text-sm dark:text-[#FFFFFF] text-slate-900">{trade.symbol}</div>
                          <div className="text-[10px] text-slate-400">#{trade.ticket}</div>
                        </td>
                        <td className="py-3 px-2 font-sans font-extrabold">
                          <span className={trade.orderType === "BUY" ? "text-[#10B981]" : "text-[#EF4444]"}>
                            {trade.orderType}
                          </span>
                        </td>
                        <td className="py-3 px-2 font-bold dark:text-[#FFFFFF] text-slate-900">{trade.lotSize}</td>
                        <td className="py-3 px-2 text-slate-400 text-[11px]">
                          {trade.openTime.replace("T", " ").slice(0, 16)}
                        </td>
                        <td className="py-3 px-2 dark:text-[#94A3B8]">{trade.entryPrice}</td>
                        <td className="py-3 px-2 dark:text-[#94A3B8]">{trade.exitPrice}</td>
                        <td className={`py-3 px-2 text-right font-black text-sm ${isWin ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                          {isWin ? "+" : ""}${netP.toFixed(2)}
                        </td>
                        <td className="py-3 px-2 text-center font-sans">
                          <GlassBadge variant="neutral" className="text-[10px]">
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
