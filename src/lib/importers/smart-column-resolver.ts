import { Trade, OrderType } from "@/types/trade";
import { parseCloseTime } from "@/lib/utils/date-utils";

/**
 * 1. ROBUST ENCODING DECODING (UTF-16 & UTF-8 Handling)
 * Strips null bytes (\u0000) and BOM markers (\uFEFF, \uFFFE).
 */
export function cleanRawContent(content: string): string {
  if (!content) return "";
  return content
    .replace(/\uFEFF|\uFFFE|\0/g, "")
    .replace(/\r\n/g, "\n");
}

/**
 * 2. SAFE SECTION ISOLATION
 */
export function isolatePositionsSection(htmlOrText: string): string {
  const clean = cleanRawContent(htmlOrText);
  const lower = clean.toLowerCase();

  let startIndex = lower.indexOf("positions");
  if (startIndex === -1) {
    startIndex = lower.indexOf("closed transactions");
  }
  if (startIndex === -1) {
    startIndex = lower.indexOf("تراکنش‌های بسته شده");
  }
  if (startIndex === -1) {
    startIndex = lower.indexOf("معاملات");
  }
  if (startIndex === -1) {
    startIndex = 0;
  }

  const isolatedFromStart = clean.substring(startIndex);
  if (isolatedFromStart.length < 300 || (!isolatedFromStart.toLowerCase().includes("buy") && !isolatedFromStart.toLowerCase().includes("sell"))) {
    return clean;
  }

  return isolatedFromStart;
}

/**
 * 4. SMART NUMBER PARSER (Preserves 0 values!)
 */
export function parseSmartNumber(str: string): number | null {
  if (str === undefined || str === null) return null;
  let cleaned = str.trim().replace(/[$€£\s]/g, "");
  if (!cleaned) return null;

  if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(cleaned)) {
    cleaned = cleaned.replace(/,/g, "");
  } else if (/^-?\d+,\d+$/.test(cleaned)) {
    cleaned = cleaned.replace(/,/g, ".");
  }

  cleaned = cleaned.replace(/[^0-9.-]/g, "");
  if (!cleaned || cleaned === "-") return null;
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

/**
 * Strict DateTime Regex Matcher (Year bounded 2000-2035).
 */
export function resolveStrictDateTime(raw?: string): { iso: string; timestamp: number } | null {
  if (!raw || typeof raw !== "string") return null;
  const cleaned = raw.trim();
  if (!cleaned) return null;

  // YYYY.MM.DD or YYYY-MM-DD
  const yyyyMatch = cleaned.match(/(\d{4})[.\/-](\d{1,2})[.\/-](\d{1,2})(?:\s+|_)?(\d{1,2}):(\d{2})(?::(\d{2}))?/);
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

  // European format: DD.MM.YYYY
  const euroMatch = cleaned.match(/(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})(?:\s+|_)?(\d{1,2}):(\d{2})(?::(\d{2}))?/);
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

  const ts = parseCloseTime(cleaned);
  if (ts > 0) {
    const d = new Date(ts);
    const y = d.getUTCFullYear();
    if (y >= 2000 && y <= 2035) {
      return { iso: d.toISOString(), timestamp: ts };
    }
  }

  return null;
}

/**
 * 3. DYNAMIC CELL PARSING VIA SEMANTIC ANCHORS
 */
export function parseRowSemanticAnchors(
  cells: string[],
  rowIdx: number,
  activeAccountId: string
): Trade | null {
  if (!cells || cells.length < 4) return null;

  const fullRowStr = cells.join(" ").toLowerCase();

  // Exclude header / summary / balance rows
  if (
    fullRowStr.includes("total") ||
    fullRowStr.includes("balance") ||
    fullRowStr.includes("credit") ||
    fullRowStr.includes("deposit") ||
    fullRowStr.includes("withdraw") ||
    (fullRowStr.includes(" in ") && !fullRowStr.includes("out") && !fullRowStr.includes("in/out"))
  ) {
    return null;
  }

  // Anchor 1: Direction Anchor ("BUY" or "SELL")
  let directionIdx = -1;
  let direction: OrderType | null = null;

  cells.forEach((c, idx) => {
    const lower = c.toLowerCase().trim();
    if (lower === "buy" || lower.includes("buy") || lower === "خرید") {
      directionIdx = idx;
      direction = "BUY";
    } else if (lower === "sell" || lower.includes("sell") || lower === "فروش") {
      directionIdx = idx;
      direction = "SELL";
    }
  });

  if (!direction || directionIdx === -1) return null;

  // Anchor 2: DateTime Anchors
  const dateAnchors: { iso: string; timestamp: number; cellIdx: number }[] = [];
  cells.forEach((c, idx) => {
    const resolved = resolveStrictDateTime(c);
    if (resolved) {
      dateAnchors.push({ ...resolved, cellIdx: idx });
    }
  });

  if (dateAnchors.length === 0) return null;

  const openTimeObj = dateAnchors[0];
  const closeTimeObj = dateAnchors[1] || dateAnchors[0];

  // Anchor 3: Ticket Anchor (MUST NOT BE A DATE CELL!)
  let ticket = 0;
  for (let i = 0; i < cells.length; i++) {
    const cellText = cells[i].trim();
    if (resolveStrictDateTime(cellText)) continue;

    const cleanNum = cellText.replace(/[^0-9]/g, "");
    if (cleanNum.length >= 4 && cleanNum.length <= 12) {
      const parsed = parseInt(cleanNum, 10);
      if (!isNaN(parsed) && parsed >= 1000 && !cleanNum.startsWith("202") && !cleanNum.startsWith("203")) {
        ticket = parsed;
        break;
      }
    }
  }
  if (ticket === 0) {
    for (let i = 0; i < cells.length; i++) {
      const cellText = cells[i].trim();
      if (resolveStrictDateTime(cellText)) continue;
      const cleanNum = cellText.replace(/[^0-9]/g, "");
      const parsed = parseInt(cleanNum, 10);
      if (!isNaN(parsed) && parsed >= 100 && !cleanNum.startsWith("202") && !cleanNum.startsWith("203")) {
        ticket = parsed;
        break;
      }
    }
  }
  if (ticket === 0) ticket = Date.now() + rowIdx;

  // Anchor 4: Symbol / Asset Anchor
  let symbol = "";
  for (const c of cells) {
    const uppercase = c.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (
      uppercase.length >= 3 &&
      uppercase.length <= 10 &&
      !uppercase.includes("BUY") &&
      !uppercase.includes("SELL") &&
      !uppercase.includes("TOTAL") &&
      !/^\d+$/.test(uppercase)
    ) {
      symbol = uppercase;
      break;
    }
  }
  if (!symbol) symbol = "XAUUSD";

  // Anchor 5: All Raw Numeric Cells
  const numericCells: { val: number; cellIdx: number }[] = [];

  cells.forEach((c, idx) => {
    if (resolveStrictDateTime(c)) return;
    const uppercase = c.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (uppercase === symbol || uppercase.includes("BUY") || uppercase.includes("SELL")) return;

    const num = parseSmartNumber(c);
    if (num !== null) {
      const absVal = Math.abs(num);
      if (Math.floor(absVal) === ticket || (absVal > 100000 && Number.isInteger(absVal))) {
        return;
      }
      numericCells.push({ val: num, cellIdx: idx });
    }
  });

  if (numericCells.length < 2) return null;

  // PROFIT is ALWAYS the VERY LAST numeric cell in the row!
  const profitCell = numericCells[numericCells.length - 1];
  let profit = profitCell.val;

  // Swap is second to last numeric cell (if 3+ exist)
  let swap = numericCells.length >= 3 ? numericCells[numericCells.length - 2].val : 0;

  // Commission is third to last numeric cell (if 4+ exist)
  let commission = numericCells.length >= 4 ? numericCells[numericCells.length - 3].val : 0;

  // Lot Size = First numeric cell in sequence matching 0.01 - 500
  const lotCell = numericCells.find((n) => n.val >= 0.01 && n.val <= 500);
  const lotSize = lotCell ? lotCell.val : 0.1;
  const lotCellIdx = lotCell ? lotCell.cellIdx : -1;

  // MARKET PRICES: Filter out lotCellIdx and profitCell.cellIdx
  const marketPriceCells = numericCells.filter(
    (n) => n.cellIdx !== lotCellIdx && n.cellIdx !== profitCell.cellIdx && n.val > 0.0001
  );

  // ENTRY PRICE: First market price cell AFTER Open Time cell index
  let entryPriceObj = marketPriceCells.find((n) => n.cellIdx > openTimeObj.cellIdx);
  if (!entryPriceObj && marketPriceCells.length > 0) {
    entryPriceObj = marketPriceCells[0];
  }
  let entryPrice = entryPriceObj ? entryPriceObj.val : 1.0;

  // EXIT PRICE: First market price cell AFTER Close Time cell index (or second market price candidate)
  let exitPriceObj = marketPriceCells.find(
    (n) => n.cellIdx > closeTimeObj.cellIdx && n.cellIdx !== entryPriceObj?.cellIdx
  );
  if (!exitPriceObj && marketPriceCells.length > 1) {
    exitPriceObj = marketPriceCells.find((n) => n.cellIdx !== entryPriceObj?.cellIdx);
  }
  let exitPrice = exitPriceObj ? exitPriceObj.val : entryPrice;

  // FAIL-SAFE 1: If entryPrice equals lotSize, fix it immediately
  if (entryPrice === lotSize) {
    const validPrices = marketPriceCells.filter((n) => n.val !== lotSize);
    if (validPrices.length > 0) entryPrice = validPrices[0].val;
    if (validPrices.length > 1) exitPrice = validPrices[1].val;
  }

  // FAIL-SAFE 2: If profit equals exitPrice or entryPrice AND > 100, profit is $0.00!
  if ((profit === exitPrice || profit === entryPrice) && Math.abs(profit) > 100) {
    profit = 0;
  }

  const durationMinutes = Math.max(
    1,
    Math.round((closeTimeObj.timestamp - openTimeObj.timestamp) / 60000) || 15
  );

  return {
    id: `semantic-${ticket}-${rowIdx}`,
    accountId: activeAccountId,
    ticket,
    symbol,
    orderType: direction,
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
