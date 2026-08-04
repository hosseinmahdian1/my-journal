import { Trade } from "@/types/trade";
import { getActiveAccountId } from "@/lib/storage/store";

export function parseMT4Report(htmlContent: string): Trade[] {
  const trades: Trade[] = [];
  const activeAccountId = getActiveAccountId();

  if (typeof window === "undefined" || !htmlContent) return trades;

  // Clean null characters from UTF-16LE files if present
  const cleanContent = htmlContent.replace(/\0/g, "");

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = cleanContent;

  const rows = Array.from(tempDiv.querySelectorAll("tr"));
  let runningBalance = 10000;

  rows.forEach((row, rowIdx) => {
    const cells = Array.from(row.querySelectorAll("td")).map((c) => (c.textContent || "").trim());

    // MT4 Closed Transactions row check
    if (cells.length >= 8) {
      const ticket = parseInt(cells[0], 10);
      const openTimeRaw = cells[1] || "";
      const typeStr = (cells[2] || "").toLowerCase();

      if (!isNaN(ticket) && ticket > 0 && (typeStr === "buy" || typeStr === "sell")) {
        const lotSize = parseFloat(cells[3]) || 0.01;
        const symbol = (cells[4] || "XAUUSD").toUpperCase();
        const entryPrice = parseFloat(cells[5]) || 0;
        const sl = parseFloat(cells[6]) || 0;
        const tp = parseFloat(cells[7]) || 0;
        const closeTimeRaw = cells[8] || openTimeRaw;
        const exitPrice = parseFloat(cells[9]) || entryPrice;
        const commission = parseFloat(cells[10]) || 0;
        const swap = parseFloat(cells[11]) || 0;
        const profit = parseFloat(cells[cells.length - 1]) || 0;

        runningBalance += profit + commission + swap;

        const parseDate = (dStr: string) => {
          if (!dStr) return new Date();
          const normalized = dStr.replace(/\./g, "/").replace(" ", "T");
          const parsed = new Date(normalized);
          return isNaN(parsed.getTime()) ? new Date() : parsed;
        };

        const openDate = parseDate(openTimeRaw);
        const closeDate = parseDate(closeTimeRaw);
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
          rrRatio: sl > 0 && entryPrice !== sl ? parseFloat((Math.abs(exitPrice - entryPrice) / Math.abs(entryPrice - sl)).toFixed(2)) : 2.0,
          isBreakEven: Math.abs(profit) < 1.0,
        });
      }
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
          const exitPrice = parseFloat(parts[9]) || parseFloat(parts[7]) || entryPrice;
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
