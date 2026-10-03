"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/glass/GlassCard";
import { GlassButton } from "@/components/ui/glass/GlassButton";
import { GlassBadge } from "@/components/ui/glass/GlassBadge";
import { Trade, OrderType } from "@/types/trade";
import { getActiveAccountId, loadTrades, saveTrades, loadJournals, saveJournals } from "@/lib/storage/store";
import { X, Plus, Save, DollarSign, Calendar, Tag, CheckCircle } from "lucide-react";

interface AddTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTradeAdded?: () => void;
}

export function AddTradeModal({ isOpen, onClose, onTradeAdded }: AddTradeModalProps) {
  const [ticket, setTicket] = useState<number>(Math.floor(1000000 + Math.random() * 9000000));
  const [symbol, setSymbol] = useState("XAUUSD");
  const [orderType, setOrderType] = useState<OrderType>("BUY");
  const [lotSize, setLotSize] = useState(0.5);
  const [entryPrice, setEntryPrice] = useState(2425.0);
  const [exitPrice, setExitPrice] = useState(2438.0);
  const [stopLoss, setStopLoss] = useState(2418.0);
  const [takeProfit, setTakeProfit] = useState(2445.0);
  const [commission, setCommission] = useState(-3.5);
  const [swap, setSwap] = useState(0);
  const [grossProfit, setGrossProfit] = useState(650.0);
  const [setupName, setSetupName] = useState("London Killzone FVG Sweep");
  const [notes, setNotes] = useState("");

  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const netProfit = grossProfit + commission + swap;

  const handleSaveTrade = () => {
    const activeAccountId = getActiveAccountId();
    const tradeId = `manual-${Date.now()}`;
    const journalId = `journal-${tradeId}`;

    const newTrade: Trade = {
      id: tradeId,
      accountId: activeAccountId,
      ticket: Number(ticket),
      symbol: symbol.toUpperCase().trim(),
      orderType,
      lotSize: Number(lotSize),
      openTime: new Date().toISOString(),
      closeTime: new Date().toISOString(),
      entryPrice: Number(entryPrice),
      exitPrice: Number(exitPrice),
      stopLoss: Number(stopLoss),
      takeProfit: Number(takeProfit),
      commission: Number(commission),
      swap: Number(swap),
      profit: Number(grossProfit),
      balanceAfterTrade: 10000 + netProfit,
      durationMinutes: 45,
      rrRatio: Number(stopLoss) > 0 ? parseFloat((Math.abs(exitPrice - entryPrice) / Math.abs(entryPrice - stopLoss)).toFixed(2)) : 2.0,
      journalId,
    };

    // Save Trade
    const allTrades = loadTrades();
    const updatedTrades = [newTrade, ...allTrades];
    saveTrades(updatedTrades);

    // Save Journal Notes & Strategy Tag
    const allJournals = loadJournals();
    allJournals[journalId] = {
      id: journalId,
      tradeId,
      setupName,
      session: "London",
      bias: orderType === "BUY" ? "Bullish" : "Bearish",
      timeframe: "M15",
      reasonForEntry: notes,
      reasonForExit: "",
      mistakes: [],
      lessonsLearned: "",
      emotion: "Calm & Disciplined",
      confidenceScore: 9,
      marketStructure: orderType === "BUY" ? "Bullish BOS" : "Bearish BOS",
    };
    saveJournals(allJournals);

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
      if (onTradeAdded) onTradeAdded();
    }, 1000);
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
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border dark:border-white/15 border-black/10 dark:bg-black/90 bg-white p-6 shadow-2xl backdrop-blur-2xl text-slate-900 dark:text-slate-100 space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b dark:border-white/10 border-black/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-400">
                <Plus className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold">ثبت دستی معامله جدید (Add Manual Trade)</h2>
                <p className="text-xs dark:text-slate-400 text-slate-500">مشخصات معامله، کمیسیون، سواپ و تگ استراتژی را وارد کنید.</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl dark:bg-white/10 bg-black/5 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-400">Ticket #</label>
              <input
                type="number"
                value={ticket}
                onChange={(e) => setTicket(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border dark:border-white/10 border-black/10 dark:bg-zinc-950 bg-slate-100 p-2.5 font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-400">Symbol</label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="mt-1 w-full rounded-xl border dark:border-white/10 border-black/10 dark:bg-zinc-950 bg-slate-100 p-2.5 font-bold"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-400">Order Type & Lots</label>
              <div className="flex gap-2 mt-1">
                <select
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value as OrderType)}
                  className="rounded-xl border dark:border-white/10 border-black/10 dark:bg-zinc-950 bg-slate-100 p-2.5 font-bold text-cyan-400"
                >
                  <option value="BUY">BUY</option>
                  <option value="SELL">SELL</option>
                </select>
                <input
                  type="number"
                  step="0.01"
                  value={lotSize}
                  onChange={(e) => setLotSize(Number(e.target.value))}
                  className="w-full rounded-xl border dark:border-white/10 border-black/10 dark:bg-zinc-950 bg-slate-100 p-2.5 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-400">Entry Price</label>
              <input
                type="number"
                step="0.0001"
                value={entryPrice}
                onChange={(e) => setEntryPrice(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border dark:border-white/10 border-black/10 dark:bg-zinc-950 bg-slate-100 p-2.5"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-400">Exit Price</label>
              <input
                type="number"
                step="0.0001"
                value={exitPrice}
                onChange={(e) => setExitPrice(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border dark:border-white/10 border-black/10 dark:bg-zinc-950 bg-slate-100 p-2.5"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-400">Gross Profit ($)</label>
              <input
                type="number"
                step="0.1"
                value={grossProfit}
                onChange={(e) => setGrossProfit(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border dark:border-white/10 border-black/10 dark:bg-zinc-950 bg-slate-100 p-2.5 font-bold text-emerald-400"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-400">Stop Loss (SL)</label>
              <input
                type="number"
                step="0.0001"
                value={stopLoss}
                onChange={(e) => setStopLoss(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border dark:border-white/10 border-black/10 dark:bg-zinc-950 bg-slate-100 p-2.5 text-rose-400"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-400">Take Profit (TP)</label>
              <input
                type="number"
                step="0.0001"
                value={takeProfit}
                onChange={(e) => setTakeProfit(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border dark:border-white/10 border-black/10 dark:bg-zinc-950 bg-slate-100 p-2.5 text-emerald-400"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-400">Commission & Swap ($)</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="number"
                  step="0.1"
                  placeholder="Comm"
                  value={commission}
                  onChange={(e) => setCommission(Number(e.target.value))}
                  className="w-full rounded-xl border dark:border-white/10 border-black/10 dark:bg-zinc-950 bg-slate-100 p-2.5 text-rose-400 font-bold"
                />
                <input
                  type="number"
                  step="0.1"
                  placeholder="Swap"
                  value={swap}
                  onChange={(e) => setSwap(Number(e.target.value))}
                  className="w-full rounded-xl border dark:border-white/10 border-black/10 dark:bg-zinc-950 bg-slate-100 p-2.5 text-amber-400 font-bold"
                />
              </div>
            </div>
          </div>

          {/* Strategy Tag & Notes */}
          <div className="space-y-3 font-persian">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">تگ استراتژی (Strategy Setup Tag):</label>
              <input
                type="text"
                value={setupName}
                onChange={(e) => setSetupName(e.target.value)}
                className="w-full rounded-xl border dark:border-white/10 border-black/10 dark:bg-zinc-950 bg-slate-100 p-2.5 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">یادداشت ورود (Notes & Entry Reason):</label>
              <textarea
                rows={3}
                placeholder="توضیحات ستاپ معاملاتی..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl border dark:border-white/10 border-black/10 dark:bg-zinc-950 bg-slate-100 p-3 text-xs font-persian"
              />
            </div>
          </div>

          {/* Net Profit Summary */}
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-3 flex items-center justify-between text-xs">
            <span className="font-bold text-cyan-300">سود خالص کل (Net P/L = Gross + Comm + Swap):</span>
            <span className={`text-lg font-black ${netProfit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {netProfit >= 0 ? "+" : ""}${netProfit.toFixed(2)}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <GlassButton variant="outline" size="sm" onClick={onClose}>
              <span>Cancel</span>
            </GlassButton>
            <GlassButton variant="primary" size="sm" onClick={handleSaveTrade}>
              {saveSuccess ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <Save className="h-4 w-4" />}
              <span>{saveSuccess ? "Trade Saved!" : "Save Manual Trade"}</span>
            </GlassButton>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
