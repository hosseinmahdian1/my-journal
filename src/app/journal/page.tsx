"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass/GlassCard";
import { GlassButton } from "@/components/ui/glass/GlassButton";
import { GlassBadge } from "@/components/ui/glass/GlassBadge";
import { loadTrades, loadJournals } from "@/lib/storage/store";
import { Trade, TradeJournal } from "@/types/trade";
import { TradeDetailModal } from "@/components/journal/TradeDetailModal";
import { BookOpen, Search, Filter, Sparkles, Image, ExternalLink, ChevronRight, Brain, Camera, Tag } from "lucide-react";

export default function JournalPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [journals, setJournals] = useState<Record<string, TradeJournal>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSymbol, setFilterSymbol] = useState("ALL");
  const [filterResult, setFilterResult] = useState("ALL");

  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const refreshData = () => {
    setTrades(loadTrades());
    setJournals(loadJournals());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const filteredTrades = trades.filter((trade) => {
    const journal = journals[trade.journalId || ""] || {};
    const matchesSearch =
      trade.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (journal.setupName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (journal.reasonForEntry || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSymbol = filterSymbol === "ALL" || trade.symbol === filterSymbol;
    const matchesResult =
      filterResult === "ALL"
        ? true
        : filterResult === "WIN"
        ? (trade.profit + trade.commission + trade.swap) > 0
        : (trade.profit + trade.commission + trade.swap) < 0;

    return matchesSearch && matchesSymbol && matchesResult;
  });

  const uniqueSymbols = Array.from(new Set(trades.map((t) => t.symbol)));

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black dark:text-white text-slate-950 flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-cyan-400" />
            <span>Trading Journal & SMC Setup Tags</span>
          </h1>
          <p className="mt-1 text-xs dark:text-slate-400 text-slate-600 font-medium">
            Click any trade card to select strategy tags, upload screenshots, edit commission & swap, write notes, and generate Persian AI reports.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <GlassCard className="flex flex-wrap items-center justify-between gap-4 p-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search setup tag, notes, SMC concepts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border dark:border-white/10 border-black/10 dark:bg-zinc-950 bg-slate-100 py-2.5 pl-10 pr-4 text-xs dark:text-white text-slate-900 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterSymbol}
            onChange={(e) => setFilterSymbol(e.target.value)}
            className="rounded-xl border dark:border-white/10 border-black/10 dark:bg-zinc-950 bg-slate-100 px-3.5 py-2 text-xs font-semibold"
          >
            <option value="ALL">All Symbols</option>
            {uniqueSymbols.map((sym) => (
              <option key={sym} value={sym}>
                {sym}
              </option>
            ))}
          </select>

          <select
            value={filterResult}
            onChange={(e) => setFilterResult(e.target.value)}
            className="rounded-xl border dark:border-white/10 border-black/10 dark:bg-zinc-950 bg-slate-100 px-3.5 py-2 text-xs font-semibold"
          >
            <option value="ALL">All Results</option>
            <option value="WIN">Winning Trades</option>
            <option value="LOSS">Losing Trades</option>
          </select>
        </div>
      </GlassCard>

      {/* Journal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrades.map((trade) => {
          const journal = journals[trade.journalId || ""] || {};
          const netPnl = trade.profit + trade.commission + trade.swap;
          const isWin = netPnl > 0;
          const hasAI = !!journal.aiAnalysis;
          const hasScreenshots = journal.screenshotBefore || journal.screenshotDuring || journal.screenshotAfter;

          return (
            <GlassCard
              key={trade.id}
              glowColor={isWin ? "green" : "red"}
              onClick={() => {
                setSelectedTrade(trade);
                setIsModalOpen(true);
              }}
              className="space-y-4 flex flex-col justify-between cursor-pointer hover:border-cyan-500/50 transition-all"
            >
              <div className="space-y-3">
                {/* Header info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold dark:text-white text-slate-900">{trade.symbol}</span>
                    <GlassBadge variant={trade.orderType === "BUY" ? "profit" : "loss"}>
                      {trade.orderType} {trade.lotSize}L
                    </GlassBadge>
                  </div>
                  <div className={`text-base font-black ${isWin ? "text-emerald-400" : "text-rose-400"}`}>
                    {isWin ? "+" : ""}${netPnl.toFixed(2)}
                  </div>
                </div>

                {/* Strategy Tag & Badges */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                    <Tag className="h-3.5 w-3.5" />
                    <span>{journal.setupName || "Uncategorized Strategy"}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {journal.session && <GlassBadge variant="cyan">{journal.session}</GlassBadge>}
                    {journal.marketStructure && <GlassBadge variant="neutral">{journal.marketStructure}</GlassBadge>}
                    {hasScreenshots && (
                      <GlassBadge variant="gold">
                        <Camera className="h-3 w-3 mr-1" /> Screenshots
                      </GlassBadge>
                    )}
                  </div>
                </div>

                {/* Net Breakdown: Commission & Swap */}
                <div className="text-[11px] dark:text-slate-400 text-slate-600 flex items-center justify-between border-t dark:border-white/5 border-black/5 pt-2">
                  <span>Comm: <strong className="text-rose-400">${trade.commission || 0}</strong></span>
                  <span>Swap: <strong className="text-amber-400">${trade.swap || 0}</strong></span>
                  <span>Duration: <strong>{trade.durationMinutes}m</strong></span>
                </div>

                {/* Persian AI Analysis Preview */}
                {hasAI ? (
                  <div className="rounded-xl border dark:border-purple-500/30 border-purple-300 dark:bg-purple-950/20 bg-purple-50 p-3 text-xs font-persian space-y-1">
                    <div className="flex items-center justify-between dark:text-purple-300 text-purple-900 font-bold">
                      <span className="flex items-center gap-1">
                        <Brain className="h-3.5 w-3.5 text-purple-400" />
                        تحلیل هوش مصنوعی:
                      </span>
                      <span>نمره: {journal.aiAnalysis?.overallScore}/100</span>
                    </div>
                    <p className="dark:text-slate-300 text-purple-950 line-clamp-2 text-[11px] leading-relaxed">
                      {journal.aiAnalysis?.persianSummary}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs dark:text-slate-400 text-slate-600 line-clamp-2 italic font-persian">
                    {journal.reasonForEntry || "توضیحاتی ثبت نشده است. کلیک کنید تا نوت، تگ و اسکرین‌شات اضافه کنید."}
                  </p>
                )}
              </div>

              {/* Bottom Card Footer */}
              <div className="pt-3 border-t dark:border-white/10 border-black/10 flex items-center justify-between text-[11px] font-semibold text-cyan-400">
                <span>Click to view details & screenshots</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Trade Detail Modal */}
      <TradeDetailModal
        trade={selectedTrade}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTradeUpdated={refreshData}
      />
    </div>
  );
}
