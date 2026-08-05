// Node-side smoke test for the new header-mapped parser.
// Mirrors the browser DOM logic for getVisibleCells / buildColumnMap / parseRowByHeaderMap.
const fs = require("fs");
const path = require("path");
const { buildColumnMap, parseRowByHeaderMap, parseRowSemanticAnchors } = require("./dist3/full.js");

// ---------------- regex-based table extractor (mirrors what browser DOM would give) ----------------
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

// ---------------- main ----------------
const reportPath = path.resolve(process.argv[2] || "test-report.html");
if (!fs.existsSync(reportPath)) {
  console.error("report not found at", reportPath);
  process.exit(1);
}
const html = fs.readFileSync(reportPath, "utf-8");
const tables = parseTables(html);

console.log("found", tables.length, "tables in report");

let totalTrades = 0;
let headerMappedTrades = 0;
let fallbackTrades = 0;
const colMapsFound = [];

tables.forEach((table, ti) => {
  let colMap = null;
  console.log(`\n=== TABLE ${ti} rows=${table.length} ===`);
  table.forEach((row, rowIdx) => {
    const cells = getVisibleCells(row);
    if (!cells || cells.length < 5) return;
    if (!colMap) {
      const c = buildColumnMap(cells);
      if (c) {
        colMap = c;
        colMapsFound.push({ tableIdx: ti, rowIdx, colMap: c, cells });
        console.log(`  header row at table[${ti}].row[${rowIdx}]:`, JSON.stringify(cells));
        console.log(`  → colMap:`, JSON.stringify(c));
        return;
      }
      // no header detected — fallback semantic
      const fb = parseRowSemanticAnchors(cells, rowIdx, "test-acct");
      if (fb) {
        fallbackTrades++;
        totalTrades++;
      }
      return;
    }
    const t = parseRowByHeaderMap(cells, colMap, rowIdx, "test-acct");
    if (t) {
      headerMappedTrades++;
      totalTrades++;
      if (headerMappedTrades <= 5) {
        console.log(`  trade via header: ticket=${t.ticket} ${t.orderType} ${t.symbol} lot=${t.lotSize} entry=${t.entryPrice} exit=${t.exitPrice} sl=${t.stopLoss} tp=${t.takeProfit} comm=${t.commission} swap=${t.swap} profit=${t.profit} open=${t.openTime} close=${t.closeTime}`);
      }
    }
  });
});

console.log("\n=== SUMMARY ===");
console.log("total trades parsed:", totalTrades);
console.log("  via header map:", headerMappedTrades);
console.log("  via fallback:", fallbackTrades);
console.log("header rows detected:", colMapsFound.length);

// Final sanity check against the user's known sample: ticket 56642855 should be
// sell XAUUSD 0.05 entry 4043.07 exit 4032.04 comm -0.23 profit 55.15.
const expected = {
  56642855: { orderType: "SELL", symbol: "XAUUSD", lotSize: 0.05, entryPrice: 4043.07, exitPrice: 4032.04, profit: 55.15, commission: -0.23, swap: 0, stopLoss: 4052.5, takeProfit: 4032.05 },
  56739535: { orderType: "BUY", lotSize: 0.07, entryPrice: 4046.28, exitPrice: 4042.59, profit: -25.83 },
};

console.log("\n=== EXPECTED SAMPLE CHECK ===");
tables.forEach((table) => {
  // run through parser to get trade records
  let colMap = null;
  table.forEach((row, rowIdx) => {
    const cells = getVisibleCells(row);
    if (!cells || cells.length < 5) return;
    if (!colMap) {
      colMap = buildColumnMap(cells);
      return;
    }
    const t = parseRowByHeaderMap(cells, colMap, rowIdx, "test-acct");
    if (!t) return;
    const exp = expected[t.ticket];
    if (!exp) return;
    const fields = ["orderType","symbol","lotSize","entryPrice","exitPrice","profit","commission","swap","stopLoss","takeProfit"];
    let ok = true;
    fields.forEach((f) => {
      if (exp[f] === undefined) return;
      if (Math.abs((t[f] - exp[f]) || 0) > 0.001 && String(t[f]) !== String(exp[f])) {
        console.log(`  ticket ${t.ticket} field ${f}: expected=${exp[f]} got=${t[f]}  ❌`);
        ok = false;
      }
    });
    if (ok) console.log(`  ticket ${t.ticket}: all expected fields match ✅`);
  });
});
