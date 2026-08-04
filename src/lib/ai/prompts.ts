import { Trade, TradeJournal, EconomicEvent } from "@/types/trade";

export function generateTradeAnalysisPrompt(trade: Trade, journal?: TradeJournal): string {
  return `
شما یک استاد ارشد روانشناسی معاملات، مدیریت ریسک و آنالیزور سبک‌های ساختار بازار (SMC / ICT) در بازار فارکس هستید.
لطفاً معامله زیر را تحلیل کرده و پاسخ خود را **کاملاً به زبان فارسی تخصصی، روان و خوانا** ارائه دهید.

### مشخصات معامله:
- نماد: ${trade.symbol}
- نوع سفارش: ${trade.orderType}
- حجم (Lot): ${trade.lotSize}
- قیمت ورود: ${trade.entryPrice} | قیمت خروج: ${trade.exitPrice}
- حد ضرر (SL): ${trade.stopLoss} | حد سود (TP): ${trade.takeProfit}
- سود/زیان خالص: $${trade.profit}
- مدت زمان پوزیشن: ${trade.durationMinutes} دقیقه
- نسبت R:R: ${trade.rrRatio || "نامشخص"}
- وضعیت BreakEven: ${trade.isBreakEven ? "بله" : "خیر"}

### اطلاعات ژورنال:
- استراتژی / ستاپ: ${journal?.setupName || "ثبت نشده"}
- سشن معاملاتی: ${journal?.session || "ثبت نشده"}
- جهت مارکت (Bias): ${journal?.bias || "ثبت نشده"}
- احساسات تریدر: ${journal?.emotion || "ثبت نشده"}
- نمره اطمینان (1-10): ${journal?.confidenceScore || "ثبت نشده"}
- علت ورود: ${journal?.reasonForEntry || "ثبت نشده"}
- علت خروج: ${journal?.reasonForExit || "ثبت نشده"}
- اشتباهات ثبت شده: ${journal?.mistakes?.join(", ") || "هیچ"}
- ساختار بازار (SMC): ${journal?.marketStructure || "ثبت نشده"} | FVG: ${journal?.fvgDetected ? "بله" : "خیر"} | OrderBlock: ${journal?.orderBlockType || "ثبت نشده"}

### فرمت خروجی مورد انتظار (حتماً به زبان فارسی و با ساختار JSON یا مارک‌داون زیر):
لطفاً پاسخ را در قالب JSON با کلیدهای زیر برگردانید:
{
  "psychologyRating": 85,
  "executionRating": 80,
  "riskManagementRating": 90,
  "overallScore": 85,
  "persianSummary": "خلاصه تحلیل پوزیشن به فارسی...",
  "tradingPsychologyFeedback": "تحلیل کنترل هیجانات، انتقام‌جویی، FOMO و ترس/طمع...",
  "entryExitTimingFeedback": "تحلیل تایمینگ ورود و خروج و مدیریت پوزیشن...",
  "riskAndLotSizeFeedback": "تحلیل حجم ورود و تناسب آن با حد ضرر...",
  "detectedWeaknesses": ["ضعف ۱", "ضعف ۲"],
  "detectedStrengths": ["نقطه قوت ۱", "نقطه قوت ۲"],
  "goldenRulesToFollow": ["قانون طلایی ۱", "قانون طلایی ۲"],
  "strategyOptimizationTips": "پیشنهاد اختصاصی برای بهینه‌سازی این استراتژی..."
}
`;
}

export function generateNewsAnalysisPrompt(event: EconomicEvent): string {
  return `
شما تحلیل‌گر ارشد اقتصاد کلان و فارکس هستید.
رویداد اقتصادی زیر را تحلیل کرده و گزارش را **کاملاً به زبان فارسی حرفه‌ای و روان** ارائه دهید:

- عنوان خبر: ${event.title}
- ارز مربوطه: ${event.currency}
- سطح اهمیت: ${event.impact}
- پیش‌بینی (Forecast): ${event.forecast} | قبلی (Previous): ${event.previous} | واقعی (Actual): ${event.actual || "هنوز اعلام نشده"}

فرمت خروجی مورد انتظار JSON به فارسی:
{
  "translatedTitleFa": "عنوان ترجمه شده به فارسی",
  "explanationFa": "توضیح کامل چیستی خبر و چرا اهمیت دارد",
  "indicatorTypeFa": "نوع شاخص اقتصادی",
  "affectedAssetsFa": {
    "goldXAUUSD": "تأثیر بر انس جهانی طلا",
    "dxyIndex": "تأثیر بر شاخص دلار آمریکا",
    "usdPairs": "تأثیر بر جفت‌ارزهای اصلی"
  },
  "bullishScenarioFa": "سناریوی صعودی مارکت",
  "bearishScenarioFa": "سناریوی نزولی مارکت",
  "expectedVolatilityFa": "Extremely High",
  "suggestedTradingApproachFa": "پیشنهاد معاملاتی برای مدیریت ریسک در زمان انتشار خبر",
  "keyLevelsToWatchFa": "سطوح کلیدی که باید زیر نظر داشت"
}
`;
}
