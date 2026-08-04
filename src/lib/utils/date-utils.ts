export function parseCloseTime(rawTime?: string): number {
  if (!rawTime || typeof rawTime !== "string") return 0;
  const cleaned = rawTime.trim();
  if (!cleaned) return 0;

  // 1. Check European DD.MM.YYYY HH:MM:SS format (e.g. 04.08.2024 15:30)
  const euroMatch = cleaned.match(/^(\d{2})[.\/-](\d{2})[.\/-](\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  if (euroMatch) {
    const [, day, month, year, hh = "00", mm = "00", ss = "00"] = euroMatch;
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hh), parseInt(mm), parseInt(ss));
    return isNaN(d.getTime()) ? 0 : d.getTime();
  }

  // 2. Standard ISO / YYYY.MM.DD HH:MM:SS (e.g. 2024.08.04 15:30:12 or 2024-08-04T15:30:12)
  const isoFormatted = cleaned.replace(/\./g, "-").replace(" ", "T");
  const d = new Date(isoFormatted);
  if (!isNaN(d.getTime())) return d.getTime();

  // 3. Fallback direct Date parse
  const fallback = new Date(cleaned);
  return isNaN(fallback.getTime()) ? 0 : fallback.getTime();
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
