import { Trade, OrderType } from "@/types/trade";
import { parseCloseTime } from "@/lib/utils/date-utils";

/**
 * Strict RegEx-based Date String Resolver.
 * Guarantees years stay strictly within 2000-2035 (eliminates year 4054 bugs).
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

  // 3. Fallback via parseCloseTime with year guard
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

export interface ColumnMap {
  ticketIdx: number;
  openTimeIdx: number;
  typeIdx: number;
  lotsIdx: number;
  symbolIdx: number;
  entryPriceIdx: number;
  slIdx: number;
  tpIdx: number;
  closeTimeIdx: number;
  exitPriceIdx: number;
  commissionIdx: number;
  swapIdx: number;
  profitIdx: number;
}

/**
 * Dynamically maps table headers to exact column indices.
 */
export function buildHeaderColumnMap(headerCells: string[]): ColumnMap | null {
  if (!headerCells || headerCells.length < 5) return null;

  const map: ColumnMap = {
    ticketIdx: -1,
    openTimeIdx: -1,
    typeIdx: -1,
    lotsIdx: -1,
    symbolIdx: -1,
    entryPriceIdx: -1,
    slIdx: -1,
    tpIdx: -1,
    closeTimeIdx: -1,
    exitPriceIdx: -1,
    commissionIdx: -1,
    swapIdx: -1,
    profitIdx: -1,
  };

  headerCells.forEach((cell, idx) => {
    const lower = cell.toLowerCase().trim();
    if (lower.includes("ticket") || lower.includes("order") || lower.includes("#") || lower.includes("تیکت")) {
      if (map.ticketIdx === -1) map.ticketIdx = idx;
    } else if (lower.includes("open time") || lower.includes("time") || lower.includes("زمان ورود")) {
      if (map.openTimeIdx === -1) map.openTimeIdx = idx;
      else if (map.closeTimeIdx === -1) map.closeTimeIdx = idx;
    } else if (lower.includes("close time") || lower.includes("زمان خروج")) {
      map.closeTimeIdx = idx;
    } else if (lower.includes("type") || lower.includes("cmd") || lower.includes("نوع")) {
      map.typeIdx = idx;
    } else if (lower.includes("volume") || lower.includes("size") || lower.includes("lots") || lower.includes("حجم")) {
      map.lotsIdx = idx;
    } else if (lower.includes("symbol") || lower.includes("item") || lower.includes("نماد")) {
      map.symbolIdx = idx;
    } else if (lower.includes("price") || lower.includes("قیمت")) {
      if (map.entryPriceIdx === -1) map.entryPriceIdx = idx;
      else if (map.exitPriceIdx === -1) map.exitPriceIdx = idx;
    } else if (lower.includes("s/l") || lower.includes("sl") || lower.includes("استاپ")) {
      map.slIdx = idx;
    } else if (lower.includes("t/p") || lower.includes("tp") || lower.includes("تارگت")) {
      map.tpIdx = idx;
    } else if (lower.includes("commission") || lower.includes("کمیسیون")) {
      map.commissionIdx = idx;
    } else if (lower.includes("swap") || lower.includes("سواپ")) {
      map.swapIdx = idx;
    } else if (lower.includes("profit") || lower.includes("سود")) {
      map.profitIdx = idx;
    }
  });

  // Verify at least profit or openTime was found
  if (map.profitIdx !== -1 || map.openTimeIdx !== -1) {
    return map;
  }
  return null;
}

/**
 * Intelligent Dynamic Cell Classifier Engine.
 * Parses ANY row dynamically with or without header column mapping.
 */
export function parseRowSmart(
  cells: string[],
  rowIdx: number,
  activeAccountId: string,
  columnMap?: ColumnMap | null
): Trade | null {
  if (!cells || cells.length < 5) return null;

  const fullRowStr = cells.join(" ").toLowerCase();

  // Skip header, summary, total, balance, or deposit/credit rows
  if (
    fullRowStr.includes("total") ||
    fullRowStr.includes("balance") ||
    fullRowStr.includes("credit") ||
    fullRowStr.includes("deposit") ||
    fullRowStr.includes("withdraw") ||
    fullRowStr.includes("open trades") ||
    fullRowStr.includes("working orders") ||
    (fullRowStr.includes(" in ") && !fullRowStr.includes("out") && !fullRowStr.includes("in/out"))
  ) {
    return null;
  }

  // 1. Detect Order Type
  let orderType: OrderType | null = null;
  if (columnMap && columnMap.typeIdx !== -1 && cells[columnMap.typeIdx]) {
    const val = cells[columnMap.typeIdx].toLowerCase();
    if (val.includes("buy") || val.includes("خرید")) orderType = "BUY";
    if (val.includes("sell") || val.includes("فروش")) orderType = "SELL";
  }
  if (!orderType) {
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
  }
  if (!orderType) return null;

  // 2. Detect Dates
  const dateCandidates: { iso: string; timestamp: number }[] = [];
  cells.forEach((c) => {
    const resolved = resolveStrictDateTime(c);
    if (resolved) {
      dateCandidates.push(resolved);
    }
  });

  if (dateCandidates.length === 0) return null;

  const openTimeObj = dateCandidates[0];
  const closeTimeObj = dateCandidates[1] || dateCandidates[0];

  // 3. Detect Symbol (Never accept pure numbers or BUY/SELL)
  let symbol = "";
  if (columnMap && columnMap.symbolIdx !== -1 && cells[columnMap.symbolIdx]) {
    const val = cells[columnMap.symbolIdx].toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (val.length >= 3 && !/^\d+$/.test(val) && !val.includes("BUY") && !val.includes("SELL")) {
      symbol = val;
    }
  }
  if (!symbol) {
    for (const c of cells) {
      const cleanSym = c.toUpperCase().replace(/[^A-Z0-9]/g, "");
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
  }
  if (!symbol) symbol = "XAUUSD";

  // 4. Detect Ticket Number (Integer >= 1000)
  let ticket = 0;
  if (columnMap && columnMap.ticketIdx !== -1 && cells[columnMap.ticketIdx]) {
    const cleanNum = cells[columnMap.ticketIdx].replace(/[^0-9]/g, "");
    const num = parseInt(cleanNum, 10);
    if (!isNaN(num) && num > 1000) ticket = num;
  }
  if (ticket === 0) {
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
  }
  if (ticket === 0) ticket = Date.now() + rowIdx;

  // 5. Extract Numeric Fields
  const floatValues: number[] = [];
  cells.forEach((c) => {
    if (resolveStrictDateTime(c)) return;
    const cleanFloat = c.replace(/[^0-9.-]/g, "");
    if (cleanFloat && cleanFloat !== "-") {
      const parsed = parseFloat(cleanFloat);
      if (!isNaN(parsed)) {
        floatValues.push(parsed);
      }
    }
  });

  const nonTicketFloats = floatValues.filter((f) => Math.floor(Math.abs(f)) !== ticket);

  // Profit extraction
  let profit = 0;
  if (columnMap && columnMap.profitIdx !== -1 && cells[columnMap.profitIdx]) {
    const cleanProfit = cells[columnMap.profitIdx].replace(/[^0-9.-]/g, "");
    const parsedP = parseFloat(cleanProfit);
    if (!isNaN(parsedP)) profit = parsedP;
  }
  if (profit === 0 && nonTicketFloats.length > 0) {
    profit = nonTicketFloats[nonTicketFloats.length - 1];
  }

  // Swap extraction
  let swap = 0;
  if (columnMap && columnMap.swapIdx !== -1 && cells[columnMap.swapIdx]) {
    const parsedS = parseFloat(cells[columnMap.swapIdx].replace(/[^0-9.-]/g, ""));
    if (!isNaN(parsedS)) swap = parsedS;
  }
  if (swap === 0 && nonTicketFloats.length >= 3) {
    swap = nonTicketFloats[nonTicketFloats.length - 2];
  }

  // Commission extraction
  let commission = 0;
  if (columnMap && columnMap.commissionIdx !== -1 && cells[columnMap.commissionIdx]) {
    const parsedC = parseFloat(cells[columnMap.commissionIdx].replace(/[^0-9.-]/g, ""));
    if (!isNaN(parsedC)) commission = parsedC;
  }
  if (commission === 0 && nonTicketFloats.length >= 4) {
    commission = nonTicketFloats[nonTicketFloats.length - 3];
  }

  // Lot Size extraction
  let lotSize = 0.1;
  if (columnMap && columnMap.lotsIdx !== -1 && cells[columnMap.lotsIdx]) {
    const parsedL = parseFloat(cells[columnMap.lotsIdx].replace(/[^0-9.-]/g, ""));
    if (!isNaN(parsedL) && parsedL > 0) lotSize = parsedL;
  }
  if (lotSize === 0.1) {
    const lotCandidate = nonTicketFloats.find((f) => f >= 0.01 && f <= 500 && f !== ticket);
    if (lotCandidate) lotSize = lotCandidate;
  }

  // Entry & Exit Price extraction
  const priceCandidates = nonTicketFloats.filter(
    (f) => Math.abs(f) > 0.0001 && Math.abs(f) !== Math.abs(profit) && f !== lotSize
  );

  let entryPrice = priceCandidates.length > 0 ? priceCandidates[0] : 1.0;
  let exitPrice = priceCandidates.length > 1 ? priceCandidates[1] : entryPrice;

  if (columnMap && columnMap.entryPriceIdx !== -1 && cells[columnMap.entryPriceIdx]) {
    const parsedE = parseFloat(cells[columnMap.entryPriceIdx].replace(/[^0-9.-]/g, ""));
    if (!isNaN(parsedE) && parsedE > 0) entryPrice = parsedE;
  }

  if (columnMap && columnMap.exitPriceIdx !== -1 && cells[columnMap.exitPriceIdx]) {
    const parsedEx = parseFloat(cells[columnMap.exitPriceIdx].replace(/[^0-9.-]/g, ""));
    if (!isNaN(parsedEx) && parsedEx > 0) exitPrice = parsedEx;
  }

  // Skip bogus $0.00 entries where entry & exit are 0
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
