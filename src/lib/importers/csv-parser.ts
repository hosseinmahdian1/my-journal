import { Trade, OrderType } from "@/types/trade";
import { getActiveAccountId } from "@/lib/storage/store";

export function parseCSVReport(csvText: string): Trade[] {
  const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].toLowerCase().split(",").map((h) => h.replace(/["']/g, "").trim());
  const trades: Trade[] = [];
  const activeAccountId = getActiveAccountId();

  const getColIdx = (names: string[]) => {
    return headers.findIndex((h) => names.some((n) => h.includes(n)));
  };

  const ticketIdx = getColIdx(["ticket", "order", "id", "#"]);
  const symbolIdx = getColIdx(["symbol", "item", "pair"]);
  const typeIdx = getColIdx(["type", "action", "cmd"]);
  const lotIdx = getColIdx(["volume", "size", "lot", "amount"]);
  const openTimeIdx = getColIdx(["open time", "opentime", "date", "created"]);
  const closeTimeIdx = getColIdx(["close time", "closetime", "close_time"]);
  const entryIdx = getColIdx(["open price", "openprice", "price", "entry"]);
  const exitIdx = getColIdx(["close price", "closeprice", "exit"]);
  const slIdx = getColIdx(["sl", "s/l", "stoploss", "stop loss"]);
  const tpIdx = getColIdx(["tp", "t/p", "takeprofit", "take profit"]);
  const profitIdx = getColIdx(["profit", "pnl", "gain", "net profit"]);
  const commissionIdx = getColIdx(["commission", "comm"]);
  const swapIdx = getColIdx(["swap", "rollover"]);

  let runningBalance = 10000;

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.replace(/["']/g, "").trim());
    if (cols.length < 3) continue;

    const ticket = ticketIdx !== -1 ? parseInt(cols[ticketIdx], 10) : 1000 + i;
    const symbol = (symbolIdx !== -1 ? cols[symbolIdx] : "XAUUSD").toUpperCase();
    const typeStr = (typeIdx !== -1 ? cols[typeIdx] : "buy").toLowerCase();

    if (!typeStr.includes("buy") && !typeStr.includes("sell")) continue;

    const lotSize = lotIdx !== -1 ? parseFloat(cols[lotIdx]) || 0.1 : 0.1;
    const entryPrice = entryIdx !== -1 ? parseFloat(cols[entryIdx]) || 0 : 0;
    const exitPrice = exitIdx !== -1 ? parseFloat(cols[exitIdx]) || entryPrice : entryPrice;
    const profit = profitIdx !== -1 ? parseFloat(cols[profitIdx]) || 0 : 0;
    const commission = commissionIdx !== -1 ? parseFloat(cols[commissionIdx]) || 0 : 0;
    const swap = swapIdx !== -1 ? parseFloat(cols[swapIdx]) || 0 : 0;
    const sl = slIdx !== -1 ? parseFloat(cols[slIdx]) || 0 : 0;
    const tp = tpIdx !== -1 ? parseFloat(cols[tpIdx]) || 0 : 0;

    const openTimeStr = openTimeIdx !== -1 ? cols[openTimeIdx] : "";
    const closeTimeStr = closeTimeIdx !== -1 ? cols[closeTimeIdx] : openTimeStr;

    const openDate = openTimeStr ? new Date(openTimeStr.replace(/\./g, "-")) : new Date();
    const closeDate = closeTimeStr ? new Date(closeTimeStr.replace(/\./g, "-")) : new Date();
    const durationMinutes = Math.max(1, Math.round((closeDate.getTime() - openDate.getTime()) / 60000) || 30);

    runningBalance += profit + commission + swap;

    trades.push({
      id: `csv-${ticket}-${i}`,
      accountId: activeAccountId,
      ticket: isNaN(ticket) ? i : ticket,
      symbol,
      orderType: typeStr.includes("buy") ? "BUY" : "SELL",
      lotSize,
      openTime: isNaN(openDate.getTime()) ? new Date().toISOString() : openDate.toISOString(),
      closeTime: isNaN(closeDate.getTime()) ? new Date().toISOString() : closeDate.toISOString(),
      entryPrice,
      exitPrice,
      stopLoss: sl,
      takeProfit: tp,
      commission,
      swap,
      profit,
      balanceAfterTrade: parseFloat(runningBalance.toFixed(2)),
      durationMinutes,
    });
  }

  return trades;
}
