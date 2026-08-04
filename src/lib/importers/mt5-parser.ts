import { Trade, OrderType } from "@/types/trade";
import { getActiveAccountId } from "@/lib/storage/store";

export function parseMT5Report(htmlContent: string): Trade[] {
  const trades: Trade[] = [];
  const activeAccountId = getActiveAccountId();

  if (typeof window === "undefined" || !htmlContent) return trades;

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlContent;

  const rows = Array.from(tempDiv.querySelectorAll("tr"));
  let runningBalance = 10000;

  rows.forEach((row, rowIdx) => {
    const cells = Array.from(row.querySelectorAll("td")).map((c) => (c.textContent || "").trim());

    // MT5 position/order row check
    if (cells.length >= 10) {
      const ticket = parseInt(cells[0], 10);
      const openTimeStr = cells[1];
      const symbolOrType = (cells[2] || "").toLowerCase();
      const typeOrSymbol = (cells[3] || "").toLowerCase();

      const isBuy = symbolOrType.includes("buy") || typeOrSymbol.includes("buy");
      const isSell = symbolOrType.includes("sell") || typeOrSymbol.includes("sell");

      if (!isNaN(ticket) && ticket > 0 && (isBuy || isSell)) {
        const orderType: OrderType = isBuy ? "BUY" : "SELL";
        const lotSize = parseFloat(cells[4]) || parseFloat(cells[3]) || 0.1;
        const symbol = (cells[2]?.length > 3 && !cells[2].includes("buy") && !cells[2].includes("sell") ? cells[2] : cells[4] || "EURUSD").toUpperCase();
        const entryPrice = parseFloat(cells[5]) || parseFloat(cells[6]) || 0;
        const exitPrice = parseFloat(cells[9]) || parseFloat(cells[8]) || entryPrice;
        const profit = parseFloat(cells[cells.length - 1]) || 0;
        const commission = parseFloat(cells[cells.length - 3]) || 0;
        const swap = parseFloat(cells[cells.length - 2]) || 0;

        runningBalance += profit;

        const openDate = new Date(openTimeStr.replace(/\./g, "-"));

        trades.push({
          id: `mt5-${ticket}-${rowIdx}`,
          accountId: activeAccountId,
          ticket,
          symbol,
          orderType,
          lotSize,
          openTime: isNaN(openDate.getTime()) ? new Date().toISOString() : openDate.toISOString(),
          closeTime: new Date().toISOString(),
          entryPrice,
          exitPrice,
          stopLoss: 0,
          takeProfit: 0,
          commission: isNaN(commission) ? 0 : commission,
          swap: isNaN(swap) ? 0 : swap,
          profit,
          balanceAfterTrade: parseFloat(runningBalance.toFixed(2)),
          durationMinutes: 45,
          isPartialClose: cells.some((c) => c.toLowerCase().includes("in/out") || c.toLowerCase().includes("partial")),
        });
      }
    }
  });

  return trades;
}
