import { Trade } from "@/types/trade";
import { getActiveAccountId } from "@/lib/storage/store";

/**
 * Filters out hidden <td> elements from a row's cell array.
 * MT4 reports from some brokers (e.g. "Sarmaye Gozare Bartar") include
 * a hidden column with class="hidden" and colspan="8" containing the EA name.
 * We also filter cells with display:none in inline style.
 */
function getVisibleCells(row: HTMLTableRowElement): string[] {
  const allCells = Array.from(row.querySelectorAll("td"));
  return allCells
    .filter((td) => {
      // Filter out cells with class "hidden"
      if (td.classList.contains("hidden")) return false;
      // Filter out cells with display:none in inline style
      const style = td.getAttribute("style") || "";
      if (/display\s*:\s*none/i.test(style)) return false;
      return true;
    })
    .map((td) => (td.textContent || "").trim());
}

/**
 * Check if a row looks like a trade data row in MT4 format.
 * After filtering hidden cells, the expected columns are:
 * [0]=Time(open) [1]=Position/Ticket [2]=Symbol [3]=Type
 * [4]=Volume [5]=Price(entry) [6]=SL [7]=TP
 * [8]=Time(close) [9]=Price(exit) [10]=Commission [11]=Swap [12]=Profit
 */
function isTradeRow(cells: string[]): boolean {
  if (cells.length < 12) return false;
  const timePattern = /^\d{4}\.\d{2}\.\d{2}\s+\d{2}:\d{2}(:\d{2})?$/;
  const openTime = cells[0];
  const ticket = parseInt(cells[1], 10);
  const type = (cells[3] || "").toLowerCase();
  
  const isTypeValid = type === "buy" || type === "sell" || type === "خرید" || type === "فروش";

  // cells[4] must be a numeric volume, not "in"/"out" (which indicates a Deals row)
  const volume = parseFloat(cells[4]);
  const hasValidVolume = !isNaN(volume) && volume > 0;
  // cells[8] should be a date (close time), not an order number (Deals row)
  const closeTimeLooksLikeDate = timePattern.test(cells[8] || "");
  return (
    timePattern.test(openTime) &&
    !isNaN(ticket) &&
    ticket > 0 &&
    isTypeValid &&
    hasValidVolume &&
    closeTimeLooksLikeDate
  );
}

export function parseMT4Report(htmlContent: string): Trade[] {
  const trades: Trade[] = [];
  const activeAccountId = getActiveAccountId();

  if (typeof window === "undefined" || !htmlContent) return trades;

  // Clean null characters from UTF-16LE files if present
  const cleanContent = htmlContent.replace(/\0/g, "");

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = cleanContent;

  const rows = Array.from(tempDiv.querySelectorAll("tr"));
  let runningBalance = 10000;

  rows.forEach((row, rowIdx) => {
    const cells = getVisibleCells(row);

    // MT4 Closed Transactions row — detect via visible cells after filtering hidden ones
    if (cells.length >= 12 && isTradeRow(cells)) {
      const openTimeRaw = cells[0] || "";
      const ticket = parseInt(cells[1], 10);
      const symbol = (cells[2] || "XAUUSD").toUpperCase();
      const typeStr = (cells[3] || "").toLowerCase();
      const lotSize = parseFloat(cells[4]) || 0.01;
      const entryPrice = parseFloat(cells[5]) || 0;
      const sl = parseFloat(cells[6]) || 0;
      const tp = parseFloat(cells[7]) || 0;
      const closeTimeRaw = cells[8] || openTimeRaw;
      const exitPrice = parseFloat(cells[9]) || entryPrice;
      const commission = parseFloat(cells[10]) || 0;
      const swap = parseFloat(cells[11]) || 0;
      // Profit may be in cells[12] (colspan=2) — use last visible cell as fallback
      const profit = parseFloat(cells[12] || cells[cells.length - 1]) || 0;

      runningBalance += profit + commission + swap;

      const parseDate = (dStr: string) => {
        if (!dStr) return new Date();
        // MT4 format: YYYY.MM.DD HH:MM:SS → normalize to ISO
        const normalized = dStr.replace(/\./g, "/").replace(" ", "T");
        const parsed = new Date(normalized);
        return isNaN(parsed.getTime()) ? new Date() : parsed;
      };

      const openDate = parseDate(openTimeRaw);
      const closeDate = parseDate(closeTimeRaw);
      const durationMinutes = Math.max(
        1,
        Math.round((closeDate.getTime() - openDate.getTime()) / 60000) || 30
      );

      trades.push({
        id: `mt4-${ticket}-${rowIdx}`,
        accountId: activeAccountId,
        ticket,
        symbol,
        orderType: (typeStr === "buy" || typeStr === "خرید") ? "BUY" : "SELL",
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
        rrRatio:
          sl > 0 && entryPrice !== sl
            ? parseFloat(
                (
                  Math.abs(exitPrice - entryPrice) /
                  Math.abs(entryPrice - sl)
                ).toFixed(2)
              )
            : 2.0,
        isBreakEven: Math.abs(profit) < 1.0,
      });
    }
  });

  // Fallback regex scanner if table DOM didn't catch MT4 formatted rows
  if (trades.length === 0) {
    const textLines = cleanContent.split(/\r?\n/);
    textLines.forEach((line, i) => {
      const cleanLine = line.replace(/<[^>]+>/g, " ").trim();
      const parts = cleanLine.split(/\s+/);
      if (parts.length >= 8) {
        const ticket = parseInt(parts[0], 10);
        const typeStr = parts[2]?.toLowerCase();
        if (!isNaN(ticket) && ticket > 100 && (typeStr === "buy" || typeStr === "sell" || typeStr === "خرید" || typeStr === "فروش")) {
          const symbol = parts[4]?.toUpperCase() || "XAUUSD";
          const lotSize = parseFloat(parts[3]) || 0.1;
          const entryPrice = parseFloat(parts[5]) || 0;
          const exitPrice =
            parseFloat(parts[9]) || parseFloat(parts[7]) || entryPrice;
          const profit = parseFloat(parts[parts.length - 1]) || 0;

          trades.push({
            id: `mt4-txt-${ticket}-${i}`,
            accountId: activeAccountId,
            ticket,
            symbol,
            orderType: (typeStr === "buy" || typeStr === "خرید") ? "BUY" : "SELL",
            lotSize,
            openTime: new Date().toISOString(),
            closeTime: new Date().toISOString(),
            entryPrice,
            exitPrice,
            stopLoss: 0,
            takeProfit: 0,
            commission: 0,
            swap: 0,
            profit,
            balanceAfterTrade: 10000 + profit,
            durationMinutes: 30,
          });
        }
      }
    });
  }

  return trades;
}
