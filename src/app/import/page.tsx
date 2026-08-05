"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/glass/GlassCard";
import { GlassButton } from "@/components/ui/glass/GlassButton";
import { GlassBadge } from "@/components/ui/glass/GlassBadge";
import { parseMT4Report } from "@/lib/importers/mt4-parser";
import { parseMT5Report } from "@/lib/importers/mt5-parser";
import { parseCSVReport } from "@/lib/importers/csv-parser";
import { parseUniversalReport } from "@/lib/importers/universal-parser";
import { mergeAndSaveTrades, getActiveAccountId } from "@/lib/storage/store";
import { Trade } from "@/types/trade";
import {
  UploadCloud,
  FileText,
  CheckCircle,
  Zap,
  RefreshCw,
  AlertCircle,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export default function ImportPage() {
  const [parsedTrades, setParsedTrades] = useState<Trade[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"MT4" | "MT5" | "CSV" | "Universal">("MT4");
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [mergeSummary, setMergeSummary] = useState<{ newCount: number; duplicateCount: number } | null>(null);

  const processContent = (content: string, name: string) => {
    let results: Trade[] = [];
    const cleanContent = content.replace(/\0/g, "");

    try {
      if (name.toLowerCase().endsWith(".json")) {
        setFileType("MT5");
        const jsonData = JSON.parse(cleanContent);
        if (Array.isArray(jsonData)) {
          results = jsonData.map((t: any) => ({ ...t, accountId: t.accountId || getActiveAccountId() }));
        }
      } else if (name.toLowerCase().endsWith(".csv")) {
        setFileType("CSV");
        results = parseCSVReport(cleanContent);
      } else if (
        name.toLowerCase().endsWith(".html") ||
        name.toLowerCase().endsWith(".htm")
      ) {
        const lower = cleanContent.toLowerCase();
        const isMT5 =
          lower.includes("positions") &&
          !lower.includes("closed transactions");
        const isMT4 =
          lower.includes("closed transactions") ||
          lower.includes("open trades");

        if (isMT5) {
          setFileType("MT5");
          results = parseMT5Report(cleanContent);
        } else if (isMT4) {
          setFileType("MT4");
          results = parseMT4Report(cleanContent);
        } else {
          const mt5Try = parseMT5Report(cleanContent);
          if (mt5Try.length > 0) {
            setFileType("MT5");
            results = mt5Try;
          } else {
            setFileType("MT4");
            results = parseMT4Report(cleanContent);
          }
        }
      } else {
        results = parseCSVReport(cleanContent);
      }

      if (results.length === 0) {
        setFileType("Universal");
        results = parseUniversalReport(cleanContent);
      }
    } catch (err) {
      console.error("Parser error:", err);
      setParseError(
        `Parser error: ${err instanceof Error ? err.message : "Unknown error occurred while parsing the file."}`
      );
      setParsedTrades([]);
      setIsProcessing(false);
      return;
    }

    if (results.length === 0) {
      setParseError(
        "No closed trades detected in this file. Please verify it is a MetaTrader HTML Detailed Report, MT5 Positions report, or CSV export. You can also click 'Load Demo Sample Data' to test immediately."
      );
    } else {
      setParseError(null);
    }

    setParsedTrades(results);
    setMergeSummary(null);
    setIsProcessing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);
    setImportSuccess(false);
    setParseError(null);
    setMergeSummary(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      let content = event.target?.result as string;

      if (content.includes("\u0000") || content.includes("\0")) {
        const utf16Reader = new FileReader();
        utf16Reader.onload = (utf16Event) => {
          const utf16Content = utf16Event.target?.result as string;
          processContent(utf16Content || content, file.name);
        };
        utf16Reader.onerror = () => {
          console.error("UTF-16 reader error, falling back to original content");
          processContent(content, file.name);
        };
        utf16Reader.readAsText(file, "utf-16le");
      } else {
        processContent(content, file.name);
      }
    };

    reader.onerror = () => {
      setParseError("Failed to read the file. Please try again.");
      setIsProcessing(false);
    };

    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (parsedTrades.length === 0) return;

    // Smart Merge & Deduplicate
    const summary = mergeAndSaveTrades(parsedTrades);
    setMergeSummary(summary);
    setImportSuccess(true);

    if (typeof window !== "undefined") {
      setTimeout(() => {
        window.location.href = "/";
      }, 800);
    }
  };

  const handleLoadSampleData = () => {
    setFileName("Sample_MT4_Report.html");
    setFileType("MT4");
    const activeId = getActiveAccountId();
    const sampleTrades: Trade[] = [
      {
        id: "sample-1",
        accountId: activeId,
        ticket: 8840121,
        symbol: "XAUUSD",
        orderType: "BUY",
        lotSize: 0.5,
        openTime: new Date(Date.now() - 86400000 * 2).toISOString(),
        closeTime: new Date(Date.now() - 86400000 * 2 + 3600000).toISOString(),
        entryPrice: 2345.5,
        exitPrice: 2362.1,
        stopLoss: 2338.0,
        takeProfit: 2370.0,
        commission: -3.5,
        swap: -0.8,
        profit: 830.0,
        balanceAfterTrade: 10830.0,
        durationMinutes: 60,
        rrRatio: 2.2,
      },
    ];
    setParsedTrades(sampleTrades);
    setParseError(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold dark:text-white text-slate-900 flex items-center gap-3">
            <UploadCloud className="h-8 w-8 text-sky-500" />
            <span>MetaTrader Trade Importer</span>
          </h1>
          <p className="mt-1 text-xs dark:text-slate-400 text-slate-600">
            Upload MT4 HTML, MT5 HTML, or CSV reports. Smart deduplication prevents duplicate trades automatically.
          </p>
        </div>

        <GlassButton
          variant="secondary"
          size="sm"
          onClick={handleLoadSampleData}
        >
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span>Load Demo Sample Data</span>
        </GlassButton>
      </div>

      {/* Upload Zone */}
      <GlassCard
        glowColor="cyan"
        className="p-10 text-center border-dashed border-2 border-sky-500/40"
      >
        <button
          onClick={() => {
            if (confirm("Clear ALL trade data, accounts, and settings? This cannot be undone.")) {
              localStorage.clear();
              window.location.reload();
            }
          }}
          className="px-3 py-1.5 text-xs rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition-all font-bold"
        >
          Clear All Data
        </button>
        <input
          type="file"
          accept=".html,.htm,.csv,.xml,.txt,.json"
          onChange={handleFileUpload}
          className="hidden"
          id="file-upload-input"
        />
        <div
          onClick={() => document.getElementById("file-upload-input")?.click()}
          className="flex flex-col items-center justify-center cursor-pointer space-y-4"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-500/10 text-sky-400 shadow-neon-cyan">
            {isProcessing ? (
              <RefreshCw className="h-8 w-8 animate-spin" />
            ) : (
              <FileText className="h-8 w-8" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold dark:text-white text-slate-900">
              {fileName
                ? `Loaded: ${fileName}`
                : "Click or Drag MetaTrader File Here"}
            </h3>
            <p className="mt-1 text-xs dark:text-slate-400 text-slate-600">
              Supports MT4 Detailed HTML Report, MT5 Positions HTML, CSV, and Text Reports
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 px-6 py-3 text-xs font-extrabold text-black shadow-lg hover:scale-105 transition-all">
            <UploadCloud className="h-4 w-4 text-black" />
            <span>Browse & Select File</span>
          </div>
        </div>
      </GlassCard>

      {/* Error Alert */}
      {parseError && (
        <div
          className="rounded-2xl border-2 border-rose-500 bg-rose-950/40 p-5 text-rose-200 text-sm flex items-start gap-4 font-persian shadow-lg shadow-rose-900/30"
          dir="rtl"
          role="alert"
        >
          <AlertCircle className="h-6 w-6 shrink-0 text-rose-400 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-rose-300 mb-1">
              خطا در پردازش فایل
            </p>
            <p className="text-rose-200/90 leading-relaxed">{parseError}</p>
          </div>
        </div>
      )}

      {/* Extracted Trades Preview */}
      {parsedTrades.length > 0 && (
        <GlassCard className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold dark:text-white text-slate-900">
                Extracted Trades Preview
              </h2>
              <GlassBadge variant="cyan">{fileType} Format</GlassBadge>
              <GlassBadge variant="profit">
                {parsedTrades.length} Trades Extracted
              </GlassBadge>
              {mergeSummary && (
                <GlassBadge variant="gold" className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                  <span>+{mergeSummary.newCount} New / {mergeSummary.duplicateCount} Duplicates Skipped</span>
                </GlassBadge>
              )}
            </div>

            <GlassButton
              variant="gold"
              onClick={handleConfirmImport}
              disabled={importSuccess}
            >
              {importSuccess ? (
                <>
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span>Imported Successfully ({mergeSummary?.newCount || 0} New Added)! Redirecting...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  <span>Confirm & Smart Merge</span>
                </>
              )}
            </GlassButton>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b dark:border-white/10 border-slate-200 dark:text-slate-400 text-slate-600 uppercase">
                <tr>
                  <th className="pb-3">Ticket</th>
                  <th className="pb-3">Symbol</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Lots</th>
                  <th className="pb-3">Open Time</th>
                  <th className="pb-3">Entry</th>
                  <th className="pb-3">Exit</th>
                  <th className="pb-3">Profit</th>
                  <th className="pb-3">Flags</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-white/5 divide-slate-100">
                {parsedTrades.slice(0, 20).map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="py-2.5 font-mono text-slate-400">
                      #{t.ticket}
                    </td>
                    <td className="py-2.5 font-bold dark:text-white text-slate-900">
                      {t.symbol}
                    </td>
                    <td className="py-2.5">
                      <GlassBadge
                        variant={t.orderType === "BUY" ? "profit" : "loss"}
                      >
                        {t.orderType}
                      </GlassBadge>
                    </td>
                    <td className="py-2.5 dark:text-slate-300 text-slate-700">
                      {t.lotSize}
                    </td>
                    <td className="py-2.5 dark:text-slate-400 text-slate-600">
                      {t.openTime.split("T")[0]}
                    </td>
                    <td className="py-2.5 dark:text-slate-300 text-slate-700">
                      {t.entryPrice}
                    </td>
                    <td className="py-2.5 dark:text-slate-300 text-slate-700">
                      {t.exitPrice}
                    </td>
                    <td
                      className={`py-2.5 font-bold ${t.profit >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                    >
                      ${t.profit}
                    </td>
                    <td className="py-2.5">
                      {t.isPartialClose && (
                        <GlassBadge variant="gold">Partial</GlassBadge>
                      )}
                      {t.isBreakEven && (
                        <GlassBadge variant="neutral">BE</GlassBadge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
