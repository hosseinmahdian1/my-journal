import { Trade, AdvancedStatistics, MonthlyMetric, SymbolMetric } from "@/types/trade";

export function calculateAdvancedStatistics(trades: Trade[], initialBalance = 10000): AdvancedStatistics {
  if (trades.length === 0) {
    return {
      balance: initialBalance,
      equity: initialBalance,
      freeMargin: initialBalance,
      floatingPnl: 0,
      marginLevelPercent: 999,
      totalNetProfit: 0,
      grossProfit: 0,
      grossLoss: 0,
      profitFactor: 0,
      expectedPayoff: 0,
      recoveryFactor: 0,
      sharpeRatio: 0,
      absoluteDrawdownAmount: 0,
      maxDrawdownAmount: 0,
      maxDrawdownPercent: 0,
      relativeDrawdownPercent: 0,
      totalTrades: 0,
      winRate: 0,
      winningTrades: 0,
      losingTrades: 0,
      longTradesCount: 0,
      longWinRate: 0,
      shortTradesCount: 0,
      shortWinRate: 0,
      profitTradesCount: 0,
      lossTradesCount: 0,
      largestProfitTrade: 0,
      largestLossTrade: 0,
      averageProfitTrade: 0,
      averageLossTrade: 0,
      maxConsecutiveWinsCount: 0,
      maxConsecutiveWinsAmount: 0,
      maxConsecutiveLossesCount: 0,
      maxConsecutiveLossesAmount: 0,
      avgConsecutiveWins: 0,
      avgConsecutiveLosses: 0,
      standardDeviation: 0,
      zScore: 0,
      ahpr: 0,
      ghpr: 0,
      expectancyPips: 0,
      winLossRatio: 0,
      rewardToRiskRatio: 0,
      avgTradeLengthMinutes: 0,
      avgWinLengthMinutes: 0,
      avgLossLengthMinutes: 0,
      riskFreeCount: 0,
      breakEvenCount: 0,
      partialExitsCount: 0,
      revengeTradesCount: 0,
      overtradingCount: 0,
      fomoTradesCount: 0,
      monthlyMetrics: [],
      symbolMetrics: [],
      todayProfit: 0,
      weeklyProfit: 0,
      monthlyProfit: 0,
      equityCurve: [],
      drawdownCurve: [],
      rrDistribution: [],
      profitDistribution: [],
    };
  }

  // Sort trades chronologically
  const sortedTrades = [...trades].sort(
    (a, b) => new Date(a.closeTime).getTime() - new Date(b.closeTime).getTime()
  );

  let currentBalance = initialBalance;
  let totalNetProfit = 0;
  let grossProfit = 0;
  let grossLoss = 0;

  let profitTradesCount = 0;
  let lossTradesCount = 0;

  let totalWinAmount = 0;
  let totalLossAmount = 0;

  let largestProfitTrade = -Infinity;
  let largestLossTrade = Infinity;

  let longTradesCount = 0;
  let winningLongCount = 0;
  let shortTradesCount = 0;
  let winningShortCount = 0;

  let totalDurationMinutes = 0;
  let winDurationMinutes = 0;
  let lossDurationMinutes = 0;

  let totalPipsGained = 0;

  // Streaks
  let currentWinCount = 0;
  let currentWinAmt = 0;
  let currentLossCount = 0;
  let currentLossAmt = 0;

  let maxWinStreakCount = 0;
  let maxWinStreakAmt = 0;
  let maxLossStreakCount = 0;
  let maxLossStreakAmt = 0;

  const winStreakCounts: number[] = [];
  const lossStreakCounts: number[] = [];

  // Detections
  let riskFreeCount = 0;
  let breakEvenCount = 0;
  let partialExitsCount = 0;
  let revengeTradesCount = 0;
  let overtradingCount = 0;
  let fomoTradesCount = 0;

  // Drawdown tracking
  let peakBalance = initialBalance;
  let maxDrawdownAmount = 0;
  let maxDrawdownPercent = 0;
  let absoluteDrawdownAmount = 0;

  // Groupings
  const symbolMap: Record<string, { profit: number; count: number; wins: number }> = {};
  const monthMap: Record<string, { profit: number; count: number; wins: number }> = {};
  const dailyTradeCounts: Record<string, number> = {};

  const equityCurve: Array<{ date: string; balance: number; equity: number }> = [
    { date: "Start", balance: initialBalance, equity: initialBalance },
  ];
  const drawdownCurve: Array<{ date: string; drawdown: number }> = [
    { date: "Start", drawdown: 0 },
  ];

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  let todayProfit = 0;
  let weeklyProfit = 0;
  let monthlyProfit = 0;

  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const runsPattern: boolean[] = []; // true = win, false = loss

  sortedTrades.forEach((trade) => {
    const netPnl = trade.profit + trade.commission + trade.swap;
    totalNetProfit += netPnl;
    currentBalance += netPnl;

    const duration = trade.durationMinutes || 15;
    totalDurationMinutes += duration;

    const tradeDate = new Date(trade.closeTime);
    const dayKey = trade.closeTime.split("T")[0];
    dailyTradeCounts[dayKey] = (dailyTradeCounts[dayKey] || 0) + 1;

    // Date range profit
    if (trade.closeTime.startsWith(todayStr)) todayProfit += netPnl;
    if (tradeDate >= weekAgo) weeklyProfit += netPnl;
    if (tradeDate >= monthAgo) monthlyProfit += netPnl;

    // Drawdowns
    if (initialBalance - currentBalance > absoluteDrawdownAmount) {
      absoluteDrawdownAmount = initialBalance - currentBalance;
    }

    if (currentBalance > peakBalance) {
      peakBalance = currentBalance;
    } else {
      const ddAmt = peakBalance - currentBalance;
      const ddPct = (ddAmt / peakBalance) * 100;
      if (ddAmt > maxDrawdownAmount) maxDrawdownAmount = ddAmt;
      if (ddPct > maxDrawdownPercent) maxDrawdownPercent = ddPct;
    }

    equityCurve.push({
      date: dayKey,
      balance: parseFloat(currentBalance.toFixed(2)),
      equity: parseFloat(currentBalance.toFixed(2)),
    });

    const currentDD = peakBalance > 0 ? ((peakBalance - currentBalance) / peakBalance) * 100 : 0;
    drawdownCurve.push({
      date: dayKey,
      drawdown: parseFloat(Math.max(0, currentDD).toFixed(2)),
    });

    // Best / Worst
    if (netPnl > largestProfitTrade) largestProfitTrade = netPnl;
    if (netPnl < largestLossTrade) largestLossTrade = netPnl;

    // Pips estimate
    const pipsMult = trade.symbol.includes("JPY") ? 100 : trade.symbol.includes("XAU") ? 10 : 10000;
    const pips = trade.pipsGained || Math.round((trade.exitPrice - trade.entryPrice) * pipsMult * (trade.orderType === "BUY" ? 1 : -1));
    totalPipsGained += pips;

    // Win vs Loss
    if (netPnl > 0.5) {
      profitTradesCount++;
      grossProfit += netPnl;
      totalWinAmount += netPnl;
      winDurationMinutes += duration;
      runsPattern.push(true);

      currentWinCount++;
      currentWinAmt += netPnl;
      if (currentWinCount > maxWinStreakCount) maxWinStreakCount = currentWinCount;
      if (currentWinAmt > maxWinStreakAmt) maxWinStreakAmt = currentWinAmt;

      if (currentLossCount > 0) {
        lossStreakCounts.push(currentLossCount);
        currentLossCount = 0;
        currentLossAmt = 0;
      }
    } else if (netPnl < -0.5) {
      lossTradesCount++;
      grossLoss += Math.abs(netPnl);
      totalLossAmount += Math.abs(netPnl);
      lossDurationMinutes += duration;
      runsPattern.push(false);

      currentLossCount++;
      currentLossAmt += Math.abs(netPnl);
      if (currentLossCount > maxLossStreakCount) maxLossStreakCount = currentLossCount;
      if (currentLossAmt > maxLossStreakAmt) maxLossStreakAmt = currentLossAmt;

      if (currentWinCount > 0) {
        winStreakCounts.push(currentWinCount);
        currentWinCount = 0;
        currentWinAmt = 0;
      }
    }

    // Long vs Short
    if (trade.orderType === "BUY") {
      longTradesCount++;
      if (netPnl > 0) winningLongCount++;
    } else if (trade.orderType === "SELL") {
      shortTradesCount++;
      if (netPnl > 0) winningShortCount++;
    }

    // Pattern Detections
    if (trade.isRiskFree || (trade.stopLoss > 0 && ((trade.orderType === "BUY" && trade.stopLoss >= trade.entryPrice) || (trade.orderType === "SELL" && trade.stopLoss <= trade.entryPrice)))) {
      riskFreeCount++;
    }
    if (trade.isBreakEven || Math.abs(netPnl) < 1.0) {
      breakEvenCount++;
    }
    if (trade.isPartialClose) {
      partialExitsCount++;
    }
    if (trade.isRevengeTrade || (lossTradesCount > 0 && netPnl < 0 && trade.lotSize > 1.5)) {
      revengeTradesCount++;
    }
    if (trade.isFomoTrade) {
      fomoTradesCount++;
    }

    // Symbol Map
    const sym = trade.symbol;
    if (!symbolMap[sym]) symbolMap[sym] = { profit: 0, count: 0, wins: 0 };
    symbolMap[sym].profit += netPnl;
    symbolMap[sym].count += 1;
    if (netPnl > 0) symbolMap[sym].wins += 1;

    // Monthly Map
    const monthKey = tradeDate.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    if (!monthMap[monthKey]) monthMap[monthKey] = { profit: 0, count: 0, wins: 0 };
    monthMap[monthKey].profit += netPnl;
    monthMap[monthKey].count += 1;
    if (netPnl > 0) monthMap[monthKey].wins += 1;
  });

  // Check overtrading days (> 5 trades/day)
  overtradingCount = Object.values(dailyTradeCounts).filter((cnt) => cnt > 5).length;

  if (currentWinCount > 0) winStreakCounts.push(currentWinCount);
  if (currentLossCount > 0) lossStreakCounts.push(currentLossCount);

  const totalTrades = sortedTrades.length;
  const longWinRate = longTradesCount > 0 ? (winningLongCount / longTradesCount) * 100 : 0;
  const shortWinRate = shortTradesCount > 0 ? (winningShortCount / shortTradesCount) * 100 : 0;

  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;
  const expectedPayoff = totalTrades > 0 ? totalNetProfit / totalTrades : 0;
  const recoveryFactor = maxDrawdownAmount > 0 ? totalNetProfit / maxDrawdownAmount : 0;

  const averageProfitTrade = profitTradesCount > 0 ? totalWinAmount / profitTradesCount : 0;
  const averageLossTrade = lossTradesCount > 0 ? totalLossAmount / lossTradesCount : 0;
  const winLossRatio = lossTradesCount > 0 ? profitTradesCount / lossTradesCount : profitTradesCount;
  const rewardToRiskRatio = averageLossTrade > 0 ? averageProfitTrade / averageLossTrade : 2.5;

  // Standard Deviation & Sharpe
  const returns = sortedTrades.map((t) => (t.profit + t.commission + t.swap) / initialBalance);
  const avgReturn = returns.reduce((a, b) => a + b, 0) / (returns.length || 1);
  const variance = returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / (returns.length || 1);
  const standardDeviation = Math.sqrt(variance);
  const sharpeRatio = standardDeviation > 0 ? (avgReturn / standardDeviation) * Math.sqrt(252) : 0;

  // AHPR & GHPR
  const ahpr = (1 + avgReturn) * 100 - 100;
  const compoundProduct = returns.reduce((acc, r) => acc * (1 + r), 1);
  const ghpr = (Math.pow(Math.max(0.0001, compoundProduct), 1 / (totalTrades || 1)) - 1) * 100;

  // Z-Score calculation
  let runsCount = 1;
  for (let i = 1; i < runsPattern.length; i++) {
    if (runsPattern[i] !== runsPattern[i - 1]) runsCount++;
  }
  const W = profitTradesCount;
  const L = lossTradesCount;
  const N = totalTrades;
  let zScore = 0;
  if (N > 1 && W > 0 && L > 0) {
    const expectedRuns = (2 * W * L) / N + 1;
    const runVariance = (2 * W * L * (2 * W * L - N)) / (Math.pow(N, 2) * (N - 1));
    zScore = runVariance > 0 ? (runsCount - expectedRuns) / Math.sqrt(runVariance) : 0;
  }

  const avgConsecutiveWins = winStreakCounts.length > 0
    ? winStreakCounts.reduce((a, b) => a + b, 0) / winStreakCounts.length
    : 0;
  const avgConsecutiveLosses = lossStreakCounts.length > 0
    ? lossStreakCounts.reduce((a, b) => a + b, 0) / lossStreakCounts.length
    : 0;

  // Symbol metrics array
  const symbolMetrics: SymbolMetric[] = Object.entries(symbolMap).map(([symbol, d]) => ({
    symbol,
    profit: parseFloat(d.profit.toFixed(2)),
    totalTrades: d.count,
    winRate: parseFloat(((d.wins / d.count) * 100).toFixed(1)),
  }));

  // Monthly metrics array
  const monthlyMetrics: MonthlyMetric[] = Object.entries(monthMap).map(([monthName, d]) => ({
    monthName,
    profit: parseFloat(d.profit.toFixed(2)),
    totalTrades: d.count,
    winRate: parseFloat(((d.wins / d.count) * 100).toFixed(1)),
  }));

  const rrDistribution = [
    { range: "< 1:1", count: sortedTrades.filter((t) => (t.rrRatio || 1) < 1).length },
    { range: "1:1 - 1:2", count: sortedTrades.filter((t) => (t.rrRatio || 1) >= 1 && (t.rrRatio || 1) < 2).length },
    { range: "1:2 - 1:3", count: sortedTrades.filter((t) => (t.rrRatio || 1) >= 2 && (t.rrRatio || 1) < 3).length },
    { range: "1:3+", count: sortedTrades.filter((t) => (t.rrRatio || 1) >= 3).length },
  ];

  const profitDistribution = [
    { bin: "<-$200", count: sortedTrades.filter((t) => t.profit < -200).length },
    { bin: "-$200 to -$50", count: sortedTrades.filter((t) => t.profit >= -200 && t.profit < -50).length },
    { bin: "-$50 to $0", count: sortedTrades.filter((t) => t.profit >= -50 && t.profit < 0).length },
    { bin: "$0 to $50", count: sortedTrades.filter((t) => t.profit >= 0 && t.profit <= 50).length },
    { bin: "$50 to $200", count: sortedTrades.filter((t) => t.profit > 50 && t.profit <= 200).length },
    { bin: ">$200", count: sortedTrades.filter((t) => t.profit > 200).length },
  ];

  return {
    balance: parseFloat(currentBalance.toFixed(2)),
    equity: parseFloat(currentBalance.toFixed(2)),
    freeMargin: parseFloat((currentBalance * 0.85).toFixed(2)),
    floatingPnl: 0,
    marginLevelPercent: 1250.5,
    totalNetProfit: parseFloat(totalNetProfit.toFixed(2)),
    grossProfit: parseFloat(grossProfit.toFixed(2)),
    grossLoss: parseFloat(grossLoss.toFixed(2)),
    profitFactor: parseFloat(profitFactor.toFixed(2)),
    expectedPayoff: parseFloat(expectedPayoff.toFixed(2)),
    recoveryFactor: parseFloat(recoveryFactor.toFixed(2)),
    sharpeRatio: parseFloat(sharpeRatio.toFixed(2)),
    absoluteDrawdownAmount: parseFloat(Math.max(0, absoluteDrawdownAmount).toFixed(2)),
    maxDrawdownAmount: parseFloat(maxDrawdownAmount.toFixed(2)),
    maxDrawdownPercent: parseFloat(maxDrawdownPercent.toFixed(2)),
    relativeDrawdownPercent: parseFloat(maxDrawdownPercent.toFixed(2)),
    totalTrades,
    winRate: parseFloat((totalTrades > 0 ? (profitTradesCount / totalTrades) * 100 : 0).toFixed(1)),
    winningTrades: profitTradesCount,
    losingTrades: lossTradesCount,
    longTradesCount,
    longWinRate: parseFloat(longWinRate.toFixed(1)),
    shortTradesCount,
    shortWinRate: parseFloat(shortWinRate.toFixed(1)),
    profitTradesCount,
    lossTradesCount,
    largestProfitTrade: largestProfitTrade === -Infinity ? 0 : parseFloat(largestProfitTrade.toFixed(2)),
    largestLossTrade: largestLossTrade === Infinity ? 0 : parseFloat(largestLossTrade.toFixed(2)),
    averageProfitTrade: parseFloat(averageProfitTrade.toFixed(2)),
    averageLossTrade: parseFloat(averageLossTrade.toFixed(2)),
    maxConsecutiveWinsCount: maxWinStreakCount,
    maxConsecutiveWinsAmount: parseFloat(maxWinStreakAmt.toFixed(2)),
    maxConsecutiveLossesCount: maxLossStreakCount,
    maxConsecutiveLossesAmount: parseFloat(maxLossStreakAmt.toFixed(2)),
    avgConsecutiveWins: parseFloat(avgConsecutiveWins.toFixed(1)),
    avgConsecutiveLosses: parseFloat(avgConsecutiveLosses.toFixed(1)),
    standardDeviation: parseFloat((standardDeviation * 100).toFixed(2)),
    zScore: parseFloat(zScore.toFixed(2)),
    ahpr: parseFloat(ahpr.toFixed(2)),
    ghpr: parseFloat(ghpr.toFixed(2)),
    expectancyPips: Math.round(totalPipsGained / (totalTrades || 1)),
    winLossRatio: parseFloat(winLossRatio.toFixed(2)),
    rewardToRiskRatio: parseFloat(rewardToRiskRatio.toFixed(2)),
    avgTradeLengthMinutes: Math.round(totalDurationMinutes / (totalTrades || 1)),
    avgWinLengthMinutes: Math.round(winDurationMinutes / (profitTradesCount || 1)),
    avgLossLengthMinutes: Math.round(lossDurationMinutes / (lossTradesCount || 1)),
    riskFreeCount,
    breakEvenCount,
    partialExitsCount,
    revengeTradesCount,
    overtradingCount,
    fomoTradesCount,
    monthlyMetrics,
    symbolMetrics,
    todayProfit: parseFloat(todayProfit.toFixed(2)),
    weeklyProfit: parseFloat(weeklyProfit.toFixed(2)),
    monthlyProfit: parseFloat(monthlyProfit.toFixed(2)),
    equityCurve,
    drawdownCurve,
    rrDistribution,
    profitDistribution,
  };
}
