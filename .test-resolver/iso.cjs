// Test isolatePositionsSection against the real report
const fs = require("fs");
const path = require("path");
const { isolatePositionsSection } = require("./dist3/full.js");
const html = fs.readFileSync(path.resolve("../test-report.html"), "utf-8");

// Replace null-char-handling trace since cleanRawContent chokes on some inputs
const isolated = isolatePositionsSection(html);
console.log("orig length:", html.length, "isolated length:", isolated.length);

// Count tables after isolation
const tableMatches = isolated.match(/<table\b/gi) || [];
console.log("tables after isolation:", tableMatches.length);

// Snippet — what's around positions / orders
const positionsIdx = isolated.toLowerCase().indexOf("positions");
const ordersIdx = isolated.toLowerCase().indexOf("orders");
const dealsIdx = isolated.toLowerCase().indexOf("deals");
console.log("positions idx:", positionsIdx, "orders idx:", ordersIdx, "deals idx:", dealsIdx);
