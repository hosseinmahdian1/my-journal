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
    sentimentStatus: "Strong Bullish Institutional Accumulation",
    fearGreedIndex: 73,
    fearGreedStatus: "Greed",
    retailLong: 54,
    retailShort: 46,
    institutionalBias: "Long",
    institutionalLong: 76,
    institutionalShort: 24,
    cotNetPositions: 245800,
    cotWeeklyChange: +14200,
    aiSmartMoneyVerdict:
      "Large institutional participants hold a net long posture of +245,800 contracts (76% Long), signaling decisive smart money sponsorship in Spot Gold alongside softening US Dollar Index (DXY) momentum.",
    contrarianWarning: "Retail long distribution remains well-balanced at 54%; risk of retail long squeeze is currently low.",
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
    fearGreedIndex: 73,
    fearGreedStatus: "Greed",
    retailLong: 68,
    retailShort: 32,
    institutionalBias: "Short",
    institutionalLong: 38,
    institutionalShort: 62,
    cotNetPositions: -42500,
    cotWeeklyChange: -5800,
    aiSmartMoneyVerdict:
      "Retail positioning is heavily skewed long (68%) against institutional distribution (62% Short), signaling potential liquidity sweep and continuation of bearish flow.",
    contrarianWarning: "Heavy retail longs (68%) trigger contrarian short alerts into key resistance zones.",
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
    fearGreedIndex: 73,
    fearGreedStatus: "Greed",
    retailLong: 51,
    retailShort: 49,
    institutionalBias: "Long",
    institutionalLong: 58,
    institutionalShort: 42,
    cotNetPositions: +18200,
    cotWeeklyChange: +3100,
    aiSmartMoneyVerdict:
      "Balanced retail market positioning with modest institutional net long expansion (+18,200 contracts) following central bank policy rate trajectories.",
    contrarianWarning: "Market trades in balanced equilibrium without extreme one-sided crowd exposure.",
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
    fearGreedIndex: 73,
    fearGreedStatus: "Greed",
    retailLong: 31,
    retailShort: 69,
    institutionalBias: "Long",
    institutionalLong: 68,
    institutionalShort: 32,
    cotNetPositions: +89400,
    cotWeeklyChange: +9500,
    aiSmartMoneyVerdict:
      "Yield differential and institutional carry appetite fuel dollar momentum. One-sided retail short bias (69%) provides continued short-squeeze fuel.",
    contrarianWarning: "Extreme retail short crowd (69% Short) continues to fuel upward momentum extensions.",
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
  const [sentimentData, setSentimentData] = useState(FALLBACK_SENTIMENT_DATA);
  const [macroSummary, setMacroSummary] = useState<string>(
    "Global market sentiment reflects risk-on liquidity expansion alongside institutional gold accumulation and dollar momentum tracking rate expectations."
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
        if (json?.metadata?.macro_summary_en || json?.metadata?.macro_summary_fa) {
          setMacroSummary(json.metadata.macro_summary_en || json.metadata.macro_summary_fa);
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
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
              <Globe className="h-8 w-8 text-cyan-400" />
              <span>Market Sentiment & Institutional Liquidity</span>
            </h1>
            <GlassBadge variant="cyan">3D Holographic</GlassBadge>
          </div>
          <p className="mt-1 text-xs dark:text-slate-400 text-slate-500 font-medium">
            Real-time multi-asset intelligence combining CFTC CoT positioning, Fear & Greed Index, and global retail order flow.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 text-xs text-emerald-400 font-bold">
            <Radio className="h-3.5 w-3.5 animate-pulse" />
            <span>Live Sentiment Feed</span>
          </div>

          <GlassButton size="sm" variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Live Refresh</span>
          </GlassButton>
        </div>
      </div>

      {/* Global Macro Regime Banner */}
      <Card3DTilt glowColor="purple" intensity={6}>
        <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-950/60 p-5 backdrop-blur-xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-400">
              <Cpu className="h-5 w-5" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider">
                Macro Liquidity Regime (120B AI Swarm): {macroRegime}
              </span>
            </div>
            <GlassBadge variant="purple">Macro Swarm</GlassBadge>
          </div>
          <p className="text-xs leading-relaxed text-slate-200">{macroSummary}</p>
        </div>
      </Card3DTilt>

      {/* Pair Selector Tabs */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <span className="text-xs font-bold text-slate-400 mr-2 uppercase tracking-wider">Select Asset:</span>
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
                    <span className="text-sm font-black text-white">3D Holographic Sentiment Sphere</span>
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
                <span className="text-xs font-bold text-amber-400 block">
                  {currentData.sentimentStatus}
                </span>
                <span className="text-[11px] text-slate-400 mt-1 block font-mono">
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
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
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
                  Status: <strong className="text-amber-300">{currentData.fearGreedStatus}</strong>
                </span>
              </GlassCard>
            </Card3DTilt>

            {/* CFTC CoT Net Positions */}
            <Card3DTilt glowColor="cyan" intensity={10}>
              <GlassCard glowColor="cyan" className="h-full p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
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
                <span className="text-xs font-semibold text-slate-400 block">
                  Institutional Bias: <strong className="text-cyan-300">{currentData.institutionalBias}</strong>
                </span>
              </GlassCard>
            </Card3DTilt>
          </div>

          {/* AI Smart Money Thesis Card */}
          <Card3DTilt glowColor="purple" intensity={8}>
            <GlassCard glowColor="purple" className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-purple-400">
                <Sparkles className="h-5 w-5" />
                <h3 className="text-sm font-black text-white">
                  Smart Money & Institutional Flow (AI Swarm Synthesis)
                </h3>
              </div>
              <p className="text-xs leading-relaxed text-slate-200">
                {currentData.aiSmartMoneyVerdict}
              </p>
            </GlassCard>
          </Card3DTilt>

          {/* Retail vs Institutional Breakdown Bar */}
          <GlassCard className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider font-mono">
                Retail vs Institutional Positioning
              </h3>
              <Layers className="h-4 w-4 text-slate-400" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Retail */}
              <div className="rounded-xl bg-slate-950/70 border border-white/10 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">Retail Traders (Community Books)</span>
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
                  <span className="font-bold text-slate-300">Institutional (CFTC CoT Positions)</span>
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
            Multi-Source Liquidity & Order Book Breakdown
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
        {currentData.contrarianWarning && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 flex items-start gap-3 text-xs text-amber-200">
            <Info className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Strategic Contrarian Market Note:</strong> {currentData.contrarianWarning}
            </p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
