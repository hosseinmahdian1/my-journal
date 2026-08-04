"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass/GlassCard";
import { GlassButton } from "@/components/ui/glass/GlassButton";
import { GlassBadge } from "@/components/ui/glass/GlassBadge";
import { loadTrades, loadJournals, saveJournals } from "@/lib/storage/store";
import { analyzeTradeWithAI } from "@/lib/ai/providers";
import { Trade, TradeJournal, PersianAIAnalysis } from "@/types/trade";
import {
  ArrowLeft,
  Sparkles,
  Brain,
  Check,
  AlertCircle,
  Camera,
  Link as LinkIcon,
  Shield,
  Save,
  Clock,
  DollarSign,
  BarChart2,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export default function TradeDetailPage({ params }: { params: any }) {
  const [tradeId, setTradeId] = useState<string>("");

  useEffect(() => {
    Promise.resolve(params).then((res) => {
      if (res && res.id) setTradeId(res.id);
    });
  }, [params]);

  const [trade, setTrade] = useState<Trade | null>(null);
  const [journal, setJournal] = useState<TradeJournal | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Form State
  const [setupName, setSetupName] = useState("");
  const [session, setSession] = useState<"Asian" | "London" | "New York" | "Overlap">("London");
  const [emotion, setEmotion] = useState<any>("Calm & Disciplined");
  const [reasonForEntry, setReasonForEntry] = useState("");
  const [reasonForExit, setReasonForExit] = useState("");
  const [lessonsLearned, setLessonsLearned] = useState("");
  const [marketStructure, setMarketStructure] = useState<any>("Bullish BOS");
  const [fvgDetected, setFvgDetected] = useState(false);

  useEffect(() => {
    const allTrades = loadTrades();
    const allJournals = loadJournals();

    const currentTrade = allTrades.find((t) => t.id === tradeId) || allTrades[0];
    setTrade(currentTrade);

    const jKey = currentTrade?.journalId || `journal-${currentTrade?.id}`;
    const existingJ = allJournals[jKey] || {
      id: jKey,
      tradeId: currentTrade?.id || "",
      setupName: "London Killzone Setup",
      session: "London",
      bias: "Bullish",
      timeframe: "M15",
      reasonForEntry: "تأییدیه CHOCH و برخورد قیمت به FVG تایم ۱۵ دقيقه.",
      reasonForExit: "رسیدن به تارگت اول در مقاومت روزانه.",
      mistakes: [],
      lessonsLearned: "صبر کردن برای کندل کلوز سوددهی را افزایش می‌دهد.",
      emotion: "Calm & Disciplined",
      confidenceScore: 9,
      marketStructure: "Bullish BOS",
      fvgDetected: true,
    };

    setJournal(existingJ);
    setSetupName(existingJ.setupName || "");
    setSession(existingJ.session || "London");
    setEmotion(existingJ.emotion || "Calm & Disciplined");
    setReasonForEntry(existingJ.reasonForEntry || "");
    setReasonForExit(existingJ.reasonForExit || "");
    setLessonsLearned(existingJ.lessonsLearned || "");
    setMarketStructure(existingJ.marketStructure || "Bullish BOS");
    setFvgDetected(existingJ.fvgDetected || false);
  }, [tradeId]);

  if (!trade || !journal) return null;

  const handleSaveJournal = () => {
    const updatedJournal: TradeJournal = {
      ...journal,
      setupName,
      session,
      emotion,
      reasonForEntry,
      reasonForExit,
      lessonsLearned,
      marketStructure,
      fvgDetected,
    };
    const allJournals = loadJournals();
    allJournals[journal.id] = updatedJournal;
    saveJournals(allJournals);
    setJournal(updatedJournal);
    alert("Journal saved successfully!");
  };

  const handleRunPersianAI = async () => {
    setIsGeneratingAI(true);
    const aiResult = await analyzeTradeWithAI(trade, journal, "Gemini");
    const updatedJournal: TradeJournal = {
      ...journal,
      aiAnalysis: aiResult,
    };
    const allJournals = loadJournals();
    allJournals[journal.id] = updatedJournal;
    saveJournals(allJournals);
    setJournal(updatedJournal);
    setIsGeneratingAI(false);
  };

  const isWin = trade.profit > 0;
  const ai = journal.aiAnalysis;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/journal">
          <GlassButton variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Journal</span>
          </GlassButton>
        </Link>

        <GlassButton variant="gold" onClick={handleRunPersianAI} disabled={isGeneratingAI}>
          <Brain className={`h-4 w-4 ${isGeneratingAI ? "animate-spin" : ""}`} />
          <span>{isGeneratingAI ? "در حال تحلیل هوش مصنوعی..." : "تحلیل هوش مصنوعی (فارسی)"}</span>
        </GlassButton>
      </div>

      {/* Trade Overview Banner */}
      <GlassCard glowColor={isWin ? "green" : "red"} className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6">
        <div>
          <div className="text-xs text-slate-400">Symbol & Ticket</div>
          <div className="text-xl font-bold text-white flex items-center gap-2 mt-1">
            <span>{trade.symbol}</span>
            <GlassBadge variant={trade.orderType === "BUY" ? "profit" : "loss"}>
              {trade.orderType}
            </GlassBadge>
          </div>
          <div className="text-xs text-slate-500 font-mono">#{trade.ticket}</div>
        </div>

        <div>
          <div className="text-xs text-slate-400">Entry / Exit Price</div>
          <div className="text-lg font-bold text-slate-200 mt-1">
            {trade.entryPrice} → {trade.exitPrice}
          </div>
          <div className="text-xs text-slate-400">SL: {trade.stopLoss} | TP: {trade.takeProfit}</div>
        </div>

        <div>
          <div className="text-xs text-slate-400">Net Profit & Loss</div>
          <div className={`text-xl font-extrabold mt-1 ${isWin ? "text-emerald-400" : "text-rose-400"}`}>
            {isWin ? "+" : ""}${trade.profit}
          </div>
          <div className="text-xs text-slate-400">R:R Ratio: <span className="font-bold text-sky-400">{trade.rrRatio || "1:2.5"}</span></div>
        </div>

        <div>
          <div className="text-xs text-slate-400">Duration & Account</div>
          <div className="text-base font-bold text-slate-200 mt-1">
            {trade.durationMinutes} Minutes
          </div>
          <div className="text-xs text-slate-400">Balance After: ${trade.balanceAfterTrade}</div>
        </div>
      </GlassCard>

      {/* Persian AI Analysis Block */}
      {ai && (
        <GlassCard glowColor="purple" className="space-y-6 border-purple-500/40 bg-purple-950/20">
          <div className="flex items-center justify-between border-b border-purple-500/30 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-persian">گزارش کامل تحلیل هوش مصنوعی (فارسی)</h2>
                <p className="text-xs text-purple-300">{ai.provider} • Score: {ai.overallScore}/100</p>
              </div>
            </div>
            <GlassBadge variant="purple">Persian AI Report</GlassBadge>
          </div>

          <div className="space-y-4 font-persian text-sm leading-relaxed text-slate-200">
            <div className="rounded-xl bg-slate-900/80 p-4 border border-white/10 space-y-2">
              <h3 className="font-bold text-sky-400 flex items-center gap-2">
                📌 خلاصه وضعیت پوزیشن:
              </h3>
              <p>{ai.persianSummary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl bg-slate-900/80 p-4 border border-white/10 space-y-2">
                <h3 className="font-bold text-emerald-400">🧠 روانشناسی و مدیریت هیجانات:</h3>
                <p>{ai.tradingPsychologyFeedback}</p>
              </div>

              <div className="rounded-xl bg-slate-900/80 p-4 border border-white/10 space-y-2">
                <h3 className="font-bold text-amber-400">⚖️ مدیریت ریسک و حجم لات:</h3>
                <p>{ai.riskAndLotSizeFeedback}</p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-900/80 p-4 border border-white/10 space-y-2">
              <h3 className="font-bold text-purple-400">💡 پیشنهاد هوشمندانه برای بهینه‌سازی استراتژی:</h3>
              <p>{ai.strategyOptimizationTips}</p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Main Journal Edit Form */}
      <GlassCard className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Journal Details & Technical Tagging</h2>
          <GlassButton variant="primary" onClick={handleSaveJournal}>
            <Save className="h-4 w-4" />
            <span>Save Journal Notes</span>
          </GlassButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-400">Setup Name</label>
            <input
              type="text"
              value={setupName}
              onChange={(e) => setSetupName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-900/80 p-2.5 text-xs text-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400">Trading Session</label>
            <select
              value={session}
              onChange={(e) => setSession(e.target.value as any)}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-900/80 p-2.5 text-xs text-white"
            >
              <option value="Asian">Asian Session</option>
              <option value="London">London Session</option>
              <option value="New York">New York Session</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400">Trader Emotion</label>
            <select
              value={emotion}
              onChange={(e) => setEmotion(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-900/80 p-2.5 text-xs text-white"
            >
              <option value="Calm & Disciplined">Calm & Disciplined</option>
              <option value="FOMO">FOMO (Fear Of Missing Out)</option>
              <option value="Greed">Greed</option>
              <option value="Fear">Fear</option>
              <option value="Revenge">Revenge Trading</option>
            </select>
          </div>
        </div>

        {/* Text Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 font-persian">علت ورود (Reason for Entry)</label>
            <textarea
              rows={3}
              value={reasonForEntry}
              onChange={(e) => setReasonForEntry(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-900/80 p-3 text-xs text-white font-persian"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 font-persian">درس‌های آموخته‌شده (Lessons Learned)</label>
            <textarea
              rows={3}
              value={lessonsLearned}
              onChange={(e) => setLessonsLearned(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-900/80 p-3 text-xs text-white font-persian"
            />
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
