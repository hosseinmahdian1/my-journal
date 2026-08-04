import { Trade } from "@/types/trade";
import { getActiveAccountId } from "@/lib/storage/store";
import { parseMetaTraderDate } from "@/lib/utils/date-utils";

function getVisibleCells(row: HTMLTableRowElement): string[] {
  const allCells = Array.from(row.querySelectorAll("td"));
  return allCells
    .filter((td) => {
      if (td.classList.contains("hidden")) return false;
      const style = td.getAttribute("style") || "";
      if (/display\s*:\s*none/i.test(style)) return false;
      return true;
    })
    .map((td) => (td.textContent || "").trim());
}

function isTradeRow(cells: string[]): boolean {
  if (cells.length < 12) return false;
  const timePattern = /^(\d{4}[.\/-]\d{2}[.\/-]\d{2}|\d{2}[.\/-]\d{2}[.\/-]\d{4})\s+\d{2}:\d{2}(:\d{2})?$/;
  const openTime = cells[0];
  const ticket = parseInt(cells[1], 10);
  const type = (cells[3] || "").toLowerCase();
  const volume = parseFloat(cells[4]);
  const hasValidVolume = !isNaN(volume) && volume > 0;
  const closeTimeLooksLikeDate = timePattern.test(cells[8] || "");

  return (
    timePattern.test(openTime) &&
    !isNaN(ticket) &&
    ticket > 0 &&
    (type === "buy" || type === "sell") &&
    hasValidVolume &&
    closeTimeLooksLikeDate
  );
}

export function parseMT4Report(htmlContent: string): Trade[] {
  const trades: Trade[] = [];
  const activeAccountId = getActiveAccountId();

  if (typeof window === "undefined" || !htmlContent) return trades;

  const cleanContent = htmlContent.replace(/\0/g, "");
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = cleanContent;

  const rows = Array.from(tempDiv.querySelectorAll("tr"));
  let runningBalance = 10000;

  rows.forEach((row, rowIdx) => {
    const cells = getVisibleCells(row);

    if (cells.length >= 12 && isTradeRow(cells)) {
      const openTimeRaw = cells[0] || "";
      const ticket = parseInt(cells[1], 10);
      const symbol = (cells[2] || "XAUUSD").toUpperCase();
      const typeStr = (cells[3] || "").toLowerCase();
      const lotSize = parseFloat(cells[4]) || 0.01;
      const entryPrice = parseFloat(cells[5]) || 0;
      const sl = parseFloat(cells[6]) || 0;
      const tp = parseFloat(cells[7]) || 0;
      const closeTimeRaw = cells[8] || openTimeRaw;
      const exitPrice = parseFloat(cells[9]) || entryPrice;
      const commission = parseFloat(cells[10]) || 0;
      const swap = parseFloat(cells[11]) || 0;
      const profit = parseFloat(cells[12] || cells[cells.length - 1]) || 0;

      runningBalance += profit + commission + swap;

      const openDate = parseMetaTraderDate(openTimeRaw, rowIdx);
      const closeDate = parseMetaTraderDate(closeTimeRaw, rowIdx);
      const durationMinutes = Math.max(
        1,
        Math.round((closeDate.getTime() - openDate.getTime()) / 60000) || 30
      );

      trades.push({
        id: `mt4-${ticket}-${rowIdx}`,
        accountId: activeAccountId,
        ticket,
        symbol,
        orderType: typeStr === "buy" ? "BUY" : "SELL",
        lotSize,
        openTime: openDate.toISOString(),
        closeTime: closeDate.toISOString(),
        entryPrice,
        exitPrice,
        stopLoss: sl,
        takeProfit: tp,
        commission,
        swap,
        profit,
        balanceAfterTrade: parseFloat(runningBalance.toFixed(2)),
        durationMinutes,
        rrRatio:
          sl > 0 && entryPrice !== sl
            ? parseFloat(
                (
                  Math.abs(exitPrice - entryPrice) /
                  Math.abs(entryPrice - sl)
                ).toFixed(2)
              )
            : 2.0,
        isBreakEven: Math.abs(profit) < 1.0,
      });
    }
  });

  // Fallback regex scanner if table DOM didn't catch MT4 formatted rows
  if (trades.length === 0) {
    const textLines = cleanContent.split(/\r?\n/);
    textLines.forEach((line, i) => {
      const cleanLine = line.replace(/<[^>]+>/g, " ").trim();
      const parts = cleanLine.split(/\s+/);
      if (parts.length >= 8) {
        const ticket = parseInt(parts[0], 10);
        const typeStr = parts[2]?.toLowerCase();
        if (!isNaN(ticket) && ticket > 100 && (typeStr === "buy" || typeStr === "sell")) {
          const symbol = parts[4]?.toUpperCase() || "XAUUSD";
          const lotSize = parseFloat(parts[3]) || 0.1;
          const entryPrice = parseFloat(parts[5]) || 0;
          const exitPrice =
            parseFloat(parts[9]) || parseFloat(parts[7]) || entryPrice;
          const profit = parseFloat(parts[parts.length - 1]) || 0;

          const fallbackDate = parseMetaTraderDate(undefined, i);

          trades.push({
            id: `mt4-txt-${ticket}-${i}`,
            accountId: activeAccountId,
            ticket,
            symbol,
            orderType: typeStr === "buy" ? "BUY" : "SELL",
            lotSize,
            openTime: fallbackDate.toISOString(),
            closeTime: fallbackDate.toISOString(),
            entryPrice,
            exitPrice,
            stopLoss: 0,
            takeProfit: 0,
            commission: 0,
            swap: 0,
            profit,
            balanceAfterTrade: 10000 + profit,
            durationMinutes: 30,
          });
        }
      }
    });
  }

  return trades;
}
