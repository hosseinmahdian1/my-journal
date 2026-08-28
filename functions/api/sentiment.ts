/**
 * Cloudflare Pages Function: /api/sentiment
 * 
 * Fetches LIVE sentiment data from multiple free public APIs:
 * 1. CNN Fear & Greed Index (stock market sentiment)
 * 2. CFTC Commitments of Traders (official institutional positioning)
 * 3. Myfxbook Community Outlook (retail trader sentiment)
 * 
 * All data is aggregated server-side to avoid CORS issues on the client.
 */

interface Env {}

// ─── CFTC COT CONFIG ─────────────────────────────────────────────────────────
const CFTC_BASE = "https://publicreporting.cftc.gov/resource/6dca-aqww.json";

const COT_MARKETS: Record<string, { query: string; exactMatch: string; symbol: string; name: string }> = {
  XAUUSD: {
    query: "GOLD - COMMODITY EXCHANGE INC.",
    exactMatch: "GOLD - COMMODITY EXCHANGE INC.",
    symbol: "XAUUSD",
    name: "Gold / US Dollar",
  },
  EURUSD: {
    query: "EURO FX - CHICAGO MERCANTILE EXCHANGE",
    exactMatch: "EURO FX - CHICAGO MERCANTILE EXCHANGE",
    symbol: "EURUSD",
    name: "Euro / US Dollar",
  },
  GBPUSD: {
    query: "BRITISH POUND - CHICAGO MERCANTILE EXCHANGE",
    exactMatch: "BRITISH POUND - CHICAGO MERCANTILE EXCHANGE",
    symbol: "GBPUSD",
    name: "British Pound / US Dollar",
  },
  USDJPY: {
    query: "JAPANESE YEN - CHICAGO MERCANTILE EXCHANGE",
    exactMatch: "JAPANESE YEN - CHICAGO MERCANTILE EXCHANGE",
    symbol: "USDJPY",
    name: "US Dollar / Japanese Yen",
  },
};

// ─── Fetch CNN Fear & Greed Index ────────────────────────────────────────────
async function fetchFearGreed(): Promise<{ score: number; classification: string } | null> {
  try {
    const res = await fetch("https://production.dataviz.cnn.io/index/fearandgreed/graphdata", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
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

// ─── Fetch CFTC COT for a single commodity ──────────────────────────────────
interface CotRow {
  report_date_as_yyyy_mm_dd: string;
  noncomm_positions_long_all: string;
  noncomm_positions_short_all: string;
  market_and_exchange_names: string;
}

async function fetchCotForCommodity(
  commodityQuery: string
): Promise<{ long: number; short: number; net: number; reportDate: string; weeklyChange: number } | null> {
  try {
    const params = new URLSearchParams();
    params.append("$where", `market_and_exchange_names='${commodityQuery}'`);
    params.append("$order", "report_date_as_yyyy_mm_dd DESC");
    params.append("$limit", "2");

    const url = `${CFTC_BASE}?${params.toString()}`;

    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) return null;
    const rows: CotRow[] = await res.json();
    if (!rows.length) return null;

    const latest = rows[0];
    const longPos = parseInt(latest.noncomm_positions_long_all || "0", 10);
    const shortPos = parseInt(latest.noncomm_positions_short_all || "0", 10);
    const net = longPos - shortPos;

    let weeklyChange = 0;
    if (rows.length > 1) {
      const prev = rows[1];
      const prevLong = parseInt(prev.noncomm_positions_long_all || "0", 10);
      const prevShort = parseInt(prev.noncomm_positions_short_all || "0", 10);
      const prevNet = prevLong - prevShort;
      weeklyChange = net - prevNet;
    }

    // Calculate percentage
    const total = longPos + shortPos;
    const longPct = total > 0 ? Math.round((longPos / total) * 100) : 50;
    const shortPct = 100 - longPct;

    return {
      long: longPct,
      short: shortPct,
      net,
      reportDate: latest.report_date_as_yyyy_mm_dd?.split("T")[0] || "",
      weeklyChange,
    };
  } catch {
    return null;
  }
}

// ─── Fetch Myfxbook Community Outlook ───────────────────────────────────────
interface MyfxbookSymbol {
  name: string;
  shortPercentage: number;
  longPercentage: number;
  shortVolume: number;
  longVolume: number;
}

async function fetchMyfxbookOutlook(): Promise<Record<string, { long: number; short: number }>> {
  const result: Record<string, { long: number; short: number }> = {};

  try {
    // Try fetching the community outlook page data
    const res = await fetch("https://www.myfxbook.com/community/outlook", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!res.ok) return result;
    const html = await res.text();

    // Extract symbol data from the page using regex patterns
    const symbolMap: Record<string, string[]> = {
      XAUUSD: ["XAUUSD", "Gold"],
      EURUSD: ["EURUSD"],
      GBPUSD: ["GBPUSD"],
      USDJPY: ["USDJPY"],
    };

    for (const [pair, patterns] of Object.entries(symbolMap)) {
      for (const pattern of patterns) {
        // Try to find long/short percentages near the symbol name
        const symbolIdx = html.indexOf(pattern);
        if (symbolIdx === -1) continue;

        // Look for percentage patterns in nearby text (within 500 chars)
        const snippet = html.substring(symbolIdx, symbolIdx + 800);

        // Pattern: looking for numbers like "62%" or "38%" near the symbol
        const pctMatches = snippet.match(/(\d{1,3})(?:\.\d+)?%/g);
        if (pctMatches && pctMatches.length >= 2) {
          const val1 = parseFloat(pctMatches[0]);
          const val2 = parseFloat(pctMatches[1]);
          // The first is usually short %, second is long % on myfxbook
          // But we need to verify - typically the page shows Short% then Long%
          if (val1 + val2 >= 95 && val1 + val2 <= 105) {
            result[pair] = { short: Math.round(val1), long: Math.round(val2) };
            break;
          }
        }
      }
    }
  } catch {
    // Myfxbook may block; return empty
  }

  return result;
}

// ─── Build the aggregated sentiment response ────────────────────────────────
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const now = new Date();
  const tehranTime = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now).replace(",", "");

  // Fetch all data sources in parallel
  const [fearGreed, myfxbook, cotGold, cotEur, cotGbp, cotJpy] = await Promise.all([
    fetchFearGreed(),
    fetchMyfxbookOutlook(),
    fetchCotForCommodity("GOLD"),
    fetchCotForCommodity("EURO FX"),
    fetchCotForCommodity("BRITISH POUND"),
    fetchCotForCommodity("JAPANESE YEN"),
  ]);

  const fgScore = fearGreed?.score ?? 50;
  const fgClass = fearGreed?.classification ?? "Neutral";

  const cotData: Record<string, typeof cotGold> = {
    XAUUSD: cotGold,
    EURUSD: cotEur,
    GBPUSD: cotGbp,
    USDJPY: cotJpy,
  };

  // Build pair-level sentiment
  const pairs: Record<string, any> = {};

  for (const [symbol, config] of Object.entries(COT_MARKETS)) {
    const cot = cotData[symbol];
    const mfxb = myfxbook[symbol];

    // CFTC institutional positioning
    const instLong = cot?.long ?? 50;
    const instShort = cot?.short ?? 50;
    const cotNet = cot?.net ?? 0;
    const cotWeekly = cot?.weeklyChange ?? 0;
    const cotDate = cot?.reportDate ?? "";

    // Myfxbook retail positioning
    const retailLong = mfxb?.long ?? 50;
    const retailShort = mfxb?.short ?? 50;

    // Determine institutional bias
    let instBias: "Long" | "Short" | "Neutral" = "Neutral";
    if (instLong >= 55) instBias = "Long";
    else if (instShort >= 55) instBias = "Short";

    // Compute overall sentiment (weighted: CFTC 50%, Retail Contrarian 30%, Fear&Greed 20%)
    // For retail contrarian: if retail is heavily long, it's bearish signal (and vice versa)
    const instScore = instLong; // Higher = more bullish
    const contrarianRetail = retailShort; // If retail is short, it's bullish (contrarian)
    const fgNormalized = fgScore; // 0-100

    const overallBullish = Math.round(instScore * 0.5 + contrarianRetail * 0.3 + fgNormalized * 0.2);
    const overallBearish = 100 - overallBullish;

    // For USDJPY: CFTC reports JPY futures (short JPY = long USDJPY)
    // So we need to INVERT the CFTC data for USDJPY
    let finalInstLong = instLong;
    let finalInstShort = instShort;
    let finalInstBias = instBias;
    let finalCotNet = cotNet;
    let finalOverallBullish = overallBullish;
    let finalOverallBearish = overallBearish;

    if (symbol === "USDJPY") {
      // CFTC reports JPY, not USD/JPY. Short JPY = Bullish USDJPY
      finalInstLong = instShort;
      finalInstShort = instLong;
      finalInstBias = instBias === "Long" ? "Short" : instBias === "Short" ? "Long" : "Neutral";
      finalCotNet = -cotNet;

      const invInstScore = finalInstLong;
      const invOverall = Math.round(invInstScore * 0.5 + contrarianRetail * 0.3 + fgNormalized * 0.2);
      finalOverallBullish = invOverall;
      finalOverallBearish = 100 - invOverall;
    }

    // Generate Persian sentiment status
    let sentimentStatus = "خنثی";
    if (finalOverallBullish >= 70) sentimentStatus = "انباشت سنگین نهادی";
    else if (finalOverallBullish >= 60) sentimentStatus = "روند صعودی نهادی";
    else if (finalOverallBullish >= 55) sentimentStatus = "تمایل صعودی ملایم";
    else if (finalOverallBearish >= 70) sentimentStatus = "فشار عرضه سنگین نهادی";
    else if (finalOverallBearish >= 60) sentimentStatus = "اصلاح نزولی نهادی";
    else if (finalOverallBearish >= 55) sentimentStatus = "تمایل نزولی ملایم";
    else sentimentStatus = "بازار خنثی و بدون جهت";

    // Build AI verdict in Persian
    let aiVerdict = "";
    if (finalInstBias === "Long") {
      aiVerdict = `موقعیت‌های خالص لانگ نهادی در ${config.name} در سطح ${finalInstLong}٪ قرار دارد (خالص ${finalCotNet.toLocaleString()} قرارداد). `;
      if (cotWeekly > 0) aiVerdict += `تغییرات هفتگی مثبت (+${cotWeekly.toLocaleString()}) نشان‌دهنده تداوم انباشت نهادی است.`;
      else if (cotWeekly < 0) aiVerdict += `تغییرات هفتگی منفی (${cotWeekly.toLocaleString()}) نشان‌دهنده کاهش تدریجی موقعیت‌های لانگ نهادی است.`;
    } else if (finalInstBias === "Short") {
      aiVerdict = `موقعیت‌های خالص شورت نهادی در ${config.name} در سطح ${finalInstShort}٪ قرار دارد (خالص ${finalCotNet.toLocaleString()} قرارداد). `;
      if (cotWeekly > 0) aiVerdict += `تغییرات هفتگی مثبت (+${cotWeekly.toLocaleString()}) نشان‌دهنده کاهش فشار فروش نهادی است.`;
      else if (cotWeekly < 0) aiVerdict += `تغییرات هفتگی منفی (${cotWeekly.toLocaleString()}) نشان‌دهنده تشدید فشار فروش نهادی است.`;
    } else {
      aiVerdict = `بازار ${config.name} در وضعیت خنثی قرار دارد و موقعیت‌های نهادی تعادلی است.`;
    }

    // Build contrarian warning
    let contrarianWarning = "";
    if (retailLong >= 65 && finalInstBias === "Short") {
      contrarianWarning = `هشدار خلاف‌جهت: ${retailLong}٪ معامله‌گران خرد در پوزیشن لانگ هستند در حالی که نهادها شورت هستند. ریسک تله خریداران (Bull Trap) بالاست.`;
    } else if (retailShort >= 65 && finalInstBias === "Long") {
      contrarianWarning = `سیگنال خلاف‌جهت: ${retailShort}٪ معامله‌گران خرد شورت هستند در حالی که نهادها لانگ هستند. سوخت Short Squeeze و ادامه روند صعودی فراهم است.`;
    } else {
      contrarianWarning = `نسبت موقعیت‌های خرد و نهادی در تعادل نسبی قرار دارد و سیگنال خلاف‌جهت قوی مشاهده نمی‌شود.`;
    }

    // Build sources array
    const sources: any[] = [];

    // Source 1: CFTC CoT
    sources.push({
      name: "CFTC Official CoT Report",
      long: finalInstLong,
      short: finalInstShort,
      status: finalInstLong > 55 ? "Bullish" : finalInstShort > 55 ? "Bearish" : "Neutral",
    });

    // Source 2: Myfxbook
    if (mfxb) {
      sources.push({
        name: "Myfxbook Community Sentiment",
        long: retailLong,
        short: retailShort,
        status: retailLong > 55 ? "Bullish" : retailShort > 55 ? "Bearish" : "Neutral",
      });
    }

    // Source 3: Fear & Greed
    sources.push({
      name: "CNN Fear & Greed Index",
      long: fgScore,
      short: 100 - fgScore,
      status: fgScore >= 55 ? "Bullish" : fgScore <= 45 ? "Bearish" : "Neutral",
    });

    pairs[symbol] = {
      symbol,
      name: config.name,
      updatedAt: tehranTime,
      overallBullish: finalOverallBullish,
      overallBearish: finalOverallBearish,
      sentimentStatus,
      fearGreedIndex: fgScore,
      fearGreedStatus: fgClass,
      retailLong: symbol === "USDJPY" ? retailShort : retailLong,
      retailShort: symbol === "USDJPY" ? retailLong : retailShort,
      institutionalBias: finalInstBias,
      institutionalLong: finalInstLong,
      institutionalShort: finalInstShort,
      cotNetPositions: finalCotNet,
      cotWeeklyChange: cotWeekly,
      cotReportDate: cotDate,
      aiSmartMoneyVerdict: aiVerdict,
      contrarianWarning,
      sources,
    };
  }

  // Build macro summary
  let macroRegime = "Neutral / Balanced";
  if (fgScore >= 70) macroRegime = "Risk-On / Liquidity Expansion";
  else if (fgScore >= 55) macroRegime = "Moderate Risk-On";
  else if (fgScore >= 45) macroRegime = "Balanced / Range-Bound";
  else if (fgScore >= 30) macroRegime = "Risk-Off / Defensive";
  else macroRegime = "Extreme Fear / Flight to Safety";

  const goldCot = cotData.XAUUSD;
  const goldInst = goldCot ? goldCot.long : 50;

  let macroSummaryFa = `در حال حاضر شاخص ترس و طمع CNN روی ${fgScore} (${fgClass}) قرار دارد. `;
  if (fgScore >= 55) {
    macroSummaryFa += `بازار در رژیم ریسک‌پذیری قرار دارد. `;
  } else if (fgScore <= 45) {
    macroSummaryFa += `بازار در رژیم ریسک‌گریزی قرار دارد. `;
  } else {
    macroSummaryFa += `بازار در وضعیت خنثی و بدون جهت مشخص است. `;
  }

  if (goldCot) {
    macroSummaryFa += `موقعیت‌های نهادی طلا ${goldInst}٪ لانگ (خالص ${goldCot.net.toLocaleString()} قرارداد) است`;
    if (goldCot.weeklyChange > 0) {
      macroSummaryFa += ` و تغییرات هفتگی مثبت (+${goldCot.weeklyChange.toLocaleString()}) حاکی از تداوم انباشت نهادی است.`;
    } else {
      macroSummaryFa += `.`;
    }
  }

  const response = {
    metadata: {
      generated_at: tehranTime,
      timezone: "Asia/Tehran (UTC+03:30)",
      data_sources: [
        "CNN Fear & Greed Index (Live)",
        "CFTC Official CoT Report (Weekly)",
        "Myfxbook Community Sentiment",
      ],
      fear_and_greed: {
        score: fgScore,
        classification: fgClass,
      },
      macro_regime: macroRegime,
      macro_summary_fa: macroSummaryFa,
    },
    pairs,
  };

  return new Response(JSON.stringify(response), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=300, s-maxage=300", // Cache 5 min
      "Access-Control-Allow-Origin": "*",
    },
  });
};
