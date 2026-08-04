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
import { UploadCloud, FileText, CheckCircle, ArrowRight, Zap, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ImportPage() {
  const router = useRouter();
  const [parsedTrades, setParsedTrades] = useState<Trade[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"MT4" | "MT5" | "CSV" | "XML">("MT4");
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);
    setImportSuccess(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      let results: Trade[] = [];

      if (file.name.toLowerCase().endsWith(".csv")) {
        setFileType("CSV");
        results = parseCSVReport(content);
      } else if (file.name.toLowerCase().endsWith(".html") || file.name.toLowerCase().endsWith(".htm")) {
        if (content.includes("MetaTrader 5") || content.includes("MT5")) {
          setFileType("MT5");
          results = parseMT5Report(content);
        } else {
          setFileType("MT4");
          results = parseMT4Report(content);
        }
      } else {
        results = parseCSVReport(content);
      }

      setParsedTrades(results);
      setIsProcessing(false);
    };

    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (parsedTrades.length === 0) return;
    const existing = loadTrades();
    const merged = [...parsedTrades, ...existing];
    saveTrades(merged);
    setImportSuccess(true);
    setTimeout(() => {
      router.push("/");
    }, 1200);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <UploadCloud className="h-8 w-8 text-sky-400" />
          <span>MetaTrader Trade Importer</span>
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Upload MT4 HTML, MT5 HTML, or CSV reports. The system automatically extracts tickets, prices, duration, R:R, partial closes, and break-even trades.
        </p>
      </div>

      {/* Upload Zone */}
      <GlassCard glowColor="cyan" className="p-10 text-center border-dashed border-2 border-sky-500/30">
        <input
          type="file"
          accept=".html,.htm,.csv,.xml"
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
            <h3 className="text-lg font-bold text-white">
              {fileName ? `Loaded: ${fileName}` : "Click or Drag MetaTrader File Here"}
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Supports MT4 Detailed HTML Report, MT5 Positions HTML, CSV, and XML
            </p>
          </div>
          <GlassButton variant="primary" size="md">
            <span>Browse Files</span>
          </GlassButton>
        </label>
      </GlassCard>

      {/* Extracted Trades Preview */}
      {parsedTrades.length > 0 && (
        <GlassCard className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-white">Extracted Trades Preview</h2>
              <GlassBadge variant="cyan">{fileType} Format</GlassBadge>
              <GlassBadge variant="profit">{parsedTrades.length} Trades Found</GlassBadge>
            </div>

            <GlassButton variant="gold" onClick={handleConfirmImport} disabled={importSuccess}>
              {importSuccess ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Imported Successfully! Redirecting...</span>
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
              <thead className="border-b border-white/10 text-slate-400 uppercase">
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
              <tbody className="divide-y divide-white/5">
                {parsedTrades.slice(0, 15).map((t) => (
                  <tr key={t.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-2.5 font-mono text-slate-400">#{t.ticket}</td>
                    <td className="py-2.5 font-bold text-white">{t.symbol}</td>
                    <td className="py-2.5">
                      <GlassBadge variant={t.orderType === "BUY" ? "profit" : "loss"}>
                        {t.orderType}
                      </GlassBadge>
                    </td>
                    <td className="py-2.5 text-slate-300">{t.lotSize}</td>
                    <td className="py-2.5 text-slate-400">{t.openTime.split("T")[0]}</td>
                    <td className="py-2.5 text-slate-300">{t.entryPrice}</td>
                    <td className="py-2.5 text-slate-300">{t.exitPrice}</td>
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
