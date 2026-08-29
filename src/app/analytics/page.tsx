"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass/GlassCard";
import { GlassButton } from "@/components/ui/glass/GlassButton";
import { GlassBadge } from "@/components/ui/glass/GlassBadge";
import { loadTrades, loadAccounts, getActiveAccountId } from "@/lib/storage/store";
import { calculateAdvancedStatistics } from "@/lib/analytics/stats-calculator";
import { AdvancedStatistics, Trade } from "@/types/trade";
import { InteractiveEquityDrawdownChart } from "@/components/analytics/InteractiveEquityDrawdownChart";
import { MyfxbookAdvancedAnalytics } from "@/components/analytics/MyfxbookAdvancedAnalytics";
import { RiskRewardAnalyticsCard } from "@/components/analytics/RiskRewardAnalyticsCard";
import {
  ShieldCheck,
  Award,
  TrendingUp,
  TrendingDown,
  Clock,
  Activity,
  Flame,
  Zap,
  Brain,
  Sparkles,
  PieChart,
  DollarSign,
  AlertTriangle,
  Layers,
  CheckCircle,
  BarChart3,
  Target,
  Compass,
  AlertCircle,
  RefreshCw,
  FileText,
} from "lucide-react";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AdvancedStatistics | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);

  const handleGenerateAI = async () => {
    if (!stats) return;
    setIsGeneratingAI(true);
    try {
      const { analyzeAccountWithAI } = await import("@/lib/ai/providers");
      const report = await analyzeAccountWithAI(stats);
      setAiReport(report);
    } catch (error) {
      console.error(error);
      setAiReport("خطا در برقراری ارتباط با هوش مصنوعی.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const renderMarkdown = (md: string) => {
    let html = md
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-amber-400 font-extrabold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-sky-400 mt-8 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-amber-500 mt-8 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-sky-400 mt-8 mb-4">$1</h1>')
      .replace(/^\- (.*$)/gim, '<li class="mb-2 list-disc list-inside">$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li class="mb-2 list-decimal list-inside text-amber-300 font-bold">$1</li>')
      .replace(/\n/g, '<br />');
    return <div dangerouslySetInnerHTML={{ __html: html }} className="text-zinc-300 leading-8" />;
  };
  useEffect(() => {
    const loadedTrades = loadTrades();
    const accounts = loadAccounts();
    const activeId = getActiveAccountId();
    const activeAccount = accounts.find((a) => a.id === activeId) || accounts[0];
    const initialBal = activeAccount?.initialBalance || 10000;

    const computedStats = calculateAdvancedStatistics(loadedTrades, initialBal);
    setTrades(loadedTrades);
    setStats(computedStats);
  }, []);

  if (!stats) return null;

  return (
    <div className="space-y-10 pb-12">
      {/* Top Banner Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-7 w-7 text-cyan-400" />
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight dark:text-white text-slate-950">
            Forex Analytics & Behavioral Audit
          </h1>
        </div>
      </div>

      {/* Interactive Account Growth & Drawdown Chart */}
      <InteractiveEquityDrawdownChart trades={trades} initialBalance={stats.balance - stats.totalNetProfit || 10000} />

      {/* ------------------------------------------------------------- */}
      {/* MYFXBOOK ADVANCED STATISTICS SUITE                             */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b dark:border-white/10 border-slate-200 pb-2">
          <h2 className="text-lg font-black dark:text-white text-slate-900 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-cyan-500" />
            <span>Myfxbook Advanced Analytics Engine</span>
          </h2>
          <GlassBadge variant="gold" className="text-[11px] font-extrabold">
            Standard Myfxbook Metrics
          </GlassBadge>
        </div>

        <MyfxbookAdvancedAnalytics trades={trades} stats={stats} initialBalance={stats.balance} />
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 1: Account Summary */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-3">
        <h2 className="text-lg font-black dark:text-white text-slate-900 flex items-center gap-2 border-b dark:border-white/10 border-slate-200 pb-2">
          <DollarSign className="h-5 w-5 text-cyan-400" />
          <span>1. Account Summary</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <GlassCard glowColor="cyan" className="p-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Balance</div>
            <div className="text-xl font-black dark:text-white text-slate-900 mt-1">${stats.balance.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">Current Account Balance</div>
          </GlassCard>

          <GlassCard glowColor="green" className="p-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Equity</div>
            <div className="text-xl font-black text-emerald-400 mt-1">${stats.equity.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">Floating Equity (Balance + Open P/L)</div>
          </GlassCard>

          <GlassCard glowColor="purple" className="p-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Free Margin</div>
            <div className="text-xl font-black text-purple-400 mt-1">${stats.freeMargin.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">Available Unusable Margin</div>
          </GlassCard>

          <GlassCard glowColor="gold" className="p-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Floating P/L</div>
            <div className="text-xl font-black text-amber-400 mt-1">${stats.floatingPnl}</div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">Open Position Floating Profit/Loss</div>
          </GlassCard>

          <GlassCard glowColor="cyan" className="p-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Margin Level</div>
            <div className="text-xl font-black text-cyan-400 mt-1">{stats.marginLevelPercent}%</div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">Current Margin Health Level</div>
          </GlassCard>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 2: Results */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-3">
        <h2 className="text-lg font-black dark:text-white text-slate-900 flex items-center gap-2 border-b dark:border-white/10 border-black/10 pb-2">
          <Award className="h-5 w-5 text-emerald-400" />
          <span>2. Performance Results</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          <GlassCard glowColor="green" className="p-3.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Net Profit</div>
            <div className="text-lg font-extrabold text-emerald-400 mt-0.5">${stats.totalNetProfit}</div>
            <div className="text-[9px] text-slate-500">Gross Profit + Gross Loss</div>
          </GlassCard>

          <GlassCard glowColor="green" className="p-3.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross Profit</div>
            <div className="text-lg font-extrabold text-emerald-400 mt-0.5">${stats.grossProfit}</div>
            <div className="text-[9px] text-slate-500">Sum of All Winning Trades</div>
          </GlassCard>

          <GlassCard glowColor="red" className="p-3.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross Loss</div>
            <div className="text-lg font-extrabold text-rose-400 mt-0.5">${stats.grossLoss}</div>
            <div className="text-[9px] text-slate-500">Sum of All Losing Trades</div>
          </GlassCard>

          <GlassCard glowColor="cyan" className="p-3.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Profit Factor</div>
            <div className="text-lg font-extrabold text-cyan-400 mt-0.5">{stats.profitFactor}</div>
            <div className="text-[9px] text-slate-500">Gross Profit ÷ Gross Loss</div>
          </GlassCard>

          <GlassCard glowColor="gold" className="p-3.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expected Payoff</div>
            <div className="text-lg font-extrabold text-amber-400 mt-0.5">${stats.expectedPayoff}</div>
            <div className="text-[9px] text-slate-500">Net Profit ÷ Total Trades</div>
          </GlassCard>

          <GlassCard glowColor="purple" className="p-3.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recovery Factor</div>
            <div className="text-lg font-extrabold text-purple-400 mt-0.5">{stats.recoveryFactor}</div>
            <div className="text-[9px] text-slate-500">Net Profit ÷ Max Drawdown</div>
          </GlassCard>

          <GlassCard glowColor="cyan" className="p-3.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sharpe Ratio</div>
            <div className="text-lg font-extrabold text-sky-400 mt-0.5">{stats.sharpeRatio}</div>
            <div className="text-[9px] text-slate-500">Risk-Adjusted Return Ratio</div>
          </GlassCard>
        </div>
      </div>

      {/* Overall Account Risk-to-Reward (R:R) Analytics Section */}
      <RiskRewardAnalyticsCard trades={trades} stats={stats} />

      {/* ------------------------------------------------------------- */}
      {/* SECTION 3: Drawdown & SECTION 4: Trade Statistics */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION 3: Drawdown */}
        <GlassCard glowColor="red" className="space-y-4">
          <h2 className="text-base font-extrabold dark:text-white text-slate-900 flex items-center gap-2 border-b dark:border-white/10 border-slate-200 pb-2">
            <TrendingDown className="h-5 w-5 text-rose-500" />
            <span>3. Drawdown Metrics</span>
          </h2>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="rounded-xl border dark:border-white/10 border-slate-200 dark:bg-slate-900/60 bg-slate-50/90 p-3 shadow-sm">
              <span className="dark:text-slate-400 text-slate-600 font-bold block text-[11px]">Absolute Drawdown</span>
              <span className="font-extrabold dark:text-rose-400 text-rose-600 text-base mt-1 block">${stats.absoluteDrawdownAmount}</span>
              <span className="text-[10px] dark:text-slate-500 text-slate-500 font-medium">Initial Deposit Drop</span>
            </div>

            <div className="rounded-xl border dark:border-white/10 border-slate-200 dark:bg-slate-900/60 bg-slate-50/90 p-3 shadow-sm">
              <span className="dark:text-slate-400 text-slate-600 font-bold block text-[11px]">Maximal Drawdown</span>
              <span className="font-extrabold dark:text-rose-400 text-rose-600 text-base mt-1 block">${stats.maxDrawdownAmount}</span>
              <span className="text-[10px] dark:text-rose-300 text-rose-700 font-extrabold">{stats.maxDrawdownPercent}% Peak to Trough</span>
            </div>

            <div className="rounded-xl border dark:border-white/10 border-slate-200 dark:bg-slate-900/60 bg-slate-50/90 p-3 shadow-sm">
              <span className="dark:text-slate-400 text-slate-600 font-bold block text-[11px]">Relative Drawdown</span>
              <span className="font-extrabold dark:text-rose-400 text-rose-600 text-base mt-1 block">{stats.relativeDrawdownPercent}%</span>
              <span className="text-[10px] dark:text-slate-500 text-slate-500 font-medium">Highest Equity Loss</span>
            </div>
          </div>
        </GlassCard>

        {/* SECTION 4: Trade Counts & Win Rate */}
        <GlassCard glowColor="cyan" className="space-y-4">
          <h2 className="text-base font-extrabold dark:text-white text-slate-900 flex items-center gap-2 border-b dark:border-white/10 border-slate-200 pb-2">
            <PieChart className="h-5 w-5 text-sky-500" />
            <span>4. Trade Distribution & Win Rate</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="rounded-xl border dark:border-white/10 border-slate-200 dark:bg-slate-900/60 bg-slate-50/90 p-3 shadow-sm">
              <span className="dark:text-slate-400 text-slate-600 font-bold block text-[11px]">Total Trades</span>
              <span className="font-extrabold dark:text-white text-slate-900 text-base mt-1 block">{stats.totalTrades}</span>
            </div>
            <div className="rounded-xl border dark:border-white/10 border-slate-200 dark:bg-slate-900/60 bg-slate-50/90 p-3 shadow-sm">
              <span className="dark:text-slate-400 text-slate-600 font-bold block text-[11px]">Winning Trades</span>
              <span className="font-extrabold dark:text-emerald-400 text-emerald-600 text-base mt-1 block">{stats.winningTrades} ({stats.winRate}%)</span>
            </div>
            <div className="rounded-xl border dark:border-white/10 border-slate-200 dark:bg-slate-900/60 bg-slate-50/90 p-3 shadow-sm">
              <span className="dark:text-slate-400 text-slate-600 font-bold block text-[11px]">Losing Trades</span>
              <span className="font-extrabold dark:text-rose-400 text-rose-600 text-base mt-1 block">{stats.losingTrades} ({(100 - stats.winRate).toFixed(1)}%)</span>
            </div>
            <div className="rounded-xl border dark:border-white/10 border-slate-200 dark:bg-slate-900/60 bg-slate-50/90 p-3 shadow-sm">
              <span className="dark:text-slate-400 text-slate-600 font-bold block text-[11px]">Break-Even Trades</span>
              <span className="font-extrabold dark:text-amber-400 text-amber-700 text-base mt-1 block">{Math.max(0, stats.totalTrades - stats.winningTrades - stats.losingTrades)}</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 12: PSYCH AUDIT - Clean Black Mobile Minimalist Behavioral AI Report */}
      {/* ------------------------------------------------------------- */}
      <div className="rounded-3xl border border-zinc-800 bg-black p-6 sm:p-10 font-persian text-right text-slate-100 shadow-2xl space-y-10 dir-rtl">
        {/* PSYCH AUDIT Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-6 text-left">
          <div className="space-y-1 dir-ltr text-left">
            <h2 className="text-3xl font-black tracking-tight text-sky-400 font-mono">PSYCH AUDIT</h2>
            <p className="text-xs text-zinc-400 font-mono">Private Behavioral Engine</p>
          </div>

          <GlassButton
            variant="gold"
            size="sm"
            onClick={handleGenerateAI}
            className="self-start sm:self-auto"
            disabled={isGeneratingAI}
          >
            <RefreshCw className={`h-4 w-4 ${isGeneratingAI ? "animate-spin" : ""}`} />
            <span>{isGeneratingAI ? "در حال تحلیل بی‌رحمانه..." : "به‌روزرسانی تحلیل"}</span>
          </GlassButton>
        </div>

        {/* Clean Black Text Document Content */}
        <div className="space-y-12 text-sm leading-8 text-zinc-200 min-h-[400px]">
          {aiReport ? (
            renderMarkdown(aiReport)
          ) : (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
              <Brain className="h-16 w-16 mb-4 text-sky-400" />
              <p className="text-center max-w-md">
                برای دریافت تحلیل فوق‌حرفه‌ای و بی‌رحمانه از عملکرد خود در این حساب روی دکمه «به‌روزرسانی تحلیل» کلیک کنید.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}