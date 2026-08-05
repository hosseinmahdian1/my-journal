import { Trade, OrderType } from "@/types/trade";
import { getActiveAccountId } from "@/lib/storage/store";
import { parseCloseTime } from "@/lib/utils/date-utils";

function getVisibleCells(row: HTMLTableRowElement): string[] {
  const allCells = Array.from(row.querySelectorAll("td, th"));
  return allCells
    .filter((td) => {
      if (td.classList.contains("hidden")) return false;
      const style = td.getAttribute("style") || "";
      if (/display\s*:\s*none/i.test(style)) return false;
      return true;
    })
    .map((td) => (td.textContent || "").trim());
}

export function parseMT4Report(htmlContent: string): Trade[] {
  const trades: Trade[] = [];
  const activeAccountId = getActiveAccountId();

  if (typeof window === "undefined" || !htmlContent) return [];

  const cleanContent = htmlContent.replace(/\0/g, "");
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = cleanContent;

  const tables = Array.from(tempDiv.querySelectorAll("table"));
  let runningBalance = 10000;

  tables.forEach((table) => {
    const rows = Array.from(table.querySelectorAll("tr"));
    let inClosedTransactions = false;

    rows.forEach((row, rowIdx) => {
      const visibleCells = getVisibleCells(row);
      if (visibleCells.length === 0) return;

      const rowStr = visibleCells.join(" ").toLowerCase();

      // Section Boundary Tracker for MT4
      if (rowStr.includes("closed transactions")) {
        inClosedTransactions = true;
        return;
      }

      if (
        rowStr.includes("open trades") ||
        rowStr.includes("working orders") ||
        rowStr.includes("summary")
      ) {
        if (inClosedTransactions) {
          inClosedTransactions = false;
        }
        return;
      }

      if (!inClosedTransactions) return;

      if (visibleCells.length < 12) return;
      if (!rowStr.includes("buy") && !rowStr.includes("sell")) return;

      // MT4 Closed Transactions Layout:
      // [0] Ticket
      // [1] Open Time
      // [2] Type
      // [3] Volume / Lot Size
      // [4] Symbol
      // [5] Entry Price
      // [6] S / L
      // [7] T / P
      // [8] Close Time
      // [9] Exit Price
      // [10] Commission
      // [11] Swap
      // [12] Profit

      const ticketRaw = visibleCells[0].replace(/[^0-9]/g, "");
      const ticket = parseInt(ticketRaw, 10);
      if (isNaN(ticket) || ticket < 1000) return;

      const openTimeRaw = visibleCells[1];
      const typeStr = visibleCells[2].toLowerCase();
      const orderType: OrderType = typeStr.includes("buy") ? "BUY" : "SELL";

      const lotSize = parseFloat(visibleCells[3]) || 0.1;
      const symbol = visibleCells[4].toUpperCase().replace(/[^A-Z0-9]/g, "") || "XAUUSD";

      const entryPrice = parseFloat(visibleCells[5]) || 1.0;
      const stopLoss = parseFloat(visibleCells[6]) || 0;
      const takeProfit = parseFloat(visibleCells[7]) || 0;

      const closeTimeRaw = visibleCells[8];
      const exitPrice = parseFloat(visibleCells[9]) || entryPrice;

      const commission = parseFloat(visibleCells[10].replace(/[^0-9.-]/g, "")) || 0;
      const swap = parseFloat(visibleCells[11].replace(/[^0-9.-]/g, "")) || 0;
      const profit = parseFloat(visibleCells[12].replace(/[^0-9.-]/g, "")) || 0;

      const openTimeTs = parseCloseTime(openTimeRaw);
      const closeTimeTs = parseCloseTime(closeTimeRaw);

      const openIso = openTimeTs > 0 ? new Date(openTimeTs).toISOString() : new Date().toISOString();
      const closeIso = closeTimeTs > 0 ? new Date(closeTimeTs).toISOString() : openIso;

      runningBalance += profit + commission + swap;

      trades.push({
        id: `mt4-${ticket}-${rowIdx}`,
        accountId: activeAccountId,
        ticket,
        symbol,
        orderType,
        lotSize,
        openTime: openIso,
        closeTime: closeIso,
        entryPrice,
        exitPrice,
        stopLoss,
        takeProfit,
        commission,
        swap,
        profit,
        balanceAfterTrade: parseFloat(runningBalance.toFixed(2)),
        durationMinutes: Math.max(1, Math.round((closeTimeTs - openTimeTs) / 60000) || 15),
        rrRatio: 2.0,
        isBreakEven: Math.abs(profit) < 1.0,
      });
    });
  });

  return trades;
}
