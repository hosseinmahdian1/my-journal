"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/glass/GlassCard";
import { GlassButton } from "@/components/ui/glass/GlassButton";
import { GlassBadge } from "@/components/ui/glass/GlassBadge";
import { Trade, TradeJournal } from "@/types/trade";
import { loadJournals, saveJournals, loadTrades, saveTrades, loadSettings } from "@/lib/storage/store";
import { analyzeTradeWithAI } from "@/lib/ai/providers";
import {
  X,
  Camera,
  Tag,
  Save,
  Brain,
  DollarSign,
  Clock,
  ExternalLink,
  Upload,
  CheckCircle,
  FileText,
  TrendingUp,
  TrendingDown,
  Layers,
  Sparkles,
  Zap,
  ShieldCheck,
} from "lucide-react";

interface TradeDetailModalProps {
  trade: Trade | null;
  isOpen: boolean;
  onClose: () => void;
  onTradeUpdated?: () => void;
}

const STRATEGY_PRESETS = [
  "London Killzone FVG Sweep",
  "NY Order Block Re-entry",
  "Asian Liquidity Breakout",
  "Gold Scalping 15m Volume",
  "SMC CHOCH & FVG Confluence",
  "Breaker Block Mitigation",
  "Trendline Liquidity Grab",
];

export function TradeDetailModal({
  trade,
  isOpen,
  onClose,
  onTradeUpdated,
}: TradeDetailModalProps) {
  const [journal, setJournal] = useState<TradeJournal | null>(null);

  // Editable Trade & Journal Fields
  const [commission, setCommission] = useState(0);
  const [swap, setSwap] = useState(0);
  const [grossProfit, setGrossProfit] = useState(0);

  const [setupName, setSetupName] = useState("");
  const [customSetupTag, setCustomSetupTag] = useState("");
  const [session, setSession] = useState<"Asian" | "London" | "New York" | "Overlap">("London");
  const [emotion, setEmotion] = useState<any>("Calm & Disciplined");
  const [reasonForEntry, setReasonForEntry] = useState("");
  const [reasonForExit, setReasonForExit] = useState("");
  const [lessonsLearned, setLessonsLearned] = useState("");
  const [tradingViewLink, setTradingViewLink] = useState("");

  // Screenshots Data URLs
  const [screenshotBefore, setScreenshotBefore] = useState<string | undefined>(undefined);
  const [screenshotDuring, setScreenshotDuring] = useState<string | undefined>(undefined);
  const [screenshotAfter, setScreenshotAfter] = useState<string | undefined>(undefined);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!trade) return;

    setCommission(trade.commission || 0);
    setSwap(trade.swap || 0);
    setGrossProfit(trade.profit || 0);

    const journals = loadJournals();
    const jKey = trade.journalId || `journal-${trade.id}`;
    const existing = journals[jKey] || {
      id: jKey,
      tradeId: trade.id,
      setupName: "London Killzone FVG Sweep",
      session: "London",
      bias: trade.orderType === "BUY" ? "Bullish" : "Bearish",
      timeframe: "M15",
      reasonForEntry: "",
      reasonForExit: "",
      mistakes: [],
      lessonsLearned: "",
      emotion: "Calm & Disciplined",
      confidenceScore: 8,
      marketStructure: trade.orderType === "BUY" ? "Bullish BOS" : "Bearish BOS",
    };

    setJournal(existing);
    setSetupName(existing.setupName || STRATEGY_PRESETS[0]);
    setSession(existing.session || "London");
    setEmotion(existing.emotion || "Calm & Disciplined");
    setReasonForEntry(existing.reasonForEntry || "");
    setReasonForExit(existing.reasonForExit || "");
    setLessonsLearned(existing.lessonsLearned || "");
    setTradingViewLink(existing.tradingViewLink || "");
    setScreenshotBefore(existing.screenshotBefore);
    setScreenshotDuring(existing.screenshotDuring);
    setScreenshotAfter(existing.screenshotAfter);
  }, [trade]);

  if (!isOpen || !trade) return null;

  const netProfit = grossProfit + commission + swap;
  const isNetWin = netProfit > 0;

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "before" | "during" | "after"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (type === "before") setScreenshotBefore(dataUrl);
      if (type === "during") setScreenshotDuring(dataUrl);
      if (type === "after") setScreenshotAfter(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!trade || !journal) return;

    const allTrades = loadTrades();
    const updatedTrades = allTrades.map((t) => {
      if (t.id === trade.id) {
        return {
          ...t,
          commission,
          swap,
          profit: grossProfit,
        };
      }
      return t;
    });
    saveTrades(updatedTrades);

    const finalSetupName = customSetupTag.trim() || setupName;
    const updatedJournal: TradeJournal = {
      ...journal,
      setupName: finalSetupName,
      session,
      emotion,
      reasonForEntry,
      reasonForExit,
      lessonsLearned,
      tradingViewLink,
      screenshotBefore,
      screenshotDuring,
      screenshotAfter,
    };

    const allJournals = loadJournals();
    allJournals[journal.id] = updatedJournal;
    saveJournals(allJournals);
    setJournal(updatedJournal);

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
    if (onTradeUpdated) onTradeUpdated();
  };

  const handleRunPersianAI = async () => {
    if (!trade || !journal) return;
    setIsAnalyzing(true);

    const updatedTrade = { ...trade, commission, swap, profit: grossProfit };
    const currentJournal: TradeJournal = {
      ...journal,
      setupName: customSetupTag.trim() || setupName,
      session,
      reasonForEntry,
      reasonForExit,
      lessonsLearned,
    };

    const settings = loadSettings();
    const activeProvider = settings.activeAiProvider || "Groq";

    const aiResult = await analyzeTradeWithAI(updatedTrade, currentJournal, activeProvider);
    const savedJ = { ...currentJournal, aiAnalysis: aiResult };

    const allJournals = loadJournals();
    allJournals[journal.id] = savedJ;
    saveJournals(allJournals);
    setJournal(savedJ);
    setIsAnalyzing(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-xl"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border dark:border-white/15 border-black/10 dark:bg-black/90 bg-white p-6 shadow-2xl backdrop-blur-2xl text-slate-900 dark:text-slate-100 space-y-6"
        >
          {/* Top Bar Header */}
          <div className="flex items-center justify-between border-b dark:border-white/10 border-black/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-400 font-black">
                {trade.symbol.slice(0, 3)}
              </div>
              <div>
                <h2 className="text-xl font-extrabold flex items-center gap-2">
                  <span>{trade.symbol}</span>
                  <GlassBadge variant={trade.orderType === "BUY" ? "profit" : "loss"}>
                    {trade.orderType} {trade.lotSize} Lots
                  </GlassBadge>
                </h2>
                <p className="text-xs dark:text-slate-400 text-slate-500 font-mono">
                  Ticket #{trade.ticket} • {trade.closeTime.split("T")[0]}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl dark:bg-white/10 bg-black/5 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="rounded-2xl border dark:border-white/10 border-black/10 dark:bg-zinc-950/60 bg-slate-50 p-3">
              <span className="text-slate-400 text-[10px] block">Entry Price:</span>
              <span className="font-bold text-base dark:text-white text-slate-900">{trade.entryPrice}</span>
            </div>
            <div className="rounded-2xl border dark:border-white/10 border-black/10 dark:bg-zinc-950/60 bg-slate-50 p-3">
              <span className="text-slate-400 text-[10px] block">Exit Price:</span>
              <span className="font-bold text-base dark:text-white text-slate-900">{trade.exitPrice}</span>
            </div>
            <div className="rounded-2xl border dark:border-white/10 border-black/10 dark:bg-zinc-950/60 bg-slate-50 p-3">
              <span className="text-slate-400 text-[10px] block">Gross Profit:</span>
              <input
                type="number"
                step="0.01"
                value={grossProfit}
                onChange={(e) => setGrossProfit(parseFloat(e.target.value) || 0)}
                className="w-full font-bold text-base dark:text-white text-slate-900 bg-transparent border-b dark:border-white/20 border-black/20 focus:outline-none"
              />
            </div>
            <div className="rounded-2xl border dark:border-white/10 border-black/10 dark:bg-zinc-950/60 bg-slate-50 p-3">
              <span className="text-slate-400 text-[10px] block font-bold">Net Profit (Live):</span>
              <span className={`font-black text-base ${isNetWin ? "text-emerald-400" : "text-rose-400"}`}>
                {isNetWin ? "+" : ""}${netProfit.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Commission & Swap Editing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border dark:border-white/10 border-black/10 dark:bg-zinc-950/40 bg-slate-50 p-4">
            <div>
              <label className="text-xs font-semibold text-rose-400 block mb-1">Commission ($)</label>
              <input
                type="number"
                step="0.01"
                value={commission}
                onChange={(e) => setCommission(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border dark:border-white/10 border-black/10 dark:bg-zinc-950 bg-slate-100 p-2.5 text-xs text-rose-400 font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-amber-400 block mb-1">Swap ($)</label>
              <input
                type="number"
                step="0.01"
                value={swap}
                onChange={(e) => setSwap(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border dark:border-white/10 border-black/10 dark:bg-zinc-950 bg-slate-100 p-2.5 text-xs text-amber-400 font-bold"
              />
            </div>
          </div>

          {/* Setup Strategy Tag Selection */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-cyan-400" />
              <span>SMC / Strategy Tag Assignment</span>
            </h3>

            <div className="flex flex-wrap gap-2">
              {STRATEGY_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    setSetupName(preset);
                    setCustomSetupTag("");
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    setupName === preset && !customSetupTag
                      ? "bg-cyan-500 text-black shadow-neon-cyan scale-105"
                      : "dark:bg-white/5 bg-slate-100 dark:text-slate-300 text-slate-700 hover:bg-cyan-500/20"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Or type custom SMC tag (e.g. FVG 5m Scalp)..."
              value={customSetupTag}
              onChange={(e) => setCustomSetupTag(e.target.value)}
              className="w-full rounded-xl border dark:border-white/10 border-black/10 dark:bg-zinc-950 bg-slate-100 p-2.5 text-xs text-cyan-400 font-bold"
            />
          </div>

          {/* Screenshots Upload Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Camera className="h-3.5 w-3.5 text-gold-400" />
              <span>Multi-Stage Chart Screenshots</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Before Entry", type: "before" as const, val: screenshotBefore },
                { label: "During Trade", type: "during" as const, val: screenshotDuring },
                { label: "After Exit", type: "after" as const, val: screenshotAfter },
              ].map((item) => (
                <div
                  key={item.type}
                  className="relative rounded-2xl border border-dashed dark:border-white/20 border-black/20 dark:bg-zinc-950/40 bg-slate-50 p-4 text-center space-y-2 overflow-hidden"
                >
                  {item.val ? (
                    <div className="relative group">
                      <img src={item.val} alt={item.label} className="w-full h-28 object-cover rounded-xl" />
                      <button
                        onClick={() => {
                          if (item.type === "before") setScreenshotBefore(undefined);
                          if (item.type === "during") setScreenshotDuring(undefined);
                          if (item.type === "after") setScreenshotAfter(undefined);
                        }}
                        className="absolute top-2 right-2 p-1 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-28 cursor-pointer space-y-2">
                      <Upload className="h-6 w-6 text-slate-400" />
                      <span className="text-xs font-semibold text-slate-400">{item.label}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, item.type)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">TradingView Chart Share URL</label>
              <input
                type="text"
                placeholder="https://www.tradingview.com/x/..."
                value={tradingViewLink}
                onChange={(e) => setTradingViewLink(e.target.value)}
                className="mt-1 w-full rounded-xl border dark:border-white/10 border-black/10 dark:bg-zinc-950 bg-slate-100 p-2.5 text-xs"
              />
            </div>
          </div>

          {/* Manual Notes & Explanations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-persian">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">توضیحات و علت ورود (Entry Reason & Notes):</label>
              <textarea
                rows={3}
                placeholder="توضیحات ستاپ، تاییدیه CHOCH، FVG و نقدینگی..."
                value={reasonForEntry}
                onChange={(e) => setReasonForEntry(e.target.value)}
                className="w-full rounded-xl border dark:border-white/10 border-black/10 dark:bg-zinc-950 bg-slate-100 p-3 text-xs font-persian"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">درس‌های آموخته‌شده و علت خروج (Lessons Learned):</label>
              <textarea
                rows={3}
                placeholder="درس‌های این پوزیشن و نحوه خروج روی مقاومت..."
                value={lessonsLearned}
                onChange={(e) => setLessonsLearned(e.target.value)}
                className="w-full rounded-xl border dark:border-white/10 border-black/10 dark:bg-zinc-950 bg-slate-100 p-3 text-xs font-persian"
              />
            </div>
          </div>

          {/* Persian AI Analysis Block */}
          {journal?.aiAnalysis && (
            <div className="rounded-2xl border border-purple-500/40 bg-purple-950/30 p-5 font-persian space-y-3 shadow-lg">
              <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
                <span className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                  <Brain className="h-4 w-4 text-purple-400" />
                  <span>گزارش هوش مصنوعی این معامله</span>
                  <GlassBadge variant="purple" className="text-[10px]">
                    {journal.aiAnalysis.provider} ({journal.aiAnalysis.model || "llama-3.3-70b"})
                  </GlassBadge>
                </span>
                <span className="font-extrabold text-amber-400 text-xs">نمره کل: {journal.aiAnalysis.overallScore}/100</span>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {journal.aiAnalysis.persianSummary}
              </p>

              {journal.aiAnalysis.tradingPsychologyFeedback && (
                <div className="bg-purple-900/20 p-2.5 rounded-xl text-xs text-purple-200">
                  <strong>نکته روانشناسی:</strong> {journal.aiAnalysis.tradingPsychologyFeedback}
                </div>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t dark:border-white/10 border-black/10">
            <div className="flex items-center gap-2">
              <GlassButton variant="gold" size="sm" onClick={handleRunPersianAI} disabled={isAnalyzing}>
                <Brain className={`h-4 w-4 ${isAnalyzing ? "animate-spin" : ""}`} />
                <span>{isAnalyzing ? "در حال اجرای Groq AI..." : "تولید تحلیل هوش مصنوعی Groq (فارسی)"}</span>
              </GlassButton>

              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to delete trade #${trade.ticket} (${trade.symbol})?`)) {
                    const { deleteTrade } = require("@/lib/storage/store");
                    deleteTrade(trade.id);
                    onClose();
                    if (onTradeUpdated) onTradeUpdated();
                    window.location.reload();
                  }
                }}
                className="px-3 py-2 text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
              >
                Delete Trade
              </button>
            </div>

            <div className="flex items-center gap-3">
              <GlassButton variant="outline" size="sm" onClick={onClose}>
                <span>Close</span>
              </GlassButton>

              <GlassButton variant="primary" size="sm" onClick={handleSave}>
                {saveSuccess ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <Save className="h-4 w-4" />}
                <span>{saveSuccess ? "Saved!" : "Save Changes"}</span>
              </GlassButton>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
