import { parseMT4Report } from "./mt4-parser";
import { parseMT5Report } from "./mt5-parser";
import { Trade } from "@/types/trade";

export function parseUniversalReport(content: string): Trade[] {
  if (!content || typeof window === "undefined") return [];

  // Try MT5 Positions Parser first
  const mt5Trades = parseMT5Report(content);
  if (mt5Trades && mt5Trades.length > 0) {
    return mt5Trades;
  }

  // Try MT4 Parser
  const mt4Trades = parseMT4Report(content);
  if (mt4Trades && mt4Trades.length > 0) {
    return mt4Trades;
  }

  return [];
}
