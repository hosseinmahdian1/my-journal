// Mimics the parseCloseTime helper from src/lib/utils/date-utils.ts
// for use in a Node-side smoke test. Accepts both YYYY.MM.DD HH:MM:SS and
// European-style dates, returns ms timestamp or 0.
function parseCloseTime(raw) {
  if (!raw || typeof raw !== "string") return 0;
  const s = raw.trim();
  // YYYY.MM.DD HH:MM[:SS]
  let m = s.match(/(\d{4})[.\/-](\d{1,2})[.\/-](\d{1,2})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (m) {
    const [, y, mo, d, h, mi, se = "0"] = m;
    const ts = Date.UTC(+y, +mo - 1, +d, +h, +mi, +se);
    if (Number.isFinite(ts)) return ts;
  }
  m = s.match(/(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (m) {
    const [, d, mo, y, h, mi, se = "0"] = m;
    const ts = Date.UTC(+y, +mo - 1, +d, +h, +mi, +se);
    if (Number.isFinite(ts)) return ts;
  }
  return 0;
}
module.exports = { parseCloseTime };
