import { Trade, OrderType } from "@/types/trade";
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

export function parseMT5Report(htmlContent: string): Trade[] {
  const rawTrades: Trade[] = [];
  const activeAccountId = getActiveAccountId();

  if (typeof window === "undefined" || !htmlContent) return [];

  const cleanContent = htmlContent.replace(/\0/g, "");
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = cleanContent;

  const tables = Array.from(tempDiv.querySelectorAll("table"));
  let runningBalance = 10000;

  tables.forEach((table) => {
    const tableText = (table.textContent || "").toLowerCase();

    // Skip open trades / orders / pending orders sections
    if (
      tableText.includes("open trades") ||
      tableText.includes("working orders") ||
      tableText.includes("orders")
    ) {
      if (!tableText.includes("positions") && !tableText.includes("deals")) {
        return;
      }
    }

    const rows = Array.from(table.querySelectorAll("tr"));
    rows.forEach((row, rowIdx) => {
      const cells = getVisibleCells(row);
      const rowText = cells.join(" ").toLowerCase();

      // Skip deal entries (direction = "in" with no profit)
      if (rowText.includes(" in ") && !rowText.includes("out") && !rowText.includes("in/out")) {
        return;
      }

      if (cells.length >= 8) {
        const ticket = parseInt(cells[0], 10);
        const openTimeRaw = cells[1] || "";
        const col2 = (cells[2] || "").toLowerCase();
        const col3 = (cells[3] || "").toLowerCase();

        const isBuy = col2.includes("buy") || col3.includes("buy") || rowText.includes("buy");
        const isSell = col2.includes("sell") || col3.includes("sell") || rowText.includes("sell");

        if (!isNaN(ticket) && ticket > 0 && (isBuy || isSell)) {
          const orderType: OrderType = isBuy ? "BUY" : "SELL";
          const lotSize = parseFloat(cells[4]) || parseFloat(cells[3]) || 0.1;
          const symbol = (
            col2.length >= 3 && !isBuy && !isSell
              ? col2
              : col3 || "EURUSD"
          ).toUpperCase().replace(/[^A-Z0-9]/g, "");

          const entryPrice = parseFloat(cells[5]) || parseFloat(cells[6]) || 0;
          const exitPrice = parseFloat(cells[9]) || parseFloat(cells[8]) || entryPrice;
          const profit = parseFloat(cells[cells.length - 1]) || 0;
          const commission = parseFloat(cells[cells.length - 3]) || 0;
          const swap = parseFloat(cells[cells.length - 2]) || 0;

          // Skip bogus $0.00 entries where entry=0 or exit=0
          if (entryPrice === 0 && exitPrice === 0) return;

          // Find date cells
          const dateCells = cells.filter((c) => parseCloseTime(c) > 0);
          const openTimeCell = dateCells[0] || openTimeRaw;
          const closeTimeCell = dateCells[1] || dateCells[0] || openTimeRaw;

          runningBalance += profit + (isNaN(commission) ? 0 : commission) + (isNaN(swap) ? 0 : swap);

          const openIso = parseAnyDateString(openTimeCell);
          const closeIso = parseAnyDateString(closeTimeCell);

          const openTs = parseCloseTime(openIso);
          const closeTs = parseCloseTime(closeIso);
          const durationMinutes = Math.max(1, Math.round((closeTs - openTs) / 60000) || 15);

          rawTrades.push({
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
            stopLoss: 0,
            takeProfit: 0,
            commission: isNaN(commission) ? 0 : commission,
            swap: isNaN(swap) ? 0 : swap,
            profit,
            balanceAfterTrade: parseFloat(runningBalance.toFixed(2)),
            durationMinutes,
            isPartialClose: rowText.includes("in/out") || rowText.includes("partial"),
          });
        }
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
      if (Math.abs(t.profit) > Math.abs(existing.profit) || t.exitPrice > existing.exitPrice) {
        ticketMap.set(t.ticket, t);
      }
    }
  });

  return Array.from(ticketMap.values());
}
