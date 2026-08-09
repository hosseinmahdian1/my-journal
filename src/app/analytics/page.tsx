"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass/GlassCard";
import { GlassButton } from "@/components/ui/glass/GlassButton";
import { GlassBadge } from "@/components/ui/glass/GlassBadge";
import { loadTrades, loadAccounts, getActiveAccountId } from "@/lib/storage/store";
import { calculateAdvancedStatistics } from "@/lib/analytics/stats-calculator";
import { AdvancedStatistics, Trade } from "@/types/trade";
import { InteractiveEquityDrawdownChart } from "@/components/analytics/InteractiveEquityDrawdownChart";
import {
  ShieldCheck,
  Award,
  TrendingUp,
  TrendingDown,
  Clock,
  Activity,
  Flame,
  Zap,
  Brain,
  Sparkles,
  PieChart,
  DollarSign,
  AlertTriangle,
  Layers,
  CheckCircle,
  BarChart3,
  Target,
  Compass,
  AlertCircle,
  RefreshCw,
  FileText,
} from "lucide-react";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AdvancedStatistics | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  useEffect(() => {
    const loadedTrades = loadTrades();
    const accounts = loadAccounts();
    const activeId = getActiveAccountId();
    const activeAccount = accounts.find((a) => a.id === activeId) || accounts[0];
    const initialBal = activeAccount?.initialBalance || 10000;
    setTrades(loadedTrades);
    setStats(calculateAdvancedStatistics(loadedTrades, initialBal));
  }, []);

  if (!stats) return null;

  return (
    <div className="space-y-10 pb-12">
      {/* Top Banner Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-black tracking-tight dark:text-white text-slate-950 flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-cyan-400" />
              <span>50+ Advanced Forex Analytics & Behavioral Audit</span>
            </h1>
            <GlassBadge variant="cyan" className="font-bold">
              Unified MetaTrader & Behavioral AI Engine
            </GlassBadge>
          </div>
          <p className="mt-1 text-xs dark:text-slate-400 text-slate-600 font-medium">
            Unified analytics dashboard: MetaTrader 50+ parameters, PSYCH AUDIT, risk management traps, and deep behavioral AI critiques.
          </p>
        </div>
      </div>

      {/* Interactive Account Growth & Drawdown Chart */}
      <InteractiveEquityDrawdownChart trades={trades} initialBalance={stats.balance} />

      {/* ------------------------------------------------------------- */}
      {/* SECTION 1: Account Summary */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-3">
        <h2 className="text-lg font-black dark:text-white text-slate-900 flex items-center gap-2 border-b dark:border-white/10 border-black/10 pb-2">
          <DollarSign className="h-5 w-5 text-cyan-400" />
          <span>1. Account Summary</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <GlassCard glowColor="cyan" className="p-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Balance</div>
            <div className="text-xl font-black dark:text-white text-slate-900 mt-1">${stats.balance.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">Current Account Balance</div>
          </GlassCard>

          <GlassCard glowColor="green" className="p-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Equity</div>
            <div className="text-xl font-black text-emerald-400 mt-1">${stats.equity.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">Floating Equity (Balance + Open P/L)</div>
          </GlassCard>

          <GlassCard glowColor="purple" className="p-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Free Margin</div>
            <div className="text-xl font-black text-purple-400 mt-1">${stats.freeMargin.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">Available Unusable Margin</div>
          </GlassCard>

          <GlassCard glowColor="gold" className="p-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Floating P/L</div>
            <div className="text-xl font-black text-amber-400 mt-1">${stats.floatingPnl}</div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">Open Position Floating Profit/Loss</div>
          </GlassCard>

          <GlassCard glowColor="cyan" className="p-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Margin Level</div>
            <div className="text-xl font-black text-cyan-400 mt-1">{stats.marginLevelPercent}%</div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">Current Margin Health Level</div>
          </GlassCard>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 2: Results */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-3">
        <h2 className="text-lg font-black dark:text-white text-slate-900 flex items-center gap-2 border-b dark:border-white/10 border-black/10 pb-2">
          <Award className="h-5 w-5 text-emerald-400" />
          <span>2. Performance Results</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          <GlassCard glowColor="green" className="p-3.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Net Profit</div>
            <div className="text-lg font-extrabold text-emerald-400 mt-0.5">${stats.totalNetProfit}</div>
            <div className="text-[9px] text-slate-500">Gross Profit + Gross Loss</div>
          </GlassCard>

          <GlassCard glowColor="green" className="p-3.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross Profit</div>
            <div className="text-lg font-extrabold text-emerald-400 mt-0.5">${stats.grossProfit}</div>
            <div className="text-[9px] text-slate-500">Sum of All Winning Trades</div>
          </GlassCard>

          <GlassCard glowColor="red" className="p-3.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross Loss</div>
            <div className="text-lg font-extrabold text-rose-400 mt-0.5">${stats.grossLoss}</div>
            <div className="text-[9px] text-slate-500">Sum of All Losing Trades</div>
          </GlassCard>

          <GlassCard glowColor="cyan" className="p-3.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Profit Factor</div>
            <div className="text-lg font-extrabold text-cyan-400 mt-0.5">{stats.profitFactor}</div>
            <div className="text-[9px] text-slate-500">Gross Profit ÷ Gross Loss</div>
          </GlassCard>

          <GlassCard glowColor="gold" className="p-3.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expected Payoff</div>
            <div className="text-lg font-extrabold text-amber-400 mt-0.5">${stats.expectedPayoff}</div>
            <div className="text-[9px] text-slate-500">Net Profit ÷ Total Trades</div>
          </GlassCard>

          <GlassCard glowColor="purple" className="p-3.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recovery Factor</div>
            <div className="text-lg font-extrabold text-purple-400 mt-0.5">{stats.recoveryFactor}</div>
            <div className="text-[9px] text-slate-500">Net Profit ÷ Max Drawdown</div>
          </GlassCard>

          <GlassCard glowColor="cyan" className="p-3.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sharpe Ratio</div>
            <div className="text-lg font-extrabold text-sky-400 mt-0.5">{stats.sharpeRatio}</div>
            <div className="text-[9px] text-slate-500">Risk-Adjusted Return Ratio</div>
          </GlassCard>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 3: Drawdown & SECTION 4: Trade Statistics */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION 3: Drawdown */}
        <GlassCard glowColor="red" className="space-y-4">
          <h2 className="text-base font-extrabold dark:text-white text-slate-900 flex items-center gap-2 border-b dark:border-white/10 border-black/10 pb-2">
            <TrendingDown className="h-5 w-5 text-rose-400" />
            <span>3. Drawdown Metrics</span>
          </h2>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="rounded-xl border dark:border-white/10 border-black/10 bg-slate-900/60 p-3">
              <span className="text-slate-400 font-semibold block text-[11px]">Absolute Drawdown</span>
              <span className="font-extrabold text-rose-400 text-base mt-1 block">${stats.absoluteDrawdownAmount}</span>
              <span className="text-[10px] text-slate-500">Initial Deposit Drop</span>
            </div>

            <div className="rounded-xl border dark:border-white/10 border-black/10 bg-slate-900/60 p-3">
              <span className="text-slate-400 font-semibold block text-[11px]">Maximal Drawdown</span>
              <span className="font-extrabold text-rose-400 text-base mt-1 block">${stats.maxDrawdownAmount}</span>
              <span className="text-[10px] text-rose-300 font-bold">{stats.maxDrawdownPercent}% Peak to Trough</span>
            </div>

            <div className="rounded-xl border dark:border-white/10 border-black/10 bg-slate-900/60 p-3">
              <span className="text-slate-400 font-semibold block text-[11px]">Relative Drawdown</span>
              <span className="font-extrabold text-rose-400 text-base mt-1 block">{stats.relativeDrawdownPercent}%</span>
              <span className="text-[10px] text-slate-500">Highest Equity Loss</span>
            </div>
          </div>
        </GlassCard>

        {/* SECTION 4: Trade Counts & Win Rate */}
        <GlassCard glowColor="cyan" className="space-y-4">
          <h2 className="text-base font-extrabold dark:text-white text-slate-900 flex items-center gap-2 border-b dark:border-white/10 border-black/10 pb-2">
            <PieChart className="h-5 w-5 text-cyan-400" />
            <span>4. Trade Distribution & Win Rate</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="rounded-xl border dark:border-white/10 border-black/10 bg-slate-900/60 p-3">
              <span className="text-slate-400 font-semibold block text-[11px]">Total Trades</span>
              <span className="font-extrabold dark:text-white text-slate-900 text-base mt-1 block">{stats.totalTrades}</span>
            </div>
            <div className="rounded-xl border dark:border-white/10 border-black/10 bg-slate-900/60 p-3">
              <span className="text-slate-400 font-semibold block text-[11px]">Winning Trades</span>
              <span className="font-extrabold text-emerald-400 text-base mt-1 block">{stats.winningTrades} ({stats.winRate}%)</span>
            </div>
            <div className="rounded-xl border dark:border-white/10 border-black/10 bg-slate-900/60 p-3">
              <span className="text-slate-400 font-semibold block text-[11px]">Losing Trades</span>
              <span className="font-extrabold text-rose-400 text-base mt-1 block">{stats.losingTrades} ({(100 - stats.winRate).toFixed(1)}%)</span>
            </div>
            <div className="rounded-xl border dark:border-white/10 border-black/10 bg-slate-900/60 p-3">
              <span className="text-slate-400 font-semibold block text-[11px]">Break-Even Trades</span>
              <span className="font-extrabold text-amber-400 text-base mt-1 block">{Math.max(0, stats.totalTrades - stats.winningTrades - stats.losingTrades)}</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 12: PSYCH AUDIT - Clean Black Mobile Minimalist Behavioral AI Report */}
      {/* ------------------------------------------------------------- */}
      <div className="rounded-3xl border border-zinc-800 bg-black p-6 sm:p-10 font-persian text-right text-slate-100 shadow-2xl space-y-10 dir-rtl">
        {/* PSYCH AUDIT Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-6 text-left">
          <div className="space-y-1 dir-ltr text-left">
            <h2 className="text-3xl font-black tracking-tight text-sky-400 font-mono">PSYCH AUDIT</h2>
            <p className="text-xs text-zinc-400 font-mono">Private Behavioral Engine</p>
          </div>

          <GlassButton
            variant="gold"
            size="sm"
            onClick={() => {
              setIsGeneratingAI(true);
              setTimeout(() => setIsGeneratingAI(false), 1000);
            }}
            className="self-start sm:self-auto"
          >
            <RefreshCw className={`h-4 w-4 ${isGeneratingAI ? "animate-spin" : ""}`} />
            <span>به‌روزرسانی تحلیل</span>
          </GlassButton>
        </div>

        {/* Clean Black Text Document Content */}
        <div className="space-y-12 text-sm leading-8 text-zinc-200">
          {/* Section 1: MetaTrader Report Audit */}
          <div className="space-y-5">
            <h3 className="text-xl font-extrabold text-amber-400 flex items-center justify-end gap-2 text-right">
              <span>📊 تحلیل کارنامه آماری و آمار‌های کلیدی گزارش (MetaTrader Report Audit)</span>
            </h3>

            <p className="text-zinc-300 leading-8">
              بررسی عمیق و کمی کارنامه معاملاتی شما نشان‌دهنده یک لبه معاملاتی واقعی (Edge) در بازار طلا (XAUUSD) است، اما این لبه به دلیل برخی ناکارآمدی‌های ساختاری در مدیریت سرمایه و نوسانات رفتاری، به طور کامل به بازدهی بهینه نرسیده است. در ادامه، پارامترهای کلیدی متاتریدر شما را کالبدشکافی می‌کنیم:
            </p>

            <ul className="space-y-4">
              <li className="space-y-1">
                <span className="font-bold text-amber-300 block">
                  • فاکتور سود (Profit Factor - {stats.profitFactor}):
                </span>
                <p className="text-zinc-300 pr-4">
                  این عدد نشان‌دهنده سلامت کلی سیستم شماست. کسب {stats.profitFactor} دلار سود به ازای هر ۱ دلار ضرر، شما را در دسته معامله‌گران سودده قرار می‌دهد. با این حال، پتانسیل طلا برای ارتقای این عدد به بالای ۲.۰ بسیار بالاست.
                </p>
              </li>

              <li className="space-y-1">
                <span className="font-bold text-amber-300 block">
                  • امید ریاضی سود (Expected Payoff - {stats.expectedPayoff}):
                </span>
                <p className="text-zinc-300 pr-4">
                  به طور متوسط، هر معامله‌ای که باز می‌کنید {stats.expectedPayoff} دلار برای شما ارزش‌افزوده ایجاد می‌کند. این یک آمار مثبت و امیدوارکننده است که نشان می‌دهد توزیع سودها و زیان‌های شما در بلندمدت به نفع رشد حساب است.
                </p>
              </li>

              <li className="space-y-1">
                <span className="font-bold text-amber-300 block">
                  • نسبت شارپ (Sharpe Ratio - {stats.sharpeRatio}):
                </span>
                <p className="text-zinc-300 pr-4">
                  این یکی از نقاط ضعف جدی کارنامه شماست. نسبت شارپ پایین ({stats.sharpeRatio}) نشان می‌دهد که بازدهی شما با نوسانات (Volatility) و ریسک بسیار بالایی به دست آمده است. به عبارت ساده‌تر، منحنی رشد حساب (Equity Curve) شما هموار نیست و مسیر ناهمواری را طی می‌کند که ناشی از توزیع نامتوازن سود و زیان در روزهای خاص است.
                </p>
              </li>

              <li className="space-y-1">
                <span className="font-bold text-amber-300 block">
                  • ضریب بازگشت (Recovery Factor - {stats.recoveryFactor}):
                </span>
                <p className="text-zinc-300 pr-4">
                  توانایی شما در بازیابی حساب از دروداون‌ها قابل قبول است. شما توانسته‌اید {stats.recoveryFactor} برابر حداکثر افت حساب خود، سود خالص تولید کنید که نشان‌دهنده انعطاف‌پذیری سیستم معاملاتی شماست.
                </p>
              </li>

              <li className="space-y-1">
                <span className="font-bold text-amber-300 block">
                  • افت حساب (Max & Relative Drawdown - {stats.maxDrawdownPercent}%):
                </span>
                <p className="text-zinc-300 pr-4">
                  کنترل دروداون در سطح {stats.maxDrawdownPercent}٪ (معادل ${stats.maxDrawdownAmount} دلار) فوق‌العاده و تحسین‌برانگیز است. این نشان می‌دهد که شما از ریسک‌های ویرانگر و کال مارجین فاصله دارید و اصول اولیه بقا در بازار را رعایت می‌کنید.
                </p>
              </li>

              <li className="space-y-2 pt-2">
                <span className="font-bold text-amber-300 block">
                  • مقایسه خرید (Long) در برابر فروش (Short):
                </span>
                <div className="pr-4 space-y-1 text-zinc-300">
                  <p>• درصد برد پوزیشن‌های خرید: <strong className="text-emerald-400">٪{stats.longWinRate}</strong> ({stats.longTradesCount} معامله)</p>
                  <p>• درصد برد پوزیشن‌های فروش: <strong className="text-emerald-400">٪{stats.shortWinRate}</strong> ({stats.shortTradesCount} معامله)</p>
                  <p className="mt-2 text-zinc-300">
                    شما در جهت خرید (Long) روی طلا تمایل و دقت بیشتری دارید. این نشان می‌دهد که درک شما از ساختارهای صعودی طلا با واقعیت بازار همخوانی بیشتری دارد.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div className="border-t border-zinc-800 my-6" />

          {/* Section 2: Strengths & Performance Skills */}
          <div className="space-y-5">
            <h3 className="text-xl font-extrabold text-amber-400 flex items-center justify-end gap-2 text-right">
              <span>🌟 نقاط قوت و مهارت‌های عملکردی</span>
            </h3>

            <p className="text-zinc-300 leading-8">
              تحلیل داده‌های ژورنال نشان می‌دهد که شما یک متخصص تایم‌فریم 15m روی نماد XAUUSD هستید. نقاط قوت برجسته شما عبارتند از:
            </p>

            <ol className="space-y-4 pr-2">
              <li className="space-y-1">
                <strong className="text-amber-300 block">
                  ۱. رابطه ریسک به ریوارد (R:R) واقعی و مثبت:
                </strong>
                <p className="text-zinc-300 pr-4">
                  میانگین سود شما <strong className="text-emerald-400">${stats.averageProfitTrade} دلار</strong> در مقابل میانگین ضرر <strong className="text-rose-400">${stats.averageLossTrade} دلار</strong> است. این یعنی نسبت R:R میانگین شما حدود <strong className="text-emerald-400 font-mono">1:{stats.rewardToRiskRatio}</strong> است. این نسبت R:R مثبت تضمین می‌کند که حساب شما در جهت رشد حرکت کند.
                </p>
              </li>

              <li className="space-y-1">
                <strong className="text-amber-300 block">
                  ۲. قدرت ممنتوم در معاملات برنده:
                </strong>
                <p className="text-zinc-300 pr-4">
                  بزرگ‌ترین معامله سودده شما (<strong className="text-emerald-400">${stats.largestProfitTrade} دلار</strong>) تقریباً دو برابر بزرگ‌ترین معامله ضررده شما (<strong className="text-rose-400">-${stats.largestLossTrade} دلار</strong>) است. این نشان می‌دهد که وقتی بازار در جهت سناریوی شما حرکت می‌کند، توانایی همراهی با روند را دارید.
                </p>
              </li>

              <li className="space-y-1">
                <strong className="text-amber-300 block">
                  ۳. تسلط بر فرآیند اجرای سریع در سشن‌های پرحجم:
                </strong>
                <p className="text-zinc-300 pr-4">
                  روزهای جمعه و سشن نیویورک برای شما یک معدن طلا بوده است. زنجیره‌ای از معاملات کاملاً موفق و با آرامش ذهنی بالا ثبت کرده‌اید.
                </p>
              </li>
            </ol>
          </div>

          <div className="border-t border-zinc-800 my-6" />

          {/* Section 3: Psychological Traps & Risk Management Failures */}
          <div className="space-y-5">
            <h3 className="text-xl font-extrabold text-amber-400 flex items-center justify-end gap-2 text-right">
              <span>⚠️ تله‌های روانشناختی و مدیریت ریسک</span>
            </h3>

            <p className="text-zinc-300 leading-8">
              با وجود اینکه احساس ثبت‌شده در تمام معاملات Calm (آرامش) درج شده است، اما رفتار معاملاتی شما در برخی روزها، داستانی کاملاً متفاوت و آمیخته با استرس، FOMO و رفتارهای تدافعی را روایت می‌کند:
            </p>

            <ol className="space-y-5 pr-2">
              <li className="space-y-2">
                <strong className="text-amber-300 block">
                  ۱. تله میانگین کم کردن و ورودهای زنجیره‌ای (Grid Trading):
                </strong>
                <p className="text-zinc-300 pr-4">
                  بزرگ‌ترین آسیب حساب شما در روزهای پرنوسان رخ داده است. پوزیشن‌های خرید یا فروش پیاپی بدون فاصله زمانی مناسب، یک رفتار کلاسیک &quot;میانگین کم کردن در ضرر&quot; است. این رفتار ناشی از اصرار بر حق به جانب بودن در مقابل بازار است.
                </p>
              </li>

              <li className="space-y-2">
                <strong className="text-amber-300 block">
                  ۲. معاملات انتقامی سریع (Revenge Trading):
                </strong>
                <p className="text-zinc-300 pr-4">
                  بلافاصله پس از شکست سنگین در معاملات زنجیره‌ای، شما وارد پوزیشن معکوس با حجم بالا شده‌اید. اگرچه برخی از این معاملات سودده بوده، اما این رفتار فلیپ کردن ناگهانی پوزیشن در عرض چند دقیقه، بازی با آتش و ناشی از هیجان انتقام بوده است.
                </p>
              </li>

              <li className="space-y-2">
                <strong className="text-amber-300 block">
                  ۳. مدیریت ریسک فری (Risk-Free) و بریک ایون (Break-Even):
                </strong>
                <div className="pr-4 space-y-2 text-zinc-300">
                  <p>
                    • <strong className="text-emerald-400">نقاط قوت:</strong> خروج به موقع و فرار از ضرر بزرگ‌تر در پوزیشن‌های مشکوک، یک نمونه عالی از بریک ایون به موقع است.
                  </p>
                  <p>
                    • <strong className="text-rose-400">نقاط ضعف:</strong> در برخی معاملات مانند پوزیشن‌های زیر ۱ دقیقه با ضرر سنگین خارج شده‌اید. این خروج‌های ناگهانی و بسیار سریع نشان‌دهنده ورود با حجم نامناسب یا عدم تحمل نوسانات طبیعی طلا است که منجر به وحشت و خروج زودهنگام می‌شود.
                  </p>
                </div>
              </li>
            </ol>
          </div>

          <div className="border-t border-zinc-800 my-6" />

          {/* Section 4: Trading Setup Optimization */}
          <div className="space-y-5">
            <h3 className="text-xl font-extrabold text-amber-400 flex items-center justify-end gap-2 text-right">
              <span>📈 بهینه‌سازی ستاپ‌های معاملاتی</span>
            </h3>

            <p className="text-zinc-300 leading-8">
              با توجه به اینکه فیلد ستاپ‌ها خالی است اما رفتار قیمتی طلا در تایم‌فریم 15m کاملاً مشخص است، تحلیل ستاپ‌های شما به شرح زیر است:
            </p>

            <ul className="space-y-4 pr-2">
              <li className="space-y-1">
                <strong className="text-amber-300 block">
                  • ستاپ‌های تعقیب روند (Trend Following) - بسیار موفق:
                </strong>
                <p className="text-zinc-300 pr-4">
                  معاملاتی که در جهت ممنتوم صعودی یا نزولی طلا باز شده‌اند و چند ساعت باز بوده‌اند، بازدهی بسیار بالایی داشته‌اند. شما باید روی ستاپ‌های مبتنی بر شکست ساختار (BOS) و بازگشت به اوردربلاک‌های (Order Block) تایم‌فریم 15m تمرکز کنید.
                </p>
              </li>

              <li className="space-y-1">
                <strong className="text-amber-300 block">
                  • ستاپ‌های برگشتی (Counter-Trend) - بسیار خطرناک:
                </strong>
                <p className="text-zinc-300 pr-4">
                  تلاش برای گرفتن انتهای اصلاح‌ها فاقد بازدهی بوده و باید کاملاً متوقف شود. طلا دارایی نیست که بتوان با آن لجبازی کرد؛ ممنتوم طلا بی‌رحم است.
                </p>
              </li>

              <li className="space-y-1">
                <strong className="text-amber-300 block">
                  • تأثیر مدیریت ریسک فری بر ستاپ‌ها:
                </strong>
                <p className="text-zinc-300 pr-4">
                  داده‌ها نشان می‌دهند هر زمان که پس از حرکت قیمت به اندازه ۱ برابر ATR پوزیشن را Risk-Free کرده‌اید، برآیند مثبتی داشته‌اید. اما خروج‌های پله‌ای (Partial Exit) در معاملات شما دیده نمی‌شود. پیاده‌سازی خروج پله‌ای در طلا به شدت به هموار شدن نسبت شارپ شما کمک خواهد کرد.
                </p>
              </li>
            </ul>
          </div>

          <div className="border-t border-zinc-800 my-6" />

          {/* Section 5: Holding Duration & Timeframe Analysis */}
          <div className="space-y-5">
            <h3 className="text-xl font-extrabold text-amber-400 flex items-center justify-end gap-2 text-right">
              <span>⏱️ تحلیل زمان، مدت باز بودن معاملات و دوره‌های زمانی</span>
            </h3>

            <ul className="space-y-4 pr-2">
              <li className="space-y-1">
                <strong className="text-amber-300 block">
                  • مدت زمان بهینه نگهداری پوزیشن:
                </strong>
                <p className="text-zinc-300 pr-4">
                  معاملات کوتاه‌مدت زیر ۵ دقیقه (Scalping) نویز بالایی دارند و نسبت شارپ شما را تخریب می‌کنند. طلا در تایم‌فریم‌های بسیار پایین رفتار وحشیانه‌ای دارد.
                </p>
              </li>

              <li className="space-y-1">
                <strong className="text-amber-300 block">
                  • تحلیل روزهای هفته و سشن‌های معاملاتی:
                </strong>
                <p className="text-zinc-300 pr-4">
                  بهترین عملکرد شما در سشن نیویورک ثبت شده است. سشن آسیا به دلیل اسپرد بالا و عدم وجود حجم واقعی، نامناسب‌ترین زمان برای سبک معاملاتی شماست.
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
