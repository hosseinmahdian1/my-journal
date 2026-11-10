"use client";

import React, { useState, useEffect, useMemo } from "react";
import { GlassCard } from "@/components/ui/glass/GlassCard";
import { GlassButton } from "@/components/ui/glass/GlassButton";
import { GlassBadge } from "@/components/ui/glass/GlassBadge";
import { loadTrades, loadJournals, loadAccounts, getActiveAccountId } from "@/lib/storage/store";
import { calculateAdvancedStatistics } from "@/lib/analytics/stats-calculator";
import { parseCloseTime } from "@/lib/utils/date-utils";
import { Trade, AdvancedStatistics, TradeJournal, Account } from "@/types/trade";
import { DailyDrawdownGuardCard } from "@/components/analytics/DailyDrawdownGuardCard";
import { MetallicAccountCard } from "@/components/account/MetallicAccountCard";
import { TradingHeatmap } from "@/components/analytics/TradingHeatmap";
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
  Sparkles,
  ChevronRight,
  ArrowUpDown,
  Calendar,
} from "lucide-react";
import { TradeDetailModal } from "@/components/journal/TradeDetailModal";
import { AccountEquityTrajectoryChart } from "@/components/analytics/AccountEquityTrajectoryChart";
import Link from "next/link";

export default function DashboardPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [journals, setJournals] = useState<Record<string, TradeJournal>>({});
  const [stats, setStats] = useState<AdvancedStatistics | null>(null);
  const [activeAccount, setActiveAccount] = useState<Account | null>(null);
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
    const currentAcc = accounts.find((a) => a.id === activeId) || accounts[0] || null;
    const initialBal = currentAcc?.initialBalance || 10000;
    
    setTrades(loadedTrades);
    setJournals(loadedJournals);
    setActiveAccount(currentAcc);
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

    if (timeFilter === "day") selectedList = realTodayList;
    else if (timeFilter === "week") selectedList = weekList;
    else if (timeFilter === "month") selectedList = monthList;

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

  const isNetProfitPos = stats.totalNetProfit >= 0;
  const initialBal = activeAccount?.initialBalance || (stats.balance - stats.totalNetProfit) || 10000;
  const netProfitPct = ((stats.totalNetProfit / initialBal) * 100).toFixed(2);
  const isProfitToday = stats.todayProfit >= 0;
  const prevBalToday = stats.balance - stats.todayProfit || 10000;
  const todayPct = ((stats.todayProfit / prevBalToday) * 100).toFixed(2);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner: Executive Overview & Quick Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full dark:bg-cyan-500/10 bg-sky-100 text-sky-600 dark:text-cyan-400 border border-sky-300 dark:border-cyan-500/20 font-mono">
              Executive Trading Desk
            </span>
            <span className="text-xs text-slate-400 font-persian font-medium">
              داشبورد هوشمند معاملات و اقتصاد کلان
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight dark:text-white text-slate-900">
            Forex & Commodity Intelligence
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/gold-desk">
            <GlassButton variant="gold">
              <Sparkles className="h-4 w-4 text-amber-500 mr-1.5 inline" />
              <span>XAUUSD Desk</span>
            </GlassButton>
          </Link>
          <Link href="/import">
            <GlassButton variant="primary">
              <Zap className="h-4 w-4 mr-1.5 inline" />
              <span>Import Trades</span>
            </GlassButton>
          </Link>
          <Link href="/journal">
            <GlassButton variant="secondary">
              <span>Open Journal</span>
              <ChevronRight className="h-4 w-4 ml-1 inline" />
            </GlassButton>
          </Link>
        </div>
      </div>

      {/* Top Fintech Grid: Metallic 3D Flip Card + Tremor-style KPI Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Column: 3D Flip Titanium Account Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <MetallicAccountCard
            account={activeAccount}
            totalBalance={stats.balance}
            equity={stats.balance}
            todayPnL={stats.todayProfit}
            todayPnLPercent={parseFloat(todayPct)}
            winRate={stats.winRate}
            activeStreak={stats.maxConsecutiveWinsCount || 3}
          />
        </div>

        {/* Right Columns: 3 Tremor-style Quick Stats (7 cols) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Net Realized PnL */}
          <div className="starlight-card p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold uppercase tracking-wider">Net PnL</span>
              <div className={`p-1.5 rounded-lg ${isNetProfitPos ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className="my-2">
              <div className={`text-2xl font-black font-mono tracking-tight ${isNetProfitPos ? "text-emerald-400" : "text-rose-400"}`}>
                {isNetProfitPos ? "+" : ""}${stats.totalNetProfit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 font-mono mt-1">
                {isNetProfitPos ? <TrendingUp className="h-3 w-3 text-emerald-400" /> : <TrendingDown className="h-3 w-3 text-rose-400" />}
                <span>{isNetProfitPos ? "+" : ""}{netProfitPct}% Total Return</span>
              </div>
            </div>
            <div className="pt-2 border-t dark:border-white/5 border-slate-200/80 text-[10px] text-slate-400 font-persian">
              سود خالص محقق‌شده کل سشن‌ها
            </div>
          </div>

          {/* Card 2: Win Rate % */}
          <div className="starlight-card p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold uppercase tracking-wider">Win Rate</span>
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Award className="h-4 w-4" />
              </div>
            </div>
            <div className="my-2">
              <div className="text-2xl font-black font-mono tracking-tight dark:text-white text-slate-900">
                {stats.winRate}%
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 font-mono mt-1">
                <span className="text-emerald-400 font-bold">{stats.winningTrades}W</span>
                <span>/</span>
                <span className="text-rose-400 font-bold">{stats.losingTrades}L</span>
                <span>({trades.length} Total)</span>
              </div>
            </div>
            <div className="pt-2 border-t dark:border-white/5 border-slate-200/80 text-[10px] text-slate-400 font-persian">
              درصد برندگی معاملات کل
            </div>
          </div>

          {/* Card 3: Profit Factor & Expectancy */}
          <div className="starlight-card p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold uppercase tracking-wider">Profit Factor</span>
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                <Activity className="h-4 w-4" />
              </div>
            </div>
            <div className="my-2">
              <div className="text-2xl font-black font-mono tracking-tight text-amber-400">
                {stats.profitFactor.toFixed(2)}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 font-mono mt-1">
                <span>Avg R:R:</span>
                <span className="font-bold text-slate-200">{stats.rewardToRiskRatio?.toFixed(2) || "1.85"}</span>
              </div>
            </div>
            <div className="pt-2 border-t dark:border-white/5 border-slate-200/80 text-[10px] text-slate-400 font-persian">
              فاکتور سودآوری و امید ریاضی

            </div>
          </div>
        </div>
      </div>

      {/* Analytics Mid Row: Equity Trajectory Chart + Daily Drawdown Guard Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AccountEquityTrajectoryChart
            trades={trades}
            initialBalance={initialBal}
            currentBalance={stats.balance}
          />
        </div>

        <div className="lg:col-span-1">
          <DailyDrawdownGuardCard
            currentBalance={stats.balance}
            todayProfit={stats.todayProfit}
            initialBalance={initialBal}
            trades={trades}
            maxDailyPct={5}
          />
        </div>
      </div>

      {/* Full-width Trading Heatmap (Fintech Calendar Heatmap) */}
      <TradingHeatmap trades={trades} />

      {/* Editorial Journal & Executed Trades Table */}
      <div className="starlight-card p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold dark:text-white text-slate-900">
                Journaled Trades & Market Logs
              </h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full dark:bg-cyan-500/10 bg-sky-100 text-sky-600 dark:text-cyan-400 border border-sky-300 dark:border-cyan-500/20 font-bold">
                {filteredTrades.length} Trades
              </span>
            </div>
            <p className="text-xs text-slate-400 font-persian mt-0.5">
              ثبت ژورنالی پوزیشن‌ها همراه با دلایل ورود، متدولوژی پرایس‌اکشن و وضعیت روانی
            </p>
          </div>

          {/* Time Filter Tabs & Sort Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center p-1 rounded-xl dark:bg-zinc-950/80 bg-slate-100 border dark:border-white/10 border-slate-200 text-xs font-bold">
              {[
                { id: "all", label: `All (${counts.all})` },
                { id: "day", label: `Today (${counts.day})` },
                { id: "week", label: `Week (${counts.week})` },
                { id: "month", label: `Month (${counts.month})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTimeFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    timeFilter === tab.id
                      ? "bg-cyan-500 text-black font-black shadow-sm"
                      : "dark:text-slate-400 text-slate-600 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 rounded-xl border dark:border-white/10 border-slate-200 dark:bg-zinc-950 bg-slate-100 px-3 py-1.5 text-xs font-semibold">
              <ArrowUpDown className="h-3.5 w-3.5 text-cyan-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-bold dark:text-white text-slate-900 focus:outline-none cursor-pointer font-sans"
              >
                <option value="newest" className="dark:bg-slate-900 text-slate-900 dark:text-white">Newest First</option>
                <option value="oldest" className="dark:bg-slate-900 text-slate-900 dark:text-white">Oldest First</option>
                <option value="highest_profit" className="dark:bg-slate-900 text-slate-900 dark:text-white">Highest Profit</option>
                <option value="largest_loss" className="dark:bg-slate-900 text-slate-900 dark:text-white">Largest Loss</option>
                <option value="highest_rr" className="dark:bg-slate-900 text-slate-900 dark:text-white">Highest R:R</option>
                <option value="symbol" className="dark:bg-slate-900 text-slate-900 dark:text-white">Symbol A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Trade Rows List */}
        {filteredTrades.length === 0 ? (
          <div className="py-12 text-center text-xs dark:text-slate-400 text-slate-600 font-semibold">
            No trades match the selected filter criteria.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b dark:border-white/10 border-slate-200 text-slate-400 uppercase tracking-wider font-mono text-[11px]">
                    <th className="py-3 px-3">Pair / Ticket</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Lots</th>
                    <th className="py-3 px-3">Executed At</th>
                    <th className="py-3 px-3">Entry Price</th>
                    <th className="py-3 px-3">Exit Price</th>
                    <th className="py-3 px-3 text-right">Net PnL</th>
                    <th className="py-3 px-3 text-center">Method / SMC Tag</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-white/5 divide-slate-100 font-mono text-xs">
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
                        className="hover:dark:bg-white/5 hover:bg-slate-50 transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-3 font-sans">
                          <div className="font-black text-sm dark:text-white text-slate-900 flex items-center gap-1.5">
                            {trade.symbol}
                            {trade.symbol.includes("XAU") && (
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">#{trade.ticket}</div>
                        </td>
                        <td className="py-3.5 px-3 font-sans font-black">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              trade.orderType === "BUY"
                                ? "dark:bg-emerald-950/60 bg-emerald-100 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                : "dark:bg-rose-950/60 bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                            }`}
                          >
                            {trade.orderType}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 font-bold text-slate-300">{trade.lotSize}</td>
                        <td className="py-3.5 px-3 text-slate-400 text-[11px] font-sans">
                          {trade.openTime.replace("T", " ").slice(0, 16)}
                        </td>
                        <td className="py-3.5 px-3 text-slate-300">{trade.entryPrice}</td>
                        <td className="py-3.5 px-3 text-slate-300">{trade.exitPrice}</td>
                        <td
                          className={`py-3.5 px-3 text-right font-black text-sm ${
                            isWin ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {isWin ? "+" : ""}${netP.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-3 text-center font-sans">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold dark:bg-zinc-800 bg-slate-100 dark:text-slate-300 text-slate-700 border dark:border-white/10 border-slate-200">
                            {j?.setupName || "Liquidity Sweep"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredTrades.length > displayCount && (
              <div className="pt-3 text-center">
                <GlassButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setDisplayCount((prev) => prev + 30)}
                >
                  <span>Load More Trades ({filteredTrades.length - displayCount} Remaining)</span>
                </GlassButton>
              </div>
            )}
          </div>
        )}
      </div>

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
