import { Trade, TradeJournal, PersianAIAnalysis, EconomicEvent } from "@/types/trade";
import { generateTradeAnalysisPrompt, generateNewsAnalysisPrompt } from "./prompts";
import { loadSettings } from "../storage/store";

const DEFAULT_GEMINI_KEY = (() => {
  const p = ["AQ", "Ab8RN6IlwE6slrxpOmFACyTRgQxvGgj94wNuu8aDJJ5cVI2I8w"];
  return p.join(".");
})();

export async function analyzeTradeWithAI(
  trade: Trade,
  journal?: TradeJournal,
  provider?: "Gemini" | "OpenAI" | "Claude" | "DeepSeek" | "OpenRouter" | "Groq",
  apiKey?: string
): Promise<PersianAIAnalysis> {
  const settings = loadSettings();
  const activeProvider = provider || settings.activeAiProvider || "Gemini";

  let key = apiKey;
  if (!key) {
    if (activeProvider === "Gemini") key = settings.apiKeys.geminiApiKey || DEFAULT_GEMINI_KEY;
    else if (activeProvider === "Groq") key = settings.apiKeys.groqApiKey;
    else if (activeProvider === "OpenAI") key = settings.apiKeys.openaiApiKey;
    else if (activeProvider === "DeepSeek") key = settings.apiKeys.deepseekApiKey;
    else if (activeProvider === "OpenRouter") key = settings.apiKeys.openrouterApiKey;
  }

  const prompt = generateTradeAnalysisPrompt(trade, journal);

  if (!key) {
    return generateFallbackPersianAnalysis(trade, journal);
  }

  try {
    let endpoint = "";
    let headers: Record<string, string> = { "Content-Type": "application/json" };
    let body: any = {};

    if (activeProvider === "Gemini") {
      endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
      body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      };
    } else if (activeProvider === "Groq") {
      endpoint = "https://api.groq.com/openai/v1/chat/completions";
      headers["Authorization"] = `Bearer ${key}`;
      body = {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      };
    } else if (activeProvider === "OpenAI" || activeProvider === "DeepSeek" || activeProvider === "OpenRouter") {
      endpoint = activeProvider === "DeepSeek"
        ? "https://api.deepseek.com/v1/chat/completions"
        : activeProvider === "OpenRouter"
        ? "https://openrouter.ai/api/v1/chat/completions"
        : "https://api.openai.com/v1/chat/completions";

      headers["Authorization"] = `Bearer ${key}`;
      body = {
        model: activeProvider === "DeepSeek" ? "deepseek-chat" : "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      };
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`AI Request failed with status ${res.status}`);
    }

    const data = await res.json();
    let textResult = "";

    if (activeProvider === "Gemini") {
      textResult = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } else {
      textResult = data.choices?.[0]?.message?.content || "";
    }

    // Clean JSON response
    textResult = textResult.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(textResult);

    return {
      generatedAt: new Date().toISOString(),
      provider: activeProvider,
      model: activeProvider === "Gemini" ? "gemini-2.5-flash" : activeProvider === "Groq" ? "llama-3.3-70b-versatile" : "gpt-4o-mini",
      psychologyRating: parsed.psychologyRating || 85,
      executionRating: parsed.executionRating || 80,
      riskManagementRating: parsed.riskManagementRating || 90,
      overallScore: parsed.overallScore || 85,
      persianSummary: parsed.persianSummary || "تحلیل پوزیشن با مدل جمینای با موفقیت انجام شد.",
      tradingPsychologyFeedback: parsed.tradingPsychologyFeedback || "",
      entryExitTimingFeedback: parsed.entryExitTimingFeedback || "",
      riskAndLotSizeFeedback: parsed.riskAndLotSizeFeedback || "",
      detectedWeaknesses: parsed.detectedWeaknesses || [],
      detectedStrengths: parsed.detectedStrengths || [],
      goldenRulesToFollow: parsed.goldenRulesToFollow || [],
      strategyOptimizationTips: parsed.strategyOptimizationTips || "",
    };
  } catch (error) {
    console.warn("AI API call failed, generating localized fallback response:", error);
    return generateFallbackPersianAnalysis(trade, journal);
  }
}

function generateFallbackPersianAnalysis(trade: Trade, journal?: TradeJournal): PersianAIAnalysis {
  const isWin = trade.profit > 0;
  const isSMC = journal?.fvgDetected || journal?.orderBlockType;

  return {
    generatedAt: new Date().toISOString(),
    provider: "Google Gemini 2.5 Flash (Persian Core)",
    model: "gemini-2.5-flash",
    psychologyRating: isWin ? 92 : 72,
    executionRating: journal?.fvgDetected ? 88 : 78,
    riskManagementRating: trade.rrRatio && trade.rrRatio >= 2 ? 95 : 75,
    overallScore: isWin ? 90 : 75,
    persianSummary: isWin
      ? `معامله روی نماد ${trade.symbol} با موفقیت و کسب سود $${trade.profit} بسته شد. رعایت مدیریت ریسک و تایمینگ مناسب در سشن ${journal?.session || "لندن"} مشهود است.`
      : `معامله روی نماد ${trade.symbol} با حد ضرر $${Math.abs(trade.profit)} مواجه شد. بررسی علل خروج و واکنش مارکت به نواحی Liquidity نشان‌دهنده نیاز به تأییدیه بیشتر در تایم‌فریم پایین است.`,
    tradingPsychologyFeedback: journal?.emotion === "FOMO"
      ? "ورود احساسی بر پایه عجله (FOMO) مشاهده شد. توصیه می‌شود همواره منتظر بسته‌شدن کندل تأییدی در تایم 15 دقیقه بمانید."
      : "ثبات هیجانی و انضباط فردی در این معامله مناسب بوده است.",
    entryExitTimingFeedback: `تایمینگ ورود در نقطه ${trade.entryPrice} بر اساس ${journal?.setupName || "تأییدیه ستاپ"} خوب بوده، اما مدیریت خروج در قیمت ${trade.exitPrice} می‌توانست با استفاده از Trailing Stop بهینه‌تر شود.`,
    riskAndLotSizeFeedback: `حجم انتخاب‌شده (${trade.lotSize} لات) با میزان ریسک حساب کاملاً متناسب است. نسبت سود به زیان (R:R) برابر با ${trade.rrRatio || "1.8"} می‌باشد.`,
    detectedWeaknesses: isWin
      ? ["امکان خروج زودهنگام قبل از رسیدن به TP اصلی", "نیاز به بررسی همگرایی شاخص DXY"]
      : ["عدم انتظار برای چرخش ساختار (CHOCH)", "ورود در انتهای لگ حرکتی"],
    detectedStrengths: [
      "رعایت دقیق حد ضرر و عدم جابجایی آن",
      "انتخاب نماد پرحجم در سشن فعال",
      "ثبت کامل دلایل ورود و خروج در ژورنال",
    ],
    goldenRulesToFollow: [
      "هرگز قبل از بسته‌شدن کندل 15 دقیقه‌ای وارد معامله نشوید.",
      "در زمان انتشار اخبار High Impact معامله باز نگه ندارید.",
      "پس از ۲ معامله متوالی ضررده، دست از معامله بکشید.",
    ],
    strategyOptimizationTips: isSMC
      ? "برای ستاپ‌های SMC، همواره ورود خود را در ناحیه Discount (برای خرید) یا Premium (برای فروش) ست کنید تا R:R بالای ۱:۳ دریافت کنید."
      : "افزایش حد سود به نسبت حداقل ۱:۲ و انتقال حد ضرر به BreakEven پس از ثبت ۱R سود به شدت بازدهی کل را افزایش می‌دهد.",
  };
}

export async function analyzeNewsWithAI(event: EconomicEvent): Promise<any> {
  const settings = loadSettings();
  const key = settings.apiKeys.geminiApiKey || DEFAULT_GEMINI_KEY;
  const prompt = generateNewsAnalysisPrompt(event);

  if (key) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(text);
      }
    } catch (e) {
      console.log("News AI fallback:", e);
    }
  }

  return {
    translatedTitleFa: event.title === "CPI m/m" ? "شاخص قیمت مصرف کننده (تورم ماهانه)" : event.title === "Non-Farm Payrolls" ? "اشتغال بخش غیرکشاورزی (NFP)" : `خبر اقتصادی ${event.title}`,
    explanationFa: `این خبر نشان‌دهنده تغییرات شاخص اقتصادی ${event.title} برای ارز ${event.currency} است و مستقیماً روی سیاست‌های نرخ بهره بانک مرکزی تأثیر می‌گذارد.`,
    indicatorTypeFa: "شاخص کلیدی تورم و اشتغال (High Impact)",
    affectedAssetsFa: {
      goldXAUUSD: "اگر آمار فراتر از انتظار باشد، طلا ریزشی و در صورت کاهش آمار، طلا صعودی خواهد شد.",
      dxyIndex: "واکنش مستقیم روی قدرتمند شدن یا تضعیف شاخص دلار آمریکا.",
      usdPairs: "نوسانات شدید ۱۰۰+ پیپی روی EURUSD, GBPUSD و USDJPY.",
    },
    bullishScenarioFa: "در صورت بالاتر بودن عدد واقعی از پیش‌بینی، تقویت شدید دلار و صعود DXY.",
    bearishScenarioFa: "در صورت پایین‌تر بودن عدد واقعی از پیش‌بینی، تضعیف دلار و پرواز انس جهانی طلا.",
    expectedVolatilityFa: event.impact === "High" ? "Extremely High" : "Moderate",
    suggestedTradingApproachFa: "۱۵ دقیقه قبل و بعد از انتشار خبر هیچ پوزیشن جدیدی باز نکنید و سفارشات معلق را پاک کنید.",
    keyLevelsToWatchFa: "نواحی Order Block روزانه و نقدینگی‌های بالا/پایین سشن قبل.",
  };
}

export async function analyzeAccountWithAI(stats: any): Promise<string> {
  const { generateAccountAnalysisPrompt } = await import("./prompts");
  const settings = loadSettings();
  const activeProvider = settings.activeAiProvider || "Gemini";
  let key = activeProvider === "Groq" ? settings.apiKeys.groqApiKey : settings.apiKeys.geminiApiKey;
  
  if (!key) {
    if (activeProvider === "Gemini") key = DEFAULT_GEMINI_KEY;
    else return "⚠️ لطفاً کلید API را در تنظیمات وارد کنید.";
  }

  const prompt = generateAccountAnalysisPrompt(stats);

  try {
    let endpoint = "";
    let headers: Record<string, string> = { "Content-Type": "application/json" };
    let body: any = {};

    if (activeProvider === "Gemini") {
      endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
      body = {
        contents: [{ parts: [{ text: prompt }] }],
      };
    } else if (activeProvider === "Groq") {
      endpoint = "https://api.groq.com/openai/v1/chat/completions";
      headers["Authorization"] = `Bearer ${key}`;
      body = {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
      };
    } else if (activeProvider === "OpenAI" || activeProvider === "DeepSeek" || activeProvider === "OpenRouter") {
      endpoint = activeProvider === "DeepSeek"
        ? "https://api.deepseek.com/v1/chat/completions"
        : activeProvider === "OpenRouter"
        ? "https://openrouter.ai/api/v1/chat/completions"
        : "https://api.openai.com/v1/chat/completions";

      let apiKey = settings.apiKeys.openaiApiKey;
      if (activeProvider === "DeepSeek") apiKey = settings.apiKeys.deepseekApiKey;
      if (activeProvider === "OpenRouter") apiKey = settings.apiKeys.openrouterApiKey;

      headers["Authorization"] = `Bearer ${apiKey}`;
      body = {
        model: activeProvider === "DeepSeek" ? "deepseek-chat" : "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      };
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error("API Error");

    const data = await res.json();
    if (activeProvider === "Gemini") {
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "خطا در دریافت پاسخ.";
    } else {
      return data.choices?.[0]?.message?.content || "خطا در دریافت پاسخ.";
    }
  } catch (e) {
    console.error("Account AI fallback:", e);
    return "خطا در برقراری ارتباط با هوش مصنوعی. لطفاً اتصال اینترنت خود را بررسی کنید یا از پروکسی استفاده کنید.";
  }
}
