import { Trade } from "@/types/trade";
import { getActiveAccountId } from "@/lib/storage/store";
import {
  isolatePositionsSection,
  buildColumnMap,
  parseRowByHeaderMap,
  parseRowSemanticAnchors,
  ColumnMap,
} from "./smart-column-resolver";

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
  const rawTrades: Trade[] = [];
  const activeAccountId = getActiveAccountId();

  if (typeof window === "undefined" || !htmlContent) return [];

  // Step 1: Section Isolation
  const isolatedContent = isolatePositionsSection(htmlContent);

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = isolatedContent;

  const tables = Array.from(tempDiv.querySelectorAll("table"));
  let colMap: ColumnMap | null = null;
  let runningBalance = 10000;

  tables.forEach((table) => {
    const rows = Array.from(table.querySelectorAll("tr"));
    // Reset colMap per table — different tables (Positions / Orders / Deals)
    // have different column layouts and must not share header maps.
    colMap = null;
    rows.forEach((row, rowIdx) => {
      const cells = getVisibleCells(row);
      if (!cells || cells.length < 5) return;

      // Try to detect header row first; once found, all subsequent rows in
      // this table use the header map.
      if (!colMap) {
        const candidate = buildColumnMap(cells);
        if (candidate) {
          colMap = candidate;
          return;
        }
        // No header detected — fall back to the legacy semantic anchors.
        const fallback = parseRowSemanticAnchors(cells, rowIdx, activeAccountId);
        if (fallback) {
          runningBalance += fallback.profit + fallback.commission + fallback.swap;
          fallback.balanceAfterTrade = parseFloat(runningBalance.toFixed(2));
          rawTrades.push(fallback);
        }
        return;
      }

      // Verify the data row still has enough cells for the mapped columns;
      // if the row is sparse (a future table that doesn't match this header),
      // drop it — don't risk misaligned values.
      const requiredMaxCol = Math.max(
        colMap.openTimeIdx,
        colMap.ticketIdx,
        colMap.symbolIdx,
        colMap.typeIdx,
        colMap.volumeIdx,
        colMap.entryPriceIdx,
        colMap.slIdx,
        colMap.tpIdx,
        colMap.closeTimeIdx,
        colMap.exitPriceIdx,
        colMap.commissionIdx,
        colMap.swapIdx,
        colMap.profitIdx
      );
      if (requiredMaxCol >= cells.length) {
        const recandidate = buildColumnMap(cells);
        if (recandidate) {
          colMap = recandidate;
        }
        return;
      }

      // We have a header map — parse using explicit column indices.
      const parsedTrade = parseRowByHeaderMap(cells, colMap, rowIdx, activeAccountId);
      if (parsedTrade) {
        runningBalance += parsedTrade.profit + parsedTrade.commission + parsedTrade.swap;
        parsedTrade.balanceAfterTrade = parseFloat(runningBalance.toFixed(2));
        rawTrades.push(parsedTrade);
      }
    });
  });

  // Fallback: If no tables caught trades, parse lines of isolated content
  if (rawTrades.length === 0) {
    const lines = isolatedContent.split("\n");
    lines.forEach((line, idx) => {
      const parts = line
        .replace(/<[^>]+>/g, " ")
        .split(/[\s,;\t]+/)
        .map((p) => p.trim())
        .filter(Boolean);

      const parsedTrade = parseRowSemanticAnchors(parts, idx, activeAccountId);
      if (parsedTrade) {
        runningBalance += parsedTrade.profit + parsedTrade.commission + parsedTrade.swap;
        parsedTrade.balanceAfterTrade = parseFloat(runningBalance.toFixed(2));
        rawTrades.push(parsedTrade);
      }
    });
  }

  // Deduplicate by ticket number: Keep the trade with the largest absolute profit.
  const ticketMap = new Map<number, Trade>();
  rawTrades.forEach((t) => {
    const existing = ticketMap.get(t.ticket);
    if (!existing) ticketMap.set(t.ticket, t);
    else if (Math.abs(t.profit) > Math.abs(existing.profit)) ticketMap.set(t.ticket, t);
  });

  return Array.from(ticketMap.values());
}
