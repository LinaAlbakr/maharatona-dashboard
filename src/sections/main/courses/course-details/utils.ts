import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

import { convertTime24to12 } from 'src/utils/format-time';

export const getDiscountedAmount = (
  basePrice: number | string | null | undefined,
  course: any
): number | null => {
  const price = Number(basePrice ?? 0);
  const discountAmount = Number(course?.discount_amount ?? 0);
  const discountType = String(course?.discount_type ?? '').toLowerCase();

  if (!Number.isFinite(price) || price <= 0) return null;
  if (!Number.isFinite(discountAmount) || discountAmount <= 0) return null;
  if (discountType !== 'total') return null;

  const discounted = price - (price * discountAmount) / 100;
  if (!Number.isFinite(discounted)) return null;

  return Math.max(0, Math.round(discounted * 100) / 100);
};

export const getDiscountedPrice = (course: any): number | null =>
  getDiscountedAmount(course?.price, course);

export const formatPriceDisplay = (amount: number | string | null | undefined): string => {
  const value = Number(amount);
  if (!Number.isFinite(value)) return '-';
  if (Number.isInteger(value) || value % 1 === 0) {
    return String(Math.round(value));
  }
  return String(Math.round(value * 10) / 10);
};

const toValidProgramDate = (date: string | Date | null | undefined): Date | null => {
  if (date == null || date === '') return null;
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const formatProgramDate = (date: string | Date | null | undefined) => {
  const parsed = toValidProgramDate(date);
  if (!parsed) return '-';

  // Keep day-month-year order in Arabic RTL layouts (e.g. "13 Jun 2026").
  const formatted = format(parsed, 'd MMM yyyy', { locale: enUS });
  return `\u200E${formatted}`;
};

export const formatProgramDateRange = (dates: (string | Date | null | undefined)[]) => {
  const parsed = dates
    .map((date) => toValidProgramDate(date))
    .filter((date): date is Date => date !== null)
    .sort((a, b) => a.getTime() - b.getTime());

  if (!parsed.length) return '-';

  const pattern = (date: Date, sameYear: boolean) =>
    format(date, sameYear ? 'd MMM' : 'd MMM yyyy', { locale: enUS });

  if (parsed.length === 1) {
    return `\u200E${pattern(parsed[0], true)}`;
  }

  const start = parsed[0];
  const end = parsed[parsed.length - 1];
  const sameYear = start.getFullYear() === end.getFullYear();

  return `\u200E${pattern(start, sameYear)} – ${pattern(end, sameYear)}`;
};

export const formatProgramTime = (value: string | undefined) => {
  if (!value) return '-';
  return /am|pm/i.test(value) ? value : convertTime24to12(value);
};

export const formatAgeYears = (age: number | string | null | undefined, yearsLabel: string) => {
  if (age === null || age === undefined || age === '') return '-';
  return `${age} ${yearsLabel}`;
};

export const resolveCourseImageUrl = (image: unknown) => {
  if (!image) return '';
  if (typeof image === 'string') return image.trim();
  if (typeof image === 'object' && image !== null) {
    const record = image as { url?: string; path?: string };
    return String(record.url ?? record.path ?? '').trim();
  }
  return '';
};

export const getCourseImageUrl = resolveCourseImageUrl;

export const getCourseImageUrls = (images: unknown): string[] =>
  (Array.isArray(images) ? images : [])
    .map((image) => resolveCourseImageUrl(image))
    .filter((url): url is string => url.length > 0);

export const isFixedCourse = (course: any) =>
  !course?.course_type || String(course.course_type).toLowerCase() === 'fixed';

export const getLocalizedText = (
  isArabic: boolean,
  ar?: string | null,
  en?: string | null,
  fallback = '-'
) => {
  const value = isArabic ? ar || en : en || ar;
  return value?.trim() || fallback;
};

export type SessionAgeDisplay =
  | { mode: 'single'; ageFrom?: number | string; ageTo?: number | string }
  | {
      mode: 'split';
      boysFrom?: number | string;
      boysTo?: number | string;
      girlsFrom?: number | string;
      girlsTo?: number | string;
    };

export const getSessionAgeDisplay = (course: any): SessionAgeDisplay => {
  const gender = course?.gender;
  const isMixed = gender === 'Mixed';
  const sameAgeRange = course?.same_age_range !== false;

  if (isMixed && !sameAgeRange) {
    return {
      mode: 'split',
      boysFrom: course?.boys_age_from,
      boysTo: course?.boys_age_to,
      girlsFrom: course?.girls_age_from,
      girlsTo: course?.girls_age_to,
    };
  }

  return {
    mode: 'single',
    ageFrom: course?.age_from ?? course?.boys_age_from ?? course?.girls_age_from,
    ageTo: course?.age_to ?? course?.boys_age_to ?? course?.girls_age_to,
  };
};
