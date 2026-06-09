/** Local calendar date as YYYY-MM-DD (timezone-safe for daily features). */
export function getLocalDateString(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function getYesterdayDateString(date = new Date()): string {
  return addDaysToDateString(getLocalDateString(date), -1);
}

/** Shift a YYYY-MM-DD string by `delta` calendar days. */
export function addDaysToDateString(dateStr: string, delta: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + delta);
  return getLocalDateString(d);
}

/** Whole calendar days from `earlier` to `later` (later − earlier). */
export function daysBetweenDates(earlier: string, later: string): number {
  const a = new Date(earlier + "T00:00:00");
  const b = new Date(later + "T00:00:00");
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}
