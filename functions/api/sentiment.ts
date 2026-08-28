/**
 * Cloudflare Pages Function: /api/sentiment
 * 
 * Fetches LIVE sentiment data optimized for Day Trading:
 * 1. Yahoo Finance (Live 1H Momentum & Price Action)
 * 2. Myfxbook Community Outlook (Live Retail Sentiment for Contrarian signals)
 * 3. CNN Fear & Greed Index
 * 4. CFTC CoT (Macro context, kept separate)
 */

interface Env {}

// ─── CONFIG ─────────────────────────────────────────────────────────
const PAIRS = {
  XAUUSD: { name: "Gold / US Dollar", yfSymbol: "GC=F", cftcExact: "GOLD - COMMODITY EXCHANGE INC." },
  EURUSD: { name: "Euro / US Dollar", yfSymbol: "EURUSD=X", cftcExact: "EURO FX - CHICAGO MERCANTILE EXCHANGE" },
  GBPUSD: { name: "British Pound / US Dollar", yfSymbol: "GBPUSD=X", cftcExact: "BRITISH POUND - CHICAGO MERCANTILE EXCHANGE" },
  USDJPY: { name: "US Dollar / Japanese Yen", yfSymbol: "JPY=X", cftcExact: "JAPANESE YEN - CHICAGO MERCANTILE EXCHANGE" },
};

// ─── Fetch Yahoo Finance (Live Momentum) ───────────────────────────────────
async function fetchYahooMomentum(symbol: string): Promise<{ trend: "Bullish" | "Bearish" | "Neutral"; changePct: number; currentPrice: number } | null> {
  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!res.ok) return null;
    const json: any = await res.json();
    const meta = json.chart.result[0].meta;
    
    const currentPrice = meta.regularMarketPrice;
    const prevPrice = meta.chartPreviousClose; // yesterday's close

    const changePct = ((currentPrice - prevPrice) / prevPrice) * 100;
    
    let trend: "Bullish" | "Bearish" | "Neutral" = "Neutral";
    if (changePct > 0.05) trend = "Bullish";
    else if (changePct < -0.05) trend = "Bearish";

    return { trend, changePct, currentPrice };
  } catch {
    return null;
  }
}

// ─── Fetch CNN Fear & Greed Index ────────────────────────────────────────────
async function fetchFearGreed(): Promise<{ score: number; classification: string } | null> {
  try {
    const res = await fetch("https://production.dataviz.cnn.io/index/fearandgreed/graphdata", {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "application/json",
      },
    });
    if (!res.ok) return null;
    const json: any = await res.json();

    const score = Math.round(json?.fear_and_greed?.score ?? json?.score ?? 50);
    let classification = "Neutral";
    if (score >= 76) classification = "Extreme Greed";
    else if (score >= 56) classification = "Greed";
    else if (score >= 46) classification = "Neutral";
    else if (score >= 26) classification = "Fear";
    else classification = "Extreme Fear";

    return { score, classification };
  } catch {
    return null;
  }
}

// ─── Fetch Myfxbook Community Outlook (Live Retail) ───────────────────────
async function fetchMyfxbookOutlook(): Promise<Record<string, { long: number; short: number }>> {
  const result: Record<string, { long: number; short: number }> = {};
  try {
    const res = await fetch("https://www.myfxbook.com/community/outlook", {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "text/html",
      },
    });
    if (!res.ok) return result;
    const html = await res.text();

    const symbolMap: Record<string, string[]> = {
      XAUUSD: ["XAUUSD", "Gold"],
      EURUSD: ["EURUSD"],
      GBPUSD: ["GBPUSD"],
      USDJPY: ["USDJPY"],
    };

    for (const [pair, patterns] of Object.entries(symbolMap)) {
      for (const pattern of patterns) {
        const symbolIdx = html.indexOf(pattern);
        if (symbolIdx === -1) continue;
        const snippet = html.substring(symbolIdx, symbolIdx + 800);
        const pctMatches = snippet.match(/(\d{1,3})(?:\.\d+)?%/g);
        if (pctMatches && pctMatches.length >= 2) {
          const val1 = parseFloat(pctMatches[0]);
          const val2 = parseFloat(pctMatches[1]);
          if (val1 + val2 >= 95 && val1 + val2 <= 105) {
            result[pair] = { short: Math.round(val1), long: Math.round(val2) };
            break;
          }
        }
      }
    }
  } catch {}
  return result;
}

// ─── Fetch CFTC COT (Macro) ────────────────────────────────────────────────
const CFTC_BASE = "https://publicreporting.cftc.gov/resource/6dca-aqww.json";
async function fetchCotForCommodity(exactMatch: string): Promise<{ long: number; short: number } | null> {
  try {
    const params = new URLSearchParams();
    params.append("$where", `market_and_exchange_names='${exactMatch}'`);
    params.append("$order", "report_date_as_yyyy_mm_dd DESC");
    params.append("$limit", "1");
    const url = `${CFTC_BASE}?${params.toString()}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    const rows: any[] = await res.json();
    if (!rows.length) return null;
    const latest = rows[0];
    const longPos = parseInt(latest.noncomm_positions_long_all || "0", 10);
    const shortPos = parseInt(latest.noncomm_positions_short_all || "0", 10);
    const total = longPos + shortPos;
    const longPct = total > 0 ? Math.round((longPos / total) * 100) : 50;
    return { long: longPct, short: 100 - longPct };
  } catch {
    return null;
  }
}

// ─── API HANDLER ──────────────────────────────────────────────────────────
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const tehranTime = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tehran",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  }).format(new Date()).replace(",", "");

  const [fearGreed, myfxbook, yfGold, yfEur, yfGbp, yfJpy, cotGold, cotEur, cotGbp, cotJpy] = await Promise.all([
    fetchFearGreed(),
    fetchMyfxbookOutlook(),
    fetchYahooMomentum(PAIRS.XAUUSD.yfSymbol),
    fetchYahooMomentum(PAIRS.EURUSD.yfSymbol),
    fetchYahooMomentum(PAIRS.GBPUSD.yfSymbol),
    fetchYahooMomentum(PAIRS.USDJPY.yfSymbol),
    fetchCotForCommodity(PAIRS.XAUUSD.cftcExact),
    fetchCotForCommodity(PAIRS.EURUSD.cftcExact),
    fetchCotForCommodity(PAIRS.GBPUSD.cftcExact),
    fetchCotForCommodity(PAIRS.USDJPY.cftcExact),
  ]);

  const yfData: Record<string, any> = { XAUUSD: yfGold, EURUSD: yfEur, GBPUSD: yfGbp, USDJPY: yfJpy };
  const cotData: Record<string, any> = { XAUUSD: cotGold, EURUSD: cotEur, GBPUSD: cotGbp, USDJPY: cotJpy };

  const pairs: Record<string, any> = {};

  for (const [symbol, config] of Object.entries(PAIRS)) {
    const yf = yfData[symbol];
    const mfxb = myfxbook[symbol];
    const cot = cotData[symbol];

    // LIVE DATA
    const currentPrice = yf?.currentPrice ?? 0;
    const changePct = yf?.changePct ?? 0;
    const momentumTrend = yf?.trend ?? "Neutral";

    // JPY=X is USD/JPY, so Yahoo data is correct. But for CFTC, Japanese Yen futures is JPY/USD.
    let retailLong = mfxb?.long ?? 50;
    let retailShort = mfxb?.short ?? 50;
    let macroLong = cot?.long ?? 50;
    
    if (symbol === "USDJPY") {
      // Invert retail if needed (myfxbook usually reports standard pairs, so USDJPY is USDJPY)
      // but CFTC reports JPY/USD.
      macroLong = cot?.short ?? 50; // Short JPY futures = Long USDJPY
    }

    // CONTRARIAN SCORE (Retail are usually wrong. If retail is 70% long, we are bearish)
    const contrarianScore = retailShort; // 0-100 where 100 means retail is fully short (so we are fully bullish)
    
    // MOMENTUM SCORE (Recent 4H trend)
    let momentumScore = 50;
    if (changePct > 0.1) momentumScore = 80;
    else if (changePct > 0.02) momentumScore = 60;
    else if (changePct < -0.1) momentumScore = 20;
    else if (changePct < -0.02) momentumScore = 40;

    // DAY TRADER OVERALL SCORE (60% Momentum, 40% Contrarian)
    const overallBullish = Math.round((momentumScore * 0.6) + (contrarianScore * 0.4));
    const overallBearish = 100 - overallBullish;

    let sentimentStatus = "بدون جهت (رنج)";
    if (overallBullish >= 70) sentimentStatus = "صعودی قدرتمند (Bullish)";
    else if (overallBullish >= 55) sentimentStatus = "تمایل به صعود";
    else if (overallBearish >= 70) sentimentStatus = "ریزش سنگین (Bearish)";
    else if (overallBearish >= 55) sentimentStatus = "تمایل به ریزش";

    let aiVerdict = "";
    if (overallBearish >= 60) {
      aiVerdict = `هشدار لایو: روند کوتاه‌مدت ${config.name} به شدت نزولی است. `;
      if (retailLong > 60) aiVerdict += `همچنین ${retailLong}٪ تریدرهای خرد در ضرر خریدار (Long) هستند که سوخت کافی برای ادامه ریزش (استاپ هانت) را فراهم می‌کند. ورود به پوزیشن لانگ به شدت پرریسک است.`;
    } else if (overallBullish >= 60) {
      aiVerdict = `سیگنال لایو: مومنتوم ${config.name} صعودی است. `;
      if (retailShort > 60) aiVerdict += `قرار گرفتن ${retailShort}٪ تریدرهای خرد در پوزیشن فروش (Short) نشان‌دهنده پتانسیل پمپ قیمت برای شورت‌اسکوییز (Short Squeeze) است.`;
    } else {
      aiVerdict = `بازار ${config.name} در حال حاضر بدون جهت مشخص (Range-Bound) نوسان می‌کند. بهتر است منتظر تاییدیه پرایس‌اکشن بمانید.`;
    }

    pairs[symbol] = {
      symbol,
      name: config.name,
      updatedAt: tehranTime,
      
      // Used by the main dial
      overallBullish,
      overallBearish,
      sentimentStatus,
      
      // Live Metrics
      retailLong,
      retailShort,
      momentumTrend,
      currentPrice,
      priceChangePct: parseFloat(changePct.toFixed(2)),
      
      // Macro (pushed to background)
      macroInstitutionalLong: macroLong,
      
      aiSmartMoneyVerdict: aiVerdict,
    };
  }

  const response = {
    metadata: {
      generated_at: tehranTime,
      timezone: "Asia/Tehran (UTC+03:30)",
      fear_and_greed: {
        score: fearGreed?.score ?? 50,
        classification: fearGreed?.classification ?? "Neutral",
      }
    },
    pairs,
  };

  return new Response(JSON.stringify(response), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=60, s-maxage=60", // Cache 1 min for live trading
      "Access-Control-Allow-Origin": "*",
    },
  });
};
