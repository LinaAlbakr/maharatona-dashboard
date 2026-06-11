import type { TFunction } from 'i18next';

import { FLEXIBLE_BOOKING_MODELS } from 'src/sections/main/centers/add-program/constants';
import type { FlexibleBookingModelKey } from 'src/sections/main/centers/add-program/types';

import { formatGroupedDatesByMonthText } from 'src/sections/main/centers/add-program/utils/custom-dates';

import { formatAgeYears, formatProgramTime, getLocalizedText } from './utils';

export const FLEXIBLE_SLOT_KEYS: Record<FlexibleBookingModelKey, string> = {
  trial: 'trialSlots',
  minutes: 'minutesSlots',
  hourly: 'hourlySlots',
  daily: 'dailySlots',
  weekly: 'weeklySlots',
  monthly: 'monthlySlots',
};

const DAY_ORDER = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

const ABBREV_TO_DAY: Record<string, (typeof DAY_ORDER)[number]> = {
  Sun: 'Sunday',
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
};

const DAY_LABEL_KEYS: Record<string, string> = {
  Sunday: 'ADD_PROGRAM.SUNDAY',
  Monday: 'ADD_PROGRAM.MONDAY',
  Tuesday: 'ADD_PROGRAM.TUESDAY',
  Wednesday: 'ADD_PROGRAM.WEDNESDAY',
  Thursday: 'ADD_PROGRAM.THURSDAY',
  Friday: 'ADD_PROGRAM.FRIDAY',
  Saturday: 'ADD_PROGRAM.SATURDAY',
};

const normalizeDayName = (day: string): string => {
  const trimmed = day.trim();
  if (DAY_LABEL_KEYS[trimmed]) return trimmed;

  const abbrev = Object.entries(ABBREV_TO_DAY).find(
    ([key]) => key.toLowerCase() === trimmed.toLowerCase()
  );
  if (abbrev) return abbrev[1];

  const match = DAY_ORDER.find((name) => name.toLowerCase() === trimmed.toLowerCase());
  return match ?? trimmed;
};

const daySortIndex = (day: string): number => {
  const index = DAY_ORDER.indexOf(normalizeDayName(day) as (typeof DAY_ORDER)[number]);
  return index === -1 ? DAY_ORDER.length : index;
};

export const FLEXIBLE_TAB_MODELS = FLEXIBLE_BOOKING_MODELS.filter((m) => m.key !== 'trial');

function resolvePackageGroup(course: any): Record<string, unknown> {
  const pkg = course?.package;
  if (!pkg) return {};
  if (typeof pkg === 'string') {
    try {
      const parsed = JSON.parse(pkg);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }
  return pkg;
}

export const modelHasDataOnCourse = (
  course: any,
  modelKey: FlexibleBookingModelKey
): boolean => {
  const slots = course?.[FLEXIBLE_SLOT_KEYS[modelKey]];
  const packages = resolvePackageGroup(course)?.[modelKey];
  const hasSlots = Array.isArray(slots) && slots.length > 0;
  const hasPackages = Array.isArray(packages) && packages.length > 0;
  return hasSlots || hasPackages;
};

export const getEnabledFlexibleModels = (course: any): FlexibleBookingModelKey[] =>
  FLEXIBLE_TAB_MODELS.filter((model) => modelHasDataOnCourse(course, model.key)).map(
    (model) => model.key
  );

export const getFirstModelWithData = (course: any): FlexibleBookingModelKey => {
  const filled = FLEXIBLE_TAB_MODELS.find((model) => modelHasDataOnCourse(course, model.key));
  return filled?.key ?? 'minutes';
};

export const getPackagesForModel = (course: any, modelKey: FlexibleBookingModelKey) => {
  const packages = resolvePackageGroup(course)?.[modelKey];
  return Array.isArray(packages) ? packages : [];
};

export const getSlotsForModel = (course: any, modelKey: FlexibleBookingModelKey) => {
  const slots = course?.[FLEXIBLE_SLOT_KEYS[modelKey]];
  return Array.isArray(slots) ? slots : [];
};

export const formatDaysList = (days: string[] | undefined, t: TFunction) => {
  if (!days?.length) return '-';
  return [...days]
    .sort((a, b) => daySortIndex(a) - daySortIndex(b))
    .map((day) => {
      const key = DAY_LABEL_KEYS[normalizeDayName(day)];
      return key ? t(key) : day;
    })
    .join(', ');
};

export const formatSlotDays = (slot: any, t: TFunction) => {
  const days = slot?.selected_days?.length
    ? slot.selected_days
    : slot?.recuringDays?.length
      ? slot.recuringDays
      : [];
  return formatDaysList(days, t);
};

export const formatDaysOff = (course: any, t: TFunction) => {
  const recurring = course?.daysOffList;
  if (Array.isArray(recurring) && recurring.length > 0) {
    return formatDaysList(recurring, t);
  }

  const customDates = course?.datesOffList;
  if (Array.isArray(customDates) && customDates.length > 0) {
    const parsedDates = customDates
      .map((date: string | Date) => {
        try {
          const parsed = date instanceof Date ? date : new Date(String(date));
          return Number.isNaN(parsed.getTime()) ? null : parsed;
        } catch {
          return null;
        }
      })
      .filter((date): date is Date => date instanceof Date);

    if (parsedDates.length > 0) {
      return formatGroupedDatesByMonthText(parsedDates);
    }
  }

  return '-';
};

export const getGenderLabel = (gender: string | undefined, t: TFunction) => {
  switch (gender) {
    case 'Mixed':
      return t('ADD_PROGRAM.GENDER_MIXED');
    case 'Boys':
      return t('ADD_PROGRAM.GENDER_BOYS');
    case 'Girls':
      return t('ADD_PROGRAM.GENDER_GIRLS');
    default:
      return gender || '-';
  }
};

export type SlotDetailField = {
  label: string;
  value: React.ReactNode;
};

const appendSlotAgeFields = (
  fields: SlotDetailField[],
  slot: any,
  t: TFunction,
  yearsLabel: string
) => {
  const gender = slot?.gender;
  const isMixed = gender === 'Mixed';

  if (isMixed && slot?.same_age_range) {
    fields.push({
      label: t('LABEL.AGE'),
      value: formatAgeYears(slot?.age_from, yearsLabel),
    });
    return;
  }

  if (isMixed && slot?.same_age_range === false) {
    fields.push(
      {
        label: `${t('ADD_PROGRAM.BOYS')} - ${t('ADD_PROGRAM.AGE_FROM')}`,
        value: formatAgeYears(slot?.boys_age_from ?? slot?.age_from, yearsLabel),
      },
      {
        label: `${t('ADD_PROGRAM.BOYS')} - ${t('ADD_PROGRAM.AGE_TO')}`,
        value: formatAgeYears(slot?.boys_age_to ?? slot?.age_to, yearsLabel),
      },
      {
        label: `${t('ADD_PROGRAM.GIRLS')} - ${t('ADD_PROGRAM.AGE_FROM')}`,
        value: formatAgeYears(slot?.girls_age_from, yearsLabel),
      },
      {
        label: `${t('ADD_PROGRAM.GIRLS')} - ${t('ADD_PROGRAM.AGE_TO')}`,
        value: formatAgeYears(slot?.girls_age_to, yearsLabel),
      }
    );
    return;
  }

  fields.push(
    {
      label: t('ADD_PROGRAM.AGE_FROM'),
      value: formatAgeYears(slot?.age_from, yearsLabel),
    },
    {
      label: t('ADD_PROGRAM.AGE_TO'),
      value: formatAgeYears(slot?.age_to, yearsLabel),
    }
  );
};

export const getSlotDetailFields = (
  modelKey: FlexibleBookingModelKey,
  slot: any,
  t: TFunction,
  isArabic: boolean
): SlotDetailField[] => {
  const yearsLabel = t('PROGRAM_DETAILS.YEARS');
  const fields: SlotDetailField[] = [
    {
      label: t('ADD_PROGRAM.GENDER'),
      value: getGenderLabel(slot?.gender, t),
    },
    {
      label: t('PROGRAM_DETAILS.DAYS'),
      value: formatSlotDays(slot, t),
    },
  ];

  appendSlotAgeFields(fields, slot, t, yearsLabel);

  fields.push(
    {
      label: t('ADD_PROGRAM.START_TIME'),
      value: formatProgramTime(slot?.start_time),
    },
    {
      label: t('ADD_PROGRAM.END_TIME'),
      value: formatProgramTime(slot?.end_time),
    }
  );

  if (modelKey === 'minutes') {
    fields.push(
      {
        label: t('PROGRAM_DETAILS.PRICE_PER_MINUTE'),
        value: slot?.price ?? '-',
      },
      {
        label: t('PROGRAM_DETAILS.DURATION_MINUTES'),
        value: slot?.class_time ?? '-',
      },
      {
        label: t('ADD_PROGRAM.SEAT_CAPACITY'),
        value: slot?.seat_capacity ?? '-',
      }
    );
  } else if (modelKey === 'hourly') {
    fields.push(
      {
        label: t('PROGRAM_DETAILS.PRICE_PER_HOUR'),
        value: slot?.price ?? '-',
      },
      {
        label: t('PROGRAM_DETAILS.DURATION_HOURS'),
        value: slot?.class_time ?? '-',
      },
      {
        label: t('ADD_PROGRAM.SEAT_CAPACITY'),
        value: slot?.seat_capacity ?? '-',
      }
    );
  } else if (modelKey === 'daily') {
    fields.push(
      {
        label: t('PROGRAM_DETAILS.PRICE_PER_DAY'),
        value: slot?.price ?? '-',
      },
      {
        label: t('ADD_PROGRAM.SEAT_CAPACITY_PER_DAY'),
        value: slot?.seat_capacity ?? '-',
      }
    );
  } else if (modelKey === 'weekly') {
    fields.push(
      {
        label: t('PROGRAM_DETAILS.PRICE_PER_WEEK'),
        value: slot?.price ?? '-',
      },
      {
        label: t('ADD_PROGRAM.SEAT_CAPACITY_PER_WEEK'),
        value: slot?.seat_capacity ?? '-',
      }
    );
  } else if (modelKey === 'monthly') {
    fields.push(
      {
        label: t('PROGRAM_DETAILS.PRICE_PER_MONTH'),
        value: slot?.price ?? '-',
      },
      {
        label: t('ADD_PROGRAM.SEAT_CAPACITY_PER_MONTH'),
        value: slot?.seat_capacity ?? '-',
      }
    );
  } else {
    fields.push({
      label: t('ADD_PROGRAM.SEAT_CAPACITY'),
      value: slot?.seat_capacity ?? '-',
    });
  }

  return fields;
};

export const getSlotTitle = (slot: any, isArabic: boolean, t: TFunction, index: number) =>
  getLocalizedText(isArabic, slot?.title_ar, slot?.title_en, `${t('PROGRAM_DETAILS.SLOT')} ${index + 1}`);
