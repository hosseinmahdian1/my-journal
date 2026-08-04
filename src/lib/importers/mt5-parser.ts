import { Trade, OrderType } from "@/types/trade";
import { getActiveAccountId } from "@/lib/storage/store";

export function parseMT5Report(htmlContent: string): Trade[] {
  const trades: Trade[] = [];
  const activeAccountId = getActiveAccountId();

  if (typeof window === "undefined" || !htmlContent) return trades;

  const cleanContent = htmlContent.replace(/\0/g, "");
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = cleanContent;

  const rows = Array.from(tempDiv.querySelectorAll("tr"));
  let runningBalance = 10000;

  rows.forEach((row, rowIdx) => {
    const cells = Array.from(row.querySelectorAll("td")).map((c) => (c.textContent || "").trim());

    if (cells.length >= 8) {
      const ticket = parseInt(cells[0], 10);
      const openTimeRaw = cells[1] || "";
      const col2 = (cells[2] || "").toLowerCase();
      const col3 = (cells[3] || "").toLowerCase();

      const isBuy = col2.includes("buy") || col3.includes("buy");
      const isSell = col2.includes("sell") || col3.includes("sell");

      if (!isNaN(ticket) && ticket > 0 && (isBuy || isSell)) {
        const orderType: OrderType = isBuy ? "BUY" : "SELL";
        const lotSize = parseFloat(cells[4]) || parseFloat(cells[3]) || 0.1;
        const symbol = (col2.length >= 3 && !isBuy && !isSell ? col2 : col3 || "EURUSD").toUpperCase();
        const entryPrice = parseFloat(cells[5]) || parseFloat(cells[6]) || 0;
        const exitPrice = parseFloat(cells[9]) || parseFloat(cells[8]) || entryPrice;
        const profit = parseFloat(cells[cells.length - 1]) || 0;
        const commission = parseFloat(cells[cells.length - 3]) || 0;
        const swap = parseFloat(cells[cells.length - 2]) || 0;

        runningBalance += profit;

        const parseDate = (dStr: string) => {
          if (!dStr) return new Date();
          const normalized = dStr.replace(/\./g, "/").replace(" ", "T");
          const parsed = new Date(normalized);
          return isNaN(parsed.getTime()) ? new Date() : parsed;
        };

        const openDate = parseDate(openTimeRaw);

        trades.push({
          id: `mt5-${ticket}-${rowIdx}`,
          accountId: activeAccountId,
          ticket,
          symbol,
          orderType,
          lotSize,
          openTime: openDate.toISOString(),
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
