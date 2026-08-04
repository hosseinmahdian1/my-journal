import { Trade, OrderType } from "@/types/trade";
import { getActiveAccountId } from "@/lib/storage/store";

/**
 * Filters out hidden <td> elements from a row's cell array.
 * Some brokers include hidden columns with class="hidden" or display:none
 * containing EA/comment names, which shift cell indices.
 */
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
    const cells = getVisibleCells(row);

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
        const symbol =
          (col2.length >= 3 && !isBuy && !isSell
            ? col2
            : col3 || "EURUSD"
          ).toUpperCase();
        const entryPrice = parseFloat(cells[5]) || parseFloat(cells[6]) || 0;
        const exitPrice = parseFloat(cells[9]) || parseFloat(cells[8]) || entryPrice;
        const profit = parseFloat(cells[cells.length - 1]) || 0;
        const commission = parseFloat(cells[cells.length - 3]) || 0;
        const swap = parseFloat(cells[cells.length - 2]) || 0;

        // Try to parse close time from cells[8] if it looks like a date
        const closeTimeRaw = cells[8] || "";

        runningBalance += profit;

        const parseDate = (dStr: string) => {
          if (!dStr) return new Date();
          // Support YYYY.MM.DD HH:MM:SS and YYYY-MM-DD HH:MM:SS
          const normalized = dStr.replace(/\./g, "/").replace(" ", "T");
          const parsed = new Date(normalized);
          return isNaN(parsed.getTime()) ? new Date() : parsed;
        };

        const openDate = parseDate(openTimeRaw);
        const closeDate = closeTimeRaw.match(/\d{4}[./]\d{2}[./]\d{2}/)
          ? parseDate(closeTimeRaw)
          : new Date();

        const durationMinutes = Math.max(
          1,
          Math.round((closeDate.getTime() - openDate.getTime()) / 60000) || 45
        );

        trades.push({
          id: `mt5-${ticket}-${rowIdx}`,
          accountId: activeAccountId,
          ticket,
          symbol,
          orderType,
          lotSize,
          openTime: openDate.toISOString(),
          closeTime: closeDate.toISOString(),
          entryPrice,
          exitPrice,
          stopLoss: 0,
          takeProfit: 0,
          commission: isNaN(commission) ? 0 : commission,
          swap: isNaN(swap) ? 0 : swap,
          profit,
          balanceAfterTrade: parseFloat(runningBalance.toFixed(2)),
          durationMinutes,
          isPartialClose: cells.some(
            (c) =>
              c.toLowerCase().includes("in/out") ||
              c.toLowerCase().includes("partial")
          ),
        });
      }
    }
  });

  return trades;
}
