import { DayOfWeek, ALL_DAYS_OF_WEEK, SHORT_DAY_NAMES } from '../types';

/**
 * Converts a JavaScript Date to local epoch day (days since Jan 1 1970).
 */
export function dateToEpochDay(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const utcDate = Date.UTC(year, month, day);
  return Math.floor(utcDate / 86400000);
}

/**
 * Converts epoch day back to a local Date object.
 */
export function epochDayToDate(epochDay: number): Date {
  const utcMs = epochDay * 86400000;
  const d = new Date(utcMs);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/**
 * Gets today's epoch day in local time.
 */
export function getTodayEpochDay(): number {
  return dateToEpochDay(new Date());
}

/**
 * Converts epoch day to DayOfWeek ('MONDAY'..'SUNDAY').
 * Day 0 (1970-01-01) was a Thursday.
 */
export function epochDayToDayOfWeek(epochDay: number): DayOfWeek {
  // ((epochDay + 3) % 7) where Thursday is index 3
  const jsDay = epochDayToDate(epochDay).getDay(); // 0 is Sun, 1 is Mon, etc.
  const map: Record<number, DayOfWeek> = {
    0: 'SUNDAY',
    1: 'MONDAY',
    2: 'TUESDAY',
    3: 'WEDNESDAY',
    4: 'THURSDAY',
    5: 'FRIDAY',
    6: 'SATURDAY',
  };
  return map[jsDay];
}

export function getIsoDayNumber(day: DayOfWeek): number {
  switch (day) {
    case 'MONDAY':
      return 1;
    case 'TUESDAY':
      return 2;
    case 'WEDNESDAY':
      return 3;
    case 'THURSDAY':
      return 4;
    case 'FRIDAY':
      return 5;
    case 'SATURDAY':
      return 6;
    case 'SUNDAY':
      return 7;
  }
}

/**
 * Checks if two dates are consecutive eligible days.
 * Mirroring Grit's areConsecutiveEligibleDays.
 */
function areConsecutiveEligibleDays(
  day1: number,
  day2: number,
  eligibleWeekdays: Set<DayOfWeek>
): boolean {
  let check = day1 + 1;
  while (check < day2) {
    if (eligibleWeekdays.has(epochDayToDayOfWeek(check))) {
      return false;
    }
    check++;
  }
  return check === day2;
}

/**
 * Calculates current streak matching Grit logic:
 * - If user missed an eligible day between last completion and today, streak is 0.
 * - Otherwise, counts consecutive eligible completed days backwards.
 */
export function countCurrentStreak(
  dates: number[],
  eligibleWeekdaysList: DayOfWeek[] = ALL_DAYS_OF_WEEK
): number {
  if (!dates || dates.length === 0) return 0;

  const eligibleWeekdays = new Set(eligibleWeekdaysList);
  const today = getTodayEpochDay();
  const filtered = Array.from(new Set(dates))
    .filter((d) => eligibleWeekdays.has(epochDayToDayOfWeek(d)))
    .sort((a, b) => a - b);

  if (filtered.length === 0) return 0;

  const lastDate = filtered[filtered.length - 1];
  const daysBetween = today - lastDate;

  if (daysBetween > 0) {
    let hasEligibleDayMissed = false;
    for (let i = 1; i <= daysBetween; i++) {
      const checkDate = lastDate + i;
      if (eligibleWeekdays.has(epochDayToDayOfWeek(checkDate)) && checkDate < today) {
        hasEligibleDayMissed = true;
        break;
      }
    }
    if (hasEligibleDayMissed) return 0;
  }

  let streak = 1;
  for (let i = filtered.length - 2; i >= 0; i--) {
    const current = filtered[i];
    const next = filtered[i + 1];
    if (areConsecutiveEligibleDays(current, next, eligibleWeekdays)) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calculates best streak matching Grit logic.
 */
export function countBestStreak(
  dates: number[],
  eligibleWeekdaysList: DayOfWeek[] = ALL_DAYS_OF_WEEK
): number {
  if (!dates || dates.length === 0) return 0;

  const eligibleWeekdays = new Set(eligibleWeekdaysList);
  const filtered = Array.from(new Set(dates))
    .filter((d) => eligibleWeekdays.has(epochDayToDayOfWeek(d)))
    .sort((a, b) => a - b);

  if (filtered.length === 0) return 0;

  let maxConsecutive = 1;
  let currentConsecutive = 1;

  for (let i = 1; i < filtered.length; i++) {
    const prev = filtered[i - 1];
    const curr = filtered[i];

    if (areConsecutiveEligibleDays(prev, curr, eligibleWeekdays)) {
      currentConsecutive++;
    } else {
      maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
      currentConsecutive = 1;
    }
  }

  return Math.max(maxConsecutive, currentConsecutive);
}

/**
 * Calculates consistency percentage (0.0 to 1.0)
 * (Total completed eligible days) / (Total eligible days since first completion until today)
 */
export function calculateConsistency(
  dates: number[],
  eligibleWeekdaysList: DayOfWeek[]
): number {
  const eligibleWeekdays = new Set(eligibleWeekdaysList);
  const eligibleDates = dates.filter((d) => eligibleWeekdays.has(epochDayToDayOfWeek(d)));
  if (eligibleDates.length === 0) return 0;

  const minDate = Math.min(...eligibleDates);
  const today = getTodayEpochDay();

  let totalEligibleDays = 0;
  for (let current = minDate; current <= today; current++) {
    if (eligibleWeekdays.has(epochDayToDayOfWeek(current))) {
      totalEligibleDays++;
    }
  }

  return totalEligibleDays > 0 ? eligibleDates.length / totalEligibleDays : 0;
}

/**
 * Prepares 52-week completion data for weekly comparison chart.
 */
export function prepareLineChartData(
  firstDay: DayOfWeek,
  habitStatuses: { date: number }[]
): number[] {
  const today = getTodayEpochDay();
  const totalWeeks = 52;
  const todayDow = epochDayToDayOfWeek(today);

  const todayIso = getIsoDayNumber(todayDow);
  const firstDayIso = getIsoDayNumber(firstDay);

  const daysIntoCurrentWeek = (todayIso - firstDayIso + 7) % 7;
  const startDateOfTodayWeek = today - daysIntoCurrentWeek;
  const startDateOfPeriod = startDateOfTodayWeek - totalWeeks * 7;

  const completionsByWeekStart = new Map<number, number>();

  habitStatuses.forEach((status) => {
    if (status.date >= startDateOfPeriod && status.date <= today) {
      const statusDow = epochDayToDayOfWeek(status.date);
      const statusIso = getIsoDayNumber(statusDow);
      const diff = (statusIso - firstDayIso + 7) % 7;
      const weekStart = status.date - diff;
      completionsByWeekStart.set(weekStart, (completionsByWeekStart.get(weekStart) || 0) + 1);
    }
  });

  const values: number[] = [];
  for (let i = 0; i <= totalWeeks; i++) {
    const weekStart = startDateOfPeriod + i * 7;
    const count = completionsByWeekStart.get(weekStart) || 0;
    values.push(Math.min(count, 7));
  }

  return values;
}

/**
 * Prepares weekday frequency map (Mon..Sun).
 */
export function prepareWeekDayFrequencyData(dates: number[]): Record<string, number> {
  const counts: Record<DayOfWeek, number> = {
    MONDAY: 0,
    TUESDAY: 0,
    WEDNESDAY: 0,
    THURSDAY: 0,
    FRIDAY: 0,
    SATURDAY: 0,
    SUNDAY: 0,
  };

  dates.forEach((d) => {
    const dow = epochDayToDayOfWeek(d);
    counts[dow] = (counts[dow] || 0) + 1;
  });

  const result: Record<string, number> = {};
  ALL_DAYS_OF_WEEK.forEach((dow) => {
    result[SHORT_DAY_NAMES[dow]] = counts[dow];
  });

  return result;
}

/**
 * Prepares heat map data map: epochDay -> count
 */
export function prepareHeatMapData(habitStatuses: { date: number }[]): Record<number, number> {
  const result: Record<number, number> = {};
  habitStatuses.forEach((st) => {
    result[st.date] = (result[st.date] || 0) + 1;
  });
  return result;
}
