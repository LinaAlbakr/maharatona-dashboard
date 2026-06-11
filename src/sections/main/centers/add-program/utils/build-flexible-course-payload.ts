import { format } from 'date-fns';

import type {
  FlexibleBookingModelKey,
  FlexibleSlot,
  ProgramFormValues,
} from '../types';
import {
  cleanFormData,
  convertDaysListToEnglish,
  formatDateForApi,
  formatRecurringDate,
  formatTimeForApi,
  normalizeGender,
  usesWeekDays,
} from './course-api-helpers';
import { applyDiscountFields } from './build-discount-fields';
import {
  getConfiguredFlexibleModelKeys,
  isFlexibleModelConfigured,
  isFlexiblePackageConfigured,
  isFlexibleSlotConfigured,
  isTrialBookingActive,
} from './flexible-model-config';

const PACKAGE_KEYS: FlexibleBookingModelKey[] = [
  'trial',
  'minutes',
  'hourly',
  'daily',
  'weekly',
  'monthly',
];

function mapSlotDays(slot: FlexibleSlot) {
  const recurringDates = (slot.custom_dates ?? [])
    .map((entry) => entry.date)
    .filter((date): date is Date => date instanceof Date);

  const weekDays = usesWeekDays(slot.recurring_days, slot.selected_days, recurringDates);

  return {
    weekDays,
    recurringDays: convertDaysListToEnglish(slot.selected_days ?? []),
    recurringDates: recurringDates.map((date) => formatRecurringDate(date)),
  };
}

function mapSlotAges(slot: FlexibleSlot) {
  const ageFrom = slot.age_from?.trim() || slot.boys_age_from?.trim() || '';
  const ageTo = slot.age_to?.trim() || slot.boys_age_to?.trim() || '';

  return {
    age_from: ageFrom,
    age_to: ageTo,
  };
}

function mapTrialSlot(slot: FlexibleSlot) {
  return {
    gender: normalizeGender(slot.gender),
    ...mapSlotAges(slot),
    selected_days: convertDaysListToEnglish(slot.selected_days ?? []),
    start_time: formatTimeForApi(slot.start_time),
    end_time: formatTimeForApi(slot.end_time),
    seat_capacity: slot.seat_capacity,
    title_en: slot.title_en,
    title_ar: slot.title_ar,
  };
}

function mapTimedSlot(slot: FlexibleSlot) {
  return {
    ...mapTrialSlot(slot),
    class_time: slot.class_time,
    price: slot.price,
  };
}

function mapRecurringSlot(slot: FlexibleSlot) {
  const { weekDays, recurringDays, recurringDates } = mapSlotDays(slot);

  return {
    gender: normalizeGender(slot.gender),
    age_from: slot.age_from,
    age_to: slot.age_to,
    selected_days: weekDays ? recurringDays : [],
    start_time: formatTimeForApi(slot.start_time),
    end_time: formatTimeForApi(slot.end_time),
    seat_capacity: slot.seat_capacity,
    recuringDays: weekDays ? recurringDays : [],
    recuringDate: weekDays ? [] : recurringDates,
    price: slot.price,
    title_en: slot.title_en,
    title_ar: slot.title_ar,
  };
}

function mapMonthlySlot(slot: FlexibleSlot) {
  return {
    ...mapRecurringSlot(slot),
    fixed_start_date: slot.fixed_start_date,
  };
}

function buildPackages(values: ProgramFormValues) {
  const packageMap: Record<string, Array<Record<string, unknown>>> = {};

  PACKAGE_KEYS.forEach((key) => {
    const model = values.flexibleModels[key];
    if (!isFlexibleModelConfigured(model, key)) return;

    packageMap[key] = (model.packages ?? [])
      .filter(isFlexiblePackageConfigured)
      .map((pkg) => ({
        title_ar: pkg.title_ar,
        title_en: pkg.title_en,
        price: pkg.price,
        number_of_classes: pkg.number_of_classes,
      }));
  });

  return packageMap;
}

export function buildFlexibleCourseFormMap(values: ProgramFormValues): Record<string, unknown> {
  const map: Record<string, unknown> = {
    name_ar: values.name_ar,
    name_en: values.name_en,
    desc_ar: values.desc_ar,
    desc_en: values.desc_en,
    start_date: formatDateForApi(values.start_date),
    end_date: formatDateForApi(values.end_date),
    start_time: formatTimeForApi(values.start_time),
    end_time: formatTimeForApi(values.end_time),
    field_id: values.field_id,
    course_type: 'flexible',
    files: [],
    additional_questions: values.additional_questions.map((option) => ({
      question_ar: option.question_ar,
      question_en: option.question_en,
      isFill: option.isFill,
      isYesNo: option.isYesNo,
      required: option.required,
    })),
    addOnMaterials: isTrialBookingActive(values.bookingType, values.flexibleModels)
      ? []
      : values.addOnMaterials.map((material) => ({
          name_ar: material.name_ar,
          name_en: material.name_en,
          desc_ar: material.desc_ar,
          desc_en: material.desc_en,
          price: material.price,
          required: material.required,
        })),
    package: buildPackages(values),
  };

  applyDiscountFields(map, values, { stringifyDiscount: false });

  const daysOff = values.daysOffRecurring ? values.daysOffList : [];
  map.daysOffList =
    daysOff.length > 0 ? convertDaysListToEnglish(daysOff) : null;
  map.datesOffList =
    values.daysOffCustom && values.datesOffList.length > 0
      ? values.datesOffList.map((date) => format(date, 'yyyy-MM-dd'))
      : null;

  const models = values.flexibleModels;
  const configuredKeys = getConfiguredFlexibleModelKeys(models);

  if (configuredKeys.includes('trial')) {
    map.trialSlots = models.trial.slots
      .filter(isFlexibleSlotConfigured)
      .map(mapTrialSlot);
  }
  if (configuredKeys.includes('minutes')) {
    map.minutesSlots = models.minutes.slots
      .filter(isFlexibleSlotConfigured)
      .map(mapTimedSlot);
  }
  if (configuredKeys.includes('hourly')) {
    map.hourlySlots = models.hourly.slots
      .filter(isFlexibleSlotConfigured)
      .map(mapTimedSlot);
  }
  if (configuredKeys.includes('daily')) {
    map.dailySlots = models.daily.slots
      .filter(isFlexibleSlotConfigured)
      .map(mapRecurringSlot);
  }
  if (configuredKeys.includes('weekly')) {
    map.weeklySlots = models.weekly.slots
      .filter(isFlexibleSlotConfigured)
      .map(mapRecurringSlot);
  }
  if (configuredKeys.includes('monthly')) {
    map.monthlySlots = models.monthly.slots
      .filter(isFlexibleSlotConfigured)
      .map(mapMonthlySlot);
  }

  return cleanFormData(map);
}
