import type { Note } from "@/types/note";

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** "just now", "5 minutes ago", "yesterday", or a short date for older notes. */
export function formatRelativeTime(isoDate: string, now: number = Date.now()): string {
  const time = new Date(isoDate).getTime();
  if (Number.isNaN(time)) return "";

  // Clamp to <= 0 so a slightly-fast server clock never shows "in 2 minutes".
  const diffSeconds = Math.min(Math.round((time - now) / 1000), 0);
  const elapsed = Math.abs(diffSeconds);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (elapsed < 45) return "just now";
  if (elapsed < HOUR) return formatter.format(Math.round(diffSeconds / MINUTE), "minute");
  if (elapsed < DAY) return formatter.format(Math.round(diffSeconds / HOUR), "hour");
  if (elapsed < 7 * DAY) return formatter.format(Math.round(diffSeconds / DAY), "day");

  const sameYear = new Date(time).getFullYear() === new Date(now).getFullYear();
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  }).format(time);
}

/** "Nov 2, 2026, 3:10 PM" (used for tooltips and the note page). */
export function formatFullDate(isoDate: string): string {
  const time = new Date(isoDate).getTime();
  if (Number.isNaN(time)) return "";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(time);
}

/** True when the note was modified after it was created (ignores sub-second DB differences). */
export function wasEdited(note: Pick<Note, "createdAt" | "updatedAt">): boolean {
  return new Date(note.updatedAt).getTime() - new Date(note.createdAt).getTime() > 1000;
}
