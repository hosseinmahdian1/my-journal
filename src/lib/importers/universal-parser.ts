import { Trade } from "@/types/trade";
import { getActiveAccountId } from "@/lib/storage/store";
import { parseRowSmart, buildHeaderColumnMap, ColumnMap } from "./smart-column-resolver";

export function parseUniversalReport(content: string): Trade[] {
  const rawTrades: Trade[] = [];
  const activeAccountId = getActiveAccountId();
  if (!content || typeof window === "undefined") return [];

  const clean = content.replace(/\0/g, "").replace(/\r\n/g, "\n");
  let runningBalance = 10000;

  // -------------------------------------------------------------
  // STRATEGY 1: DOM Table Extraction with Smart Column Resolver
  // -------------------------------------------------------------
  try {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = clean;
    const tables = Array.from(tempDiv.querySelectorAll("table"));

    tables.forEach((table) => {
      const tableText = (table.textContent || "").toLowerCase();

      // Skip open trades / working orders / summary tables
      if (
        tableText.includes("open trades") ||
        tableText.includes("working orders") ||
        tableText.includes("orders")
      ) {
        if (!tableText.includes("closed transactions") && !tableText.includes("positions") && !tableText.includes("deals")) {
          return;
        }
      }

      const rows = Array.from(table.querySelectorAll("tr"));

      // Find header row cells to build dynamic column map
      let columnMap: ColumnMap | null = null;
      for (const r of rows) {
        const headerCells = Array.from(r.querySelectorAll("th, td")).map((c) => (c.textContent || "").trim());
        const map = buildHeaderColumnMap(headerCells);
        if (map) {
          columnMap = map;
          break;
        }
      }

      rows.forEach((row, rowIdx) => {
        const textCells = Array.from(row.querySelectorAll("td, th")).map((c) =>
          (c.textContent || "").trim()
        );
        const parsedTrade = parseRowSmart(textCells, rowIdx, activeAccountId, columnMap);
        if (parsedTrade) {
          runningBalance += parsedTrade.profit + parsedTrade.commission + parsedTrade.swap;
          parsedTrade.balanceAfterTrade = parseFloat(runningBalance.toFixed(2));
          rawTrades.push(parsedTrade);
        }
      });
    });
  } catch (e) {
    console.warn("DOM parsing fallback:", e);
  }

  // -------------------------------------------------------------
  // STRATEGY 2: Line-by-Line Regex Scanner with Smart Column Resolver
  // -------------------------------------------------------------
  if (rawTrades.length === 0) {
    const lines = clean.split("\n");
    let columnMap: ColumnMap | null = null;

    // Scan lines for header
    for (const l of lines) {
      const parts = l.replace(/<[^>]+>/g, " ").split(/[\s,;\t]+/).map((p) => p.trim()).filter(Boolean);
      const map = buildHeaderColumnMap(parts);
      if (map) {
        columnMap = map;
        break;
      }
    }

    lines.forEach((line, idx) => {
      const parts = line
        .replace(/<[^>]+>/g, " ")
        .split(/[\s,;\t]+/)
        .map((p) => p.trim())
        .filter(Boolean);

      const parsedTrade = parseRowSmart(parts, idx, activeAccountId, columnMap);
      if (parsedTrade) {
        runningBalance += parsedTrade.profit + parsedTrade.commission + parsedTrade.swap;
        parsedTrade.balanceAfterTrade = parseFloat(runningBalance.toFixed(2));
        rawTrades.push(parsedTrade);
      }
    });
  }

  // Deduplicate by ticket number
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
