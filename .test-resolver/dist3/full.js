"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanRawContent = cleanRawContent;
exports.isolatePositionsSection = isolatePositionsSection;
exports.parseSmartNumber = parseSmartNumber;
exports.resolveStrictDateTime = resolveStrictDateTime;
exports.buildColumnMap = buildColumnMap;
exports.parseRowByHeaderMap = parseRowByHeaderMap;
exports.parseRowSemanticAnchors = parseRowSemanticAnchors;
const date_utils_1 = require("./lib/utils/date-utils");
/**
 * 1. ROBUST ENCODING DECODING (UTF-16 & UTF-8 Handling)
 * Strips null bytes (\u0000) and BOM markers (\uFEFF, \uFFFE).
 */
function cleanRawContent(content) {
    if (!content)
        return "";
    return content
        .replace(/\uFEFF|\uFFFE|\0/g, "")
        .replace(/\r\n/g, "\n");
}
/**
 * 2. SAFE SECTION ISOLATION
 */
function isolatePositionsSection(htmlOrText) {
    const clean = cleanRawContent(htmlOrText);
    const lower = clean.toLowerCase();
    let startIndex = lower.indexOf("positions");
    if (startIndex === -1) {
        startIndex = lower.indexOf("closed transactions");
    }
    if (startIndex === -1) {
        startIndex = lower.indexOf("تراکنش‌های بسته شده");
    }
    if (startIndex === -1) {
        startIndex = lower.indexOf("معاملات");
    }
    if (startIndex === -1) {
        startIndex = 0;
    }
    const isolatedFromStart = clean.substring(startIndex);
    if (isolatedFromStart.length < 300 || (!isolatedFromStart.toLowerCase().includes("buy") && !isolatedFromStart.toLowerCase().includes("sell"))) {
        return clean;
    }
    return isolatedFromStart;
}
/**
 * 4. SMART NUMBER PARSER (Preserves 0 values!)
 */
function parseSmartNumber(str) {
    if (str === undefined || str === null)
        return null;
    let cleaned = str.trim().replace(/[$€£\s]/g, "");
    if (!cleaned)
        return null;
    if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(cleaned)) {
        cleaned = cleaned.replace(/,/g, "");
    }
    else if (/^-?\d+,\d+$/.test(cleaned)) {
        cleaned = cleaned.replace(/,/g, ".");
    }
    cleaned = cleaned.replace(/[^0-9.-]/g, "");
    if (!cleaned || cleaned === "-")
        return null;
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
}
/**
 * Strict DateTime Regex Matcher (Year bounded 2000-2035).
 */
function resolveStrictDateTime(raw) {
    if (!raw || typeof raw !== "string")
        return null;
    const cleaned = raw.trim();
    if (!cleaned)
        return null;
    // YYYY.MM.DD or YYYY-MM-DD
    const yyyyMatch = cleaned.match(/(\d{4})[.\/-](\d{1,2})[.\/-](\d{1,2})(?:\s+|_)?(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    if (yyyyMatch) {
        let [, yearStr, monthStr, dayStr, hhStr = "00", mmStr = "00", ssStr = "00"] = yyyyMatch;
        const year = parseInt(yearStr, 10);
        const month = parseInt(monthStr, 10) - 1;
        const day = parseInt(dayStr, 10);
        const hh = parseInt(hhStr, 10);
        const mm = parseInt(mmStr, 10);
        const ss = parseInt(ssStr, 10);
        if (year >= 2000 && year <= 2035 && month >= 0 && month <= 11 && day >= 1 && day <= 31) {
            const d = new Date(Date.UTC(year, month, day, hh, mm, ss));
            if (!isNaN(d.getTime())) {
                return { iso: d.toISOString(), timestamp: d.getTime() };
            }
        }
    }
    // European format: DD.MM.YYYY
    const euroMatch = cleaned.match(/(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})(?:\s+|_)?(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    if (euroMatch) {
        let [, dayStr, monthStr, yearStr, hhStr = "00", mmStr = "00", ssStr = "00"] = euroMatch;
        const year = parseInt(yearStr, 10);
        const month = parseInt(monthStr, 10) - 1;
        const day = parseInt(dayStr, 10);
        const hh = parseInt(hhStr, 10);
        const mm = parseInt(mmStr, 10);
        const ss = parseInt(ssStr, 10);
        if (year >= 2000 && year <= 2035 && month >= 0 && month <= 11 && day >= 1 && day <= 31) {
            const d = new Date(Date.UTC(year, month, day, hh, mm, ss));
            if (!isNaN(d.getTime())) {
                return { iso: d.toISOString(), timestamp: d.getTime() };
            }
        }
    }
    const ts = (0, date_utils_1.parseCloseTime)(cleaned);
    if (ts > 0) {
        const d = new Date(ts);
        const y = d.getUTCFullYear();
        if (y >= 2000 && y <= 2035) {
            return { iso: d.toISOString(), timestamp: ts };
        }
    }
    return null;
}
/** Normalize a header cell to a canonical token we can match on. */
function normHeader(s) {
    return (s || "")
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[/.]/g, "") // "S/L" -> "sl", "T/P" -> "tp"
        .replace(/&nbsp;/g, "");
}
/**
 * Try to identify the column indices from a row of header cells.
 *
 * Real header structure for MT4/MT5 Positions reports (Sarmaye Gozare Bartar):
 *   Time | Position | Symbol | Type | Volume | Price | S/L | T/P | Time | Price | Commission | Swap | Profit
 *
 * - "Time" appears twice → first → openTimeIdx, second → closeTimeIdx
 * - "Price" appears twice → first → entryPriceIdx, second → exitPriceIdx
 *
 * Returns null if the row doesn't look like a header (so the caller can fallback
 * to the semantic-anchor approach).
 */
function buildColumnMap(cells) {
    if (!cells || cells.length < 8)
        return null;
    const normalized = cells.map(normHeader);
    // Quick header-score check: must contain at least 3 of these canonical tokens
    const headerTokens = new Set([
        "time",
        "ticket",
        "position",
        "order",
        "symbol",
        "type",
        "direction",
        "volume",
        "price",
        "s/l",
        "sl",
        "t/p",
        "tp",
        "commission",
        "comm",
        "swap",
        "profit",
        "deal",
    ]);
    let score = 0;
    for (const n of normalized) {
        if (headerTokens.has(n))
            score++;
    }
    if (score < 3)
        return null;
    const findIdx = (...needles) => {
        for (let i = 0; i < normalized.length; i++) {
            for (const needle of needles) {
                if (normalized[i] === needle)
                    return i;
            }
        }
        return -1;
    };
    // ---- open / close Time (first / second Time column)
    const timeIdxs = [];
    for (let i = 0; i < normalized.length; i++) {
        if (normalized[i] === "time" || normalized[i] === "opentime") {
            timeIdxs.push(i);
        }
    }
    // Some reports put a generic "Time" then later "Close Time" — capture order:
    if (timeIdxs.length === 0) {
        // Variant: "Open Time", "Close Time" — treat "Open Time" first, "Close Time" second
        for (let i = 0; i < normalized.length; i++) {
            if (normalized[i] === "closetime" || normalized[i] === "closedtime") {
                timeIdxs.push(i);
            }
        }
    }
    const openTimeIdx = timeIdxs[0] ?? -1;
    const closeTimeIdx = timeIdxs[1] ?? openTimeIdx;
    // ---- entry / exit Price (first / second Price column)
    const priceIdxs = [];
    for (let i = 0; i < normalized.length; i++) {
        if (normalized[i] === "price") {
            priceIdxs.push(i);
        }
    }
    const entryPriceIdx = priceIdxs[0] ?? -1;
    const exitPriceIdx = priceIdxs[1] ?? entryPriceIdx;
    // ---- unique-position columns
    const ticketIdx = findIdx("ticket", "position", "order", "deal");
    const symbolIdx = findIdx("symbol");
    const typeIdx = findIdx("type", "direction");
    const volumeIdx = findIdx("volume", "lots", "lot", "size");
    const slIdx = findIdx("s/l", "sl", "stoploss", "stop");
    const tpIdx = findIdx("t/p", "tp", "takeprofit", "profit1");
    const commissionIdx = findIdx("commission", "comm", "fee");
    const swapIdx = findIdx("swap");
    const profitIdx = findIdx("profit");
    // Sanity: require at least ticket + price + volume + profit to consider this a header
    if (ticketIdx === -1 ||
        (entryPriceIdx === -1 && exitPriceIdx === -1) ||
        volumeIdx === -1 ||
        profitIdx === -1) {
        return null;
    }
    return {
        openTimeIdx,
        ticketIdx,
        symbolIdx,
        typeIdx,
        volumeIdx,
        entryPriceIdx,
        slIdx,
        tpIdx,
        closeTimeIdx,
        exitPriceIdx,
        commissionIdx,
        swapIdx,
        profitIdx,
    };
}
/**
 * Parse a single trade row using an explicit column map (the preferred path).
 *
 * Reads each value by its column index instead of guessing.
 */
function parseRowByHeaderMap(cells, colMap, rowIdx, activeAccountId) {
    if (!cells || cells.length < 8 || !colMap)
        return null;
    const fullRowStr = cells.join(" ").toLowerCase();
    // Exclude header / summary / balance rows
    if (fullRowStr.includes("total") ||
        fullRowStr.includes("balance") ||
        fullRowStr.includes("credit") ||
        fullRowStr.includes("deposit") ||
        fullRowStr.includes("withdraw")) {
        return null;
    }
    // ------ Order type (buy / sell)
    let orderType = null;
    if (colMap.typeIdx >= 0 && colMap.typeIdx < cells.length) {
        const t = cells[colMap.typeIdx].toLowerCase().trim();
        if (t === "buy" || t === "خرید" || t === "long" || t === "in")
            orderType = "BUY";
        else if (t === "sell" || t === "فروش" || t === "short" || t === "out")
            orderType = "SELL";
    }
    if (!orderType) {
        // Fallback: scan whole row for any cell containing "buy"/"sell"
        for (const c of cells) {
            const t = c.toLowerCase().trim();
            if (t === "buy") {
                orderType = "BUY";
                break;
            }
            if (t === "sell") {
                orderType = "SELL";
                break;
            }
        }
    }
    if (!orderType)
        return null;
    // ------ Open / Close times
    let openTimeObj = null;
    let closeTimeObj = null;
    if (colMap.openTimeIdx >= 0 &&
        colMap.openTimeIdx < cells.length &&
        colMap.openTimeIdx !== colMap.closeTimeIdx) {
        openTimeObj = resolveStrictDateTime(cells[colMap.openTimeIdx]);
    }
    if (colMap.closeTimeIdx >= 0 && colMap.closeTimeIdx < cells.length) {
        closeTimeObj = resolveStrictDateTime(cells[colMap.closeTimeIdx]);
    }
    if (!openTimeObj) {
        // Fallback: first two date-like cells
        const dateAnchors = [];
        cells.forEach((c, idx) => {
            const resolved = resolveStrictDateTime(c);
            if (resolved)
                dateAnchors.push({ ...resolved, cellIdx: idx });
        });
        if (dateAnchors.length > 0)
            openTimeObj = dateAnchors[0];
        if (dateAnchors.length > 1)
            closeTimeObj = dateAnchors[1];
    }
    if (!closeTimeObj)
        closeTimeObj = openTimeObj;
    if (!openTimeObj)
        return null;
    // ------ Ticket (by column, then as a fallback digit-run not starting with a year)
    let ticket = 0;
    if (colMap.ticketIdx >= 0 && colMap.ticketIdx < cells.length) {
        const cleaned = cells[colMap.ticketIdx].replace(/[^0-9]/g, "");
        if (cleaned)
            ticket = parseInt(cleaned, 10);
    }
    if (!ticket || Number.isNaN(ticket)) {
        for (let i = 0; i < cells.length; i++) {
            const cellText = cells[i].trim();
            if (resolveStrictDateTime(cellText))
                continue;
            const cleanNum = cellText.replace(/[^0-9]/g, "");
            if (cleanNum.length >= 4 &&
                cleanNum.length <= 12 &&
                !cleanNum.startsWith("202") &&
                !cleanNum.startsWith("203")) {
                const parsed = parseInt(cleanNum, 10);
                if (!isNaN(parsed) && parsed >= 1000) {
                    ticket = parsed;
                    break;
                }
            }
        }
    }
    if (!ticket || Number.isNaN(ticket))
        ticket = Date.now() + rowIdx;
    // ------ Symbol (by column)
    let symbol = "";
    if (colMap.symbolIdx >= 0 && colMap.symbolIdx < cells.length) {
        symbol = cells[colMap.symbolIdx]
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, "")
            .trim();
    }
    if (!symbol) {
        for (const c of cells) {
            const up = c.toUpperCase().replace(/[^A-Z0-9]/g, "");
            if (up.length >= 3 &&
                up.length <= 12 &&
                !up.includes("BUY") &&
                !up.includes("SELL") &&
                !up.includes("TOTAL") &&
                !/^\d+$/.test(up)) {
                symbol = up;
                break;
            }
        }
    }
    if (!symbol)
        symbol = "XAUUSD";
    // ------ Lot / Volume
    let lotSize = 0.1;
    if (colMap.volumeIdx >= 0 && colMap.volumeIdx < cells.length) {
        // "0.05 / 0.05" → take first
        const rawVol = cells[colMap.volumeIdx].trim();
        const firstPart = rawVol.split(/[\/\\]/)[0].trim();
        const num = parseSmartNumber(firstPart);
        if (num !== null)
            lotSize = num;
    }
    // ------ Entry / Exit price (by column)
    let entryPrice = 1.0;
    let exitPrice = 1.0;
    if (colMap.entryPriceIdx >= 0 && colMap.entryPriceIdx < cells.length) {
        const n = parseSmartNumber(cells[colMap.entryPriceIdx]);
        if (n !== null)
            entryPrice = n;
    }
    if (colMap.exitPriceIdx >= 0 && colMap.exitPriceIdx < cells.length) {
        const n = parseSmartNumber(cells[colMap.exitPriceIdx]);
        if (n !== null)
            exitPrice = n;
    }
    // If entry === exit and exit === 0 (typical when no exit column was mapped),
    // try to grab an exit price from the next numeric cell after close time.
    if (entryPrice === exitPrice && colMap.closeTimeIdx >= 0) {
        for (let i = colMap.closeTimeIdx + 1; i < cells.length; i++) {
            if (i === colMap.entryPriceIdx)
                continue;
            const n = parseSmartNumber(cells[i]);
            if (n !== null && n > 1 && Math.abs(n) !== Math.abs(lotSize)) {
                exitPrice = n;
                break;
            }
        }
    }
    // ------ SL / TP
    let stopLoss = 0;
    let takeProfit = 0;
    if (colMap.slIdx >= 0 && colMap.slIdx < cells.length) {
        const n = parseSmartNumber(cells[colMap.slIdx]);
        if (n !== null)
            stopLoss = n;
    }
    if (colMap.tpIdx >= 0 && colMap.tpIdx < cells.length) {
        const n = parseSmartNumber(cells[colMap.tpIdx]);
        if (n !== null)
            takeProfit = n;
    }
    // ------ Commission / Swap / Profit
    let commission = 0;
    let swap = 0;
    let profit = 0;
    if (colMap.commissionIdx >= 0 && colMap.commissionIdx < cells.length) {
        const n = parseSmartNumber(cells[colMap.commissionIdx]);
        if (n !== null)
            commission = n;
    }
    if (colMap.swapIdx >= 0 && colMap.swapIdx < cells.length) {
        const n = parseSmartNumber(cells[colMap.swapIdx]);
        if (n !== null)
            swap = n;
    }
    if (colMap.profitIdx >= 0 && colMap.profitIdx < cells.length) {
        const n = parseSmartNumber(cells[colMap.profitIdx]);
        if (n !== null)
            profit = n;
    }
    // Fail-safe for header-mapped cells that haven't been populated
    if (entryPrice === 1.0 && exitPrice === 1.0) {
        // fall through to legacy guess so we still produce a usable record
        const fallback = parseRowSemanticAnchors(cells, rowIdx, activeAccountId);
        if (fallback) {
            return {
                ...fallback,
                ticket: ticket || fallback.ticket,
                symbol,
                orderType,
                lotSize: lotSize || fallback.lotSize,
                entryPrice: fallback.entryPrice,
                exitPrice: fallback.exitPrice,
                stopLoss: stopLoss || fallback.stopLoss,
                takeProfit: takeProfit || fallback.takeProfit,
                commission: commission || fallback.commission,
                swap: swap || fallback.swap,
                profit: profit || fallback.profit,
            };
        }
    }
    const _closeTime = closeTimeObj ?? openTimeObj;
    const durationMinutes = Math.max(1, Math.round((_closeTime.timestamp - openTimeObj.timestamp) / 60000) || 15);
    return {
        id: `header-${ticket}-${rowIdx}`,
        accountId: activeAccountId,
        ticket,
        symbol,
        orderType,
        lotSize,
        openTime: openTimeObj.iso,
        closeTime: _closeTime.iso,
        entryPrice,
        exitPrice,
        stopLoss,
        takeProfit,
        commission: isNaN(commission) ? 0 : commission,
        swap: isNaN(swap) ? 0 : swap,
        profit,
        balanceAfterTrade: 10000 + profit,
        durationMinutes,
        rrRatio: 2.0,
        isBreakEven: Math.abs(profit) < 1.0,
    };
}
/**
 * 3. DYNAMIC CELL PARSING VIA SEMANTIC ANCHORS — kept as a robust fallback
 *    for files that don't expose a clean header row.
 */
function parseRowSemanticAnchors(cells, rowIdx, activeAccountId) {
    if (!cells || cells.length < 4)
        return null;
    const fullRowStr = cells.join(" ").toLowerCase();
    // Exclude header / summary / balance rows
    if (fullRowStr.includes("total") ||
        fullRowStr.includes("balance") ||
        fullRowStr.includes("credit") ||
        fullRowStr.includes("deposit") ||
        fullRowStr.includes("withdraw") ||
        (fullRowStr.includes(" in ") && !fullRowStr.includes("out") && !fullRowStr.includes("in/out"))) {
        return null;
    }
    // Anchor 1: Direction Anchor ("BUY" or "SELL")
    let directionIdx = -1;
    let direction = null;
    cells.forEach((c, idx) => {
        const lower = c.toLowerCase().trim();
        if (lower === "buy" || lower.includes("buy") || lower === "خرید") {
            directionIdx = idx;
            direction = "BUY";
        }
        else if (lower === "sell" || lower.includes("sell") || lower === "فروش") {
            directionIdx = idx;
            direction = "SELL";
        }
    });
    if (!direction || directionIdx === -1)
        return null;
    // Anchor 2: DateTime Anchors
    const dateAnchors = [];
    cells.forEach((c, idx) => {
        const resolved = resolveStrictDateTime(c);
        if (resolved) {
            dateAnchors.push({ ...resolved, cellIdx: idx });
        }
    });
    if (dateAnchors.length === 0)
        return null;
    const openTimeObj = dateAnchors[0];
    const closeTimeObj = dateAnchors[1] || dateAnchors[0];
    // Anchor 3: Ticket Anchor (MUST NOT BE A DATE CELL!)
    let ticket = 0;
    for (let i = 0; i < cells.length; i++) {
        const cellText = cells[i].trim();
        if (resolveStrictDateTime(cellText))
            continue;
        const cleanNum = cellText.replace(/[^0-9]/g, "");
        if (cleanNum.length >= 4 && cleanNum.length <= 12) {
            const parsed = parseInt(cleanNum, 10);
            if (!isNaN(parsed) && parsed >= 1000 && !cleanNum.startsWith("202") && !cleanNum.startsWith("203")) {
                ticket = parsed;
                break;
            }
        }
    }
    if (ticket === 0) {
        for (let i = 0; i < cells.length; i++) {
            const cellText = cells[i].trim();
            if (resolveStrictDateTime(cellText))
                continue;
            const cleanNum = cellText.replace(/[^0-9]/g, "");
            const parsed = parseInt(cleanNum, 10);
            if (!isNaN(parsed) && parsed >= 100 && !cleanNum.startsWith("202") && !cleanNum.startsWith("203")) {
                ticket = parsed;
                break;
            }
        }
    }
    if (ticket === 0)
        ticket = Date.now() + rowIdx;
    // Anchor 4: Symbol / Asset Anchor
    let symbol = "";
    for (const c of cells) {
        const uppercase = c.toUpperCase().replace(/[^A-Z0-9]/g, "");
        if (uppercase.length >= 3 &&
            uppercase.length <= 10 &&
            !uppercase.includes("BUY") &&
            !uppercase.includes("SELL") &&
            !uppercase.includes("TOTAL") &&
            !/^\d+$/.test(uppercase)) {
            symbol = uppercase;
            break;
        }
    }
    if (!symbol)
        symbol = "XAUUSD";
    // Anchor 5: All Raw Numeric Cells
    const numericCells = [];
    cells.forEach((c, idx) => {
        if (resolveStrictDateTime(c))
            return;
        const uppercase = c.toUpperCase().replace(/[^A-Z0-9]/g, "");
        if (uppercase === symbol || uppercase.includes("BUY") || uppercase.includes("SELL"))
            return;
        const num = parseSmartNumber(c);
        if (num !== null) {
            const absVal = Math.abs(num);
            if (Math.floor(absVal) === ticket || (absVal > 100000 && Number.isInteger(absVal))) {
                return;
            }
            numericCells.push({ val: num, cellIdx: idx });
        }
    });
    if (numericCells.length < 2)
        return null;
    // PROFIT is ALWAYS the VERY LAST numeric cell in the row!
    const profitCell = numericCells[numericCells.length - 1];
    let profit = profitCell.val;
    // Swap is second to last numeric cell (if 3+ exist)
    let swap = numericCells.length >= 3 ? numericCells[numericCells.length - 2].val : 0;
    // Commission is third to last numeric cell (if 4+ exist)
    let commission = numericCells.length >= 4 ? numericCells[numericCells.length - 3].val : 0;
    // Lot Size = First numeric cell in sequence matching 0.01 - 500
    const lotCell = numericCells.find((n) => n.val >= 0.01 && n.val <= 500);
    const lotSize = lotCell ? lotCell.val : 0.1;
    const lotCellIdx = lotCell ? lotCell.cellIdx : -1;
    // MARKET PRICES: Filter out lotCellIdx and profitCell.cellIdx
    const marketPriceCells = numericCells.filter((n) => n.cellIdx !== lotCellIdx && n.cellIdx !== profitCell.cellIdx && n.val > 0.0001);
    // ENTRY PRICE: First market price cell AFTER Open Time cell index
    let entryPriceObj = marketPriceCells.find((n) => n.cellIdx > openTimeObj.cellIdx);
    if (!entryPriceObj && marketPriceCells.length > 0) {
        entryPriceObj = marketPriceCells[0];
    }
    let entryPrice = entryPriceObj ? entryPriceObj.val : 1.0;
    // EXIT PRICE: First market price cell AFTER Close Time cell index (or second market price candidate)
    let exitPriceObj = marketPriceCells.find((n) => n.cellIdx > closeTimeObj.cellIdx && n.cellIdx !== entryPriceObj?.cellIdx);
    if (!exitPriceObj && marketPriceCells.length > 1) {
        exitPriceObj = marketPriceCells.find((n) => n.cellIdx !== entryPriceObj?.cellIdx);
    }
    let exitPrice = exitPriceObj ? exitPriceObj.val : entryPrice;
    // FAIL-SAFE 1: If entryPrice equals lotSize, fix it immediately
    if (entryPrice === lotSize) {
        const validPrices = marketPriceCells.filter((n) => n.val !== lotSize);
        if (validPrices.length > 0)
            entryPrice = validPrices[0].val;
        if (validPrices.length > 1)
            exitPrice = validPrices[1].val;
    }
    // FAIL-SAFE 2: If profit equals exitPrice or entryPrice AND > 100, profit is $0.00!
    if ((profit === exitPrice || profit === entryPrice) && Math.abs(profit) > 100) {
        profit = 0;
    }
    const durationMinutes = Math.max(1, Math.round((closeTimeObj.timestamp - openTimeObj.timestamp) / 60000) || 15);
    return {
        id: `semantic-${ticket}-${rowIdx}`,
        accountId: activeAccountId,
        ticket,
        symbol,
        orderType: direction,
        lotSize,
        openTime: openTimeObj.iso,
        closeTime: closeTimeObj.iso,
        entryPrice,
        exitPrice,
        stopLoss: 0,
        takeProfit: 0,
        commission: isNaN(commission) ? 0 : commission,
        swap: isNaN(swap) ? 0 : swap,
        profit,
        balanceAfterTrade: 10000 + profit,
        durationMinutes,
        rrRatio: 2.0,
        isBreakEven: Math.abs(profit) < 1.0,
    };
}
