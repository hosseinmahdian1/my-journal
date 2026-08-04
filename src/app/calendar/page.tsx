"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/glass/GlassCard";
import { GlassButton } from "@/components/ui/glass/GlassButton";
import { GlassBadge } from "@/components/ui/glass/GlassBadge";
import { INITIAL_ECONOMIC_EVENTS } from "@/lib/storage/store";
import { analyzeNewsWithAI } from "@/lib/ai/providers";
import { EconomicEvent } from "@/types/trade";
import { Newspaper, Clock, Filter, Brain, Sparkles, AlertCircle, ChevronDown } from "lucide-react";

export default function EconomicCalendarPage() {
  const [events, setEvents] = useState<EconomicEvent[]>(INITIAL_ECONOMIC_EVENTS);
  const [selectedCurrency, setSelectedCurrency] = useState("ALL");
  const [selectedImpact, setSelectedImpact] = useState("ALL");
  const [analyzedEvent, setAnalyzedEvent] = useState<EconomicEvent | null>(INITIAL_ECONOMIC_EVENTS[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const filteredEvents = events.filter((e) => {
    const matchesCurr = selectedCurrency === "ALL" || e.currency === selectedCurrency;
    const matchesImpact = selectedImpact === "ALL" || e.impact === selectedImpact;
    return matchesCurr && matchesImpact;
  });

  const handleAnalyzeNews = async (event: EconomicEvent) => {
    setIsAnalyzing(true);
    const aiAnalysis = await analyzeNewsWithAI(event);
    const updated = { ...event, aiNewsAnalysis: aiAnalysis };
    setAnalyzedEvent(updated);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Newspaper className="h-8 w-8 text-amber-400" />
          <span>Economic Calendar & Persian AI Insights</span>
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          ForexFactory macro events, countdown timers, and instant Persian AI breakdown for Gold (XAUUSD), DXY & USD pairs.
        </p>
      </div>

      {/* Filters & Countdown */}
      <GlassCard className="flex flex-wrap items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-3">
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-xs text-white"
          >
            <option value="ALL">All Currencies</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="JPY">JPY</option>
          </select>

          <select
            value={selectedImpact}
            onChange={(e) => setSelectedImpact(e.target.value)}
            className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-xs text-white"
          >
            <option value="ALL">All Impacts</option>
            <option value="High">High Impact Only</option>
            <option value="Medium">Medium Impact</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30">
          <Clock className="h-4 w-4 animate-pulse" />
          <span className="font-semibold">Next High Impact Event in: 18h 42m</span>
        </div>
      </GlassCard>

      {/* Main Grid: Calendar List & AI News Report Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Events Table */}
        <GlassCard className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-bold text-white">Upcoming High-Impact Releases</h2>

          <div className="space-y-3">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => handleAnalyzeNews(event)}
                className={`flex items-center justify-between rounded-xl border p-4 transition-all cursor-pointer ${
                  analyzedEvent?.id === event.id
                    ? "border-amber-500/50 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                    : "border-white/10 bg-slate-900/60 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-center font-mono text-xs text-slate-400">
                    <div>{event.date}</div>
                    <div className="font-bold text-amber-400">{event.time}</div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white text-sm">{event.currency}</span>
                      <GlassBadge variant={event.impact === "High" ? "loss" : "gold"}>
                        {event.impact}
                      </GlassBadge>
                    </div>
                    <div className="text-xs font-semibold text-slate-200 mt-0.5">{event.title}</div>
                  </div>
                </div>

                <div className="text-right text-xs text-slate-300">
                  <div>Forecast: <span className="text-sky-400 font-bold">{event.forecast}</span></div>
                  <div>Previous: <span className="text-slate-400">{event.previous}</span></div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Persian AI News Analysis Display Pane */}
        <GlassCard glowColor="gold" className="space-y-4 font-persian">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-amber-400" />
              <h3 className="font-bold text-white text-base">تحلیل هوش مصنوعی خبر (فارسی)</h3>
            </div>
            <GlassBadge variant="gold">فارسی</GlassBadge>
          </div>

          {analyzedEvent?.aiNewsAnalysis ? (
            <div className="space-y-4 text-xs leading-relaxed text-slate-200">
              <div className="rounded-xl bg-slate-900/80 p-3 border border-amber-500/30 space-y-1">
                <h4 className="font-bold text-amber-300 text-sm">
                  📌 {analyzedEvent.aiNewsAnalysis.translatedTitleFa}
                </h4>
                <p className="text-slate-300">{analyzedEvent.aiNewsAnalysis.explanationFa}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-sky-400">📊 تأثیر بر دارایی‌های فارکس:</h4>
                <div className="space-y-1.5 text-[11px]">
                  <div className="bg-slate-900/60 p-2 rounded-lg border border-white/5">
                    <strong className="text-amber-400">طلا (XAUUSD): </strong>
                    {analyzedEvent.aiNewsAnalysis.affectedAssetsFa.goldXAUUSD}
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded-lg border border-white/5">
                    <strong className="text-sky-400">شاخص دلار (DXY): </strong>
                    {analyzedEvent.aiNewsAnalysis.affectedAssetsFa.dxyIndex}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-emerald-950/20 border border-emerald-500/30 p-2 rounded-lg">
                  <strong className="text-emerald-400">سناریوی صعودی:</strong>
                  <p className="mt-0.5">{analyzedEvent.aiNewsAnalysis.bullishScenarioFa}</p>
                </div>
                <div className="bg-rose-950/20 border border-rose-500/30 p-2 rounded-lg">
                  <strong className="text-rose-400">سناریوی نزولی:</strong>
                  <p className="mt-0.5">{analyzedEvent.aiNewsAnalysis.bearishScenarioFa}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-xs text-slate-400">
              برای مشاهده تحلیل کامل اقتصادی به زبان فارسی، روی یکی از اخبار کلیک کنید.
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
