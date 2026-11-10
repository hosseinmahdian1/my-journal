"use client";

import React, { useMemo, useState } from "react";
import { Trade } from "@/types/trade";
import { parseCloseTime } from "@/lib/utils/date-utils";
import { Calendar, Award, Flame, Info } from "lucide-react";

interface TradingHeatmapProps {
  trades: Trade[];
}

export function TradingHeatmap({ trades }: TradingHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<{
    dateStr: string;
    pnl: number;
    count: number;
    winCount: number;
  } | null>(null);

  // Group trades by YYYY-MM-DD
  const { dailyData, summary } = useMemo(() => {
    const map: Record<string, { pnl: number; count: number; winCount: number }> = {};
    let totalProfitDays = 0;
    let totalLossDays = 0;
    let totalBreakEvenDays = 0;

    trades.forEach((t) => {
      const ts = parseCloseTime(t.closeTime || t.openTime);
      if (ts === 0) return;
      const d = new Date(ts);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const net = t.profit + (t.commission || 0) + (t.swap || 0);

      if (!map[key]) {
        map[key] = { pnl: 0, count: 0, winCount: 0 };
      }
      map[key].pnl += net;
      map[key].count += 1;
      if (net > 0) map[key].winCount += 1;
    });

    Object.values(map).forEach((day) => {
      if (day.pnl > 1) totalProfitDays++;
      else if (day.pnl < -1) totalLossDays++;
      else totalBreakEvenDays++;
    });

    return {
      dailyData: map,
      summary: {
        totalProfitDays,
        totalLossDays,
        totalBreakEvenDays,
        totalActiveDays: Object.keys(map).length,
      },
    };
  }, [trades]);

  // Generate 16 weeks of recent calendar grid
  const weeks = useMemo(() => {
    const today = new Date();
    const result = [];
    const start = new Date(today);
    start.setDate(today.getDate() - (15 * 7 + today.getDay()));

    for (let w = 0; w < 16; w++) {
      const weekDays = [];
      for (let d = 0; d < 7; d++) {
        const current = new Date(start);
        current.setDate(start.getDate() + (w * 7 + d));
        const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`;
        const data = dailyData[key] || { pnl: 0, count: 0, winCount: 0 };
        const isFuture = current.getTime() > today.getTime();
        weekDays.push({
          date: current,
          key,
          isFuture,
          ...data,
        });
      }
      result.push(weekDays);
    }
    return result;
  }, [dailyData]);

  const getCellColor = (pnl: number, count: number, isFuture: boolean) => {
    if (isFuture) return "bg-transparent border border-transparent opacity-10";
    if (count === 0) return "dark:bg-zinc-900/60 bg-slate-100 border dark:border-white/5 border-slate-200";
    if (pnl > 300) return "bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]";
    if (pnl > 50) return "bg-emerald-400/90 text-white";
    if (pnl > 0) return "bg-emerald-500/50 text-white";
    if (pnl === 0) return "bg-amber-400/60 text-white";
    if (pnl > -150) return "bg-rose-400/80 text-white";
    return "bg-rose-600 text-white shadow-[0_0_10px_rgba(244,63,94,0.5)]";
  };

  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="starlight-card p-5 relative overflow-hidden">
      {/* Header with Title and Quick Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold dark:text-white text-slate-900 flex items-center gap-2">
              Trading Activity & PnL Heatmap
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full dark:bg-zinc-800 bg-slate-100 dark:text-slate-300 text-slate-700">
                {summary.totalActiveDays} Active Days
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Daily session intensity (Green = Profit, Red = Drawdown)
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
          <span>Loss</span>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-rose-600 inline-block" />
            <span className="w-3 h-3 rounded-sm bg-rose-400/80 inline-block" />
            <span className="w-3 h-3 rounded-sm dark:bg-zinc-800 bg-slate-200 inline-block" />
            <span className="w-3 h-3 rounded-sm bg-emerald-500/50 inline-block" />
            <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
          </div>
          <span>Profit</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="relative overflow-x-auto no-scrollbar pb-2">
        <div className="inline-flex gap-1.5 items-start">
          {/* Day of Week labels column */}
          <div className="flex flex-col gap-1.5 mr-1 text-[10px] font-bold text-slate-500 select-none">
            {dayLabels.map((lbl, idx) => (
              <span key={idx} className="h-3.5 w-3.5 flex items-center justify-center">
                {lbl}
              </span>
            ))}
          </div>

          {/* Grid columns (weeks) */}
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1.5">
              {week.map((day) => (
                <div
                  key={day.key}
                  onMouseEnter={() =>
                    setHoveredDay({
                      dateStr: day.key,
                      pnl: day.pnl,
                      count: day.count,
                      winCount: day.winCount,
                    })
                  }
                  onMouseLeave={() => setHoveredDay(null)}
                  className={`heatmap-cell h-3.5 w-3.5 rounded-sm cursor-pointer ${getCellColor(
                    day.pnl,
                    day.count,
                    day.isFuture
                  )}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Hover Status Bar / Summary Pill */}
      <div className="mt-3 pt-3 border-t dark:border-white/10 border-slate-200 flex flex-wrap items-center justify-between text-xs">
        {hoveredDay ? (
          <div className="flex items-center gap-3 font-mono">
            <span className="text-slate-400 font-sans font-bold">{hoveredDay.dateStr}:</span>
            <span
              className={`font-black ${
                hoveredDay.pnl >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {hoveredDay.pnl >= 0 ? "+" : ""}${hoveredDay.pnl.toFixed(2)}
            </span>
            <span className="text-slate-400 font-sans">
              {hoveredDay.count} Trades ({hoveredDay.winCount} Won)
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-4 text-slate-400 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {summary.totalProfitDays} Green Days
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              {summary.totalLossDays} Red Days
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              {summary.totalBreakEvenDays} Neutral Days
            </span>
          </div>
        )}

        <span className="text-[11px] text-slate-500 hidden sm:inline">
          Hover any cell for daily breakdown
        </span>
      </div>
    </div>
  );
}
