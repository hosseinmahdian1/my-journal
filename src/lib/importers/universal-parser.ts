import { Trade, OrderType } from "@/types/trade";
import { getActiveAccountId } from "@/lib/storage/store";
import { parseMetaTraderDate } from "@/lib/utils/date-utils";

/**
 * Universal Smart Parser Engine for MetaTrader 4, MetaTrader 5, and CSV Reports.
 * Extracts Ticket, Symbol, Order Type, Lot Size, Entry/Exit Prices, Profit,
 * and MOST IMPORTANTLY: Exact Open Time and Close Time from HTML cells.
 */
export function parseUniversalReport(content: string): Trade[] {
  const trades: Trade[] = [];
  const activeAccountId = getActiveAccountId();
  if (!content || typeof window === "undefined") return trades;

  const clean = content.replace(/\0/g, "").replace(/\r\n/g, "\n");
  let runningBalance = 10000;

  // Date regex matching YYYY.MM.DD HH:MM(:SS) or DD.MM.YYYY HH:MM(:SS) or ISO
  const dateTimeRegex = /(\d{4}[.\/-]\d{2}[.\/-]\d{2}|\d{2}[.\/-]\d{2}[.\/-]\d{4})\s+\d{2}:\d{2}(:\d{2})?/;

  try {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = clean;
    const rows = Array.from(tempDiv.querySelectorAll("tr"));

    rows.forEach((row, rowIdx) => {
      const textCells = Array.from(row.querySelectorAll("td, th")).map((c) =>
        (c.textContent || "").trim()
      );
      if (textCells.length < 5) return;

      const fullRowStr = textCells.join(" ").toLowerCase();

      // Skip non-trade summary rows
      if (
        fullRowStr.includes("total") ||
        fullRowStr.includes("balance") ||
        fullRowStr.includes("credit") ||
        fullRowStr.includes("deposit") ||
        fullRowStr.includes("withdraw") ||
        fullRowStr.includes("working orders")
      ) {
        return;
      }

      // Detect Buy or Sell
      const isBuy = fullRowStr.includes("buy") || fullRowStr.includes("خرید");
      const isSell = fullRowStr.includes("sell") || fullRowStr.includes("فروش");
      if (!isBuy && !isSell) return;

      // Extract all date/time strings from row cells
      const foundDateStrings: string[] = [];
      textCells.forEach((cell) => {
        const match = cell.match(dateTimeRegex);
        if (match) {
          foundDateStrings.push(match[0]);
        }
      });

      const openTimeRaw = foundDateStrings[0] || "";
      const closeTimeRaw = foundDateStrings[1] || openTimeRaw;

      const openDate = parseMetaTraderDate(openTimeRaw, rowIdx * 2 + 1);
      const closeDate = parseMetaTraderDate(closeTimeRaw, rowIdx * 2);

      // Extract numbers from row
      const nums = textCells
        .map((tc) => {
          const cleaned = tc.replace(/[^0-9.-]/g, "");
          return parseFloat(cleaned);
        })
        .filter((n) => !isNaN(n));

      // Extract Ticket (usually 5 to 9 digit integer)
      let ticketCandidate = 0;
      for (const tc of textCells) {
        const match = tc.match(/^\b\d{5,9}\b$/);
        if (match) {
          ticketCandidate = parseInt(match[0], 10);
          break;
        }
      }
      if (!ticketCandidate) {
        ticketCandidate = nums.find((n) => Number.isInteger(n) && n > 1000) || Date.now() + rowIdx;
      }

      // Extract Symbol (e.g. XAUUSD, EURUSD, GBPUSD, BTCUSD, US30)
      let symbol = "XAUUSD";
      for (const cell of textCells) {
        const uppercase = cell.toUpperCase().replace(/[^A-Z0-9]/g, "");
        if (
          uppercase.length >= 3 &&
          uppercase.length <= 10 &&
          !uppercase.includes("BUY") &&
          !uppercase.includes("SELL") &&
          !uppercase.includes("TOTAL") &&
          !uppercase.includes("CLOSED")
        ) {
          symbol = uppercase;
          break;
        }
      }

      // Lot size (usually decimal between 0.01 and 100)
      const lotCandidate = nums.find((n) => n > 0 && n <= 100 && n !== ticketCandidate) || 0.1;
      // Profit candidate (last number in trade row)
      const profitCandidate = nums.length > 0 ? nums[nums.length - 1] : 0;
      // Entry price candidate
      const entryCandidate = nums.find((n) => n > 0.0001 && n !== ticketCandidate && n !== lotCandidate) || 1.0;
      // Exit price candidate
      const exitCandidate = nums.length > 3 ? nums[nums.length - 2] : entryCandidate;

      runningBalance += profitCandidate;

      const durationMinutes = Math.max(
        1,
        Math.round((closeDate.getTime() - openDate.getTime()) / 60000) || 30
      );

      trades.push({
        id: `univ-dom-${ticketCandidate}-${rowIdx}`,
        accountId: activeAccountId,
        ticket: Math.floor(ticketCandidate),
        symbol,
        orderType: isBuy ? "BUY" : "SELL",
        lotSize: lotCandidate,
        openTime: openDate.toISOString(),
        closeTime: closeDate.toISOString(),
        entryPrice: entryCandidate,
        exitPrice: exitCandidate,
        stopLoss: 0,
        takeProfit: 0,
        commission: 0,
        swap: 0,
        profit: profitCandidate,
        balanceAfterTrade: parseFloat(runningBalance.toFixed(2)),
        durationMinutes,
        rrRatio: 2.0,
        isBreakEven: Math.abs(profitCandidate) < 1.0,
      });
    });
  } catch (e) {
    console.warn("DOM parsing fallback error:", e);
  }

  // -------------------------------------------------------------
  // STRATEGY 2: Line-by-Line Regex Scanner (If DOM returns 0 trades)
  // -------------------------------------------------------------
  if (trades.length === 0) {
    const lines = clean.split("\n");
    lines.forEach((line, idx) => {
      const lower = line.toLowerCase();
      if (!lower.includes("buy") && !lower.includes("sell")) return;

      const parts = line
        .replace(/<[^>]+>/g, " ")
        .split(/[\s,;\t]+/)
        .map((p) => p.trim())
        .filter(Boolean);

      if (parts.length < 5) return;

      const isBuy = lower.includes("buy");
      let ticket = idx + 1000;
      let symbol = "XAUUSD";
      let lotSize = 0.1;
      let profit = 0;

      for (const p of parts) {
        const num = parseFloat(p.replace(/[^0-9.-]/g, ""));
        if (!isNaN(num)) {
          if (num > 10000 && ticket === idx + 1000) ticket = Math.floor(num);
          else if (num >= 0.01 && num <= 500) lotSize = num;
          profit = num;
        } else {
          const uppercase = p.toUpperCase().replace(/[^A-Z0-9]/g, "");
          if (uppercase.length >= 3 && uppercase.length <= 10 && !uppercase.includes("BUY") && !uppercase.includes("SELL")) {
            symbol = uppercase;
          }
        }
      }

      runningBalance += profit;

      const dateMatches = line.match(new RegExp(dateTimeRegex, "g"));
      const openDate = parseMetaTraderDate(dateMatches?.[0], idx * 2 + 1);
      const closeDate = parseMetaTraderDate(dateMatches?.[1] || dateMatches?.[0], idx * 2);

      trades.push({
        id: `univ-line-${ticket}-${idx}`,
        accountId: activeAccountId,
        ticket,
        symbol,
        orderType: isBuy ? "BUY" : "SELL",
        lotSize,
        openTime: openDate.toISOString(),
        closeTime: closeDate.toISOString(),
        entryPrice: 1.0,
        exitPrice: 1.0,
        stopLoss: 0,
        takeProfit: 0,
        commission: 0,
        swap: 0,
        profit,
        balanceAfterTrade: parseFloat(runningBalance.toFixed(2)),
        durationMinutes: 30,
        rrRatio: 2.0,
      });
    });
  }

  return trades;
}
