export type OrderType = "BUY" | "SELL" | "BALANCE" | "CREDIT";

export interface TradingAccount {
  id: string;
  name: string;
  broker?: string;
  accountNumber?: string;
  currency: string;
  initialBalance: number;
  createdAt: string;
}

export interface Trade {
  id: string;
  accountId: string; // Scoped to specific trading account
  ticket: number;
  symbol: string;
  orderType: OrderType;
  lotSize: number;
  openTime: string; // ISO String
  closeTime: string; // ISO String
  entryPrice: number;
  exitPrice: number;
  stopLoss: number;
  takeProfit: number;
  commission: number;
  swap: number;
  profit: number; // Net Profit in account currency
  balanceAfterTrade: number;
  magicNumber?: number;
  comment?: string;
  durationMinutes: number;
  
  // Advanced MT4/MT5 Metrics
  riskPercent?: number;
  rewardPercent?: number;
  rrRatio?: number;
  pipsGained?: number;
  maePips?: number; // Maximum Adverse Excursion
  mfePips?: number; // Maximum Favorable Excursion
  slippagePips?: number;
  spreadPips?: number;
  
  // Pattern Detections
  isPartialClose?: boolean;
  isTrailingStop?: boolean;
  isBreakEven?: boolean;
  isRiskFree?: boolean;
  isRevengeTrade?: boolean;
  isOvertrading?: boolean;
  isFomoTrade?: boolean;

  // Associated Journal Data ID
  journalId?: string;
}

export interface TradeJournal {
  id: string;
  tradeId: string;
  
  // Screenshots
  screenshotBefore?: string;
  screenshotDuring?: string;
  screenshotAfter?: string;
  tradingViewLink?: string;

  // Trade Setup & Execution Parameters
  setupName: string;
  session: "Asian" | "London" | "New York" | "Overlap";
  bias: "Bullish" | "Bearish" | "Neutral";
  timeframe: "M1" | "M5" | "M15" | "H1" | "H4" | "D1";
  
  reasonForEntry: string;
  reasonForExit: string;
  mistakes: string[];
  lessonsLearned: string;
  
  // Emotion & Psychology
  emotion: "Calm & Disciplined" | "FOMO" | "Greed" | "Fear" | "Revenge" | "Overconfidence" | "Anxious";
  confidenceScore: number;
  manualNotes?: string;

  // SMC / ICT Concepts Tagging
  marketStructure: "Bullish BOS" | "Bearish BOS" | "CHOCH" | "Ranging";
  liquidityType?: "Equal Highs" | "Equal Lows" | "Trendline Liquidity" | "Session High/Low";
  orderBlockType?: "Bullish OB" | "Bearish OB" | "Breaker Block" | "Mitigation Block";
  fvgDetected?: boolean;
  premiumDiscountZone?: "Premium" | "Discount" | "Equilibrium";
  killZone?: "Asian" | "London Open" | "NY Open" | "London Close";

  // Persian AI Analysis Snapshot
  aiAnalysis?: PersianAIAnalysis;
}

export interface PersianAIAnalysis {
  generatedAt: string;
  provider: string;
  model: string;
  psychologyRating: number;
  executionRating: number;
  riskManagementRating: number;
  overallScore: number;
  
  persianSummary: string;
  tradingPsychologyFeedback: string;
  entryExitTimingFeedback: string;
  riskAndLotSizeFeedback: string;
  detectedWeaknesses: string[];
  detectedStrengths: string[];
  goldenRulesToFollow: string[];
  strategyOptimizationTips: string;
}

export interface MonthlyMetric {
  monthName: string;
  profit: number;
  winRate: number;
  totalTrades: number;
}

export interface SymbolMetric {
  symbol: string;
  profit: number;
  totalTrades: number;
  winRate: number;
}

export interface AdvancedStatistics {
  balance: number;
  equity: number;
  freeMargin: number;
  floatingPnl: number;
  marginLevelPercent: number;

  totalNetProfit: number;
  grossProfit: number;
  grossLoss: number;
  profitFactor: number;
  expectedPayoff: number;
  recoveryFactor: number;
  sharpeRatio: number;

  absoluteDrawdownAmount: number;
  maxDrawdownAmount: number;
  maxDrawdownPercent: number;
  relativeDrawdownPercent: number;

  totalTrades: number;
  winRate: number;
  winningTrades: number;
  losingTrades: number;
  longTradesCount: number;
  longWinRate: number;
  shortTradesCount: number;
  shortWinRate: number;
  profitTradesCount: number;
  lossTradesCount: number;
  largestProfitTrade: number;
  largestLossTrade: number;
  averageProfitTrade: number;
  averageLossTrade: number;

  maxConsecutiveWinsCount: number;
  maxConsecutiveWinsAmount: number;
  maxConsecutiveLossesCount: number;
  maxConsecutiveLossesAmount: number;
  avgConsecutiveWins: number;
  avgConsecutiveLosses: number;

  standardDeviation: number;
  zScore: number;
  ahpr: number;
  ghpr: number;
  expectancyPips: number;
  winLossRatio: number;
  rewardToRiskRatio: number;

  avgTradeLengthMinutes: number;
  avgWinLengthMinutes: number;
  avgLossLengthMinutes: number;

  riskFreeCount: number;
  breakEvenCount: number;
  partialExitsCount: number;
  revengeTradesCount: number;
  overtradingCount: number;
  fomoTradesCount: number;

  monthlyMetrics: MonthlyMetric[];
  symbolMetrics: SymbolMetric[];

  todayProfit: number;
  weeklyProfit: number;
  monthlyProfit: number;
  equityCurve: Array<{ date: string; balance: number; equity: number }>;
  drawdownCurve: Array<{ date: string; drawdown: number }>;
  rrDistribution: Array<{ range: string; count: number }>;
  profitDistribution: Array<{ bin: string; count: number }>;
}

export interface EconomicEvent {
  id: string;
  title: string;
  currency: string;
  date: string;
  time: string;
  impact: "High" | "Medium" | "Low";
  forecast: string;
  previous: string;
  actual?: string;
  surprise?: string;

  aiNewsAnalysis?: {
    translatedTitleFa: string;
    explanationFa: string;
    indicatorTypeFa: string;
    affectedAssetsFa: {
      goldXAUUSD: string;
      dxyIndex: string;
      usdPairs: string;
    };
    bullishScenarioFa: string;
    bearishScenarioFa: string;
    expectedVolatilityFa: "Extremely High" | "High" | "Moderate" | "Low";
    suggestedTradingApproachFa: string;
    keyLevelsToWatchFa: string;
  };
}

export interface UserSettings {
  ownerName: string;
  defaultCurrency: string;
  calendarMode: "Gregorian" | "Jalali" | "Both";
  themeMode: "Dark Glass";
  activeAiProvider: "Gemini" | "OpenAI" | "Claude" | "DeepSeek" | "OpenRouter";
  apiKeys: {
    geminiApiKey?: string;
    openaiApiKey?: string;
    claudeApiKey?: string;
    deepseekApiKey?: string;
    openrouterApiKey?: string;
  };
  selectedModel: string;
  autoBackupEnabled: boolean;
}
