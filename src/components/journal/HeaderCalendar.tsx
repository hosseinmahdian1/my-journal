import React, { useState } from "react";
import { Trade } from "@/types/trade";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from "lucide-react";
import { GlassCard } from "@/components/ui/glass/GlassCard";

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
    <GlassCard className="p-6 max-w-sm sm:max-w-md mx-auto dark:bg-[#141829]/95 bg-white text-slate-900 dark:text-[#E6E8F2] shadow-xl border dark:border-[#2A3050]/35 border-slate-200">
      {/* Month Navigation */}
      <div className="flex items-center justify-between pb-4 border-b dark:border-[#2A3050]/30 border-slate-200">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-xl dark:hover:bg-[#2A3050]/20 hover:bg-slate-100 dark:text-[#8892B0] text-slate-700 hover:text-[#7C5CFF] transition-all cursor-pointer"
          title="Previous Month"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="text-center">
          <h3 className="text-sm font-black tracking-widest dark:text-[#E6E8F2] text-slate-900 uppercase">
            {monthNames[currentMonth]} {currentYear}
          </h3>
          {monthlyTradesCount > 0 && (
            <div className={`text-xs font-extrabold mt-0.5 ${monthlyPnL >= 0 ? "dark:text-[#34D399] text-emerald-600" : "dark:text-[#F87171] text-rose-600"}`}>
              Month PnL: {monthlyPnL >= 0 ? "+" : ""}${monthlyPnL.toFixed(2)} ({monthlyTradesCount} Trades)
            </div>
          )}
        </div>

        <button
          onClick={handleNextMonth}
          className="p-2 rounded-xl dark:hover:bg-[#2A3050]/20 hover:bg-slate-100 dark:text-[#8892B0] text-slate-700 hover:text-[#7C5CFF] transition-all cursor-pointer"
          title="Next Month"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Selected Date Badge Filter */}
      {selectedDate && (
        <div className="mt-3 flex items-center justify-between dark:bg-[#7C5CFF]/15 bg-amber-50 dark:border-[#7C5CFF]/30 border-amber-200 px-3 py-1.5 rounded-xl text-xs border">
          <span className="font-extrabold dark:text-[#7C5CFF] text-amber-900 flex items-center gap-1.5">
            <CalendarIcon className="h-3.5 w-3.5" />
            <span>Filtered: {selectedDate}</span>
          </span>
          <button
            onClick={() => onSelectDate(null)}
            className="p-1 hover:bg-amber-200/50 dark:hover:bg-[#7C5CFF]/20 dark:text-[#7C5CFF] text-amber-800 rounded-lg transition-all cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-black dark:text-[#8892B0] text-slate-700 my-3">
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

          let bgStyle = "dark:text-[#E6E8F2] text-slate-800 dark:hover:bg-[#2A3050]/20 hover:bg-slate-100 font-bold";
          let badgeDot = null;

          if (stats) {
            if (stats.netPnl > 0) {
              bgStyle = "dark:bg-[#34D399]/25 bg-emerald-100/90 border dark:border-[#34D399]/50 border-emerald-300 dark:text-[#34D399] text-emerald-800 hover:bg-emerald-200 dark:hover:bg-[#34D399]/35 font-black shadow-sm";
              badgeDot = <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-[#34D399] shadow-[0_0_6px_#34D399]" />;
            } else if (stats.netPnl < 0) {
              bgStyle = "dark:bg-[#F87171]/25 bg-rose-100/90 border dark:border-[#F87171]/50 border-rose-300 dark:text-[#F87171] text-rose-800 hover:bg-rose-200 dark:hover:bg-[#F87171]/35 font-black shadow-sm";
              badgeDot = <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-[#F87171] shadow-[0_0_6px_#F87171]" />;
            } else {
              bgStyle = "dark:bg-[#2A3050]/20 bg-slate-100 border dark:border-[#2A3050]/30 border-slate-300 dark:text-[#E6E8F2] text-slate-800 font-bold";
            }
          }

          if (isSelected) {
            bgStyle += " ring-2 ring-[#7C5CFF] ring-offset-2 dark:ring-offset-[#0B0E1A] ring-offset-white";
          }

          return (
            <button
              key={`day-${day}`}
              onClick={() => {
                if (isSelected) onSelectDate(null);
                else onSelectDate(dateKey);
              }}
              className={`relative h-9 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${bgStyle}`}
              title={stats ? `${dateKey}: ${stats.netPnl >= 0 ? "+" : ""}$${stats.netPnl.toFixed(2)} (${stats.count} trades)` : dateKey}
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
