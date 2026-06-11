import { convertTime24to12, fDate } from 'src/utils/format-time';

export const getDiscountedPrice = (course: any): number | null => {
  const basePrice = Number(course?.price ?? 0);
  const discountAmount = Number(course?.discount_amount ?? 0);
  const discountType = String(course?.discount_type ?? '').toLowerCase();

  if (!Number.isFinite(basePrice) || basePrice <= 0) return null;
  if (!Number.isFinite(discountAmount) || discountAmount <= 0) return null;
  if (discountType !== 'total') return null;

  const discounted = basePrice - (basePrice * discountAmount) / 100;
  if (!Number.isFinite(discounted)) return null;

  return Math.max(0, Math.round(discounted * 100) / 100);
};

export const formatProgramDate = (date: string | Date | null | undefined) => {
  if (!date) return '-';
  return fDate(date, 'd MMM yyyy');
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
