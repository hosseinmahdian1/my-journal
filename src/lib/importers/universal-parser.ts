import { Trade } from "@/types/trade";
import { getActiveAccountId } from "@/lib/storage/store";
import { parseCloseTime, parseAnyDateString } from "@/lib/utils/date-utils";

export function parseUniversalReport(content: string): Trade[] {
  const rawTrades: Trade[] = [];
  const activeAccountId = getActiveAccountId();
  if (!content || typeof window === "undefined") return [];

  const clean = content.replace(/\0/g, "").replace(/\r\n/g, "\n");
  let runningBalance = 10000;

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
      rows.forEach((row, rowIdx) => {
        const textCells = Array.from(row.querySelectorAll("td, th")).map((c) =>
          (c.textContent || "").trim()
        );
        if (textCells.length < 5) return;

        const fullRowStr = textCells.join(" ").toLowerCase();

        // Skip summary / header / balance / in deal rows
        if (
          fullRowStr.includes("total") ||
          fullRowStr.includes("balance") ||
          fullRowStr.includes("credit") ||
          fullRowStr.includes("deposit") ||
          fullRowStr.includes("withdraw") ||
          (fullRowStr.includes(" in ") && !fullRowStr.includes("out"))
        ) {
          return;
        }

        const isBuy = fullRowStr.includes("buy") || fullRowStr.includes("خرید");
        const isSell = fullRowStr.includes("sell") || fullRowStr.includes("فروش");
        if (!isBuy && !isSell) return;

        // Scan for real dates inside row text cells
        const foundDateCells = textCells.filter((c) => parseCloseTime(c) > 0);
        const openDateRaw = foundDateCells[0];
        const closeDateRaw = foundDateCells[1] || foundDateCells[0];

        const openIso = parseAnyDateString(openDateRaw);
        const closeIso = parseAnyDateString(closeDateRaw);

        // Extract numbers from row
        const nums = textCells
          .map((tc) => {
            const cleaned = tc.replace(/[^0-9.-]/g, "");
            return parseFloat(cleaned);
          })
          .filter((n) => !isNaN(n));

        // Extract symbol
        let symbol = "XAUUSD";
        for (const cell of textCells) {
          const uppercase = cell.toUpperCase().replace(/[^A-Z0-9]/g, "");
          if (
            uppercase.length >= 3 &&
            uppercase.length <= 10 &&
            !uppercase.includes("BUY") &&
            !uppercase.includes("SELL") &&
            !uppercase.includes("TOTAL")
          ) {
            symbol = uppercase;
            break;
          }
        }

        const ticketCandidate = nums.find((n) => Number.isInteger(n) && n > 1000) || Date.now() + rowIdx;
        const lotCandidate = nums.find((n) => n > 0 && n <= 100 && n !== ticketCandidate) || 0.1;
        const profitCandidate = nums.length > 0 ? nums[nums.length - 1] : 0;
        const entryCandidate = nums.find((n) => n > 0.0001 && n !== ticketCandidate && n !== lotCandidate) || 1.0;
        const exitCandidate = nums.length > 3 ? nums[nums.length - 2] : entryCandidate;

        // Filter out bogus 0 entry & 0 exit trades
        if (entryCandidate === 0 && exitCandidate === 0) return;

        runningBalance += profitCandidate;

        const openTs = parseCloseTime(openIso);
        const closeTs = parseCloseTime(closeIso);
        const durationMinutes = Math.max(1, Math.round((closeTs - openTs) / 60000) || 15);

        rawTrades.push({
          id: `univ-dom-${ticketCandidate}-${rowIdx}`,
          accountId: activeAccountId,
          ticket: Math.floor(ticketCandidate),
          symbol,
          orderType: isBuy ? "BUY" : "SELL",
          lotSize: lotCandidate,
          openTime: openIso,
          closeTime: closeIso,
          entryPrice: entryCandidate,
          exitPrice: exitCandidate,
          stopLoss: 0,
          takeProfit: 0,
          commission: 0,
          swap: 0,
          profit: profitCandidate,
          balanceAfterTrade: parseFloat(runningBalance.toFixed(2)),
          durationMinutes,
          rrRatio: 2.0,
          isBreakEven: Math.abs(profitCandidate) < 1.0,
        });
      });
    });
  } catch (e) {
    console.warn("DOM parsing fallback:", e);
  }

  // Deduplicate ticket numbers
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
