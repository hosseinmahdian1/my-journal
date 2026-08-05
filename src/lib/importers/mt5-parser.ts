import { Trade, OrderType } from "@/types/trade";
import { getActiveAccountId } from "@/lib/storage/store";
import { parseCloseTime } from "@/lib/utils/date-utils";

/**
 * Filter out hidden cells (e.g. td class="hidden" or style="display:none")
 */
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

  // Strip null bytes
  const cleanContent = htmlContent.replace(/\0/g, "");
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = cleanContent;

  const tables = Array.from(tempDiv.querySelectorAll("table"));
  let runningBalance = 10000;

  tables.forEach((table) => {
    const tableText = (table.textContent || "").toLowerCase();

    // STRICT ISOLATION: Process ONLY the "Positions" table in MT5!
    // Ignore Orders, Deals, Summary, Balance tables
    if (!tableText.includes("positions")) return;
    if (tableText.includes("orders") && !tableText.includes("positions")) return;
    if (tableText.includes("deals") && !tableText.includes("positions")) return;

    const rows = Array.from(table.querySelectorAll("tr"));
    rows.forEach((row, rowIdx) => {
      const visibleCells = getVisibleCells(row);
      if (visibleCells.length < 12) return;

      const rowStr = visibleCells.join(" ").toLowerCase();
      if (!rowStr.includes("buy") && !rowStr.includes("sell")) return;

      // MT5 Positions Table Visible Cell Layout:
      // [0] Open Time (e.g. "2026.07.31 13:28:27")
      // [1] Position Ticket (e.g. "56642855")
      // [2] Symbol (e.g. "XAUUSD")
      // [3] Type ("buy" / "sell")
      // [4] Volume (e.g. "0.05")
      // [5] Entry Price (e.g. "4043.07")
      // [6] S / L (e.g. "4052.50")
      // [7] T / P (e.g. "4032.05")
      // [8] Close Time (e.g. "2026.07.31 13:36:17")
      // [9] Exit Price (e.g. "4032.04")
      // [10] Commission (e.g. "-0.23")
      // [11] Swap (e.g. "0.00")
      // [12] Profit (e.g. "55.15")

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
