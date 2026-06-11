import { format } from 'date-fns';

export function parseFormBoolean(value: unknown): boolean {
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false' || value === '' || value == null) return false;
  return Boolean(value);
}

const DAY_TO_ABBREV: Record<string, string> = {
  Sunday: 'Sun',
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
};

export function convertDaysListToEnglish(days: string[]): string[] {
  return days.map((day) => DAY_TO_ABBREV[day] ?? day);
}

export function normalizeGender(gender: string): string {
  const trimmed = gender.trim();
  if (!trimmed) return '';
  const lower = trimmed.toLowerCase();
  if (lower === 'boys' || lower === 'boy') return 'Boys';
  if (lower === 'girls' || lower === 'girl') return 'Girls';
  if (lower === 'mixed' || lower === 'mix') return 'Mixed';
  if (lower === 'any') return 'Any';
  return trimmed;
}

export function formatTimeForApi(value: Date | null): string {
  if (!value) return '';
  return format(value, 'h:mm a');
}

export function formatDateForApi(value: Date | null): string {
  if (!value) return '';
  return value.toISOString();
}

export function formatRecurringDate(value: Date | null): string {
  if (!value) return '';
  return format(value, 'yyyy-MM-dd');
}

export function usesWeekDays(
  isRecurring: boolean,
  recurringDays: string[],
  recurringDates: Date[]
): boolean {
  if (!isRecurring) return false;
  if (recurringDays.length > 0) return true;
  if (recurringDates.length > 0) return false;
  return isRecurring;
}

type CleanFormDataOptions = {
  jsonArrayKeys?: string[];
  skipJsonKeys?: string[];
};

export function cleanFormData(
  data: Record<string, unknown>,
  options: CleanFormDataOptions = {}
): Record<string, unknown> {
  const jsonArrayKeys = new Set(options.jsonArrayKeys ?? []);
  const skipJsonKeys = new Set(options.skipJsonKeys ?? ['daysOffList', 'datesOffList']);
  const cleaned: Record<string, unknown> = {};

  const sanitize = (value: unknown, key?: string): unknown => {
    if (value == null) return null;
    if (value instanceof Date) return value.toISOString();
    if (Array.isArray(value)) return value.map((item) => sanitize(item, key));
    if (typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, sanitize(v, k)])
      );
    }
    if (key === 'price' || key === 'discount_amount') {
      if (typeof value === 'number') return String(value);
    }
    return value;
  };

  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'string' && value.trim() === '') {
      cleaned[key] = null;
      return;
    }

    const sanitizedValue = sanitize(value, key);

    if (skipJsonKeys.has(key)) {
      cleaned[key] = sanitizedValue;
      return;
    }

    if (jsonArrayKeys.has(key)) {
      cleaned[key] =
        typeof sanitizedValue === 'string' ? sanitizedValue : JSON.stringify(sanitizedValue);
      return;
    }

    if (Array.isArray(sanitizedValue) || (sanitizedValue && typeof sanitizedValue === 'object')) {
      cleaned[key] = JSON.stringify(sanitizedValue);
    } else {
      cleaned[key] = sanitizedValue;
    }
  });

  return cleaned;
}

export function appendFormDataFields(formData: FormData, data: Record<string, unknown>) {
  Object.entries(data).forEach(([key, value]) => {
    if (value == null) return;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item instanceof Date) {
          formData.append(key, item.toISOString());
        } else {
          formData.append(key, String(item));
        }
      });
      return;
    }

    formData.append(key, String(value));
  });
}
