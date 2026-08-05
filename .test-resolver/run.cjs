// Node-side smoke test for the new header-mapped parser.
const fs = require("fs");
const path = require("path");
const {
  buildColumnMap,
  parseRowByHeaderMap,
  parseRowSemanticAnchors,
} = require("./dist3/full.js");

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
        cells.push({
          textContent: inner.replace(/\s+/g, " ").trim(),
          isHidden,
          displayNone,
        });
      }
      rows.push(cells);
    }
    tables.push(rows);
  }
  return tables;
}

function getVisibleCells(row) {
  return row.filter((c) => !c.isHidden && !c.displayNone).map((c) => c.textContent);
}

// Each table gets its own colMap, exactly like mt5-parser.ts does
function parseReport(html, accountId) {
  const tables = parseTables(html);
  const rawTrades = [];
  let runningBalance = 10000;

  tables.forEach((table) => {
    let colMap = null;
    table.forEach((row, rowIdx) => {
      const cells = getVisibleCells(row);
      if (!cells || cells.length < 5) return;
      if (!colMap) {
        const c = buildColumnMap(cells);
        if (c) { colMap = c; return; }
        const fb = parseRowSemanticAnchors(cells, rowIdx, accountId);
        if (fb) {
          runningBalance += fb.profit + fb.commission + fb.swap;
          fb.balanceAfterTrade = +runningBalance.toFixed(2);
          rawTrades.push(fb);
        }
        return;
      }
      const requiredMaxCol = Math.max(
        colMap.openTimeIdx, colMap.ticketIdx, colMap.symbolIdx, colMap.typeIdx,
        colMap.volumeIdx, colMap.entryPriceIdx, colMap.slIdx, colMap.tpIdx,
        colMap.closeTimeIdx, colMap.exitPriceIdx, colMap.commissionIdx,
        colMap.swapIdx, colMap.profitIdx
      );
      if (requiredMaxCol >= cells.length) {
        const rec = buildColumnMap(cells);
        if (rec) colMap = rec;
        return;
      }
      const t = parseRowByHeaderMap(cells, colMap, rowIdx, accountId);
      if (t) {
        runningBalance += t.profit + t.commission + t.swap;
        t.balanceAfterTrade = +runningBalance.toFixed(2);
        rawTrades.push(t);
      }
    });
  });

  // Dedup by ticket
  const ticketMap = new Map();
  rawTrades.forEach((t) => {
    const e = ticketMap.get(t.ticket);
    if (!e) ticketMap.set(t.ticket, t);
    else if (Math.abs(t.profit) > Math.abs(e.profit)) ticketMap.set(t.ticket, t);
  });
  return Array.from(ticketMap.values());
}

const reportPath = path.resolve(process.argv[2] || "../test-report.html");
const html = fs.readFileSync(reportPath, "utf-8");
const trades = parseReport(html, "test-acct");

console.log("=== TRADES (after dedup) ===");
console.log("unique trades:", trades.length);

const sumProfit = trades.reduce((a, t) => a + t.profit, 0);
console.log("sum profit (= reported 183.72):", sumProfit.toFixed(2));

console.log("\n=== POSITIONS TABLE (only trades from 1st table) ===");
const positions = parseReport(html, "test-acct");
positions.forEach((t, i) => {
  console.log(JSON.stringify({
    idx: i,
    ticket: t.ticket,
    orderType: t.orderType,
    symbol: t.symbol,
    lotSize: t.lotSize,
    entryPrice: t.entryPrice,
    exitPrice: t.exitPrice,
    stopLoss: t.stopLoss,
    takeProfit: t.takeProfit,
    commission: t.commission,
    swap: t.swap,
    profit: t.profit,
    openTime: t.openTime,
    closeTime: t.closeTime,
  }));
});

// Sample test: ticket 56642855 should match user's known values
const expected = [
  { ticket: 56642855, orderType: "SELL", lotSize: 0.05, entryPrice: 4043.07, exitPrice: 4032.04, stopLoss: 4052.5, takeProfit: 4032.05, commission: -0.23, swap: 0, profit: 55.15 },
  { ticket: 56739535, orderType: "BUY", lotSize: 0.07, entryPrice: 4046.28, exitPrice: 4042.59, stopLoss: 4039.35, takeProfit: 4053.04, commission: -0.32, swap: 0, profit: -25.83 },
];

console.log("\n=== EXPECTED SAMPLE CHECK ===");
let allOk = true;
expected.forEach((exp) => {
  const t = trades.find((x) => x.ticket === exp.ticket);
  if (!t) {
    console.log(`  ❌ ticket ${exp.ticket} not found`);
    allOk = false;
    return;
  }
  let ok = true;
  Object.keys(exp).forEach((f) => {
    if (f === "ticket") return;
    const got = t[f];
    const expV = exp[f];
    const same = typeof got === "number"
      ? Math.abs(got - expV) < 0.001
      : got === expV;
    if (!same) { console.log(`  ❌ ticket ${exp.ticket} field ${f}: expected=${expV} got=${got}`); ok = false; allOk = false; }
  });
  if (ok) console.log(`  ✅ ticket ${exp.ticket} matches expected`);
});

console.log("\noverall:", allOk ? "PASS ✅" : "FAIL ❌");
process.exit(allOk ? 0 : 1);
