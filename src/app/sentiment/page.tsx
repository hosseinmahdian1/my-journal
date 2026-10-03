"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass/GlassCard";
import { GlassBadge } from "@/components/ui/glass/GlassBadge";
import { Card3DTilt } from "@/components/3d/Card3DTilt";
import { SentimentGlobe3D } from "@/components/3d/SentimentGlobe3D";
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Activity,
  BarChart3,
  Flame,
  BrainCircuit,
  Sparkles,
  Zap,
} from "lucide-react";

interface PairSentimentData {
  symbol: string;
  name: string;
  updatedAt: string;
  overallBullish: number;
  overallBearish: number;
  sentimentStatus: string;
  retailLong: number;
  retailShort: number;
  momentumTrend: "Bullish" | "Bearish" | "Neutral";
  currentPrice: number;
  priceChangePct: number;
  macroInstitutionalLong: number;
  aiSmartMoneyVerdict: string;
}

const FALLBACK_SENTIMENT_DATA: Record<string, PairSentimentData> = {
  XAUUSD: {
    symbol: "XAUUSD",
    name: "Gold / US Dollar",
    updatedAt: "Just now",
    overallBullish: 50,
    overallBearish: 50,
    sentimentStatus: "در حال دریافت دیتای لایو...",
    retailLong: 50,
    retailShort: 50,
    momentumTrend: "Neutral",
    currentPrice: 0,
    priceChangePct: 0,
    macroInstitutionalLong: 50,
    aiSmartMoneyVerdict: "در حال محاسبه سیگنال‌های لایو...",
  },
};

export default function MarketSentimentPage() {
  const [selectedPair, setSelectedPair] = useState<string>("XAUUSD");
  const [sentimentData, setSentimentData] = useState<Record<string, PairSentimentData>>(FALLBACK_SENTIMENT_DATA);
  const [fearGreed, setFearGreed] = useState({ score: 50, status: "Neutral" });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("Loading...");

  const fetchLiveSentiment = async () => {
    try {
      const res = await fetch("/api/sentiment?_t=" + Date.now());
      if (res.ok) {
        const json = await res.json();
        if (json?.pairs) {
          setSentimentData(json.pairs);
        }
        if (json?.metadata?.generated_at) {
          setLastUpdated(json.metadata.generated_at);
        }
        if (json?.metadata?.fear_and_greed) {
          setFearGreed({
            score: json.metadata.fear_and_greed.score,
            status: json.metadata.fear_and_greed.classification,
          });
        }
      }
    } catch (e) {
      console.log("Live sentiment fetch failed:", e);
    } finally {
      setIsLoading(false);
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
    const interval = setInterval(fetchLiveSentiment, 60000); // 1 minute polling for active traders
    return () => clearInterval(interval);
  }, []);

  const currentData = sentimentData[selectedPair] || sentimentData["XAUUSD"] || FALLBACK_SENTIMENT_DATA["XAUUSD"];
  const isBullish = currentData.overallBullish >= 50;

  return (
    <div className="space-y-8 pb-16 relative z-10">
      {/* Header Title with Live Pulse */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-br from-[#EDEDED] to-[#9A9A9A] bg-clip-text text-transparent drop-shadow-sm font-mono flex items-center gap-3">
            Live Orderflow
            {isLoading ? (
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8B5CF6] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#8B5CF6]"></span>
              </span>
            ) : (
              <span className="flex h-3 w-3 relative">
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#34D399] shadow-[0_0_10px_#34D399]"></span>
              </span>
            )}
          </h1>
        </div>

        <button
          onClick={handleRefresh}
          className="group relative flex items-center justify-center gap-2 rounded-xl dark:bg-[#141414]/80 bg-white border dark:border-[#2A2A2A]/30 border-slate-200 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-[#0A0A0A] transition-all active:scale-95 shadow-sm"
        >
          <RefreshCw className={`h-4 w-4 dark:text-[#8B5CF6] text-amber-600 ${isRefreshing ? "animate-spin" : ""}`} />
          <span className="text-xs font-bold dark:text-[#EDEDED] text-slate-800">
            {isRefreshing ? "SYNCING..." : "SYNC LIVE DATA"}
          </span>
        </button>
      </div>

      {isLoading && (
        <div className="w-full p-12 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5CF6]"></div>
        </div>
      )}

      {!isLoading && (
        <>
          {/* PAIR SELECTOR */}
          <div className="flex justify-center flex-wrap gap-2 mb-8">
            {["XAUUSD", "EURUSD", "GBPUSD", "USDJPY"].map((pair) => {
              const isSelected = selectedPair === pair;
              return (
                <button
                  key={pair}
                  onClick={() => setSelectedPair(pair)}
                  className={`rounded-xl px-5 py-2.5 text-xs font-black transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? "bg-[#8B5CF6] text-[#0A0A0A] shadow-md scale-105"
                      : "dark:bg-[#141414]/60 bg-white dark:text-[#9A9A9A] text-slate-700 hover:border-[#8B5CF6]/50 border dark:border-[#2A2A2A]/30 border-slate-200 shadow-sm"
                  }`}
                >
                  {pair}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* 3D Holographic Visualizer Card */}
            <div className="lg:col-span-5">
              <Card3DTilt glowColor={isBullish ? "emerald" : "rose"} intensity={15} className="h-full">
                <GlassCard glowColor={isBullish ? "green" : "red"} className="h-full flex flex-col justify-between p-6">
                  <div>
                    <div className="flex items-center justify-between border-b dark:border-[#2A2A2A]/25 border-slate-200 pb-4">
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 dark:text-[#8B5CF6] text-amber-600" />
                        <span className="text-sm font-black dark:text-[#EDEDED] text-slate-900 font-mono">Day Trader Sentiment</span>
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

                  <div className="rounded-xl dark:bg-[#0A0A0A]/70 bg-slate-50 border dark:border-[#2A2A2A]/25 border-slate-200 p-3.5 text-center shadow-sm" dir="rtl">
                    <span className="text-sm font-bold dark:text-[#8B5CF6] text-amber-700 block font-persian text-center">
                      {currentData.sentimentStatus}
                    </span>
                    <span className="text-[11px] dark:text-[#9A9A9A] text-slate-500 mt-1 block font-mono text-center" dir="ltr">
                      Last Synced: {lastUpdated}
                    </span>
                  </div>
                </GlassCard>
              </Card3DTilt>
            </div>

            {/* Core Statistical Metrics */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Momentum & Fear/Greed */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* 1H Momentum Trend */}
                <Card3DTilt glowColor={currentData.momentumTrend === "Bullish" ? "emerald" : currentData.momentumTrend === "Bearish" ? "rose" : "cyan"} intensity={10}>
                  <GlassCard className="h-full p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider dark:text-[#9A9A9A] text-slate-500 font-mono">
                        1H Live Momentum
                      </span>
                      <Activity className="h-5 w-5 dark:text-[#8B5CF6] text-amber-600" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        {currentData.momentumTrend === "Bullish" ? (
                          <TrendingUp className="h-7 w-7 text-[#34D399]" />
                        ) : currentData.momentumTrend === "Bearish" ? (
                          <TrendingDown className="h-7 w-7 text-[#F87171]" />
                        ) : (
                          <TrendingUp className="h-7 w-7 text-[#9A9A9A]" />
                        )}
                        <span className="text-3xl font-black font-mono dark:text-[#EDEDED]">
                          {currentData.currentPrice ? currentData.currentPrice.toLocaleString() : "---"}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs dark:text-[#9A9A9A] text-slate-600 flex items-center justify-between font-mono">
                      <span>Daily Change:</span>
                      <span
                        className={`font-bold ${
                          currentData.priceChangePct > 0 ? "text-[#34D399]" : 
                          currentData.priceChangePct < 0 ? "text-[#F87171]" : "text-[#9A9A9A]"
                        }`}
                      >
                        {currentData.priceChangePct > 0 ? "+" : ""}{currentData.priceChangePct}%
                      </span>
                    </div>
                  </GlassCard>
                </Card3DTilt>

                {/* Fear & Greed Dial */}
                <Card3DTilt glowColor="gold" intensity={10}>
                  <GlassCard glowColor="gold" className="h-full p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider dark:text-[#9A9A9A] text-slate-500 font-mono">
                        CNN Fear & Greed
                      </span>
                      <Flame className="h-5 w-5 dark:text-[#8B5CF6] text-amber-500" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black dark:text-[#8B5CF6] text-amber-600 font-mono">
                        {fearGreed.score}
                      </span>
                      <span className="text-xs font-bold dark:text-[#9A9A9A] text-slate-500">/ 100</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full dark:bg-[#0A0A0A] bg-slate-100 overflow-hidden flex border dark:border-[#2A2A2A]/20">
                      <div
                        style={{ width: `${fearGreed.score}%` }}
                        className="h-full bg-gradient-to-r from-[#34D399] via-[#8B5CF6] to-[#F87171]"
                      />
                    </div>
                    <span className="text-xs font-semibold dark:text-[#9A9A9A] text-slate-700 block">
                      Status: <strong className="dark:text-[#8B5CF6] text-amber-700">{fearGreed.status}</strong>
                    </span>
                  </GlassCard>
                </Card3DTilt>
              </div>

              {/* Retail Contrarian Bar */}
              <GlassCard className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase dark:text-[#9A9A9A] text-slate-500 tracking-wider font-mono">
                    Retail Contrarian Sentiment (Live)
                  </h3>
                  <BarChart3 className="h-4 w-4 dark:text-[#9A9A9A] text-slate-500" />
                </div>

                <div className="rounded-xl dark:bg-[#0A0A0A]/70 bg-slate-50 border dark:border-[#2A2A2A]/25 border-slate-200 p-4 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold dark:text-[#EDEDED] text-slate-700">Retail Traders (Dumb Money)</span>
                    <span className="dark:text-[#9A9A9A] text-slate-600 font-mono font-bold">
                      <span className="text-[#34D399]">Long {currentData.retailLong}%</span> | <span className="text-[#F87171]">Short {currentData.retailShort}%</span>
                    </span>
                  </div>
                  <div className="h-4 w-full rounded-full dark:bg-[#141414] bg-slate-200 overflow-hidden flex shadow-inner">
                    <div style={{ width: `${currentData.retailLong}%` }} className="bg-[#34D399] h-full transition-all duration-500" />
                    <div style={{ width: `${currentData.retailShort}%` }} className="bg-[#F87171] h-full transition-all duration-500" />
                  </div>
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold text-[#9A9A9A] pt-1">
                    <span>Retail is Buying (Bearish Signal)</span>
                    <span>Retail is Selling (Bullish Signal)</span>
                  </div>
                </div>
              </GlassCard>

              {/* AI Smart Money Thesis Card */}
              <Card3DTilt glowColor="gold" intensity={8}>
                <GlassCard glowColor="gold" className="p-5 space-y-3">
                  <div className="flex items-center gap-2 dark:text-[#8B5CF6] text-amber-600">
                    <BrainCircuit className="h-5 w-5" />
                    <h3 className="text-sm font-black dark:text-[#EDEDED] text-slate-900">
                      Live AI Orderflow Verdict
                    </h3>
                  </div>
                  <p
                    dir="rtl"
                    className="text-sm leading-relaxed dark:text-[#EDEDED] text-slate-800 font-persian text-right"
                  >
                    {currentData.aiSmartMoneyVerdict}
                  </p>
                </GlassCard>
              </Card3DTilt>
            </div>
          </div>

          {/* Macro Summary Strip */}
          <div className="flex items-center justify-center pt-8 border-t dark:border-[#2A2A2A]/25 border-slate-200">
            <span className="text-xs font-semibold dark:text-[#9A9A9A] text-slate-400 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#8B5CF6]" /> 
              دیدگاه ماکرو هفتگی (CFTC): موقعیت‌های نهادی در حال حاضر {currentData.macroInstitutionalLong}% لانگ می‌باشد.
            </span>
          </div>
        </>
      )}
    </div>
  );
}
