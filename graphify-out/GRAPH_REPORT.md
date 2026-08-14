# Graph Report - .  (2026-08-12)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 287 nodes · 612 edges · 19 communities (16 shown, 3 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `739568bb`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 15
- Community 16

## God Nodes (most connected - your core abstractions)
1. `Trade` - 21 edges
2. `getActiveAccountId()` - 21 edges
3. `compilerOptions` - 16 edges
4. `GlassBadge()` - 15 edges
5. `loadTrades()` - 15 edges
6. `GlassButton()` - 14 edges
7. `GlassCard()` - 13 edges
8. `loadJournals()` - 11 edges
9. `cn()` - 11 edges
10. `loadSettings()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `InteractiveChartProps` --references--> `Trade`  [EXTRACTED]
  src/components/analytics/InteractiveEquityDrawdownChart.tsx → src/types/trade.ts
- `HeaderCalendarProps` --references--> `Trade`  [EXTRACTED]
  src/components/journal/HeaderCalendar.tsx → src/types/trade.ts
- `TradeDetailModalProps` --references--> `Trade`  [EXTRACTED]
  src/components/journal/TradeDetailModal.tsx → src/types/trade.ts
- `AnalyticsPage()` --calls--> `getActiveAccountId()`  [EXTRACTED]
  src/app/analytics/page.tsx → src/lib/storage/store.ts
- `AnalyticsPage()` --calls--> `loadAccounts()`  [EXTRACTED]
  src/app/analytics/page.tsx → src/lib/storage/store.ts

## Import Cycles
- None detected.

## Communities (19 total, 3 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.16
Nodes (27): AnalyticsPage(), JournalPage(), DashboardPage(), INITIAL_SENTIMENT_DATA, PairSentimentData, SettingsPage(), InteractiveChartProps, InteractiveEquityDrawdownChart() (+19 more)

### Community 1 - "Community 1"
Cohesion: 0.09
Nodes (29): buildColumnMap(), cleanRawContent(), date_utils_1, isolatePositionsSection(), normHeader(), parseRowByHeaderMap(), parseRowSemanticAnchors(), parseSmartNumber() (+21 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (29): class-variance-authority, clsx, framer-motion, @hookform/resolvers, jalaali-js, lucide-react, next, dependencies (+21 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (26): dom, dom.iterable, esnext, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.tsx, compilerOptions (+18 more)

### Community 4 - "Community 4"
Cohesion: 0.08
Nodes (25): autoprefixer, @cloudflare/next-on-pages, devDependencies, autoprefixer, @cloudflare/next-on-pages, postcss, tailwindcss, @types/node (+17 more)

### Community 5 - "Community 5"
Cohesion: 0.18
Nodes (14): metadata, ClientLayoutWrapper(), LayoutInner(), Header(), NAV_ITEMS, Sidebar(), SidebarContext, SidebarContextType (+6 more)

### Community 6 - "Community 6"
Cohesion: 0.21
Nodes (16): convertToTehranDateTime(), EconomicCalendarPage(), getOfficialForexFactoryEvents(), generateNewsAnalysisPrompt(), generateTradeAnalysisPrompt(), analyzeNewsWithAI(), analyzeTradeWithAI(), generateFallbackPersianAnalysis() (+8 more)

### Community 7 - "Community 7"
Cohesion: 0.30
Nodes (13): ImportPage(), parseCSVReport(), getVisibleCells(), parseMT4Report(), getVisibleCells(), parseMT5Report(), parseUniversalReport(), getActiveAccountId() (+5 more)

### Community 8 - "Community 8"
Cohesion: 0.23
Nodes (13): AccountSwitcher(), AccountSwitcherProps, DEFAULT_ACCOUNTS, DEFAULT_SETTINGS, deleteAccount(), INITIAL_DEMO_JOURNALS, INITIAL_DEMO_TRADES, INITIAL_ECONOMIC_EVENTS (+5 more)

### Community 9 - "Community 9"
Cohesion: 0.27
Nodes (10): buildColumnMap(), cleanRawContent(), ColumnMap, isolatePositionsSection(), normHeader(), parseRowByHeaderMap(), parseRowSemanticAnchors(), parseSmartNumber() (+2 more)

### Community 10 - "Community 10"
Cohesion: 0.18
Nodes (10): compilerOptions, esModuleInterop, module, moduleResolution, outDir, skipLibCheck, strict, target (+2 more)

### Community 11 - "Community 11"
Cohesion: 0.36
Nodes (9): buildColumnMap(), cleanRawContent(), ColumnMap, isolatePositionsSection(), normHeader(), parseRowByHeaderMap(), parseRowSemanticAnchors(), parseSmartNumber() (+1 more)

### Community 12 - "Community 12"
Cohesion: 0.22
Nodes (8): background_color, description, display, icons, name, short_name, start_url, theme_color

## Knowledge Gaps
- **107 isolated node(s):** `PairSentimentData`, `AddTradeModalProps`, `GlassBadgeProps`, `GlassButtonProps`, `GlassCardProps` (+102 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Community 2` to `Community 4`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Why does `Trade` connect `Community 0` to `Community 8`, `Community 11`, `Community 6`, `Community 7`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `PairSentimentData`, `AddTradeModalProps`, `GlassBadgeProps` to the rest of the system?**
  _107 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.0873440285204991 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._