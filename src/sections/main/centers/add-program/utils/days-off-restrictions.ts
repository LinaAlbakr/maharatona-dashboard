import { isSameDay } from 'date-fns';

import type { ProgramFormValues } from '../types';

const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

const ABBREV_TO_DAY: Record<string, (typeof WEEKDAY_NAMES)[number]> = {
  Sun: 'Sunday',
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
};

export type DaysOffRestrictions = {
  disabledWeekdays: string[];
  disabledDates: Date[];
};

function normalizeWeekday(day: string): string {
  const trimmed = day.trim();
  if ((WEEKDAY_NAMES as readonly string[]).includes(trimmed)) return trimmed;

  const abbrev = Object.entries(ABBREV_TO_DAY).find(
    ([key]) => key.toLowerCase() === trimmed.toLowerCase()
  );
  if (abbrev) return abbrev[1];

  const match = WEEKDAY_NAMES.find((name) => name.toLowerCase() === trimmed.toLowerCase());
  return match ?? trimmed;
}

export function getDaysOffRestrictions(
  values: Pick<
    ProgramFormValues,
    'daysOffRecurring' | 'daysOffCustom' | 'daysOffList' | 'datesOffList'
  >
): DaysOffRestrictions {
  const disabledWeekdays = values.daysOffRecurring
    ? values.daysOffList.map(normalizeWeekday).filter(Boolean)
    : [];

  const disabledDates = values.daysOffCustom
    ? (values.datesOffList || []).filter((date): date is Date => date instanceof Date)
    : [];

  return { disabledWeekdays, disabledDates };
}

export function isWeekdayDisabledByDaysOff(weekday: string, restrictions: DaysOffRestrictions): boolean {
  const normalized = normalizeWeekday(weekday);
  return restrictions.disabledWeekdays.includes(normalized);
}

export function isDateDisabledByDaysOff(date: Date, restrictions: DaysOffRestrictions): boolean {
  const weekdayName = WEEKDAY_NAMES[date.getDay()];
  if (restrictions.disabledWeekdays.includes(weekdayName)) return true;

  return restrictions.disabledDates.some((disabledDate) => isSameDay(disabledDate, date));
}
