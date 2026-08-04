"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/glass/GlassCard";
import { GlassButton } from "@/components/ui/glass/GlassButton";
import { GlassBadge } from "@/components/ui/glass/GlassBadge";
import { parseMT4Report } from "@/lib/importers/mt4-parser";
import { parseMT5Report } from "@/lib/importers/mt5-parser";
import { parseCSVReport } from "@/lib/importers/csv-parser";
import { loadTrades, saveTrades } from "@/lib/storage/store";
import { Trade } from "@/types/trade";
import { UploadCloud, FileText, CheckCircle, Zap, RefreshCw, AlertCircle, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ImportPage() {
  const router = useRouter();
  const [parsedTrades, setParsedTrades] = useState<Trade[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"MT4" | "MT5" | "CSV" | "XML">("MT4");
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const processContent = (content: string, name: string) => {
    let results: Trade[] = [];
    const cleanContent = content.replace(/\0/g, "");

    if (name.toLowerCase().endsWith(".csv")) {
      setFileType("CSV");
      results = parseCSVReport(cleanContent);
    } else if (name.toLowerCase().endsWith(".html") || name.toLowerCase().endsWith(".htm")) {
      if (cleanContent.includes("MetaTrader 5") || cleanContent.includes("MT5")) {
        setFileType("MT5");
        results = parseMT5Report(cleanContent);
      } else {
        setFileType("MT4");
        results = parseMT4Report(cleanContent);
      }
    } else {
      results = parseCSVReport(cleanContent);
      if (results.length === 0) results = parseMT4Report(cleanContent);
    }

    if (results.length === 0) {
      setParseError("0 trades were found in the file. Please check if it is a valid MT4/MT5 HTML Detailed Report or CSV export.");
    } else {
      setParseError(null);
    }

    setParsedTrades(results);
    setIsProcessing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);
    setImportSuccess(false);
    setParseError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      let content = event.target?.result as string;

      // Detect UTF-16LE encoding (common in MT4/MT5 exported HTML reports)
      if (content.includes("\u0000") || content.includes("\0")) {
        const utf16Reader = new FileReader();
        utf16Reader.onload = (utf16Event) => {
          const utf16Content = utf16Event.target?.result as string;
          processContent(utf16Content || content, file.name);
        };
        utf16Reader.readAsText(file, "utf-16le");
      } else {
        processContent(content, file.name);
      }
    };

    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (parsedTrades.length === 0) return;
    const existing = loadTrades();
    const merged = [...parsedTrades, ...existing];
    saveTrades(merged);
    setImportSuccess(true);

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("storage"));
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  };

  const handleLoadSampleData = () => {
    setFileName("Sample_MT4_Report.html");
    setFileType("MT4");
    const sampleTrades: Trade[] = [
      {
        id: "sample-1",
        accountId: "default-acc-1",
        ticket: 8840121,
        symbol: "XAUUSD",
        orderType: "BUY",
        lotSize: 0.5,
        openTime: new Date(Date.now() - 86400000 * 2).toISOString(),
        closeTime: new Date(Date.now() - 86400000 * 2 + 3600000).toISOString(),
        entryPrice: 2345.50,
        exitPrice: 2362.10,
        stopLoss: 2338.00,
        takeProfit: 2370.00,
        commission: -3.50,
        swap: -0.80,
        profit: 830.00,
        balanceAfterTrade: 10830.00,
        durationMinutes: 60,
        rrRatio: 2.2,
      },
      {
        id: "sample-2",
        accountId: "default-acc-1",
        ticket: 8840125,
        symbol: "EURUSD",
        orderType: "SELL",
        lotSize: 1.0,
        openTime: new Date(Date.now() - 86400000).toISOString(),
        closeTime: new Date(Date.now() - 86400000 + 1800000).toISOString(),
        entryPrice: 1.0850,
        exitPrice: 1.0820,
        stopLoss: 1.0880,
        takeProfit: 1.0790,
        commission: -7.00,
        swap: 0,
        profit: 300.00,
        balanceAfterTrade: 11123.00,
        durationMinutes: 30,
        rrRatio: 1.0,
      },
    ];
    setParsedTrades(sampleTrades);
    setParseError(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold dark:text-white text-slate-900 flex items-center gap-3">
            <UploadCloud className="h-8 w-8 text-sky-500" />
            <span>MetaTrader Trade Importer</span>
          </h1>
          <p className="mt-1 text-xs dark:text-slate-400 text-slate-600">
            Upload MT4 HTML, MT5 HTML, or CSV reports. The system automatically parses tickets, entry/exit prices, profit, commission, and swap.
          </p>
        </div>

        <GlassButton variant="secondary" size="sm" onClick={handleLoadSampleData}>
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span>Load Demo Sample Data</span>
        </GlassButton>
      </div>

      {/* Upload Zone */}
      <GlassCard glowColor="cyan" className="p-10 text-center border-dashed border-2 border-sky-500/40">
        <input
          type="file"
          accept=".html,.htm,.csv,.xml,.txt"
          onChange={handleFileUpload}
          className="hidden"
          id="file-upload-input"
        />
        <label
          htmlFor="file-upload-input"
          className="flex flex-col items-center justify-center cursor-pointer space-y-4"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-500/10 text-sky-400 shadow-neon-cyan">
            {isProcessing ? <RefreshCw className="h-8 w-8 animate-spin" /> : <FileText className="h-8 w-8" />}
          </div>
          <div>
            <h3 className="text-lg font-bold dark:text-white text-slate-900">
              {fileName ? `Loaded: ${fileName}` : "Click or Drag MetaTrader File Here"}
            </h3>
            <p className="mt-1 text-xs dark:text-slate-400 text-slate-600">
              Supports MT4 Detailed HTML Report, MT5 Positions HTML, CSV, and Text Reports
            </p>
          </div>
          <GlassButton variant="primary" size="md">
            <span>Browse Files</span>
          </GlassButton>
        </label>
      </GlassCard>

      {/* Error Alert */}
      {parseError && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-950/20 p-4 text-rose-300 text-xs flex items-center gap-3 font-persian" dir="rtl">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
          <span>{parseError}</span>
        </div>
      )}

      {/* Extracted Trades Preview */}
      {parsedTrades.length > 0 && (
        <GlassCard className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold dark:text-white text-slate-900">Extracted Trades Preview</h2>
              <GlassBadge variant="cyan">{fileType} Format</GlassBadge>
              <GlassBadge variant="profit">{parsedTrades.length} Trades Found</GlassBadge>
            </div>

            <GlassButton variant="gold" onClick={handleConfirmImport} disabled={importSuccess}>
              {importSuccess ? (
                <>
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span>Imported Successfully! Redirecting to Dashboard...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  <span>Confirm & Save to Journal</span>
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
                {parsedTrades.slice(0, 15).map((t) => (
                  <tr key={t.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-2.5 font-mono text-slate-400">#{t.ticket}</td>
                    <td className="py-2.5 font-bold dark:text-white text-slate-900">{t.symbol}</td>
                    <td className="py-2.5">
                      <GlassBadge variant={t.orderType === "BUY" ? "profit" : "loss"}>
                        {t.orderType}
                      </GlassBadge>
                    </td>
                    <td className="py-2.5 dark:text-slate-300 text-slate-700">{t.lotSize}</td>
                    <td className="py-2.5 dark:text-slate-400 text-slate-600">{t.openTime.split("T")[0]}</td>
                    <td className="py-2.5 dark:text-slate-300 text-slate-700">{t.entryPrice}</td>
                    <td className="py-2.5 dark:text-slate-300 text-slate-700">{t.exitPrice}</td>
                    <td className={`py-2.5 font-bold ${t.profit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      ${t.profit}
                    </td>
                    <td className="py-2.5">
                      {t.isPartialClose && <GlassBadge variant="gold">Partial</GlassBadge>}
                      {t.isBreakEven && <GlassBadge variant="neutral">BE</GlassBadge>}
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
