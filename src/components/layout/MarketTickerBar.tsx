"use client";

import React from "react";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface TickerItem {
  symbol: string;
  name: string;
  price: string;
  change: string;
  isPositive: boolean;
}

const TICKER_DATA: TickerItem[] = [
  { symbol: "XAU/USD", name: "Gold Spot", price: "$2,684.50", change: "+0.74%", isPositive: true },
  { symbol: "DXY", name: "Dollar Index", price: "106.62", change: "+0.14%", isPositive: true },
  { symbol: "EUR/USD", name: "Euro / Dollar", price: "1.0538", change: "-0.21%", isPositive: false },
  { symbol: "GBP/USD", name: "Cable", price: "1.2640", change: "+0.08%", isPositive: true },
  { symbol: "US10Y", name: "US 10Y Yield", price: "4.425%", change: "-0.03%", isPositive: false },
  { symbol: "BTC/USD", name: "Bitcoin", price: "$88,350", change: "+3.85%", isPositive: true },
  { symbol: "BRENT", name: "Crude Oil", price: "$73.85", change: "-0.62%", isPositive: false },
  { symbol: "SPX 500", name: "S&P 500", price: "5,982.5", change: "+0.42%", isPositive: true },
];

export function MarketTickerBar() {
  return (
    <div className="relative w-full border-b dark:border-white/10 border-slate-200/80 dark:bg-black/50 bg-slate-100/90 text-xs overflow-hidden backdrop-blur-md z-20 select-none">
      <div className="flex items-center mx-auto px-4 py-1.5">
        {/* Live Indicator Badge */}
        <div className="flex items-center gap-1.5 shrink-0 pr-3 border-r dark:border-white/10 border-slate-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-wider dark:text-cyan-400 text-sky-700 flex items-center gap-1">
            <Activity className="h-2.5 w-2.5" />
            Live Macro
          </span>
        </div>

        {/* Scrolling Ticker Track */}
        <div className="ticker-container flex-1 overflow-x-auto no-scrollbar flex items-center gap-6 pl-4 whitespace-nowrap">
          {TICKER_DATA.map((item, idx) => (
            <div
              key={item.symbol + idx}
              className="inline-flex items-center gap-2 group cursor-pointer transition-transform hover:scale-105"
            >
              <span className="font-bold text-[11px] dark:text-slate-200 text-slate-800">
                {item.symbol}
              </span>
              <span className="font-mono text-[11px] font-semibold dark:text-slate-300 text-slate-600">
                {item.price}
              </span>
              <span
                className={`inline-flex items-center text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-md ${
                  item.isPositive
                    ? "dark:bg-emerald-950/60 bg-emerald-100/80 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : "dark:bg-rose-950/60 bg-rose-100/80 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                }`}
              >
                {item.isPositive ? (
                  <TrendingUp className="h-2.5 w-2.5 mr-0.5 inline" />
                ) : (
                  <TrendingDown className="h-2.5 w-2.5 mr-0.5 inline" />
                )}
                {item.change}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
