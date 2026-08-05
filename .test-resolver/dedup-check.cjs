const fs = require("fs");
const path = require("path");
const { buildColumnMap, parseRowByHeaderMap } = require("./dist3/full.js");
const html = fs.readFileSync(path.resolve("../test-report.html"), "utf-8");

function parseTables(html) {
  const tables = [];
  const tableRe = /<table\b[^>]*>([\s\S]*?)<\/table>/gi;
  let m;
  while ((m = tableRe.exec(html)) !== null) {
    const rows = [];
    const trRe = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
    let tr;
    while ((tr = trRe.exec(m[1])) !== null) {
      const cells = [];
      const cellRe = /<(td|th)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
      let td;
      while ((td = cellRe.exec(tr[1])) !== null) {
        const attrs = td[2];
        const inner = td[3].replace(/<[^>]*>/g, " ");
        const isHidden = /class\s*=\s*"[^"]*\bhidden\b/.test(attrs);
        const displayNone = /display\s*:\s*none/i.test(attrs);
        cells.push({ textContent: inner.replace(/\s+/g, " ").trim(), isHidden, displayNone });
      }
      rows.push(cells);
    }
    tables.push(rows);
  }
  return tables;
}

const tables = parseTables(html);
const all = [];
tables.forEach((table) => {
  let colMap = null;
  table.forEach((row, idx) => {
    const cells = row.filter((c) => !c.isHidden && !c.displayNone).map((c) => c.textContent);
    if (!cells || cells.length < 5) return;
    if (!colMap) {
      colMap = buildColumnMap(cells);
      return;
    }
    const t = parseRowByHeaderMap(cells, colMap, idx, "test");
    if (t) all.push(t);
  });
});

const ticketMap = new Map();
all.forEach((t) => {
  const e = ticketMap.get(t.ticket);
  if (!e) ticketMap.set(t.ticket, t);
  else if (Math.abs(t.profit) > Math.abs(e.profit)) ticketMap.set(t.ticket, t);
});

const unique = Array.from(ticketMap.values());
console.log("unique trades after dedup:", unique.length);
const sumProfit = unique.reduce((a, t) => a + t.profit, 0);
console.log("sum of profit (= reported Net Profit 183.72):", sumProfit.toFixed(2));
console.log("tickets:", unique.map(t => t.ticket).join(", "));
console.log("first 3 trades:");
unique.slice(0,3).forEach(t => console.log(JSON.stringify({
  ticket: t.ticket, orderType: t.orderType, symbol: t.symbol, lotSize: t.lotSize,
  entryPrice: t.entryPrice, exitPrice: t.exitPrice, profit: t.profit,
  openTime: t.openTime, closeTime: t.closeTime, stopLoss: t.stopLoss, takeProfit: t.takeProfit,
  commission: t.commission, swap: t.swap
}, null, 2)));
