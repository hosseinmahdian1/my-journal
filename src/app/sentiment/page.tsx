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
  Cpu,
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
  cotNetPositions: number;
  cotWeeklyChange: number;
  aiSmartMoneyVerdict: string;
  contrarianWarning?: string;
  sources: {
    name: string;
    long: number;
    short: number;
    status: "Bullish" | "Bearish" | "Neutral";
  }[];
}

const FALLBACK_SENTIMENT_DATA: Record<string, PairSentimentData> = {
  XAUUSD: {
    symbol: "XAUUSD",
    name: "Gold / US Dollar",
    updatedAt: "Just now",
    overallBullish: 78,
    overallBearish: 22,
    sentimentStatus: "انباشت سنگین نهادی",
    fearGreedIndex: 74,
    fearGreedStatus: "Greed",
    retailLong: 54,
    retailShort: 46,
    institutionalBias: "Long",
    institutionalLong: 88,
    institutionalShort: 12,
    cotNetPositions: 222189,
    cotWeeklyChange: +4249,
    aiSmartMoneyVerdict:
      "موقعیت‌های خالص لانگ نهادی در طلا به شدت بالا (۸۸٪) بوده و نشان‌دهنده انباشت سنگین و جریان نقدینگی قدرتمند نهادی به سمت دارایی‌های امن در دوران تورم یا ریسک‌پذیری بالا است.",
    contrarianWarning: "نسبت لانگ خرده‌فروشان متعادل است و ریسک ترپ خریداران در کف پایین ارزیابی می‌شود.",
    sources: [
      { name: "CFTC Official CoT Report", long: 88, short: 12, status: "Bullish" },
      { name: "Myfxbook Community Sentiment", long: 65, short: 35, status: "Bullish" },
      { name: "TradingView Multi-Timeframe Score", long: 70, short: 30, status: "Bullish" },
      { name: "IG Client & Institutional Orderbook", long: 63, short: 37, status: "Bullish" },
    ],
  },
  EURUSD: {
    symbol: "EURUSD",
    name: "Euro / US Dollar",
    updatedAt: "Just now",
    overallBullish: 43,
    overallBearish: 57,
    sentimentStatus: "اصلاح نزولی نهادی",
    fearGreedIndex: 74,
    fearGreedStatus: "Greed",
    retailLong: 66,
    retailShort: 34,
    institutionalBias: "Short",
    institutionalLong: 43,
    institutionalShort: 57,
    cotNetPositions: -59088,
    cotWeeklyChange: +922,
    aiSmartMoneyVerdict:
      "گزارش رسمی CFTC حاکی از برتری پوزیشن‌های شورت موسسات با خالص -۵۹,۰۸۸ قرارداد است، در حالی که معامله‌گران خرد تمایل به خرید دارند.",
    contrarianWarning: "انباشت سنگین خریداران خرد (۶۶٪ لانگ) در برابر نهادها، سیگنال اصلاح معکوس به سمت پایین را تقویت می‌کند.",
    sources: [
      { name: "CFTC Official CoT Report", long: 43, short: 57, status: "Bearish" },
      { name: "Myfxbook Community Sentiment", long: 42, short: 58, status: "Bearish" },
      { name: "TradingView Multi-Timeframe Score", long: 45, short: 55, status: "Bearish" },
      { name: "OANDA Order Book", long: 40, short: 60, status: "Bearish" },
    ],
  },
  GBPUSD: {
    symbol: "GBPUSD",
    name: "British Pound / US Dollar",
    updatedAt: "Just now",
    overallBullish: 37,
    overallBearish: 63,
    sentimentStatus: "فشار عرضه نهادی",
    fearGreedIndex: 74,
    fearGreedStatus: "Greed",
    retailLong: 52,
    retailShort: 48,
    institutionalBias: "Short",
    institutionalLong: 37,
    institutionalShort: 63,
    cotNetPositions: -54573,
    cotWeeklyChange: +1648,
    aiSmartMoneyVerdict:
      "خالص تعهدات معامله‌گران پوند روی -۵۴,۵۷۳ قرارداد شورت است اما تغییرات هفتگی مثبت نشان‌دهنده بستن پوزیشن‌های فروش است.",
    contrarianWarning: "بازار در حالت تعادل نقدینگی بدون واگرایی افراطی قرار دارد.",
    sources: [
      { name: "CFTC Official CoT Report", long: 37, short: 63, status: "Bearish" },
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
    sentimentStatus: "حفظ روند صعودی کری‌ترید",
    fearGreedIndex: 74,
    fearGreedStatus: "Greed",
    retailLong: 32,
    retailShort: 68,
    institutionalBias: "Long",
    institutionalLong: 65,
    institutionalShort: 35,
    cotNetPositions: +52893,
    cotWeeklyChange: +10808,
    aiSmartMoneyVerdict:
      "فشار فروش سنگین روی ین در بورس شیکاگو به همراه غلبه ۶۸٪ فروشندگان خرد روی جفت‌ارز USDJPY، سوخت ادامه روند صعودی و رالی خرید دلار را فراهم می‌کند.",
    contrarianWarning: "انباشت شدید فروشندگان خرد (۶۸٪ شورت) سوخت ادامه‌دار رشد قیمت (Short Squeeze) است.",
    sources: [
      { name: "CFTC Official CoT Report", long: 65, short: 35, status: "Bullish" },
      { name: "Myfxbook Community Sentiment", long: 74, short: 26, status: "Bullish" },
      { name: "TradingView Multi-Timeframe Score", long: 70, short: 30, status: "Bullish" },
      { name: "OANDA Order Book", long: 68, short: 32, status: "Bullish" },
    ],
  },
};

export default function MarketSentimentPage() {
  const [selectedPair, setSelectedPair] = useState<string>("XAUUSD");
  const [sentimentData, setSentimentData] = useState(FALLBACK_SENTIMENT_DATA);
  const [macroSummary, setMacroSummary] = useState<string>(
    "در حال حاضر بازار تحت تاثیر یک رژیم ریسک‌پذیری و توسعه نقدینگی قرار دارد؛ جریان نقدینگی نهادی به طور چشمگیری به سمت طلا سرازیر شده و با ۸۸٪ موقعیت لانگ خالص نهادی، طلا به شدت مورد انباشت قرار گرفته است."
  );
  const [macroRegime, setMacroRegime] = useState<string>("Risk-On / Liquidity Expansion");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("Live Stream");

  const fetchLiveSentiment = async () => {
    try {
      const res = await fetch("/data/sentiment-live.json?_t=" + Date.now());
      if (res.ok) {
        const json = await res.json();
        if (json?.pairs) {
          setSentimentData(json.pairs);
        }
        if (json?.metadata?.macro_summary_fa) {
          setMacroSummary(json.metadata.macro_summary_fa);
        } else if (json?.metadata?.macro_summary_en) {
          setMacroSummary(json.metadata.macro_summary_en);
        }
        if (json?.metadata?.macro_regime) {
          setMacroRegime(json.metadata.macro_regime);
        }
        if (json?.metadata?.generated_at) {
          setLastUpdated(json.metadata.generated_at);
        }
      }
    } catch (e) {
      console.log("Error loading live sentiment:", e);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchLiveSentiment();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  useEffect(() => {
    fetchLiveSentiment();
    const interval = setInterval(fetchLiveSentiment, 45000);
    return () => clearInterval(interval);
  }, []);

  const currentData = sentimentData[selectedPair] || sentimentData["XAUUSD"] || FALLBACK_SENTIMENT_DATA["XAUUSD"];
  const isBullish = currentData.overallBullish >= 50;

  return (
    <div className="space-y-8 pb-16 relative z-10">
      {/* Header Title with Live Pulse */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Globe className="h-7 w-7 dark:text-cyan-400 text-sky-600" />
          <h1 className="text-2xl sm:text-3xl font-black dark:text-white text-slate-900 tracking-tight">
            Market Sentiment & Liquidity
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl dark:bg-emerald-500/10 bg-emerald-50 border dark:border-emerald-500/30 border-emerald-200 px-3.5 py-1.5 text-xs dark:text-emerald-400 text-emerald-700 font-bold shadow-sm">
            <Radio className="h-3.5 w-3.5 animate-pulse" />
            <span>Live Sentiment Feed</span>
          </div>

          <GlassButton size="sm" variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Live Refresh</span>
          </GlassButton>
        </div>
      </div>

      {/* Global Macro Regime Banner (RTL & Vazirmatn for Persian Paragraph) */}
      <Card3DTilt glowColor="purple" intensity={6}>
        <div className="rounded-2xl border dark:border-purple-500/30 border-purple-200/90 dark:bg-gradient-to-r dark:from-purple-950/40 dark:via-indigo-950/30 dark:to-slate-950/60 bg-gradient-to-r from-purple-50/90 via-indigo-50/80 to-slate-50 p-5 backdrop-blur-xl space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 dark:text-purple-400 text-purple-700">
              <Cpu className="h-5 w-5" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider">
                Macro Liquidity Regime (Google Gemini 2.5 Flash): {macroRegime}
              </span>
            </div>
            <GlassBadge variant="purple">Macro Swarm</GlassBadge>
          </div>
          <p
            dir="rtl"
            className="text-xs leading-relaxed dark:text-slate-200 text-slate-800 font-persian text-right selection:bg-purple-500/30"
          >
            {macroSummary}
          </p>
        </div>
      </Card3DTilt>

      {/* Pair Selector Tabs */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <span className="text-xs font-bold dark:text-slate-400 text-slate-500 mr-2 uppercase tracking-wider">Select Asset:</span>
        {Object.keys(sentimentData).map((pair) => {
          const isSelected = selectedPair === pair;
          return (
            <button
              key={pair}
              onClick={() => setSelectedPair(pair)}
              className={`rounded-xl px-5 py-2.5 text-xs font-black transition-all duration-300 cursor-pointer ${
                isSelected
                  ? "bg-gradient-to-r from-sky-500 to-emerald-500 text-white dark:text-slate-950 shadow-[0_4px_16px_rgba(14,165,233,0.35)] scale-105"
                  : "dark:bg-slate-900/80 bg-white dark:text-slate-300 text-slate-700 hover:border-sky-400/50 border dark:border-white/10 border-slate-200 shadow-sm"
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
                <div className="flex items-center justify-between border-b dark:border-white/10 border-slate-200 pb-4">
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5 dark:text-cyan-400 text-sky-600" />
                    <span className="text-sm font-black dark:text-white text-slate-900">3D Holographic Sentiment Sphere</span>
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

              <div className="rounded-xl dark:bg-slate-950/60 bg-slate-50 border dark:border-white/10 border-slate-200 p-3.5 text-center shadow-sm" dir="rtl">
                <span className="text-xs font-bold dark:text-amber-400 text-amber-700 block font-persian text-center">
                  {currentData.sentimentStatus}
                </span>
                <span className="text-[11px] dark:text-slate-400 text-slate-500 mt-1 block font-mono text-center" dir="ltr">
                  Last Synced: {lastUpdated}
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
                  <span className="text-xs font-bold uppercase tracking-wider dark:text-slate-400 text-slate-500 font-mono">
                    Fear & Greed Index
                  </span>
                  <Flame className="h-5 w-5 dark:text-amber-400 text-amber-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black dark:text-amber-400 text-amber-600 font-mono">
                    {currentData.fearGreedIndex}
                  </span>
                  <span className="text-xs font-bold dark:text-slate-300 text-slate-500">/ 100</span>
                </div>
                <div className="h-2.5 w-full rounded-full dark:bg-slate-900 bg-slate-100 border dark:border-transparent border-slate-200 overflow-hidden flex">
                  <div
                    style={{ width: `${currentData.fearGreedIndex}%` }}
                    className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500 shadow-[0_0_10px_#f59e0b]"
                  />
                </div>
                <span className="text-xs font-semibold dark:text-slate-300 text-slate-700 block">
                  Status: <strong className="dark:text-amber-300 text-amber-700">{currentData.fearGreedStatus}</strong>
                </span>
              </GlassCard>
            </Card3DTilt>

            {/* CFTC CoT Net Positions */}
            <Card3DTilt glowColor="cyan" intensity={10}>
              <GlassCard glowColor="cyan" className="h-full p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider dark:text-slate-400 text-slate-500 font-mono">
                    CFTC CoT Net Contracts
                  </span>
                  <BarChart3 className="h-5 w-5 dark:text-cyan-400 text-sky-600" />
                </div>
                <div className="text-3xl font-black dark:text-cyan-400 text-sky-700 font-mono">
                  {currentData.cotNetPositions > 0 ? "+" : ""}
                  {currentData.cotNetPositions.toLocaleString()}
                </div>
                <div className="text-xs dark:text-slate-300 text-slate-600 flex items-center justify-between font-mono">
                  <span>Weekly Flow:</span>
                  <span
                    className={`font-bold ${
                      currentData.cotWeeklyChange >= 0 ? "dark:text-emerald-400 text-emerald-600" : "dark:text-rose-400 text-rose-600"
                    }`}
                  >
                    {currentData.cotWeeklyChange >= 0 ? "▲ +" : "▼ "}
                    {currentData.cotWeeklyChange.toLocaleString()} contracts
                  </span>
                </div>
                <span className="text-xs font-semibold dark:text-slate-400 text-slate-600 block">
                  Institutional Bias: <strong className="dark:text-cyan-300 text-sky-700">{currentData.institutionalBias}</strong>
                </span>
              </GlassCard>
            </Card3DTilt>
          </div>

          {/* AI Smart Money Thesis Card (Explicit RTL & Persian Font) */}
          <Card3DTilt glowColor="purple" intensity={8}>
            <GlassCard glowColor="purple" className="p-5 space-y-3">
              <div className="flex items-center gap-2 dark:text-purple-400 text-purple-600">
                <Sparkles className="h-5 w-5" />
                <h3 className="text-sm font-black dark:text-white text-slate-900">
                  Smart Money & Institutional Flow (Google Gemini 2.5 Flash)
                </h3>
              </div>
              <p
                dir="rtl"
                className="text-xs leading-relaxed dark:text-slate-200 text-slate-800 font-persian text-right selection:bg-purple-500/30"
              >
                {currentData.aiSmartMoneyVerdict}
              </p>
            </GlassCard>
          </Card3DTilt>

          {/* Retail vs Institutional Breakdown Bar */}
          <GlassCard className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase dark:text-slate-400 text-slate-500 tracking-wider font-mono">
                Retail vs Institutional Positioning
              </h3>
              <Layers className="h-4 w-4 dark:text-slate-400 text-slate-500" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Retail */}
              <div className="rounded-xl dark:bg-slate-950/70 bg-slate-50 border dark:border-white/10 border-slate-200 p-3.5 space-y-2 shadow-sm">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold dark:text-slate-300 text-slate-700">Retail Traders (Community Books)</span>
                  <span className="dark:text-emerald-400 text-emerald-700 font-mono font-bold">
                    L: {currentData.retailLong}% | S: {currentData.retailShort}%
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full dark:bg-slate-900 bg-slate-200 overflow-hidden flex">
                  <div style={{ width: `${currentData.retailLong}%` }} className="bg-emerald-500 h-full" />
                  <div style={{ width: `${currentData.retailShort}%` }} className="bg-rose-500 h-full" />
                </div>
              </div>

              {/* Institutional */}
              <div className="rounded-xl dark:bg-slate-950/70 bg-slate-50 border dark:border-white/10 border-slate-200 p-3.5 space-y-2 shadow-sm">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold dark:text-slate-300 text-slate-700">Institutional (CFTC CoT Positions)</span>
                  <span className="dark:text-cyan-400 text-sky-700 font-mono font-bold">
                    L: {currentData.institutionalLong}% | S: {currentData.institutionalShort}%
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full dark:bg-slate-900 bg-slate-200 overflow-hidden flex">
                  <div
                    style={{ width: `${currentData.institutionalLong}%` }}
                    className="bg-sky-500 h-full"
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
        <div className="flex items-center gap-2 border-b dark:border-white/10 border-slate-200 pb-4">
          <Activity className="h-5 w-5 dark:text-amber-400 text-amber-600" />
          <h2 className="text-base font-extrabold dark:text-white text-slate-900">
            Multi-Source Liquidity & Order Book Breakdown
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentData.sources.map((source) => (
            <div
              key={source.name}
              className="rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-slate-950/70 bg-slate-50/80 p-4 space-y-2.5 transition-all hover:border-sky-500/40 shadow-sm"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold dark:text-white text-slate-900">{source.name}</span>
                <GlassBadge variant={source.status === "Bullish" ? "profit" : "loss"}>
                  {source.status}
                </GlassBadge>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono font-bold dark:text-slate-400 text-slate-500">
                <span className="dark:text-emerald-400 text-emerald-700">Long: {source.long}%</span>
                <span className="dark:text-rose-400 text-rose-700">Short: {source.short}%</span>
              </div>

              <div className="h-2.5 w-full rounded-full dark:bg-slate-900 bg-slate-200 overflow-hidden flex p-0.5">
                <div
                  style={{ width: `${source.long}%` }}
                  className="h-full bg-emerald-500 rounded-l-full shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                />
                <div
                  style={{ width: `${source.short}%` }}
                  className="h-full bg-rose-500 rounded-r-full shadow-[0_0_8px_rgba(244,63,94,0.3)]"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Contrarian Indicator Banner (Explicit RTL & Persian Alignment) */}
        {currentData.contrarianWarning && (
          <div
            dir="rtl"
            className="rounded-xl border dark:border-amber-500/30 border-amber-200 dark:bg-amber-950/20 bg-amber-50/90 p-4 flex items-start gap-3 text-xs dark:text-amber-200 text-amber-900 shadow-sm"
          >
            <Info className="h-5 w-5 dark:text-amber-400 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-persian text-right flex-1">
              <strong className="font-bold">نکته استراتژیک معامله‌گری خلاف‌جهت (Contrarian Signal):</strong>{" "}
              {currentData.contrarianWarning}
            </p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
