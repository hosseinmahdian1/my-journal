import { Trade } from "@/types/trade";
import { getActiveAccountId } from "@/lib/storage/store";
import { parseRowSmart } from "./smart-column-resolver";

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

    // Skip open trades / working orders / summary sections
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
      const parsedTrade = parseRowSmart(cells, rowIdx, activeAccountId);
      if (parsedTrade) {
        runningBalance += parsedTrade.profit + parsedTrade.commission + parsedTrade.swap;
        parsedTrade.balanceAfterTrade = parseFloat(runningBalance.toFixed(2));
        rawTrades.push(parsedTrade);
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
