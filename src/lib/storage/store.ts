import { Trade, TradeJournal, UserSettings, EconomicEvent, TradingAccount } from "@/types/trade";

const SETTINGS_KEY = "tj_ai_settings_v1";
const ACCOUNTS_KEY = "tj_ai_accounts_v1";
const ACTIVE_ACCOUNT_KEY = "tj_ai_active_account_id_v1";
const TRADES_KEY = "tj_ai_trades_v1";
const JOURNALS_KEY = "tj_ai_journals_v1";

export const DEFAULT_ACCOUNTS: TradingAccount[] = [
  {
    id: "acc-1",
    name: "Prop Master Account",
    broker: "FTMO Pro",
    accountNumber: "9940120",
    currency: "USD",
    initialBalance: 10000,
    createdAt: "2026-08-01",
  },
  {
    id: "acc-2",
    name: "FTMO Challenge $50k",
    broker: "FTMO",
    accountNumber: "500412",
    currency: "USD",
    initialBalance: 50000,
    createdAt: "2026-08-01",
  },
  {
    id: "acc-3",
    name: "Gold Scalping Live",
    broker: "IC Markets",
    accountNumber: "884102",
    currency: "USD",
    initialBalance: 25000,
    createdAt: "2026-08-01",
  },
];

export const DEFAULT_SETTINGS: UserSettings = {
  ownerName: "Owner Trader",
  defaultCurrency: "USD",
  calendarMode: "Both",
  themeMode: "Dark Glass",
  activeAiProvider: "Gemini",
  apiKeys: {},
  selectedModel: "gemini-1.5-flash",
  autoBackupEnabled: true,
};

export const INITIAL_DEMO_TRADES: Trade[] = [
  {
    id: "trade-101",
    accountId: "acc-1",
    ticket: 8839201,
    symbol: "XAUUSD",
    orderType: "BUY",
    lotSize: 0.5,
    openTime: "2026-08-01T13:15:00.000Z",
    closeTime: "2026-08-01T14:45:00.000Z",
    entryPrice: 2420.5,
    exitPrice: 2435.2,
    stopLoss: 2415.0,
    takeProfit: 2438.0,
    commission: -3.5,
    swap: 0,
    profit: 735.0,
    balanceAfterTrade: 10731.5,
    durationMinutes: 90,
    rrRatio: 2.67,
    isBreakEven: false,
    isPartialClose: true,
    journalId: "journal-101",
  },
  {
    id: "trade-102",
    accountId: "acc-1",
    ticket: 8839245,
    symbol: "EURUSD",
    orderType: "SELL",
    lotSize: 1.0,
    openTime: "2026-08-02T08:00:00.000Z",
    closeTime: "2026-08-02T10:30:00.000Z",
    entryPrice: 1.0925,
    exitPrice: 1.0880,
    stopLoss: 1.0945,
    takeProfit: 1.0870,
    commission: -7.0,
    swap: -1.2,
    profit: 450.0,
    balanceAfterTrade: 11173.3,
    durationMinutes: 150,
    rrRatio: 2.25,
    isBreakEven: false,
    journalId: "journal-102",
  },
  {
    id: "trade-103",
    accountId: "acc-1",
    ticket: 8839310,
    symbol: "GBPUSD",
    orderType: "BUY",
    lotSize: 0.8,
    openTime: "2026-08-02T14:00:00.000Z",
    closeTime: "2026-08-02T14:35:00.000Z",
    entryPrice: 1.2840,
    exitPrice: 1.2820,
    stopLoss: 1.2820,
    takeProfit: 1.2890,
    commission: -5.6,
    swap: 0,
    profit: -160.0,
    balanceAfterTrade: 11007.7,
    durationMinutes: 35,
    rrRatio: 2.5,
    isBreakEven: false,
    journalId: "journal-103",
  },
  {
    id: "trade-104",
    accountId: "acc-1",
    ticket: 8839402,
    symbol: "USDJPY",
    orderType: "BUY",
    lotSize: 0.6,
    openTime: "2026-08-02T16:10:00.000Z",
    closeTime: "2026-08-02T18:20:00.000Z",
    entryPrice: 154.20,
    exitPrice: 155.10,
    stopLoss: 153.80,
    takeProfit: 155.40,
    commission: -4.2,
    swap: 0,
    profit: 540.0,
    balanceAfterTrade: 11543.5,
    durationMinutes: 130,
    rrRatio: 2.25,
    journalId: "journal-104",
  },
];

export const INITIAL_DEMO_JOURNALS: Record<string, TradeJournal> = {
  "journal-101": {
    id: "journal-101",
    tradeId: "trade-101",
    setupName: "NY Open FVG Liquidity Sweep",
    session: "New York",
    bias: "Bullish",
    timeframe: "M15",
    reasonForEntry: "قیمت نقدینگی سشن قبل را ریجکت کرد و روی FVG تایم ۱۵ دقیقه‌ای اردربلاک صعودی تشکیل داد.",
    reasonForExit: "رسیدن به تارگت اول و سیو سود ۷۰٪ پوزیشن در لول مقاومت روزانه.",
    mistakes: ["ورود ۵ دقیقه زودتر از بسته‌شدن کندل"],
    lessonsLearned: "صبر کردن برای کندل تأییدی سودآوری پوزیشن را تضمین می‌کند.",
    emotion: "Calm & Disciplined",
    confidenceScore: 9,
    marketStructure: "Bullish BOS",
    liquidityType: "Equal Lows",
    orderBlockType: "Bullish OB",
    fvgDetected: true,
    premiumDiscountZone: "Discount",
    killZone: "NY Open",
  },
};

export function loadAccounts(): TradingAccount[] {
  if (typeof window === "undefined") return DEFAULT_ACCOUNTS;
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
      return DEFAULT_ACCOUNTS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_ACCOUNTS;
  }
}

export function saveAccounts(accounts: TradingAccount[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function getActiveAccountId(): string {
  if (typeof window === "undefined") return "acc-1";
  try {
    return localStorage.getItem(ACTIVE_ACCOUNT_KEY) || "acc-1";
  } catch {
    return "acc-1";
  }
}

export function setActiveAccountId(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACTIVE_ACCOUNT_KEY, id);
}

export function loadSettings(): UserSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadTrades(accountId?: string): Trade[] {
  if (typeof window === "undefined") return INITIAL_DEMO_TRADES;
  try {
    const targetAccountId = accountId || getActiveAccountId();
    const raw = localStorage.getItem(TRADES_KEY);
    if (!raw) {
      localStorage.setItem(TRADES_KEY, JSON.stringify(INITIAL_DEMO_TRADES));
      return INITIAL_DEMO_TRADES.filter((t) => t.accountId === targetAccountId || !t.accountId);
    }
    const allTrades: Trade[] = JSON.parse(raw);
    return allTrades.filter((t) => (t.accountId || "acc-1") === targetAccountId);
  } catch {
    return INITIAL_DEMO_TRADES;
  }
}

export function saveTrades(trades: Trade[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TRADES_KEY, JSON.stringify(trades));
}

export function deleteTrade(tradeId: string): void {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(TRADES_KEY);
  if (!raw) return;
  const allTrades: Trade[] = JSON.parse(raw);
  const updated = allTrades.filter((t) => t.id !== tradeId);
  localStorage.setItem(TRADES_KEY, JSON.stringify(updated));
}

export function loadJournals(): Record<string, TradeJournal> {
  if (typeof window === "undefined") return INITIAL_DEMO_JOURNALS;
  try {
    const raw = localStorage.getItem(JOURNALS_KEY);
    if (!raw) {
      localStorage.setItem(JOURNALS_KEY, JSON.stringify(INITIAL_DEMO_JOURNALS));
      return INITIAL_DEMO_JOURNALS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEMO_JOURNALS;
  }
}

export function saveJournals(journals: Record<string, TradeJournal>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(JOURNALS_KEY, JSON.stringify(journals));
}

export const INITIAL_ECONOMIC_EVENTS: EconomicEvent[] = [
  {
    id: "news-1",
    title: "US Core CPI m/m",
    currency: "USD",
    date: "2026-08-03",
    time: "16:00",
    impact: "High",
    forecast: "0.3%",
    previous: "0.2%",
    aiNewsAnalysis: {
      translatedTitleFa: "شاخص قیمت مصرف‌کننده پایه آمریکا (تورم ماهانه)",
      explanationFa: "مهم‌ترین شاخص تورمی مورد توجه فدرال رزرو جهت تصمیم‌گیری نرخ بهره.",
      indicatorTypeFa: "شاخص تورم کلان (High Impact)",
      affectedAssetsFa: {
        goldXAUUSD: "افزایش تورم باعث سقوط طلا و کاهش تورم موجب صعود پرقدرت طلا می‌شود.",
        dxyIndex: "در صورت بالا بودن آمار، شاخص دلار صعودی خواهد شد.",
        usdPairs: "نوسانات ۱۲۰+ پیپ روی تمام جفت‌ارزهای دلاری.",
      },
      bullishScenarioFa: "عدد بالای ۰.۴٪ باعث تقویت دلار و افت طلا می‌گردد.",
      bearishScenarioFa: "عدد زیر ۰.۲٪ باعث ریزش سنگین دلار و اوج‌گیری طلا می‌شود.",
      expectedVolatilityFa: "Extremely High",
      suggestedTradingApproachFa: "از باز کردن پوزیشن ۱۵ دقیقه قبل از خبر امتناع ورزید.",
      keyLevelsToWatchFa: "مقاومت ۲۴۴۰ و حمایت ۲۴۰۰ طلا.",
    },
  },
  {
    id: "news-2",
    title: "Non-Farm Employment Change (NFP)",
    currency: "USD",
    date: "2026-08-05",
    time: "16:00",
    impact: "High",
    forecast: "185K",
    previous: "206K",
  },
  {
    id: "news-3",
    title: "BOE Monetary Policy Summary",
    currency: "GBP",
    date: "2026-08-04",
    time: "14:30",
    impact: "High",
    forecast: "5.00%",
    previous: "5.25%",
  },
];
