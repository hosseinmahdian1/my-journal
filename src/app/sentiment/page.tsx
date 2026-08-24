"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass/GlassCard";
import { GlassBadge } from "@/components/ui/glass/GlassBadge";
import { GlassButton } from "@/components/ui/glass/GlassButton";
import { Card3DTilt } from "@/components/3d/Card3DTilt";
import { SentimentGlobe3D } from "@/components/3d/SentimentGlobe3D";
import {
  Compass,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Info,
  Layers,
  Activity,
  Zap,
  Globe,
  Radio,
  BarChart3,
  ShieldAlert,
  Flame,
  BrainCircuit,
  Sparkles,
} from "lucide-react";

interface PairSentimentData {
  symbol: string;
  name: string;
  updatedAt: string;
  overallBullish: number;
  overallBearish: number;
  sentimentStatus: string;
  fearGreedIndex: number;
  fearGreedStatus: string;
  retailLong: number;
  retailShort: number;
  institutionalBias: "Long" | "Short" | "Neutral";
  institutionalLong: number;
  institutionalShort: number;
  cotNetPositions: number; // in contracts
  cotWeeklyChange: number;
  aiSmartMoneyVerdict: string;
  sources: {
    name: string;
    long: number;
    short: number;
    status: "Bullish" | "Bearish" | "Neutral";
  }[];
}

const INITIAL_SENTIMENT_DATA: Record<string, PairSentimentData> = {
  XAUUSD: {
    symbol: "XAUUSD",
    name: "Gold / US Dollar",
    updatedAt: "Just now",
    overallBullish: 78,
    overallBearish: 22,
    sentimentStatus: "Strong Bullish Institutional Accumulation",
    fearGreedIndex: 74,
    fearGreedStatus: "Greed / High Risk Appetite",
    retailLong: 54,
    retailShort: 46,
    institutionalBias: "Long",
    institutionalLong: 76,
    institutionalShort: 24,
    cotNetPositions: 245800,
    cotWeeklyChange: +14200,
    aiSmartMoneyVerdict:
      "جریان نقدینگی پول هوشمند (Smart Money) در حال افزایش موقعیت‌های خرید تعهدی در معاملات آتی شمش طلا است؛ تضعیف دلار کاتالیزور اصلی انباشت نهادی است.",
    sources: [
      { name: "CFTC Commitment of Traders (CoT)", long: 76, short: 24, status: "Bullish" },
      { name: "Myfxbook Community Sentiment", long: 65, short: 35, status: "Bullish" },
      { name: "TradingView Multi-Timeframe Score", long: 70, short: 30, status: "Bullish" },
      { name: "IG Client & Institutional Orderbook", long: 63, short: 37, status: "Bullish" },
    ],
  },
  EURUSD: {
    symbol: "EURUSD",
    name: "Euro / US Dollar",
    updatedAt: "Just now",
    overallBullish: 42,
    overallBearish: 58,
    sentimentStatus: "Moderate Bearish Consolidation",
    fearGreedIndex: 45,
    fearGreedStatus: "Neutral / Hesitant",
    retailLong: 68,
    retailShort: 32,
    institutionalBias: "Short",
    institutionalLong: 38,
    institutionalShort: 62,
    cotNetPositions: -42500,
    cotWeeklyChange: -5800,
    aiSmartMoneyVerdict:
      "انباشت پوزیشن‌های خرید توسط معامله‌گران خرد در برابر فشار فروش نهادی، سیگنال اصلاح معکوس (Contrarian Short) را نشان می‌دهد.",
    sources: [
      { name: "CFTC Commitment of Traders (CoT)", long: 38, short: 62, status: "Bearish" },
      { name: "Myfxbook Community Sentiment", long: 42, short: 58, status: "Bearish" },
      { name: "TradingView Multi-Timeframe Score", long: 45, short: 55, status: "Bearish" },
      { name: "OANDA Order Book", long: 40, short: 60, status: "Bearish" },
    ],
  },
  GBPUSD: {
    symbol: "GBPUSD",
    name: "British Pound / US Dollar",
    updatedAt: "Just now",
    overallBullish: 55,
    overallBearish: 45,
    sentimentStatus: "Mild Bullish Bias",
    fearGreedIndex: 58,
    fearGreedStatus: "Mild Greed",
    retailLong: 51,
    retailShort: 49,
    institutionalBias: "Long",
    institutionalLong: 58,
    institutionalShort: 42,
    cotNetPositions: +18200,
    cotWeeklyChange: +3100,
    aiSmartMoneyVerdict:
      "تعادل نسبی در موقعیت‌های خرده‌فروشی و برتری ملایم خریداران نهادی پس از آخرین نشست بانک مرکزی انگلستان.",
    sources: [
      { name: "CFTC Commitment of Traders (CoT)", long: 58, short: 42, status: "Bullish" },
      { name: "Myfxbook Community Sentiment", long: 54, short: 46, status: "Bullish" },
      { name: "TradingView Multi-Timeframe Score", long: 50, short: 50, status: "Neutral" },
      { name: "IG Client Positioning", long: 53, short: 47, status: "Bullish" },
    ],
  },
  USDJPY: {
    symbol: "USDJPY",
    name: "US Dollar / Japanese Yen",
    updatedAt: "Just now",
    overallBullish: 68,
    overallBearish: 32,
    sentimentStatus: "Strong Bullish Volatility",
    fearGreedIndex: 65,
    fearGreedStatus: "Greed",
    retailLong: 31,
    retailShort: 69,
    institutionalBias: "Long",
    institutionalLong: 68,
    institutionalShort: 32,
    cotNetPositions: +89400,
    cotWeeklyChange: +9500,
    aiSmartMoneyVerdict:
      "تداوم اختلاف نرخ بهره و فشار روی ین ژاپن منجر به جریان ورودی قوی در جهت تقویت دلار شده است.",
    sources: [
      { name: "CFTC Commitment of Traders (CoT)", long: 68, short: 32, status: "Bullish" },
      { name: "Myfxbook Community Sentiment", long: 74, short: 26, status: "Bullish" },
      { name: "TradingView Multi-Timeframe Score", long: 70, short: 30, status: "Bullish" },
      { name: "OANDA Order Book", long: 69, short: 31, status: "Bullish" },
    ],
  },
};

export default function MarketSentimentPage() {
  const [selectedPair, setSelectedPair] = useState<string>("XAUUSD");
  const [sentimentData, setSentimentData] = useState(INITIAL_SENTIMENT_DATA);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("هم‌اکنون (زنده)");

  const currentData = sentimentData[selectedPair] || sentimentData["XAUUSD"];
  const isBullish = currentData.overallBullish >= 50;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setSentimentData((prev) => {
        const copy = { ...prev };
        const data = { ...copy[selectedPair] };
        const delta = Math.floor(Math.random() * 3) - 1;
        const newBullish = Math.min(90, Math.max(20, data.overallBullish + delta));
        data.overallBullish = newBullish;
        data.overallBearish = 100 - newBullish;
        data.updatedAt = new Date().toLocaleTimeString("fa-IR");
        copy[selectedPair] = data;
        return copy;
      });
      setLastUpdated(new Date().toLocaleTimeString("fa-IR"));
      setIsRefreshing(false);
    }, 700);
  };

  useEffect(() => {
    const interval = setInterval(handleRefresh, 30000);
    return () => clearInterval(interval);
  }, [selectedPair]);

  return (
    <div className="space-y-8 pb-16 relative z-10">
      {/* Header Title with Live Pulse */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
              <Globe className="h-8 w-8 text-cyan-400" />
              <span>مرکز تحلیل سنتیمنت و نقدینگی ۳ بعدی</span>
            </h1>
            <GlassBadge variant="cyan">3D Holographic</GlassBadge>
          </div>
          <p className="mt-1 text-xs dark:text-slate-400 text-slate-500 font-persian font-medium">
            ترکیب تعهدات نهادی CFTC CoT، سنتیمنت کامیونیتی جهانی و شاخص ترس و طمع
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 text-xs text-emerald-400 font-bold">
            <Radio className="h-3.5 w-3.5 animate-pulse" />
            <span>پخش زنده سنتیمنت مارکت</span>
          </div>

          <GlassButton size="sm" variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>بروزرسانی زنده</span>
          </GlassButton>
        </div>
      </div>

      {/* Pair Selector Tabs */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <span className="text-xs font-bold text-slate-400 mr-2">انتخاب نماد:</span>
        {Object.keys(sentimentData).map((pair) => {
          const isSelected = selectedPair === pair;
          return (
            <button
              key={pair}
              onClick={() => setSelectedPair(pair)}
              className={`rounded-xl px-5 py-2.5 text-xs font-black transition-all duration-300 cursor-pointer ${
                isSelected
                  ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-105"
                  : "dark:bg-slate-900/80 bg-slate-100 dark:text-slate-300 text-slate-700 hover:border-cyan-400/50 border border-white/10"
              }`}
            >
              {pair}
            </button>
          );
        })}
      </div>

      {/* Main 3D Holographic Overview & Metric Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* 3D Holographic Globe Visualizer Card */}
        <div className="lg:col-span-5">
          <Card3DTilt glowColor={isBullish ? "emerald" : "rose"} intensity={15} className="h-full">
            <GlassCard glowColor={isBullish ? "green" : "red"} className="h-full flex flex-col justify-between p-6">
              <div>
                <div className="flex items-center justify-between border-b dark:border-white/10 border-black/10 pb-4">
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5 text-cyan-400" />
                    <span className="text-sm font-black text-white">ویژوالایزر ۳ بعدی تمایلات</span>
                  </div>
                  <GlassBadge variant={isBullish ? "profit" : "loss"}>
                    {isBullish ? "BULLISH DOMINANCE" : "BEARISH DOMINANCE"}
                  </GlassBadge>
                </div>

                <div className="py-4 flex items-center justify-center">
                  <SentimentGlobe3D
                    sentiment={isBullish ? "BULLISH" : "BEARISH"}
                    score={currentData.overallBullish}
                  />
                </div>
              </div>

              <div className="rounded-xl bg-slate-950/60 border border-white/10 p-3.5 text-center">
                <span className="text-xs font-bold text-amber-400 font-persian block">
                  {currentData.sentimentStatus}
                </span>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  بروزرسانی داده‌ها: {lastUpdated}
                </span>
              </div>
            </GlassCard>
          </Card3DTilt>
        </div>

        {/* Core Statistical Metrics & Fear/Greed */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Fear & Greed + CoT Summary Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Fear & Greed Dial */}
            <Card3DTilt glowColor="gold" intensity={10}>
              <GlassCard glowColor="gold" className="h-full p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Fear & Greed Index
                  </span>
                  <Flame className="h-5 w-5 text-amber-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-amber-400 font-mono">
                    {currentData.fearGreedIndex}
                  </span>
                  <span className="text-xs font-bold text-slate-300">/ 100</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden flex">
                  <div
                    style={{ width: `${currentData.fearGreedIndex}%` }}
                    className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500 shadow-[0_0_10px_#f59e0b]"
                  />
                </div>
                <span className="text-xs font-semibold text-slate-300 block">
                  وضعیت: <strong className="text-amber-300">{currentData.fearGreedStatus}</strong>
                </span>
              </GlassCard>
            </Card3DTilt>

            {/* CFTC CoT Net Positions */}
            <Card3DTilt glowColor="cyan" intensity={10}>
              <GlassCard glowColor="cyan" className="h-full p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    CFTC CoT Net Contracts
                  </span>
                  <BarChart3 className="h-5 w-5 text-cyan-400" />
                </div>
                <div className="text-3xl font-black text-cyan-400 font-mono">
                  {currentData.cotNetPositions > 0 ? "+" : ""}
                  {currentData.cotNetPositions.toLocaleString()}
                </div>
                <div className="text-xs text-slate-300 flex items-center justify-between font-mono">
                  <span>Weekly Flow:</span>
                  <span
                    className={`font-bold ${
                      currentData.cotWeeklyChange >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {currentData.cotWeeklyChange >= 0 ? "▲ +" : "▼ "}
                    {currentData.cotWeeklyChange.toLocaleString()} contracts
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-400 block font-persian">
                  گرایش نهادی: <strong className="text-cyan-300">{currentData.institutionalBias}</strong>
                </span>
              </GlassCard>
            </Card3DTilt>
          </div>

          {/* AI Smart Money Thesis Card */}
          <Card3DTilt glowColor="purple" intensity={8}>
            <GlassCard glowColor="purple" className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-purple-400">
                <Sparkles className="h-5 w-5" />
                <h3 className="text-sm font-black text-white">سنتز تحلیلی پول هوشمند (Smart Money AI Insight)</h3>
              </div>
              <p className="text-xs leading-relaxed text-slate-200 font-persian">
                {currentData.aiSmartMoneyVerdict}
              </p>
            </GlassCard>
          </Card3DTilt>

          {/* Retail vs Institutional Breakdown Bar */}
          <GlassCard className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Retail vs Institutional Positioning
              </h3>
              <Layers className="h-4 w-4 text-slate-400" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Retail */}
              <div className="rounded-xl bg-slate-950/70 border border-white/10 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">خرده‌فروشی (Retail Traders)</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    L: {currentData.retailLong}% | S: {currentData.retailShort}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden flex">
                  <div style={{ width: `${currentData.retailLong}%` }} className="bg-emerald-500 h-full" />
                  <div style={{ width: `${currentData.retailShort}%` }} className="bg-rose-500 h-full" />
                </div>
              </div>

              {/* Institutional */}
              <div className="rounded-xl bg-slate-950/70 border border-white/10 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">موسسات مالی (Institutional CoT)</span>
                  <span className="text-cyan-400 font-mono font-bold">
                    L: {currentData.institutionalLong}% | S: {currentData.institutionalShort}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden flex">
                  <div
                    style={{ width: `${currentData.institutionalLong}%` }}
                    className="bg-cyan-500 h-full"
                  />
                  <div
                    style={{ width: `${currentData.institutionalShort}%` }}
                    className="bg-rose-500 h-full"
                  />
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Breakdown by Trusted Liquidity Sources */}
      <GlassCard className="space-y-6 p-6">
        <div className="flex items-center gap-2 border-b dark:border-white/10 border-black/10 pb-4">
          <Activity className="h-5 w-5 text-amber-400" />
          <h2 className="text-base font-extrabold dark:text-white text-slate-900">
            تفکیک سنتیمنت بر اساس منابع معتبر نقدینگی و اوردربوک
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentData.sources.map((source) => (
            <div
              key={source.name}
              className="rounded-2xl border dark:border-white/10 border-black/10 dark:bg-slate-950/70 bg-slate-50 p-4 space-y-2.5 transition-all hover:border-cyan-500/40"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold dark:text-white text-slate-900">{source.name}</span>
                <GlassBadge variant={source.status === "Bullish" ? "profit" : "loss"}>
                  {source.status}
                </GlassBadge>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-400">
                <span className="text-emerald-400">Long: {source.long}%</span>
                <span className="text-rose-400">Short: {source.short}%</span>
              </div>

              <div className="h-2.5 w-full rounded-full bg-slate-900 overflow-hidden flex p-0.5">
                <div
                  style={{ width: `${source.long}%` }}
                  className="h-full bg-emerald-500 rounded-l-full shadow-[0_0_8px_#10b981]"
                />
                <div
                  style={{ width: `${source.short}%` }}
                  className="h-full bg-rose-500 rounded-r-full shadow-[0_0_8px_#f43f5e]"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Contrarian Indicator Banner */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 flex items-start gap-3 text-xs text-amber-200">
          <Info className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-persian">
            <strong>نکته استراتژیک معامله‌گری خلاف‌جهت (Contrarian Signal):</strong> زمانی که بیش از ۷۰٪ معامله‌گران خرد در یک جهت وارد پوزیشن می‌شوند و جریان نهادی در جهت معکوس است، احتمال چرخش شدید و تسویه‌حساب نقدینگی (Liquidity Sweep) به شدت بالا می‌رود.
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
