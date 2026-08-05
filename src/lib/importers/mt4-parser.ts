import { Trade } from "@/types/trade";
import { getActiveAccountId } from "@/lib/storage/store";
import { parseCloseTime, parseAnyDateString } from "@/lib/utils/date-utils";

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

/**
 * Validates whether a table row is a REAL Closed Transaction in MT4 format:
 * [0]=OpenTime (date)
 * [1]=Ticket (integer > 0)
 * [2]=Symbol (string)
 * [3]=Type (buy/sell)
 * [4]=Volume (number > 0)
 * [5]=OpenPrice (number > 0)
 * ...
 * [8]=CloseTime (MUST BE A VALID DATE STRING)
 * [9]=ClosePrice (number > 0)
 */
function isClosedTradeRow(cells: string[]): boolean {
  if (cells.length < 10) return false;
  const openTimeRaw = cells[0];
  const ticket = parseInt(cells[1], 10);
  const type = (cells[3] || "").toLowerCase();
  const volume = parseFloat(cells[4]);
  const entryPrice = parseFloat(cells[5]);
  const closeTimeRaw = cells[8];

  const hasValidOpenTime = parseCloseTime(openTimeRaw) > 0;
  const hasValidCloseTime = parseCloseTime(closeTimeRaw) > 0;
  const hasValidTicket = !isNaN(ticket) && ticket > 0;
  const hasValidType = type === "buy" || type === "sell";
  const hasValidVolume = !isNaN(volume) && volume > 0;
  const hasValidEntry = !isNaN(entryPrice) && entryPrice > 0;

  // Crucial: Must have a valid Close Time date string in cells[8].
  // Open trades / pending orders have Price(current) in cells[8], which fails parseCloseTime!
  return (
    hasValidOpenTime &&
    hasValidCloseTime &&
    hasValidTicket &&
    hasValidType &&
    hasValidVolume &&
    hasValidEntry
  );
}

export function parseMT4Report(htmlContent: string): Trade[] {
  const rawTrades: Trade[] = [];
  const activeAccountId = getActiveAccountId();

  if (typeof window === "undefined" || !htmlContent) return [];

  const cleanContent = htmlContent.replace(/\0/g, "");
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = cleanContent;

  const tables = Array.from(tempDiv.querySelectorAll("table"));
  let runningBalance = 10000;

  // Process tables, filtering out Open Trades / Working Orders sections
  tables.forEach((table) => {
    const tableText = (table.textContent || "").toLowerCase();
    
    // Skip open trades / working orders / summary tables
    if (
      tableText.includes("open trades") ||
      tableText.includes("working orders") ||
      tableText.includes("orders")
    ) {
      // Check if this table specifically contains "closed transactions"
      if (!tableText.includes("closed transactions")) {
        return;
      }
    }

    const rows = Array.from(table.querySelectorAll("tr"));
    rows.forEach((row, rowIdx) => {
      const cells = getVisibleCells(row);

      if (isClosedTradeRow(cells)) {
        const openTimeRaw = cells[0];
        const ticket = parseInt(cells[1], 10);
        const symbol = (cells[2] || "XAUUSD").toUpperCase().replace(/[^A-Z0-9]/g, "");
        const typeStr = (cells[3] || "").toLowerCase();
        const lotSize = parseFloat(cells[4]) || 0.01;
        const entryPrice = parseFloat(cells[5]) || 0;
        const sl = parseFloat(cells[6]) || 0;
        const tp = parseFloat(cells[7]) || 0;
        const closeTimeRaw = cells[8];
        const exitPrice = parseFloat(cells[9]) || entryPrice;
        const commission = parseFloat(cells[10]) || 0;
        const swap = parseFloat(cells[11]) || 0;
        // MT4 profit is in cells[12] or last cell
        const profit = parseFloat(cells[12] || cells[cells.length - 1]) || 0;

        // Skip bogus $0.00 trades with entry=0 or exit=0
        if (entryPrice === 0 && exitPrice === 0) return;

        runningBalance += profit + commission + swap;

        const openIso = parseAnyDateString(openTimeRaw);
        const closeIso = parseAnyDateString(closeTimeRaw);

        const openTs = parseCloseTime(openIso);
        const closeTs = parseCloseTime(closeIso);
        const durationMinutes = Math.max(
          1,
          Math.round((closeTs - openTs) / 60000) || 15
        );

        rawTrades.push({
          id: `mt4-${ticket}-${rowIdx}`,
          accountId: activeAccountId,
          ticket,
          symbol,
          orderType: typeStr === "buy" ? "BUY" : "SELL",
          lotSize,
          openTime: openIso,
          closeTime: closeIso,
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
              ? parseFloat((Math.abs(exitPrice - entryPrice) / Math.abs(entryPrice - sl)).toFixed(2))
              : 2.0,
          isBreakEven: Math.abs(profit) < 1.0,
        });
      }
    });
  });

  // Deduplicate by ticket number: Keep the trade with actual non-zero profit/exit price
  const ticketMap = new Map<number, Trade>();
  rawTrades.forEach((t) => {
    const existing = ticketMap.get(t.ticket);
    if (!existing) {
      ticketMap.set(t.ticket, t);
    } else {
      // If current trade has profit or exitPrice > 0, replace existing
      if (Math.abs(t.profit) > Math.abs(existing.profit) || t.exitPrice > existing.exitPrice) {
        ticketMap.set(t.ticket, t);
      }
    }
  });

  return Array.from(ticketMap.values());
}
