export function parseMetaTraderDate(dStr?: string, fallbackIndex = 0): Date {
  if (!dStr || typeof dStr !== "string") {
    return new Date(Date.now() - fallbackIndex * 1800000);
  }

  const cleaned = dStr.trim();
  if (!cleaned) return new Date(Date.now() - fallbackIndex * 1800000);

  // 1. Try ISO hyphenated format (YYYY-MM-DD HH:MM:SS or YYYY.MM.DD HH:MM:SS -> YYYY-MM-DDTHH:MM:SS)
  const normalizedIso = cleaned.replace(/\./g, "-").replace(" ", "T");
  const dIso = new Date(normalizedIso);
  if (!isNaN(dIso.getTime())) return dIso;

  // 2. Try slash format without T (YYYY/MM/DD HH:MM:SS)
  const normalizedSlash = cleaned.replace(/\./g, "/");
  const dSlash = new Date(normalizedSlash);
  if (!isNaN(dSlash.getTime())) return dSlash;

  // 3. Try European format DD.MM.YYYY HH:MM:SS
  const euroMatch = cleaned.match(/^(\d{2})[.\/-](\d{2})[.\/-](\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  if (euroMatch) {
    const [, day, month, year, hh = "00", mm = "00", ss = "00"] = euroMatch;
    const dEuro = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hh), parseInt(mm), parseInt(ss));
    if (!isNaN(dEuro.getTime())) return dEuro;
  }

  return new Date(Date.now() - fallbackIndex * 1800000);
}

export function parseCloseTime(rawTime?: string): number {
  return parseMetaTraderDate(rawTime).getTime();
}

export function formatTradeDateTime(rawTime?: string): string {
  const ts = parseCloseTime(rawTime);
  if (ts === 0) return rawTime || "N/A";
  const d = new Date(ts);
  return d.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
