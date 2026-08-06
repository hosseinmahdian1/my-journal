import React, { useState } from "react";
import { Trade } from "@/types/trade";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from "lucide-react";
import { GlassCard } from "@/components/ui/glass/GlassCard";
import { GlassBadge } from "@/components/ui/glass/GlassBadge";

interface HeaderCalendarProps {
  trades: Trade[];
  selectedDate: string | null;
  onSelectDate: (dateStr: string | null) => void;
}

export function HeaderCalendar({ trades, selectedDate, onSelectDate }: HeaderCalendarProps) {
  const [currentYear, setCurrentYear] = useState(() => {
    if (trades.length > 0) {
      const d = new Date(trades[0].openTime || trades[0].closeTime);
      if (!isNaN(d.getTime())) return d.getFullYear();
    }
    return 2026;
  });

  const [currentMonth, setCurrentMonth] = useState(() => {
    if (trades.length > 0) {
      const d = new Date(trades[0].openTime || trades[0].closeTime);
      if (!isNaN(d.getTime())) return d.getMonth();
    }
    return 7; // August (0-indexed 7)
  });

  const monthNames = [
    "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
  ];

  const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Build daily stats for current month & year
  const dailyStatsMap = new Map<string, { netPnl: number; count: number }>();
  trades.forEach((t) => {
    const rawDate = t.openTime || t.closeTime;
    if (!rawDate) return;
    const dateKey = rawDate.split("T")[0]; // YYYY-MM-DD
    const netPnl = t.profit + (t.commission || 0) + (t.swap || 0);

    const existing = dailyStatsMap.get(dateKey) || { netPnl: 0, count: 0 };
    dailyStatsMap.set(dateKey, {
      netPnl: existing.netPnl + netPnl,
      count: existing.count + 1,
    });
  });

  // Calculate calendar grid days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const calendarCells = [];
  // Padding cells before first day
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(null);
  }
  // Month days
  for (let day = 1; day <= totalDaysInMonth; day++) {
    calendarCells.push(day);
  }

  // Monthly total PnL
  let monthlyPnL = 0;
  let monthlyTradesCount = 0;
  dailyStatsMap.forEach((stats, dateKey) => {
    const [yStr, mStr] = dateKey.split("-");
    if (parseInt(yStr, 10) === currentYear && parseInt(mStr, 10) === currentMonth + 1) {
      monthlyPnL += stats.netPnl;
      monthlyTradesCount += stats.count;
    }
  });

  return (
    <GlassCard className="p-6 max-w-sm sm:max-w-md mx-auto dark:bg-zinc-950/80 bg-slate-900 text-white shadow-2xl border dark:border-white/10 border-cyan-500/30">
      {/* Month Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-all"
          title="Previous Month"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="text-center">
          <h3 className="text-sm font-extrabold tracking-widest text-white uppercase">
            {monthNames[currentMonth]} {currentYear}
          </h3>
          {monthlyTradesCount > 0 && (
            <div className={`text-xs font-bold mt-0.5 ${monthlyPnL >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              Month PnL: {monthlyPnL >= 0 ? "+" : ""}${monthlyPnL.toFixed(2)} ({monthlyTradesCount} Trades)
            </div>
          )}
        </div>

        <button
          onClick={handleNextMonth}
          className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-all"
          title="Next Month"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Selected Date Badge Filter */}
      {selectedDate && (
        <div className="mt-3 flex items-center justify-between bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 rounded-xl text-xs">
          <span className="font-bold text-cyan-300 flex items-center gap-1.5">
            <CalendarIcon className="h-3.5 w-3.5" />
            <span>Filtered: {selectedDate}</span>
          </span>
          <button
            onClick={() => onSelectDate(null)}
            className="p-1 hover:bg-cyan-500/20 text-cyan-400 rounded-lg transition-all"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 my-3">
        {daysOfWeek.map((day, idx) => (
          <div key={idx} className="py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {calendarCells.map((day, idx) => {
          if (day === null) {
            return <div key={`pad-${idx}`} className="h-9" />;
          }

          const dayStr = day < 10 ? `0${day}` : `${day}`;
          const monthStr = currentMonth + 1 < 10 ? `0${currentMonth + 1}` : `${currentMonth + 1}`;
          const dateKey = `${currentYear}-${monthStr}-${dayStr}`;

          const stats = dailyStatsMap.get(dateKey);
          const isSelected = selectedDate === dateKey;

          let bgStyle = "hover:bg-white/10 text-slate-200";
          let badgeDot = null;

          if (stats) {
            if (stats.netPnl > 0) {
              bgStyle = "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 font-bold";
              badgeDot = <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-neon-green" />;
            } else if (stats.netPnl < 0) {
              bgStyle = "bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 font-bold";
              badgeDot = <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-rose-400 shadow-neon-red" />;
            } else {
              bgStyle = "bg-slate-700/40 border border-slate-600/40 text-slate-300 hover:bg-slate-700/60";
            }
          }

          if (isSelected) {
            bgStyle += " ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900";
          }

          return (
            <button
              key={`day-${day}`}
              onClick={() => {
                if (isSelected) onSelectDate(null);
                else onSelectDate(dateKey);
              }}
              className={`relative h-9 rounded-xl flex flex-col items-center justify-center transition-all ${bgStyle}`}
              title={stats ? `${dateKey}: ${stats.netPnl >= 0 ? "+" : ""}$${stats.netPnl.toFixed(2)}` : dateKey}
            >
              <span>{day}</span>
              {badgeDot}
            </button>
          );
        })}
      </div>
    </GlassCard>
  );
}
