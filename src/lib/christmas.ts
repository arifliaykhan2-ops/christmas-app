export type ChristmasMode = 'dec25' | 'jan7';

const MONTH_DAY: Record<ChristmasMode, [number, number]> = { dec25: [11, 25], jan7: [0, 7] };

export type CountdownState =
  | { isToday: true; target: Date }
  | { isToday: false; target: Date; days: number; hours: number; minutes: number; seconds: number };

/** Time left until the next Christmas Day (local midnight), or "today". */
export function countdown(now: Date, mode: ChristmasMode): CountdownState {
  const [month, day] = MONTH_DAY[mode];
  const year = now.getFullYear();
  const thisYear = new Date(year, month, day);
  const dayAfter = new Date(year, month, day + 1);

  if (now >= thisYear && now < dayAfter) return { isToday: true, target: thisYear };

  const target = now < thisYear ? thisYear : new Date(year + 1, month, day);
  let ms = Math.max(0, target.getTime() - now.getTime());
  const days = Math.floor(ms / 86_400_000);
  ms -= days * 86_400_000;
  const hours = Math.floor(ms / 3_600_000);
  ms -= hours * 3_600_000;
  const minutes = Math.floor(ms / 60_000);
  const seconds = Math.floor((ms - minutes * 60_000) / 1000);
  return { isToday: false, target, days, hours, minutes, seconds };
}

/** December the advent calendar belongs to: this December, or last one in Jan–Jun. */
export function adventYear(now: Date): number {
  return now.getMonth() < 6 ? now.getFullYear() - 1 : now.getFullYear();
}

export function doorDate(now: Date, day: number): Date {
  return new Date(adventYear(now), 11, day);
}

export function isDoorOpen(now: Date, day: number): boolean {
  return now >= doorDate(now, day);
}

/** Today's door number (1–24) during advent, otherwise null. */
export function todaysDoor(now: Date): number | null {
  if (now.getMonth() !== 11) return null;
  const d = now.getDate();
  return d >= 1 && d <= 24 ? d : null;
}
