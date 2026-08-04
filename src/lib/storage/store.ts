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
    openTime: new Date(Date.now() - 7200000).toISOString(),
    closeTime: new Date(Date.now() - 3600000).toISOString(),
    entryPrice: 2420.5,
    exitPrice: 2435.2,
    stopLoss: 2415.0,
    takeProfit: 2438.0,
    commission: -3.5,
    swap: 0,
    profit: 735.0,
    balanceAfterTrade: 10731.5,
    durationMinutes: 60,
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
    openTime: new Date(Date.now() - 86400000 - 7200000).toISOString(),
    closeTime: new Date(Date.now() - 86400000).toISOString(),
    entryPrice: 1.0925,
    exitPrice: 1.0880,
    stopLoss: 1.0945,
    takeProfit: 1.0870,
    commission: -7.0,
    swap: -1.2,
    profit: 450.0,
    balanceAfterTrade: 11173.3,
    durationMinutes: 120,
    rrRatio: 2.25,
    isBreakEven: false,
    journalId: "journal-102",
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

export function deleteAccount(accountId: string): void {
  if (typeof window === "undefined") return;
  const accounts = loadAccounts();
  if (accounts.length <= 1) return;

  const remainingAccounts = accounts.filter((a) => a.id !== accountId);
  saveAccounts(remainingAccounts);

  const activeId = getActiveAccountId();
  if (activeId === accountId) {
    setActiveAccountId(remainingAccounts[0].id);
  }

  const allTrades = loadAllTrades();
  const remainingTrades = allTrades.filter((t) => (t.accountId || "acc-1") !== accountId);
  localStorage.setItem(TRADES_KEY, JSON.stringify(remainingTrades));

  window.dispatchEvent(new Event("storage"));
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

export function loadAllTrades(): Trade[] {
  if (typeof window === "undefined") return INITIAL_DEMO_TRADES;
  try {
    const rawV1 = localStorage.getItem("tj_ai_trades_v1");
    const rawRel = localStorage.getItem("tj_ai_trades_v1_rel");

    let listV1: Trade[] = [];
    let listRel: Trade[] = [];

    if (rawV1) {
      try { listV1 = JSON.parse(rawV1); } catch {}
    }
    if (rawRel) {
      try { listRel = JSON.parse(rawRel); } catch {}
    }

    if (listV1.length === 0 && listRel.length === 0) {
      localStorage.setItem("tj_ai_trades_v1", JSON.stringify(INITIAL_DEMO_TRADES));
      return INITIAL_DEMO_TRADES;
    }

    // Merge both without duplicates by trade id or ticket
    const map = new Map<string, Trade>();
    [...listV1, ...listRel].forEach((t) => {
      if (t && t.id) {
        map.set(t.id, t);
      }
    });

    const merged = Array.from(map.values());
    localStorage.setItem("tj_ai_trades_v1", JSON.stringify(merged));
    return merged;
  } catch {
    return INITIAL_DEMO_TRADES;
  }
}

export function loadTrades(accountId?: string): Trade[] {
  const targetAccountId = accountId || getActiveAccountId();
  const all = loadAllTrades();
  return all.filter((t) => (t.accountId || "acc-1") === targetAccountId);
}

export function saveTrades(newOrUpdatedTrades: Trade[]): void {
  if (typeof window === "undefined") return;
  const activeAccountId = getActiveAccountId();
  const allTrades = loadAllTrades();

  const otherAccountTrades = allTrades.filter((t) => (t.accountId || "acc-1") !== activeAccountId);
  const sanitizedTrades = newOrUpdatedTrades.map((t) => ({
    ...t,
    accountId: t.accountId || activeAccountId,
  }));

  const fullList = [...otherAccountTrades, ...sanitizedTrades];
  localStorage.setItem(TRADES_KEY, JSON.stringify(fullList));
  window.dispatchEvent(new Event("storage"));
}

export function resetDemoTrades(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TRADES_KEY, JSON.stringify(INITIAL_DEMO_TRADES));
  window.dispatchEvent(new Event("storage"));
}

export function loadJournals(): Record<string, TradeJournal> {
  if (typeof window === "undefined") return INITIAL_DEMO_JOURNALS;
  try {
    const raw = localStorage.getItem(JOURNALS_KEY);
    return raw ? JSON.parse(raw) : INITIAL_DEMO_JOURNALS;
  } catch {
    return INITIAL_DEMO_JOURNALS;
  }
}

export function saveJournals(journals: Record<string, TradeJournal>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(JOURNALS_KEY, JSON.stringify(journals));
  window.dispatchEvent(new Event("storage"));
}

export const INITIAL_ECONOMIC_EVENTS: EconomicEvent[] = [
  {
    id: "news-1",
    title: "US Non-Farm Payrolls (NFP)",
    currency: "USD",
    date: "2026-08-07",
    time: "16:00",
    impact: "High",
    forecast: "+185K",
    previous: "+206K",
  },
  {
    id: "news-2",
    title: "CPI Inflation Rate YoY",
    currency: "USD",
    date: "2026-08-12",
    time: "16:00",
    impact: "High",
    forecast: "3.0%",
    previous: "3.2%",
  },
  {
    id: "news-3",
    title: "ECB Interest Rate Decision",
    currency: "EUR",
    date: "2026-08-14",
    time: "15:45",
    impact: "High",
    forecast: "3.75%",
    previous: "4.00%",
  },
];
