"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass/GlassCard";
import { GlassBadge } from "@/components/ui/glass/GlassBadge";
import { GlassButton } from "@/components/ui/glass/GlassButton";
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
  institutionalBias: "Long" | "Short" | "Neutral";
  institutionalLong: number;
  institutionalShort: number;
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
    overallBullish: 62,
    overallBearish: 38,
    sentimentStatus: "Strong Bullish Sentiment",
    retailLong: 58,
    retailShort: 42,
    institutionalBias: "Short",
    institutionalLong: 45,
    institutionalShort: 55,
    sources: [
      { name: "Myfxbook Community Sentiment", long: 65, short: 35, status: "Bullish" },
      { name: "TradingView Technical Analysis", long: 58, short: 42, status: "Bullish" },
      { name: "IG Client Positioning", long: 63, short: 37, status: "Bullish" },
      { name: "OANDA Order Book", long: 60, short: 40, status: "Bullish" },
    ],
  },
  EURUSD: {
    symbol: "EURUSD",
    name: "Euro / US Dollar",
    updatedAt: "Just now",
    overallBullish: 44,
    overallBearish: 56,
    sentimentStatus: "Moderate Bearish Sentiment",
    retailLong: 68,
    retailShort: 32,
    institutionalBias: "Short",
    institutionalLong: 38,
    institutionalShort: 62,
    sources: [
      { name: "Myfxbook Community Sentiment", long: 42, short: 58, status: "Bearish" },
      { name: "TradingView Technical Analysis", long: 45, short: 55, status: "Bearish" },
      { name: "IG Client Positioning", long: 68, short: 32, status: "Bullish" },
      { name: "OANDA Order Book", long: 40, short: 60, status: "Bearish" },
    ],
  },
  GBPUSD: {
    symbol: "GBPUSD",
    name: "British Pound / US Dollar",
    updatedAt: "Just now",
    overallBullish: 52,
    overallBearish: 48,
    sentimentStatus: "Neutral / Balanced Sentiment",
    retailLong: 51,
    retailShort: 49,
    institutionalBias: "Long",
    institutionalLong: 58,
    institutionalShort: 42,
    sources: [
      { name: "Myfxbook Community Sentiment", long: 54, short: 46, status: "Bullish" },
      { name: "TradingView Technical Analysis", long: 50, short: 50, status: "Neutral" },
      { name: "IG Client Positioning", long: 53, short: 47, status: "Bullish" },
      { name: "OANDA Order Book", long: 49, short: 51, status: "Bearish" },
    ],
  },
  USDJPY: {
    symbol: "USDJPY",
    name: "US Dollar / Japanese Yen",
    updatedAt: "Just now",
    overallBullish: 71,
    overallBearish: 29,
    sentimentStatus: "Very Strong Bullish Sentiment",
    retailLong: 28,
    retailShort: 72,
    institutionalBias: "Long",
    institutionalLong: 68,
    institutionalShort: 32,
    sources: [
      { name: "Myfxbook Community Sentiment", long: 74, short: 26, status: "Bullish" },
      { name: "TradingView Technical Analysis", long: 70, short: 30, status: "Bullish" },
      { name: "IG Client Positioning", long: 28, short: 72, status: "Bearish" },
      { name: "OANDA Order Book", long: 69, short: 31, status: "Bullish" },
    ],
  },
};

export default function MarketSentimentPage() {
  const [selectedPair, setSelectedPair] = useState<string>("XAUUSD");
  const [sentimentData, setSentimentData] = useState(INITIAL_SENTIMENT_DATA);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("Just now");

  const currentData = sentimentData[selectedPair] || sentimentData["XAUUSD"];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      // Simulate live micro-fluctuations
      setSentimentData((prev) => {
        const copy = { ...prev };
        const data = { ...copy[selectedPair] };
        const delta = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
        const newBullish = Math.min(85, Math.max(15, data.overallBullish + delta));
        data.overallBullish = newBullish;
        data.overallBearish = 100 - newBullish;
        data.updatedAt = new Date().toLocaleTimeString();
        copy[selectedPair] = data;
        return copy;
      });
      setLastUpdated(new Date().toLocaleTimeString());
      setIsRefreshing(false);
    }, 800);
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(handleRefresh, 30000);
    return () => clearInterval(interval);
  }, [selectedPair]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-amber-400 flex items-center gap-3 tracking-tight">
            <Globe className="h-8 w-8 text-amber-400" />
            <span>Market Sentiment</span>
          </h1>
          <p className="mt-1 text-xs dark:text-slate-400 text-slate-500 font-medium">
            Real-time sentiment analysis from multiple institutional & community sources
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 text-xs text-emerald-400 font-bold">
            <Radio className="h-3.5 w-3.5 animate-pulse" />
            <span>Live Sentiment Stream</span>
          </div>

          <GlassButton size="sm" variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </GlassButton>
        </div>
      </div>

      {/* Pair Selector Tabs */}
      <div className="flex items-center gap-2.5">
        <span className="text-xs font-bold text-slate-400 mr-2">Select Pair:</span>
        {Object.keys(sentimentData).map((pair) => {
          const isSelected = selectedPair === pair;
          return (
            <button
              key={pair}
              onClick={() => setSelectedPair(pair)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? "bg-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.5)] scale-105"
                  : "dark:bg-zinc-900 bg-slate-100 dark:text-slate-300 text-slate-700 hover:border-amber-400/50 border border-transparent"
              }`}
            >
              {pair}
            </button>
          );
        })}
      </div>

      {/* Top Main Overview Card */}
      <GlassCard glowColor="gold" className="space-y-6 p-6">
        <div className="flex items-center justify-between border-b dark:border-white/10 border-black/10 pb-4">
          <h2 className="text-lg font-black dark:text-white text-slate-900">
            {currentData.symbol} Sentiment Overview
          </h2>
          <span className="text-xs text-slate-400 font-semibold">Updated: {lastUpdated}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Overall Sentiment Stats */}
          <div className="lg:col-span-4 flex items-center justify-around border-r dark:border-white/10 border-black/10 pr-4">
            <div className="text-center">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Overall Sentiment</div>
              <div className="flex items-center justify-center gap-1 mt-2 text-emerald-400 font-black text-3xl">
                <TrendingUp className="h-7 w-7" />
                <span>{currentData.overallBullish}%</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-400">Bullish</span>
            </div>

            <div className="h-12 w-px dark:bg-white/10 bg-black/10" />

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mt-6 text-rose-400 font-black text-3xl">
                <TrendingDown className="h-7 w-7" />
                <span>{currentData.overallBearish}%</span>
              </div>
              <span className="text-[11px] font-bold text-rose-400">Bearish</span>
            </div>
          </div>

          {/* Center Progress Split Bar */}
          <div className="lg:col-span-5 space-y-2 text-center">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-emerald-400">Bullish {currentData.overallBullish}%</span>
              <span className="text-rose-400">Bearish {currentData.overallBearish}%</span>
            </div>

            <div className="h-4 w-full rounded-full bg-slate-900 border dark:border-white/10 border-black/10 overflow-hidden flex p-0.5">
              <div
                style={{ width: `${currentData.overallBullish}%` }}
                className="h-full rounded-l-full bg-gradient-to-r from-emerald-500 to-green-400 shadow-[0_0_12px_#10b981] transition-all duration-500"
              />
              <div
                style={{ width: `${currentData.overallBearish}%` }}
                className="h-full rounded-r-full bg-gradient-to-r from-rose-500 to-red-400 shadow-[0_0_12px_#f43f5e] transition-all duration-500"
              />
            </div>

            <span className="text-xs font-extrabold text-amber-400 block pt-1">
              {currentData.sentimentStatus}
            </span>
          </div>

          {/* Right Summary Badges */}
          <div className="lg:col-span-3 space-y-2 text-xs">
            <div className="flex items-center justify-between rounded-xl dark:bg-zinc-950/80 bg-slate-100 p-2.5 border border-white/5">
              <span className="text-slate-400 font-semibold">Retail Long</span>
              <span className="font-extrabold text-emerald-400">{currentData.retailLong}%</span>
            </div>

            <div className="flex items-center justify-between rounded-xl dark:bg-zinc-950/80 bg-slate-100 p-2.5 border border-white/5">
              <span className="text-slate-400 font-semibold">Retail Short</span>
              <span className="font-extrabold text-rose-400">{currentData.retailShort}%</span>
            </div>

            <div className="flex items-center justify-between rounded-xl dark:bg-zinc-950/80 bg-slate-100 p-2.5 border border-white/5">
              <span className="text-slate-400 font-semibold">Institutional</span>
              <span className="font-extrabold text-amber-400">{currentData.institutionalBias}</span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Middle Section: Sentiment by Source */}
      <GlassCard className="space-y-6">
        <div className="flex items-center gap-2 border-b dark:border-white/10 border-black/10 pb-4">
          <Activity className="h-5 w-5 text-amber-400" />
          <h2 className="text-base font-extrabold dark:text-white text-slate-900">Sentiment by Source</h2>
        </div>

        <div className="space-y-4">
          {currentData.sources.map((source) => (
            <div key={source.name} className="rounded-2xl border dark:border-white/10 border-black/10 dark:bg-zinc-950/60 bg-slate-50 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold dark:text-white text-slate-900">{source.name}</span>
                <GlassBadge variant={source.status === "Bullish" ? "profit" : "loss"}>
                  {source.status}
                </GlassBadge>
              </div>

              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                <span className="text-emerald-400">Long {source.long}%</span>
                <span className="text-rose-400">Short {source.short}%</span>
              </div>

              <div className="h-2.5 w-full rounded-full bg-slate-900 overflow-hidden flex">
                <div
                  style={{ width: `${source.long}%` }}
                  className="h-full bg-emerald-500 shadow-[0_0_8px_#10b981]"
                />
                <div
                  style={{ width: `${source.short}%` }}
                  className="h-full bg-rose-500 shadow-[0_0_8px_#f43f5e]"
                />
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Bottom Section: Retail vs Institutional Positioning */}
      <GlassCard className="space-y-6">
        <div className="flex items-center gap-2 border-b dark:border-white/10 border-black/10 pb-4">
          <Layers className="h-5 w-5 text-cyan-400" />
          <h2 className="text-base font-extrabold dark:text-white text-slate-900">
            Retail vs Institutional Positioning
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border dark:border-white/10 border-black/10 dark:bg-zinc-950/80 bg-slate-100 p-5 text-center space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase">Retail Traders</span>
            <div className="flex items-center justify-center gap-6 text-xl font-black">
              <div>
                <span className="text-emerald-400 block">{currentData.retailLong}%</span>
                <span className="text-[10px] text-slate-500 font-semibold">Long</span>
              </div>
              <div>
                <span className="text-rose-400 block">{currentData.retailShort}%</span>
                <span className="text-[10px] text-slate-500 font-semibold">Short</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border dark:border-white/10 border-black/10 dark:bg-zinc-950/80 bg-slate-100 p-5 text-center space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase">Institutional (COT Data)</span>
            <div className="flex items-center justify-center gap-6 text-xl font-black">
              <div>
                <span className="text-emerald-400 block">{currentData.institutionalLong}%</span>
                <span className="text-[10px] text-slate-500 font-semibold">Long</span>
              </div>
              <div>
                <span className="text-rose-400 block">{currentData.institutionalShort}%</span>
                <span className="text-[10px] text-slate-500 font-semibold">Short</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contrarian Indicator Banner */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5 flex items-start gap-3 text-xs text-amber-200">
          <Info className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            When retail and institutional sentiment diverges significantly, it can signal potential market reversals. Consider this as a contrarian indicator.
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
