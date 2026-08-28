"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass/GlassCard";
import { GlassButton } from "@/components/ui/glass/GlassButton";
import { GlassBadge } from "@/components/ui/glass/GlassBadge";
import { analyzeNewsWithAI } from "@/lib/ai/providers";
import { loadSettings } from "@/lib/storage/store";
import { EconomicEvent } from "@/types/trade";
import {
  Newspaper,
  Clock,
  Filter,
  Brain,
  Sparkles,
  RefreshCw,
  Zap,
  CheckCircle,
  Radio,
  ExternalLink,
  Globe,
} from "lucide-react";

// ─── UTILS ────────────────────────────────────────────────────────────────
/**
 * Converts any UTC / ISO 8601 date string to Tehran Local Time (Asia/Tehran, UTC+03:30)
 */
function convertToTehranDateTime(dateIsoStr: string): { tehranDate: string; tehranTime: string } {
  try {
    const d = new Date(dateIsoStr);
    if (isNaN(d.getTime())) {
      return { tehranDate: "Unknown", tehranTime: "All Day" };
    }

    const tehranTime = d.toLocaleTimeString("en-US", {
      timeZone: "Asia/Tehran",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const tehranDate = d.toLocaleDateString("en-US", {
      timeZone: "Asia/Tehran",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    return { tehranDate, tehranTime };
  } catch (err) {
    return { tehranDate: "Unknown", tehranTime: "All Day" };
  }
}

export default function EconomicCalendarPage() {
  const [events, setEvents] = useState<(EconomicEvent & { tehranTimeDisplay?: string; tehranDateDisplay?: string })[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState("ALL");
  const [selectedImpact, setSelectedImpact] = useState("ALL");
  const [analyzedEvent, setAnalyzedEvent] = useState<EconomicEvent | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSyncingFF, setIsSyncingFF] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  // Live ticking countdown to next release in Tehran time
  const [countdownText, setCountdownText] = useState("00h 00m 00s");
  const [nextEvent, setNextEvent] = useState<any>(null);

  const fetchLiveCalendar = async () => {
    setIsSyncingFF(true);
    setSyncSuccess(false);
    try {
      const res = await fetch("/api/calendar?_t=" + Date.now());
      if (res.ok) {
        const data = await res.json();
        const formattedEvents = data.map((ev: any) => {
          const { tehranDate, tehranTime } = convertToTehranDateTime(ev.date);
          return {
            ...ev,
            tehranDateDisplay: tehranDate,
            tehranTimeDisplay: `${tehranTime} (Tehran Time)`,
          };
        });
        setEvents(formattedEvents);
        setSyncSuccess(true);
        if (formattedEvents.length > 0 && !analyzedEvent) {
          handleAnalyzeNews(formattedEvents[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch live calendar:", err);
    } finally {
      setIsSyncingFF(false);
    }
  };

  useEffect(() => {
    fetchLiveCalendar();
  }, []);

  // Calculate Next Event Countdown
  useEffect(() => {
    const timer = setInterval(() => {
      if (events.length === 0) return;
      
      const now = new Date();
      // Find the first event in the future
      let upcoming = events.find((e) => {
        const evDate = new Date(e.date);
        return evDate.getTime() > now.getTime() && (e.impact === "High" || e.impact === "Medium");
      });

      if (!upcoming) return;
      
      setNextEvent(upcoming);

      const target = new Date(upcoming.date);
      const diffMs = target.getTime() - now.getTime();
      
      if (diffMs <= 0) {
        setCountdownText("00h 00m 00s");
        return;
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000);

      const hStr = hours < 10 ? `0${hours}` : `${hours}`;
      const mStr = mins < 10 ? `0${mins}` : `${mins}`;
      const sStr = secs < 10 ? `0${secs}` : `${secs}`;

      setCountdownText(`${hStr}h ${mStr}m ${sStr}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [events]);

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

  const handleSyncForexFactory = () => {
    fetchLiveCalendar();
    setTimeout(() => setSyncSuccess(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-3xl font-extrabold dark:text-white text-slate-950 flex items-center gap-3">
              <Newspaper className="h-8 w-8 text-amber-400" />
              <span>ForexFactory Live Economic Calendar</span>
            </h1>
            <GlassBadge variant="gold" className="flex items-center gap-1">
              <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
              <span>Direct Feed: ForexFactory.com</span>
            </GlassBadge>
            <GlassBadge variant="cyan" className="font-bold">
              🇮🇷 Tehran Time (UTC+03:30)
            </GlassBadge>
          </div>
          <p className="mt-1 text-xs dark:text-slate-400 text-slate-600 font-medium">
            Official ForexFactory economic events automatically converted to Tehran local time (+03:30 IRST).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://www.forexfactory.com/calendar"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white/5 border border-white/10 text-slate-300 hover:text-white transition-all"
          >
            <span>ForexFactory.com</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          <GlassButton variant="gold" onClick={handleSyncForexFactory} disabled={isSyncingFF}>
            <RefreshCw className={`h-4 w-4 ${isSyncingFF ? "animate-spin" : ""}`} />
            <span>{isSyncingFF ? "Syncing ForexFactory..." : syncSuccess ? "Calendar Synced!" : "Sync ForexFactory Calendar"}</span>
          </GlassButton>
        </div>
      </div>

      {/* Filters & Tehran Time Ticking Countdown Bar */}
      <GlassCard className="flex flex-wrap items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold dark:text-slate-300 text-slate-700">
            <Filter className="h-3.5 w-3.5 text-cyan-400" />
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="rounded-xl border dark:border-white/10 border-black/10 dark:bg-zinc-950 bg-slate-100 px-3 py-2 text-xs font-semibold"
            >
              <option value="ALL">All Currencies</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="JPY">JPY</option>
            </select>
          </div>

          <select
            value={selectedImpact}
            onChange={(e) => setSelectedImpact(e.target.value)}
            className="rounded-xl border dark:border-white/10 border-black/10 dark:bg-zinc-950 bg-slate-100 px-3 py-2 text-xs font-semibold"
          >
            <option value="ALL">All Impacts</option>
            <option value="High">High Impact Only</option>
            <option value="Medium">Medium Impact</option>
          </select>
        </div>

        {/* Live Tehran Time Ticking Countdown */}
        <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 px-3.5 py-2 rounded-xl border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
          <Clock className="h-4 w-4 text-amber-400 animate-pulse" />
          <span>Next High Impact Event (Tehran Time): <strong className="font-mono text-sm text-amber-300">{countdownText}</strong></span>
        </div>
      </GlassCard>

      {/* Main Grid: Live ForexFactory Events & Persian AI Report */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Events Table */}
        <GlassCard className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold dark:text-white text-slate-900 flex items-center gap-2">
              <span>ForexFactory High-Impact Releases</span>
              <GlassBadge variant="cyan">{filteredEvents.length} Releases</GlassBadge>
            </h2>
            <span className="text-[11px] text-cyan-400 font-bold font-mono">🇮🇷 UTC+03:30 Tehran Time</span>
          </div>

          <div className="space-y-3">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => handleAnalyzeNews(event)}
                className={`flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border p-4 transition-all cursor-pointer gap-3 ${
                  analyzedEvent?.id === event.id
                    ? "border-amber-500/50 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                    : "dark:border-white/10 border-black/10 dark:bg-zinc-950/60 bg-slate-50 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Tehran Time Release Display Badge */}
                  <div className="text-center font-mono text-xs dark:text-slate-400 text-slate-600 shrink-0 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-white/5">
                    <div className="text-[10px] font-semibold text-slate-400">{event.tehranDateDisplay || event.date}</div>
                    <div className="font-extrabold text-amber-400 text-xs mt-0.5">{event.tehranTimeDisplay || `${event.time} (Tehran Time)`}</div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold dark:text-white text-slate-900 text-sm">{event.currency}</span>
                      <GlassBadge variant={event.impact === "High" ? "loss" : "gold"}>
                        {event.impact}
                      </GlassBadge>
                      {event.actual && (
                        <GlassBadge variant="profit" className="text-[10px]">
                          Actual: {event.actual}
                        </GlassBadge>
                      )}
                    </div>
                    <div className="text-xs font-bold dark:text-slate-200 text-slate-800 mt-0.5">{event.title}</div>
                  </div>
                </div>

                <div className="text-right text-xs dark:text-slate-300 text-slate-700 flex sm:flex-col justify-between sm:justify-end gap-2 sm:gap-0">
                  <div>Forecast: <span className="text-sky-400 font-bold">{event.forecast}</span></div>
                  <div>Previous: <span className="text-slate-400 font-semibold">{event.previous}</span></div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Persian AI News Analysis Display Pane */}
        <GlassCard glowColor="gold" className="space-y-4 font-persian">
          <div className="flex items-center justify-between border-b dark:border-white/10 border-black/10 pb-3">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-amber-400" />
              <h3 className="font-bold dark:text-white text-slate-900 text-base">تحلیل هوش مصنوعی خبر (Groq Llama-3.3)</h3>
            </div>
            <GlassBadge variant="gold">فارسی</GlassBadge>
          </div>

          {isAnalyzing ? (
            <div className="py-12 text-center text-xs text-amber-400 flex flex-col items-center justify-center space-y-2">
              <RefreshCw className="h-6 w-6 animate-spin text-amber-400" />
              <span>در حال تحلیل هوشمند خبر اقتصادی ForexFactory...</span>
            </div>
          ) : analyzedEvent?.aiNewsAnalysis ? (
            <div className="space-y-4 text-xs leading-relaxed dark:text-slate-200 text-slate-800">
              <div className="rounded-xl dark:bg-zinc-950/80 bg-amber-50/80 p-3 border border-amber-500/30 space-y-1">
                <h4 className="font-bold text-amber-500 dark:text-amber-300 text-sm">
                  📌 {analyzedEvent.aiNewsAnalysis.translatedTitleFa}
                </h4>
                <p className="dark:text-slate-300 text-slate-700">{analyzedEvent.aiNewsAnalysis.explanationFa}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-extrabold dark:text-sky-400 text-sky-700">📊 تأثیر بر دارایی‌های فارکس:</h4>
                <div className="space-y-1.5 text-[11px]">
                  <div className="dark:bg-zinc-950/60 bg-amber-50/80 p-3 rounded-xl border dark:border-white/5 border-amber-200/80 shadow-sm">
                    <strong className="dark:text-amber-400 text-amber-800 font-extrabold">طلا (XAUUSD): </strong>
                    <span className="dark:text-slate-300 text-slate-700 font-medium">{analyzedEvent.aiNewsAnalysis.affectedAssetsFa.goldXAUUSD}</span>
                  </div>
                  <div className="dark:bg-zinc-950/60 bg-sky-50/80 p-3 rounded-xl border dark:border-white/5 border-sky-200/80 shadow-sm">
                    <strong className="dark:text-sky-400 text-sky-800 font-extrabold">شاخص دلار (DXY): </strong>
                    <span className="dark:text-slate-300 text-slate-700 font-medium">{analyzedEvent.aiNewsAnalysis.affectedAssetsFa.dxyIndex}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-[11px]">
                <div className="dark:bg-emerald-950/20 bg-emerald-50/90 border dark:border-emerald-500/30 border-emerald-200 p-3 rounded-xl shadow-sm">
                  <strong className="dark:text-emerald-400 text-emerald-700 font-extrabold block">سناریوی صعودی:</strong>
                  <p className="mt-1 dark:text-slate-300 text-slate-700 font-medium leading-relaxed">{analyzedEvent.aiNewsAnalysis.bullishScenarioFa}</p>
                </div>
                <div className="dark:bg-rose-950/20 bg-rose-50/90 border dark:border-rose-500/30 border-rose-200 p-3 rounded-xl shadow-sm">
                  <strong className="dark:text-rose-400 text-rose-700 font-extrabold block">سناریوی نزولی:</strong>
                  <p className="mt-1 dark:text-slate-300 text-slate-700 font-medium leading-relaxed">{analyzedEvent.aiNewsAnalysis.bearishScenarioFa}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-xs text-slate-400">
              برای مشاهده تحلیل کامل اقتصادی به زبان فارسی، روی یکی از اخبار ForexFactory کلیک کنید.
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
