import { Trade, OrderType } from "@/types/trade";
import { getActiveAccountId } from "@/lib/storage/store";
import { parseMetaTraderDate } from "@/lib/utils/date-utils";

export function parseUniversalReport(content: string): Trade[] {
  const trades: Trade[] = [];
  const activeAccountId = getActiveAccountId();
  if (!content || typeof window === "undefined") return trades;

  const clean = content.replace(/\0/g, "").replace(/\r\n/g, "\n");
  let runningBalance = 10000;

  // -------------------------------------------------------------
  // STRATEGY 1: DOM Table Extraction
  // -------------------------------------------------------------
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

      if (
        fullRowStr.includes("total") ||
        fullRowStr.includes("balance") ||
        fullRowStr.includes("credit") ||
        fullRowStr.includes("deposit") ||
        fullRowStr.includes("withdraw")
      ) {
        return;
      }

      const isBuy = fullRowStr.includes("buy") || fullRowStr.includes("خرید");
      const isSell = fullRowStr.includes("sell") || fullRowStr.includes("فروش");

      if (!isBuy && !isSell) return;

      const nums = textCells
        .map((tc) => {
          const cleaned = tc.replace(/[^0-9.-]/g, "");
          return parseFloat(cleaned);
        })
        .filter((n) => !isNaN(n));

      // Extract symbol
      let symbol = "XAUUSD";
      for (const cell of textCells) {
        const uppercase = cell.toUpperCase().replace(/[^A-Z0-9]/g, "");
        if (
          uppercase.length >= 3 &&
          uppercase.length <= 10 &&
          !uppercase.includes("BUY") &&
          !uppercase.includes("SELL") &&
          !uppercase.includes("TOTAL")
        ) {
          symbol = uppercase;
          break;
        }
      }

      // Extract date strings if present in text cells
      const dateCells = textCells.filter((c) =>
        /(\d{4}[.\/-]\d{2}[.\/-]\d{2}|\d{2}[.\/-]\d{2}[.\/-]\d{4})/.test(c)
      );

      const openTimeRaw = dateCells[0] || "";
      const closeTimeRaw = dateCells[1] || dateCells[0] || "";

      const openDate = parseMetaTraderDate(openTimeRaw, rowIdx * 2 + 1);
      const closeDate = parseMetaTraderDate(closeTimeRaw, rowIdx * 2);

      const ticketCandidate = nums.find((n) => Number.isInteger(n) && n > 1000) || Date.now() + rowIdx;
      const lotCandidate = nums.find((n) => n > 0 && n <= 100 && n !== ticketCandidate) || 0.1;
      const profitCandidate = nums.length > 0 ? nums[nums.length - 1] : 0;
      const entryCandidate = nums.find((n) => n > 0.0001 && n !== ticketCandidate && n !== lotCandidate) || 1.0;
      const exitCandidate = nums.length > 3 ? nums[nums.length - 2] : entryCandidate;

      runningBalance += profitCandidate;

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
        durationMinutes: 30,
        rrRatio: 2.0,
        isBreakEven: Math.abs(profitCandidate) < 1.0,
      });
    });
  } catch (e) {
    console.warn("DOM parsing fallback:", e);
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

      const dateMatch = line.match(/(\d{4}[.\/-]\d{2}[.\/-]\d{2}\s+\d{2}:\d{2}(:\d{2})?)/);
      const fallbackDate = parseMetaTraderDate(dateMatch ? dateMatch[1] : undefined, idx);

      trades.push({
        id: `univ-line-${ticket}-${idx}`,
        accountId: activeAccountId,
        ticket,
        symbol,
        orderType: isBuy ? "BUY" : "SELL",
        lotSize,
        openTime: fallbackDate.toISOString(),
        closeTime: fallbackDate.toISOString(),
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
