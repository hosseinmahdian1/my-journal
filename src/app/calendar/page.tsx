"use client";

import React, { useState, useEffect } from "react";
import { analyzeNewsWithAI } from "@/lib/ai/providers";
import { EconomicEvent } from "@/types/trade";
import {
  FolderOpen,
  Folder,
  BarChart2,
  Clock,
  Filter,
  Brain,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { GlassButton } from "@/components/ui/glass/GlassButton";

/**
 * Converts any UTC / ISO 8601 date string to Tehran Local Time (Asia/Tehran, UTC+03:30)
 */
function convertToTehranDateTime(dateIsoStr: string): {
  tehranDate: string;
  tehranTime: string;
  dayName: string;
} {
  try {
    const d = new Date(dateIsoStr);
    if (isNaN(d.getTime())) {
      return { tehranDate: "Unknown", tehranTime: "All Day", dayName: "" };
    }

    const tehranTime = d.toLocaleTimeString("en-US", {
      timeZone: "Asia/Tehran",
      hour: "numeric",
      minute: "2-digit",
      hour12: true, // ForexFactory uses 12-hour format (e.g., 8:30pm)
    });

    const monthName = d.toLocaleDateString("en-US", {
      timeZone: "Asia/Tehran",
      month: "short",
    });
    const dayNum = d.toLocaleDateString("en-US", {
      timeZone: "Asia/Tehran",
      day: "numeric",
    });
    
    const dayName = d.toLocaleDateString("en-US", {
      timeZone: "Asia/Tehran",
      weekday: "short",
    });

    return { tehranDate: `${monthName} ${dayNum}`, tehranTime: tehranTime.toLowerCase(), dayName };
  } catch (err) {
    return { tehranDate: "Unknown", tehranTime: "All Day", dayName: "" };
  }
}

export default function EconomicCalendarPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState("ALL");
  const [selectedImpact, setSelectedImpact] = useState("ALL");
  
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [isSyncingFF, setIsSyncingFF] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const fetchLiveCalendar = async (isBackground = false) => {
    if (!isBackground) {
      setIsSyncingFF(true);
      setSyncSuccess(false);
    }
    try {
      const res = await fetch("/api/calendar?_t=" + Date.now());
      if (res.ok) {
        const data = await res.json();
        const formattedEvents = data.map((ev: any) => {
          const { tehranDate, tehranTime, dayName } = convertToTehranDateTime(ev.date);
          return {
            ...ev,
            tehranDateDisplay: tehranDate,
            tehranTimeDisplay: tehranTime,
            dayNameDisplay: dayName,
          };
        });
        
        // Preserve any existing AI analysis when updating events in the background
        setEvents(prev => {
          if (prev.length === 0) return formattedEvents;
          return formattedEvents.map((newEv: any) => {
             const existingEv = prev.find(p => p.id === newEv.id);
             if (existingEv && existingEv.aiNewsAnalysis) {
               return { ...newEv, aiNewsAnalysis: existingEv.aiNewsAnalysis };
             }
             return newEv;
          });
        });

        if (!isBackground) setSyncSuccess(true);
      }
    } catch (err) {
      console.error("Failed to fetch live calendar:", err);
    } finally {
      if (!isBackground) setIsSyncingFF(false);
    }
  };

  useEffect(() => {
    fetchLiveCalendar();
    
    // Auto-update every 30 seconds to catch live 'Actual' values instantly
    const interval = setInterval(() => {
      fetchLiveCalendar(true);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const filteredEvents = events.filter((e) => {
    const matchesCurr = selectedCurrency === "ALL" || e.currency === selectedCurrency;
    const matchesImpact = selectedImpact === "ALL" || e.impact === selectedImpact;
    return matchesCurr && matchesImpact;
  });

  const handleToggleDetail = async (event: any) => {
    if (expandedRowId === event.id) {
      setExpandedRowId(null);
      return;
    }
    
    setExpandedRowId(event.id);
    
    // If not already analyzed, fetch AI analysis
    if (!event.aiNewsAnalysis) {
      setIsAnalyzing(true);
      const aiAnalysis = await analyzeNewsWithAI(event);
      
      setEvents(prev => prev.map(e => {
        if (e.id === event.id) {
          return { ...e, aiNewsAnalysis: aiAnalysis };
        }
        return e;
      }));
      setIsAnalyzing(false);
    }
  };

  const handleSyncForexFactory = () => {
    fetchLiveCalendar();
    setTimeout(() => setSyncSuccess(false), 3000);
  };

  // Helper to get Impact Icon Color (ForexFactory Style in Holst Palette)
  const getImpactIcon = (impact: string) => {
    if (impact === "High") return "bg-[#EF4444]";
    if (impact === "Medium") return "bg-[#F59E0B]";
    if (impact === "Low") return "bg-[#10B981]";
    return "bg-[#232734]"; // Non-Economic
  };
  
  // Helper to determine if value is better/worse than expected
  const getActualColorClass = (actual: string, forecast: string, previous: string) => {
    if (!actual || actual === "Pending" || actual === "-") return "text-slate-800 dark:text-[#94A3B8]";
    
    // Simple numeric comparison for coloring (ForexFactory standard)
    const actNum = parseFloat(actual.replace(/[^0-9.-]/g, ""));
    const forNum = parseFloat(forecast.replace(/[^0-9.-]/g, ""));
    const prevNum = parseFloat(previous.replace(/[^0-9.-]/g, ""));
    
    // If there's a forecast, compare to forecast, else compare to previous
    const compareTo = !isNaN(forNum) ? forNum : prevNum;
    
    if (isNaN(actNum) || isNaN(compareTo)) return "text-slate-800 dark:text-[#94A3B8]";
    
    // For a generic display, green if > expected, red if < expected.
    if (actNum > compareTo) return "text-[#10B981] font-bold";
    if (actNum < compareTo) return "text-[#EF4444] font-bold";
    return "text-slate-800 dark:text-[#94A3B8] font-bold";
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Header Controls (similar to FF header banner) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between dark:bg-[#14161D] bg-[#232734] p-3 rounded-t-xl text-[#FFFFFF] shadow-md border-b dark:border-[#232734]/30">
        <div className="flex items-center gap-3">
          <h1 className="font-bold text-lg tracking-wide">Economic Calendar</h1>
          <span className="text-xs font-semibold bg-black/30 border border-[#232734]/40 px-2 py-1 rounded text-[#F59E0B]">Tehran Time (+03:30)</span>
        </div>
        
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <Filter className="h-3 w-3 text-[#F59E0B]" />
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="bg-black/30 border border-[#232734]/30 rounded outline-none py-1 px-2 cursor-pointer focus:ring-0 text-[#FFFFFF]"
            >
              <option value="ALL">All Currencies</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="JPY">JPY</option>
              <option value="CAD">CAD</option>
              <option value="AUD">AUD</option>
              <option value="NZD">NZD</option>
              <option value="CHF">CHF</option>
            </select>
          </div>
          
          <div className="flex items-center gap-1.5">
            <select
              value={selectedImpact}
              onChange={(e) => setSelectedImpact(e.target.value)}
              className="bg-black/30 border border-[#232734]/30 rounded outline-none py-1 px-2 cursor-pointer focus:ring-0 text-[#FFFFFF]"
            >
              <option value="ALL">All Impacts</option>
              <option value="High">High Impact</option>
              <option value="Medium">Medium Impact</option>
            </select>
          </div>

          <button onClick={handleSyncForexFactory} className="flex items-center gap-1 text-[#F59E0B] hover:text-[#FFFFFF] transition-colors cursor-pointer">
            <RefreshCw className={`h-3 w-3 ${isSyncingFF ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* ForexFactory Style Table */}
      <div className="overflow-x-auto border border-[#E2E8F0] dark:border-[#232734]/30 rounded-b-xl shadow-sm bg-white dark:bg-[#0B0C10] -mt-6">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="dark:bg-[#14161D] bg-[#F59E0B] text-[#FFFFFF] text-[11px] uppercase font-bold border-b dark:border-[#232734]/30 border-[#232734]">
              <th className="py-2.5 px-3 text-center w-20">Date</th>
              <th className="py-2.5 px-3 text-right w-24">Time</th>
              <th className="py-2.5 px-3 text-center w-16">Currency</th>
              <th className="py-2.5 px-3 text-center w-16">Impact</th>
              <th className="py-2.5 px-3">Event</th>
              <th className="py-2.5 px-3 text-center w-16">Detail</th>
              <th className="py-2.5 px-3 text-center w-24">Actual</th>
              <th className="py-2.5 px-3 text-center w-24">Forecast</th>
              <th className="py-2.5 px-3 text-center w-24">Previous</th>
              <th className="py-2.5 px-3 text-center w-12">Graph</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map((event, index) => {
              // Logic to hide repeated Date/Time (grouping effect like ForexFactory)
              const prevEvent = index > 0 ? filteredEvents[index - 1] : null;
              
              const showDate = !prevEvent || prevEvent.tehranDateDisplay !== event.tehranDateDisplay;
              
              // Show time if it's a new date, or if the time is different from previous
              const showTime = showDate || (prevEvent && prevEvent.tehranTimeDisplay !== event.tehranTimeDisplay);
              
              const isExpanded = expandedRowId === event.id;
              
              return (
                <React.Fragment key={event.id}>
                  {/* Date Separator Row (Optional, FF adds visual separation for new days) */}
                  {showDate && index > 0 && (
                    <tr className="border-t border-[#E2E8F0] dark:border-[#232734]/25"></tr>
                  )}
                  
                  <tr className={`border-b border-gray-100 dark:border-[#232734]/15 hover:bg-slate-50 dark:hover:bg-[#14161D]/40 transition-colors ${showDate ? 'border-t border-[#E2E8F0] dark:border-[#232734]/25' : ''}`}>
                    
                    {/* Date Column */}
                    <td className="py-2.5 px-3 text-center align-top border-r border-gray-100 dark:border-[#232734]/15">
                      {showDate && (
                        <div className="flex flex-col text-slate-600 dark:text-[#94A3B8]">
                          <span className="font-semibold text-xs text-[#FFFFFF]">{event.dayNameDisplay}</span>
                          <span className="text-[11px]">{event.tehranDateDisplay}</span>
                        </div>
                      )}
                    </td>
                    
                    {/* Time Column */}
                    <td className="py-2.5 px-3 text-right text-xs text-slate-500 dark:text-[#94A3B8] align-top">
                      {showTime && (
                        <span>{event.tehranTimeDisplay}</span>
                      )}
                    </td>
                    
                    {/* Currency Column */}
                    <td className="py-2.5 px-3 text-center align-middle font-bold text-slate-700 dark:text-[#FFFFFF] text-xs">
                      {event.currency}
                    </td>
                    
                    {/* Impact Column (Colored Icon) */}
                    <td className="py-2.5 px-3 text-center align-middle">
                      <div className="flex justify-center">
                        <div 
                          className={`w-3.5 h-3.5 rounded-sm shadow-sm ${getImpactIcon(event.impact)}`}
                          title={`${event.impact} Impact`}
                        ></div>
                      </div>
                    </td>
                    
                    {/* Event Title */}
                    <td className="py-2.5 px-3 align-middle text-slate-800 dark:text-[#FFFFFF] font-medium">
                      {event.title}
                    </td>
                    
                    {/* Detail Icon */}
                    <td className="py-2.5 px-3 text-center align-middle">
                      <button 
                        onClick={() => handleToggleDetail(event)}
                        className="p-1 rounded hover:bg-amber-100 dark:hover:bg-[#232734]/30 transition-colors inline-flex justify-center items-center group cursor-pointer"
                        title="Open AI Analysis"
                      >
                        {isExpanded ? (
                          <FolderOpen className="h-4 w-4 text-[#F59E0B]" />
                        ) : (
                          <Folder className="h-4 w-4 text-[#F59E0B]/70 group-hover:text-[#F59E0B]" />
                        )}
                      </button>
                    </td>
                    
                    {/* Actual */}
                    <td className={`py-2.5 px-3 text-center align-middle text-xs ${getActualColorClass(event.actual, event.forecast, event.previous)}`}>
                      {event.actual || ""}
                    </td>
                    
                    {/* Forecast */}
                    <td className="py-2.5 px-3 text-center align-middle text-xs text-slate-600 dark:text-[#94A3B8]">
                      {event.forecast || ""}
                    </td>
                    
                    {/* Previous */}
                    <td className="py-2.5 px-3 text-center align-middle text-xs text-slate-600 dark:text-[#94A3B8]">
                      {event.previous || ""}
                    </td>
                    
                    {/* Graph Icon */}
                    <td className="py-2.5 px-3 text-center align-middle">
                      <BarChart2 className="h-4 w-4 text-[#F59E0B] inline-block opacity-80" />
                    </td>
                  </tr>
                  
                  {/* Expanded Detail Row (AI Analysis in Persian) */}
                  {isExpanded && (
                    <tr className="bg-slate-50 dark:bg-[#0B0C10]/90 shadow-inner">
                      <td colSpan={10} className="p-0 border-b border-gray-200 dark:border-[#232734]/30">
                        <div className="p-6">
                          <div className="bg-white dark:bg-[#14161D] border border-amber-200 dark:border-[#232734]/40 rounded-xl p-5 shadow-sm">
                            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-[#232734]/25 pb-3 mb-4">
                              <Brain className="h-5 w-5 text-[#F59E0B]" />
                              <h3 className="font-bold text-slate-800 dark:text-[#FFFFFF] font-persian" dir="rtl">
                                تحلیل هوش مصنوعی خبر: {event.title}
                              </h3>
                            </div>
                            
                            {isAnalyzing ? (
                              <div className="flex flex-col items-center justify-center py-6 gap-3">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#F59E0B]"></div>
                                <span className="text-xs text-[#F59E0B] font-persian">در حال دریافت تفسیر فارسی...</span>
                              </div>
                            ) : (
                              <div dir="rtl" className="font-persian text-sm leading-relaxed text-slate-700 dark:text-[#FFFFFF]">
                                {event.aiNewsAnalysis ? (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                      <div>
                                        <h4 className="font-bold text-[#F59E0B] text-xs mb-1">توضیحات خبر</h4>
                                        <p className="dark:text-[#94A3B8]">{event.aiNewsAnalysis.explanationFa}</p>
                                      </div>
                                      <div>
                                        <h4 className="font-bold text-[#F59E0B] text-xs mb-1">سناریوی صعودی (Bullish)</h4>
                                        <p className="text-[#10B981] font-semibold">{event.aiNewsAnalysis.bullishScenarioFa}</p>
                                      </div>
                                      <div>
                                        <h4 className="font-bold text-[#F59E0B] text-xs mb-1">سناریوی نزولی (Bearish)</h4>
                                        <p className="text-[#EF4444] font-semibold">{event.aiNewsAnalysis.bearishScenarioFa}</p>
                                      </div>
                                    </div>
                                    <div className="space-y-4 bg-slate-100 dark:bg-[#0B0C10]/70 p-4 rounded-xl border border-slate-200 dark:border-[#232734]/25">
                                      <div>
                                        <h4 className="font-bold text-[#F59E0B] text-xs mb-1">دارایی‌های تحت تاثیر</h4>
                                        <ul className="list-disc list-inside space-y-1 text-xs dark:text-[#94A3B8]">
                                          <li><span className="font-bold text-[#FFFFFF]">طلا (XAUUSD):</span> {event.aiNewsAnalysis.affectedAssetsFa?.goldXAUUSD}</li>
                                          <li><span className="font-bold text-[#FFFFFF]">شاخص دلار (DXY):</span> {event.aiNewsAnalysis.affectedAssetsFa?.dxyIndex}</li>
                                        </ul>
                                      </div>
                                      <div>
                                        <h4 className="font-bold text-[#F59E0B] text-xs mb-1">نوسان مورد انتظار</h4>
                                        <p className="dark:text-[#94A3B8]">{event.aiNewsAnalysis.expectedVolatilityFa}</p>
                                      </div>
                                      <div>
                                        <h4 className="font-bold text-[#F59E0B] text-xs mb-1">رویکرد پیشنهادی ترید</h4>
                                        <p className="dark:text-[#94A3B8]">{event.aiNewsAnalysis.suggestedTradingApproachFa}</p>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-slate-500 italic">محتوایی یافت نشد.</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            
            {filteredEvents.length === 0 && (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-500">
                  No economic events found for the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
