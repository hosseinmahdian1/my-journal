"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/glass/GlassCard";
import { GlassButton } from "@/components/ui/glass/GlassButton";
import { GlassBadge } from "@/components/ui/glass/GlassBadge";
import { Trade, TradeJournal } from "@/types/trade";
import { loadJournals, saveJournals, loadTrades, saveTrades } from "@/lib/storage/store";
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

  // Real-time Net Profit Calculation: Net Profit = Gross Profit + Commission + Swap
  const netProfit = grossProfit + commission + swap;
  const isNetWin = netProfit > 0;

  // Handle Image Upload
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

    // 1. Update Trade Commission, Swap, Net Profit
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

    // 2. Update Journal Notes, Setup Tag & Screenshots
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

    const aiResult = await analyzeTradeWithAI(updatedTrade, currentJournal, "Gemini");
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
        {/* Modal Backdrop Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-xl"
        />

        {/* Modal Content */}
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

          {/* Real-time Net Profit Breakdown Banner */}
          <div className={`rounded-2xl border p-4 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4 ${isNetWin ? "bg-emerald-950/20 border-emerald-500/30" : "bg-rose-950/20 border-rose-500/30"}`}>
            <div className="space-y-1">
              <span className="text-xs dark:text-slate-400 text-slate-500 font-semibold uppercase">Net Profit Calculation</span>
              <div className="flex items-center gap-3 text-sm font-mono font-bold">
                <span>Gross P/L: <strong className={grossProfit >= 0 ? "text-emerald-400" : "text-rose-400"}>${grossProfit}</strong></span>
                <span>+ Comm: <strong className="text-rose-400">${commission}</strong></span>
                <span>+ Swap: <strong className="text-amber-400">${swap}</strong></span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs dark:text-slate-400 text-slate-500 font-semibold">Total Account Impact</span>
              <div className={`text-2xl font-black ${isNetWin ? "text-emerald-400" : "text-rose-400"}`}>
                {isNetWin ? "+" : ""}${netProfit.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Strategy Tag Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Tag className="h-4 w-4" />
              <span>انتخاب استراتژی معاملاتی (Strategy Setup Tag)</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={setupName}
                onChange={(e) => {
                  setSetupName(e.target.value);
                  setCustomSetupTag("");
                }}
                className="rounded-xl border dark:border-white/10 border-black/10 dark:bg-zinc-950 bg-slate-100 p-3 text-xs font-semibold"
              >
                {STRATEGY_PRESETS.map((preset) => (
                  <option key={preset} value={preset}>
                    {preset}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Or type custom strategy tag..."
                value={customSetupTag}
                onChange={(e) => setCustomSetupTag(e.target.value)}
                className="rounded-xl border dark:border-white/10 border-black/10 dark:bg-zinc-950 bg-slate-100 p-3 text-xs"
              />
            </div>
          </div>

          {/* Screenshots Uploader (Before, During, After) */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <Camera className="h-4 w-4" />
              <span>آپلوُد اسکرین‌شات‌های تحلیل و ورود (Setup Screenshots)</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Before Entry */}
              <div className="rounded-2xl border dark:border-white/10 border-black/10 p-3 text-center space-y-2 dark:bg-zinc-950/60 bg-slate-50">
                <span className="text-xs font-bold block text-slate-400">Before Entry</span>
                {screenshotBefore ? (
                  <img src={screenshotBefore} alt="Before" className="h-32 w-full object-cover rounded-xl border border-white/10" />
                ) : (
                  <div className="h-32 w-full rounded-xl border border-dashed border-white/20 flex flex-col items-center justify-center text-slate-500 text-xs">
                    <Upload className="h-6 w-6 mb-1" />
                    <span>Upload Image</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "before")}
                  className="text-[10px] w-full text-slate-400 cursor-pointer"
                />
              </div>

              {/* During Trade */}
              <div className="rounded-2xl border dark:border-white/10 border-black/10 p-3 text-center space-y-2 dark:bg-zinc-950/60 bg-slate-50">
                <span className="text-xs font-bold block text-slate-400">During Trade</span>
                {screenshotDuring ? (
                  <img src={screenshotDuring} alt="During" className="h-32 w-full object-cover rounded-xl border border-white/10" />
                ) : (
                  <div className="h-32 w-full rounded-xl border border-dashed border-white/20 flex flex-col items-center justify-center text-slate-500 text-xs">
                    <Upload className="h-6 w-6 mb-1" />
                    <span>Upload Image</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "during")}
                  className="text-[10px] w-full text-slate-400 cursor-pointer"
                />
              </div>

              {/* After Exit */}
              <div className="rounded-2xl border dark:border-white/10 border-black/10 p-3 text-center space-y-2 dark:bg-zinc-950/60 bg-slate-50">
                <span className="text-xs font-bold block text-slate-400">After Exit</span>
                {screenshotAfter ? (
                  <img src={screenshotAfter} alt="After" className="h-32 w-full object-cover rounded-xl border border-white/10" />
                ) : (
                  <div className="h-32 w-full rounded-xl border border-dashed border-white/20 flex flex-col items-center justify-center text-slate-500 text-xs">
                    <Upload className="h-6 w-6 mb-1" />
                    <span>Upload Image</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "after")}
                  className="text-[10px] w-full text-slate-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Editable Commission & Swap & TV Link */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400">Commission ($)</label>
              <input
                type="number"
                step="0.1"
                value={commission}
                onChange={(e) => setCommission(parseFloat(e.target.value) || 0)}
                className="mt-1 w-full rounded-xl border dark:border-white/10 border-black/10 dark:bg-zinc-950 bg-slate-100 p-2.5 text-xs text-rose-400 font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">Swap ($)</label>
              <input
                type="number"
                step="0.1"
                value={swap}
                onChange={(e) => setSwap(parseFloat(e.target.value) || 0)}
                className="mt-1 w-full rounded-xl border dark:border-white/10 border-black/10 dark:bg-zinc-950 bg-slate-100 p-2.5 text-xs text-amber-400 font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">TradingView Chart Link</label>
              <input
                type="url"
                placeholder="https://tradingview.com/x/..."
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
            <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-4 font-persian space-y-2">
              <div className="flex items-center justify-between text-purple-300 font-bold text-xs">
                <span className="flex items-center gap-1.5">
                  <Brain className="h-4 w-4 text-purple-400" />
                  گزارش هوش مصنوعی این معامله:
                </span>
                <span>نمره: {journal.aiAnalysis.overallScore}/100</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {journal.aiAnalysis.persianSummary}
              </p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t dark:border-white/10 border-black/10">
            <div className="flex items-center gap-2">
              <GlassButton variant="gold" size="sm" onClick={handleRunPersianAI} disabled={isAnalyzing}>
                <Brain className={`h-4 w-4 ${isAnalyzing ? "animate-spin" : ""}`} />
                <span>{isAnalyzing ? "تحلیل AI..." : "تحلیل هوش مصنوعی (فارسی)"}</span>
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
