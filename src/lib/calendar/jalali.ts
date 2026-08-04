import { toJalaali as convertToJalaali } from "jalaali-js";

export function toJalali(dateInput: Date | string): { year: number; month: number; day: number; formatted: string } {
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) {
    return { year: 1403, month: 1, day: 1, formatted: "1403/01/01" };
  }

  const gYear = d.getFullYear();
  const gMonth = d.getMonth() + 1;
  const gDay = d.getDate();

  const j = convertToJalaali(gYear, gMonth, gDay);

  const monthNamesFa = [
    "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
    "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
  ];

  const monthName = monthNamesFa[j.jm - 1] || "";
  const formatted = `${j.jy}/${String(j.jm).padStart(2, "0")}/${String(j.jd).padStart(2, "0")}`;
  const formattedVerbose = `${j.jd} ${monthName} ${j.jy}`;

  return {
    year: j.jy,
    month: j.jm,
    day: j.jd,
    formatted,
  };
}

export function formatDualDate(dateInput: Date | string, mode: "Gregorian" | "Jalali" | "Both" = "Both"): string {
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return "";

  const gregStr = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const jalali = toJalali(d);

  if (mode === "Gregorian") return gregStr;
  if (mode === "Jalali") return `${jalali.formatted} (شمسی)`;
  return `${gregStr} • ${jalali.formatted}`;
}
