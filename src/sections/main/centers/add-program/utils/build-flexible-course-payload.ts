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

function mapTrialSlot(slot: FlexibleSlot) {
  return {
    gender: normalizeGender(slot.gender),
    age_from: slot.age_from,
    age_to: slot.age_to,
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
    selected_days: recurringDays,
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
    if (!model?.enabled || !model.slots?.length) return;

    packageMap[key] = (model.packages ?? []).map((pkg) => ({
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
    price: values.price,
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
    addOnMaterials: values.addOnMaterials.map((material) => ({
      name_ar: material.name_ar,
      name_en: material.name_en,
      desc_ar: material.desc_ar,
      desc_en: material.desc_en,
      price: material.price,
      required: material.required,
    })),
    discount_type: values.discount_type,
    discount_amount: values.enableDiscount ? values.discount_amount : null,
    discount: values.enableDiscount
      ? values.discount.map((group) => ({
          title_ar: group.title_ar,
          title_en: group.title_en,
          discounts: group.discounts.map((item) => ({
            no_of_kids: item.no_of_kids,
            discount: item.discount,
          })),
        }))
      : [],
    package: buildPackages(values),
  };

  const daysOff = values.daysOffRecurring ? values.daysOffList : [];
  map.daysOffList =
    daysOff.length > 0 ? convertDaysListToEnglish(daysOff) : null;
  map.datesOffList =
    values.datesOffList.length > 0
      ? values.datesOffList.map((date) => format(date, 'yyyy-MM-dd'))
      : null;

  const models = values.flexibleModels;

  if (models.trial.enabled) {
    map.trialSlots = models.trial.slots.map(mapTrialSlot);
  }
  if (models.minutes.enabled) {
    map.minutesSlots = models.minutes.slots.map(mapTimedSlot);
  }
  if (models.hourly.enabled) {
    map.hourlySlots = models.hourly.slots.map(mapTimedSlot);
  }
  if (models.daily.enabled) {
    map.dailySlots = models.daily.slots.map(mapRecurringSlot);
  }
  if (models.weekly.enabled) {
    map.weeklySlots = models.weekly.slots.map(mapRecurringSlot);
  }
  if (models.monthly.enabled) {
    map.monthlySlots = models.monthly.slots.map(mapMonthlySlot);
  }

  return cleanFormData(map);
}
