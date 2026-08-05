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

export function parseMT5Report(htmlContent: string): Trade[] {
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
    let inPositionsSection = false;

    rows.forEach((row, rowIdx) => {
      const visibleCells = getVisibleCells(row);
      if (visibleCells.length === 0) return;

      const rowStr = visibleCells.join(" ").toLowerCase();

      // Section Boundary Tracker
      if (rowStr === "positions" || (visibleCells.length === 1 && visibleCells[0].toLowerCase() === "positions")) {
        inPositionsSection = true;
        return;
      }

      if (
        rowStr === "orders" ||
        rowStr === "deals" ||
        rowStr === "summary" ||
        (visibleCells.length === 1 &&
          (visibleCells[0].toLowerCase() === "orders" ||
            visibleCells[0].toLowerCase() === "deals" ||
            visibleCells[0].toLowerCase() === "summary"))
      ) {
        if (inPositionsSection) {
          inPositionsSection = false;
        }
        return;
      }

      if (!inPositionsSection) return;

      if (visibleCells.length < 12) return;
      if (!rowStr.includes("buy") && !rowStr.includes("sell")) return;

      // Deal Guard: Cell 4 in MT5 Positions MUST NOT be "in" or "out"
      const cell4 = visibleCells[4].toLowerCase();
      if (cell4 === "in" || cell4 === "out") return;

      // Check if cell 0 is valid Open Time
      const isCell0Date = /^\d{4}[.\/-]\d{1,2}[.\/-]\d{1,2}/.test(visibleCells[0]);
      if (!isCell0Date) return;

      const openTimeRaw = visibleCells[0];
      const ticketRaw = visibleCells[1].replace(/[^0-9]/g, "");
      const ticket = parseInt(ticketRaw, 10);
      if (isNaN(ticket) || ticket < 1000) return;

      const symbol = visibleCells[2].toUpperCase().replace(/[^A-Z0-9]/g, "") || "XAUUSD";
      const typeStr = visibleCells[3].toLowerCase();
      const orderType: OrderType = typeStr.includes("buy") ? "BUY" : "SELL";

      const lotSize = parseFloat(visibleCells[4]) || 0.1;
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
        id: `mt5-${ticket}-${rowIdx}`,
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
