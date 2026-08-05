import { Trade, OrderType } from "@/types/trade";
import { getActiveAccountId } from "@/lib/storage/store";
import { parseCloseTime } from "@/lib/utils/date-utils";

/**
 * Strict RegEx-based Date String Resolver.
 * Guarantees years stay within 2000-2035 (eliminates year 4054 bugs).
 */
export function resolveStrictDateTime(raw?: string): { iso: string; timestamp: number } | null {
  if (!raw || typeof raw !== "string") return null;
  const cleaned = raw.trim();
  if (!cleaned) return null;

  // 1. YYYY.MM.DD HH:MM:SS or YYYY-MM-DD HH:MM:SS
  const yyyyMatch = cleaned.match(/^(\d{4})[.\/-](\d{1,2})[.\/-](\d{1,2})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (yyyyMatch) {
    let [, yearStr, monthStr, dayStr, hhStr = "00", mmStr = "00", ssStr = "00"] = yyyyMatch;
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    const day = parseInt(dayStr, 10);
    const hh = parseInt(hhStr, 10);
    const mm = parseInt(mmStr, 10);
    const ss = parseInt(ssStr, 10);

    if (year >= 2000 && year <= 2035 && month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      const d = new Date(Date.UTC(year, month, day, hh, mm, ss));
      if (!isNaN(d.getTime())) {
        return { iso: d.toISOString(), timestamp: d.getTime() };
      }
    }
  }

  // 2. DD.MM.YYYY HH:MM:SS (European Format)
  const euroMatch = cleaned.match(/^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (euroMatch) {
    let [, dayStr, monthStr, yearStr, hhStr = "00", mmStr = "00", ssStr = "00"] = euroMatch;
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    const day = parseInt(dayStr, 10);
    const hh = parseInt(hhStr, 10);
    const mm = parseInt(mmStr, 10);
    const ss = parseInt(ssStr, 10);

    if (year >= 2000 && year <= 2035 && month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      const d = new Date(Date.UTC(year, month, day, hh, mm, ss));
      if (!isNaN(d.getTime())) {
        return { iso: d.toISOString(), timestamp: d.getTime() };
      }
    }
  }

  // 3. General Fallback via parseCloseTime
  const ts = parseCloseTime(cleaned);
  if (ts > 0) {
    const d = new Date(ts);
    const y = d.getFullYear();
    if (y >= 2000 && y <= 2035) {
      return { iso: d.toISOString(), timestamp: ts };
    }
  }

  return null;
}

/**
 * Intelligent Dynamic Cell Classifier Engine.
 * Extracts fields from ANY row dynamically, completely independent of column order!
 */
export function parseRowSmart(cells: string[], rowIdx: number, activeAccountId: string): Trade | null {
  if (!cells || cells.length < 5) return null;

  const fullRowStr = cells.join(" ").toLowerCase();

  // Skip summary, balance, deposit, credit, headers, or "in" deal rows
  if (
    fullRowStr.includes("total") ||
    fullRowStr.includes("balance") ||
    fullRowStr.includes("credit") ||
    fullRowStr.includes("deposit") ||
    fullRowStr.includes("withdraw") ||
    fullRowStr.includes("closed transactions") ||
    fullRowStr.includes("open trades") ||
    fullRowStr.includes("ticket") ||
    (fullRowStr.includes(" in ") && !fullRowStr.includes("out"))
  ) {
    return null;
  }

  // 1. Detect Order Type (BUY or SELL)
  let orderType: OrderType | null = null;
  for (const c of cells) {
    const lower = c.toLowerCase().trim();
    if (lower === "buy" || lower.includes("buy") || lower === "خرید") {
      orderType = "BUY";
      break;
    }
    if (lower === "sell" || lower.includes("sell") || lower === "فروش") {
      orderType = "SELL";
      break;
    }
  }
  if (!orderType) return null;

  // 2. Detect Date Strings
  const dateCandidates: { iso: string; timestamp: number }[] = [];
  cells.forEach((c) => {
    const resolved = resolveStrictDateTime(c);
    if (resolved) {
      dateCandidates.push(resolved);
    }
  });

  // Must have at least 1 valid date string (e.g. close time or open time)
  if (dateCandidates.length === 0) return null;

  const openTimeObj = dateCandidates[0];
  const closeTimeObj = dateCandidates[1] || dateCandidates[0];

  // 3. Detect Symbol (e.g. XAUUSD, EURUSD, GBPUSD, BTCUSD, US30, GOLD)
  let symbol = "";
  for (const c of cells) {
    const cleanSym = c.toUpperCase().replace(/[^A-Z0-9]/g, "");
    // Symbol must be 3-10 characters long and NOT match BUY/SELL/NUMERIC
    if (
      cleanSym.length >= 3 &&
      cleanSym.length <= 10 &&
      !cleanSym.includes("BUY") &&
      !cleanSym.includes("SELL") &&
      !cleanSym.includes("TOTAL") &&
      !/^\d+$/.test(cleanSym)
    ) {
      symbol = cleanSym;
      break;
    }
  }
  if (!symbol) symbol = "XAUUSD";

  // 4. Detect Ticket Number (Integer >= 1000 or 5+ digits)
  let ticket = 0;
  for (const c of cells) {
    const cleanNum = c.replace(/[^0-9]/g, "");
    if (cleanNum.length >= 4 && cleanNum.length <= 12) {
      const num = parseInt(cleanNum, 10);
      if (!isNaN(num) && num > 1000) {
        ticket = num;
        break;
      }
    }
  }
  if (ticket === 0) ticket = Date.now() + rowIdx;

  // 5. Extract Numeric Values (Prices, Lot, Commission, Swap, Profit)
  const floatValues: number[] = [];
  cells.forEach((c) => {
    // Exclude date strings and symbols from float parsing
    if (resolveStrictDateTime(c)) return;
    const cleanFloat = c.replace(/[^0-9.-]/g, "");
    if (cleanFloat && cleanFloat !== "-") {
      const parsed = parseFloat(cleanFloat);
      if (!isNaN(parsed)) {
        floatValues.push(parsed);
      }
    }
  });

  // Ticket number should not be in float values
  const nonTicketFloats = floatValues.filter((f) => Math.floor(Math.abs(f)) !== ticket);

  // Lot Size candidate (between 0.01 and 500)
  const lotSize = nonTicketFloats.find((f) => f >= 0.01 && f <= 500 && f !== ticket) || 0.1;

  // Profit is almost always the LAST float number in the row
  const profit = nonTicketFloats.length > 0 ? nonTicketFloats[nonTicketFloats.length - 1] : 0;

  // Swap is usually the second-to-last float number (if 3+ floats exist)
  const swap = nonTicketFloats.length >= 3 ? nonTicketFloats[nonTicketFloats.length - 2] : 0;

  // Commission is usually the third-to-last float number (if 4+ floats exist)
  const commission = nonTicketFloats.length >= 4 ? nonTicketFloats[nonTicketFloats.length - 3] : 0;

  // Entry Price & Exit Price candidates (prices > 0.0001)
  const priceCandidates = nonTicketFloats.filter(
    (f) => Math.abs(f) > 0.0001 && Math.abs(f) !== Math.abs(profit) && f !== lotSize
  );

  const entryPrice = priceCandidates.length > 0 ? priceCandidates[0] : 1.0;
  const exitPrice = priceCandidates.length > 1 ? priceCandidates[1] : entryPrice;

  // Skip bogus $0.00 trades where entryPrice and exitPrice are zero
  if (entryPrice === 0 && exitPrice === 0) return null;

  const durationMinutes = Math.max(
    1,
    Math.round((closeTimeObj.timestamp - openTimeObj.timestamp) / 60000) || 15
  );

  return {
    id: `smart-${ticket}-${rowIdx}`,
    accountId: activeAccountId,
    ticket,
    symbol,
    orderType,
    lotSize,
    openTime: openTimeObj.iso,
    closeTime: closeTimeObj.iso,
    entryPrice,
    exitPrice,
    stopLoss: 0,
    takeProfit: 0,
    commission: isNaN(commission) ? 0 : commission,
    swap: isNaN(swap) ? 0 : swap,
    profit,
    balanceAfterTrade: 10000 + profit,
    durationMinutes,
    rrRatio: 2.0,
    isBreakEven: Math.abs(profit) < 1.0,
  };
}
