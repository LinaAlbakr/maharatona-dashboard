import { format } from 'date-fns';

export type DateWeekGroup = {
  key: string;
  weekNumber: number;
  month: number;
  year: number;
  dates: Date[];
};

export function getWeekOfMonth(date: Date): number {
  return Math.ceil(date.getDate() / 7);
}

export function groupDatesByWeekAndMonth(dates: Date[]): DateWeekGroup[] {
  const groups = new Map<string, DateWeekGroup>();

  dates.forEach((date) => {
    const weekNumber = getWeekOfMonth(date);
    const month = date.getMonth();
    const year = date.getFullYear();
    const key = `${year}-${month}-${weekNumber}`;

    if (!groups.has(key)) {
      groups.set(key, { key, weekNumber, month, year, dates: [] });
    }
    groups.get(key)!.dates.push(new Date(date));
  });

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      dates: group.dates.sort((a, b) => a.getTime() - b.getTime()),
    }))
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      if (a.month !== b.month) return a.month - b.month;
      return a.weekNumber - b.weekNumber;
    });
}

export function mergeUniqueDates(existing: Date[], added: Date[]): Date[] {
  const merged = [...existing];

  added.forEach((date) => {
    if (!merged.some((item) => item.toDateString() === date.toDateString())) {
      merged.push(new Date(date));
    }
  });

  return merged.sort((a, b) => a.getTime() - b.getTime());
}

export function removeDateGroup(allDates: Date[], group: DateWeekGroup): Date[] {
  const groupSet = new Set(group.dates.map((date) => date.toDateString()));
  return allDates.filter((date) => !groupSet.has(date.toDateString()));
}

export function formatDateWeekGroupText(group: DateWeekGroup, weekLabel: string): string {
  const dayNumbers = group.dates.map((date) => format(date, 'dd')).join(', ');
  const monthYear = format(group.dates[0], 'MMMM, yyyy');
  return `${weekLabel}: ${dayNumbers} ${monthYear}`;
}

export function formatGroupedDatesText(dates: Date[], weekLabelFor: (weekNumber: number) => string): string {
  if (!dates.length) return '';

  return groupDatesByWeekAndMonth(dates)
    .map((group) => formatDateWeekGroupText(group, weekLabelFor(group.weekNumber)))
    .join(' | ');
}
