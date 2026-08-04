import { Trade, OrderType } from "@/types/trade";
import { getActiveAccountId } from "@/lib/storage/store";

export function parseMT4Report(htmlContent: string): Trade[] {
  const trades: Trade[] = [];
  const activeAccountId = getActiveAccountId();

  if (typeof window === "undefined" || !htmlContent) return trades;

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlContent;

  const rows = Array.from(tempDiv.querySelectorAll("tr"));
  let runningBalance = 10000;

  rows.forEach((row, rowIdx) => {
    const cells = Array.from(row.querySelectorAll("td")).map((c) => (c.textContent || "").trim());

    // MT4 Closed Transactions row usually has 13 or 14 columns
    if (cells.length >= 12) {
      const ticket = parseInt(cells[0], 10);
      const openTimeStr = cells[1];
      const typeStr = (cells[2] || "").toLowerCase();

      if (!isNaN(ticket) && ticket > 0 && (typeStr === "buy" || typeStr === "sell")) {
        const lotSize = parseFloat(cells[3]) || 0.01;
        const symbol = (cells[4] || "XAUUSD").toUpperCase();
        const entryPrice = parseFloat(cells[5]) || 0;
        const sl = parseFloat(cells[6]) || 0;
        const tp = parseFloat(cells[7]) || 0;
        const closeTimeStr = cells[8] || openTimeStr;
        const exitPrice = parseFloat(cells[9]) || entryPrice;
        const commission = parseFloat(cells[10]) || 0;
        const swap = parseFloat(cells[11]) || 0;
        const profit = parseFloat(cells[cells.length - 1]) || 0;

        runningBalance += profit + commission + swap;

        const openDate = new Date(openTimeStr.replace(/\./g, "-"));
        const closeDate = new Date(closeTimeStr.replace(/\./g, "-"));
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
          openTime: isNaN(openDate.getTime()) ? new Date().toISOString() : openDate.toISOString(),
          closeTime: isNaN(closeDate.getTime()) ? new Date().toISOString() : closeDate.toISOString(),
          entryPrice,
          exitPrice,
          stopLoss: sl,
          takeProfit: tp,
          commission,
          swap,
          profit,
          balanceAfterTrade: parseFloat(runningBalance.toFixed(2)),
          durationMinutes,
          rrRatio: sl > 0 ? parseFloat((Math.abs(exitPrice - entryPrice) / Math.abs(entryPrice - sl)).toFixed(2)) : 2.0,
          isBreakEven: Math.abs(profit) < 1.0,
        });
      }
    }
  });

  // Fallback regex scanner if table DOM didn't catch MT4 formatted rows
  if (trades.length === 0) {
    const textLines = htmlContent.split(/\r?\n/);
    textLines.forEach((line, i) => {
      const parts = line.replace(/<[^>]+>/g, " ").trim().split(/\s+/);
      if (parts.length >= 10) {
        const ticket = parseInt(parts[0], 10);
        const typeStr = parts[2]?.toLowerCase();
        if (!isNaN(ticket) && ticket > 1000 && (typeStr === "buy" || typeStr === "sell")) {
          const symbol = parts[4]?.toUpperCase() || "XAUUSD";
          const lotSize = parseFloat(parts[3]) || 0.1;
          const entryPrice = parseFloat(parts[5]) || 0;
          const exitPrice = parseFloat(parts[9]) || entryPrice;
          const profit = parseFloat(parts[parts.length - 1]) || 0;

          trades.push({
            id: `mt4-txt-${ticket}-${i}`,
            accountId: activeAccountId,
            ticket,
            symbol,
            orderType: typeStr === "buy" ? "BUY" : "SELL",
            lotSize,
            openTime: new Date().toISOString(),
            closeTime: new Date().toISOString(),
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
