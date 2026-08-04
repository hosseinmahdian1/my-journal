import { Trade } from "@/types/trade";
import { getActiveAccountId } from "@/lib/storage/store";
import { parseMetaTraderDate } from "@/lib/utils/date-utils";

function getVisibleCells(row: HTMLTableRowElement): string[] {
  const allCells = Array.from(row.querySelectorAll("td"));
  return allCells
    .filter((td) => {
      if (td.classList.contains("hidden")) return false;
      const style = td.getAttribute("style") || "";
      if (/display\s*:\s*none/i.test(style)) return false;
      return true;
    })
    .map((td) => (td.textContent || "").replace(/\u00A0/g, " ").trim());
}

export function parseMT4Report(htmlContent: string): Trade[] {
  const trades: Trade[] = [];
  const activeAccountId = getActiveAccountId();

  if (typeof window === "undefined" || !htmlContent) return trades;

  const cleanContent = htmlContent.replace(/\0/g, "");
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = cleanContent;

  const rows = Array.from(tempDiv.querySelectorAll("tr"));
  let runningBalance = 10000;

  const datePattern = /(\d{4}[.\/-]\d{2}[.\/-]\d{2}|\d{2}[.\/-]\d{2}[.\/-]\d{4})[\sT]+(\d{2}:\d{2}(?::\d{2})?)/;

  rows.forEach((row, rowIdx) => {
    const cells = getVisibleCells(row);
    if (cells.length < 10) return;

    let ticket = 0;
    let symbol = "";
    let lotSize = 0.01;
    let entryPrice = 0;
    let exitPrice = 0;
    let sl = 0;
    let tp = 0;
    let profit = 0;
    let commission = 0;
    let swap = 0;

    const dateMatches: string[] = [];
    cells.forEach((cell) => {
      const match = cell.match(datePattern);
      if (match) dateMatches.push(match[0]);
    });

    const fullStr = cells.join(" ").toLowerCase();
    const isBuy = fullStr.includes("buy");
    const isSell = fullStr.includes("sell");
    if (!isBuy && !isSell) return;

    // Parse ticket
    for (const c of cells) {
      if (/^\b\d{5,9}\b$/.test(c)) {
        ticket = parseInt(c, 10);
        break;
      }
    }
    if (!ticket) return;

    // Parse symbol
    for (const c of cells) {
      const upper = c.toUpperCase().replace(/[^A-Z0-9]/g, "");
      if (upper.length >= 3 && upper.length <= 10 && !upper.includes("BUY") && !upper.includes("SELL") && !upper.includes("TOTAL") && isNaN(Number(upper))) {
        symbol = upper;
        break;
      }
    }

    // Extract numbers, completely ignoring cells that are Dates (otherwise year/month becomes price)
    const nonDateCells = cells.filter(c => !datePattern.test(c));
    const nums = nonDateCells
      .map((c) => parseFloat(c.replace(/[^0-9.-]/g, "")))
      .filter((n) => !isNaN(n));

    lotSize = nums.find((n) => n > 0 && n <= 100 && n !== ticket) || 0.01;
    profit = nums.length > 0 ? nums[nums.length - 1] : 0;
    entryPrice = nums.find((n) => n > 0.0001 && n !== ticket && n !== lotSize) || 1.0;
    exitPrice = nums.length > 3 ? nums[nums.length - 2] : entryPrice;

    runningBalance += profit;

    const openTimeRaw = dateMatches[0] || "";
    const closeTimeRaw = dateMatches[1] || openTimeRaw;

    const openDate = parseMetaTraderDate(openTimeRaw, rowIdx * 2 + 1);
    const closeDate = parseMetaTraderDate(closeTimeRaw, rowIdx * 2);

    const durationMinutes = Math.max(
      1,
      Math.round((closeDate.getTime() - openDate.getTime()) / 60000) || 30
    );

    trades.push({
      id: `mt4-${ticket}-${rowIdx}`,
      accountId: activeAccountId,
      ticket,
      symbol: symbol || "XAUUSD",
      orderType: isBuy ? "BUY" : "SELL",
      lotSize,
      openTime: openDate.toISOString(),
      closeTime: closeDate.toISOString(),
      entryPrice,
      exitPrice,
      stopLoss: sl,
      takeProfit: tp,
      commission,
      swap,
      profit,
      balanceAfterTrade: parseFloat(runningBalance.toFixed(2)),
      durationMinutes,
      rrRatio: 2.0,
      isBreakEven: Math.abs(profit) < 1.0,
    });
  });

  return trades;
}
