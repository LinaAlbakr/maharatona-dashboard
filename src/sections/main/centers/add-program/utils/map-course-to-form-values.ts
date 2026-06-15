import { isValid } from 'date-fns';

import {
  createDefaultFlexibleModels,
  EMPTY_DISCOUNT_GROUP,
  EMPTY_FLEXIBLE_SLOT,
  EMPTY_MATERIAL,
  EMPTY_QUESTION,
  FLEXIBLE_BOOKING_MODELS,
} from '../constants';
import { getProgramDefaultValues } from '../default-values';
import { parseFormBoolean, toFormTimeString } from './course-api-helpers';
import type {
  FlexibleBookingModelKey,
  FlexibleModelConfig,
  FlexibleSlot,
  ProgramFormValues,
  TimeSlotType,
} from '../types';

const ABBREV_TO_DAY: Record<string, string> = {
  Sun: 'Sunday',
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
};

const FLEXIBLE_SLOT_KEYS: Record<FlexibleBookingModelKey, string> = {
  trial: 'trialSlots',
  minutes: 'minutesSlots',
  hourly: 'hourlySlots',
  daily: 'dailySlots',
  weekly: 'weeklySlots',
  monthly: 'monthlySlots',
};

function str(value: unknown): string {
  if (value == null) return '';
  return String(value);
}

function parseApiDate(value: unknown): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return isValid(date) ? date : null;
}

function convertAbbrevDaysToFull(days: string[]): string[] {
  return days.map((day) => ABBREV_TO_DAY[day] ?? day);
}

function resolvePackageGroup(course: Record<string, unknown>): Record<string, unknown> {
  const pkg = course.package;
  if (!pkg) return {};
  if (typeof pkg === 'string') {
    try {
      const parsed = JSON.parse(pkg);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }
  return typeof pkg === 'object' && !Array.isArray(pkg) ? (pkg as Record<string, unknown>) : {};
}

function inferTimeType(slots: unknown[]): 'open' | 'fixed' {
  if (!Array.isArray(slots) || !slots.length) return 'open';
  return slots.some((slot) => {
    const record = slot as Record<string, unknown>;
    return Boolean(String(record.class_time ?? '').trim());
  })
    ? 'fixed'
    : 'open';
}

function mapApiSlotToForm(slot: Record<string, unknown>, modelKey: FlexibleBookingModelKey): FlexibleSlot {
  const recurringDays = Array.isArray(slot.recuringDays) ? slot.recuringDays : [];
  const recurringDates = Array.isArray(slot.recuringDate) ? slot.recuringDate : [];
  const selectedRaw = Array.isArray(slot.selected_days) ? slot.selected_days : recurringDays;
  const selectedDays = convertAbbrevDaysToFull(selectedRaw.map(String));

  const customDates = recurringDates.map((dateValue, index) => ({
    id: `date-${index}`,
    date: parseApiDate(dateValue),
    label: String(dateValue),
  }));

  const gender = str(slot.gender || 'Mixed');
  const ageFrom = str(slot.age_from ?? slot.boys_age_from ?? '');
  const ageTo = str(slot.age_to ?? slot.boys_age_to ?? '');

  return {
    title_ar: str(slot.title_ar),
    title_en: str(slot.title_en),
    gender,
    same_age_range: false,
    boys_age_from: '',
    boys_age_to: '',
    girls_age_from: '',
    girls_age_to: '',
    age_from: ageFrom,
    age_to: ageTo,
    selected_days: customDates.length > 0 ? [] : selectedDays,
    start_time: toFormTimeString(slot.start_time),
    end_time: toFormTimeString(slot.end_time),
    seat_capacity: str(slot.seat_capacity ?? ''),
    price: str(slot.price ?? ''),
    class_time: str(slot.class_time ?? ''),
    recurring_days:
      customDates.length > 0
        ? false
        : recurringDays.length > 0 || selectedDays.length > 0,
    fixed_start_date: modelKey === 'monthly' ? Boolean(slot.fixed_start_date) : false,
    custom_dates: customDates,
  };
}

function mapFlexibleModels(course: Record<string, unknown>): Record<FlexibleBookingModelKey, FlexibleModelConfig> {
  const models = createDefaultFlexibleModels();
  const packageGroup = resolvePackageGroup(course);

  FLEXIBLE_BOOKING_MODELS.forEach(({ key, hasTimeType }) => {
    const apiSlots = course[FLEXIBLE_SLOT_KEYS[key]];
    const apiPackages = packageGroup[key];
    const slots = Array.isArray(apiSlots) ? apiSlots : [];
    const packages = Array.isArray(apiPackages) ? apiPackages : [];
    const hasData = slots.length > 0 || packages.length > 0;

    if (!hasData) return;

    const timeType: TimeSlotType = hasTimeType ? inferTimeType(slots) : 'open';

    models[key] = {
      enabled: true,
      timeType,
      packages: packages.length
        ? packages.map((pkg) => {
            const record = pkg as Record<string, unknown>;
            return {
              title_ar: str(record.title_ar),
              title_en: str(record.title_en),
              number_of_classes: str(record.number_of_classes ?? ''),
              price: str(record.price ?? ''),
            };
          })
        : [],
      slots: slots.length
        ? slots.map((slot) => mapApiSlotToForm(slot as Record<string, unknown>, key))
        : [{ ...EMPTY_FLEXIBLE_SLOT }],
    };
  });

  return models;
}

function mapFixedSessionFields(course: Record<string, unknown>) {
  const gender = str(course.gender || 'Mixed');
  const isMixed = gender === 'Mixed';
  const sameAgeRange = isMixed ? parseFormBoolean(course.same_age_range ?? true) : false;

  let boys_age_from = '';
  let boys_age_to = '';
  let girls_age_from = '';
  let girls_age_to = '';

  if (isMixed && sameAgeRange) {
    boys_age_from = str(course.age_from);
    boys_age_to = str(course.age_to);
  } else if (isMixed) {
    boys_age_from = str(course.boys_age_from);
    boys_age_to = str(course.boys_age_to);
    girls_age_from = str(course.girls_age_from);
    girls_age_to = str(course.girls_age_to);
  } else if (gender === 'Girls') {
    girls_age_from = str(course.age_from);
    girls_age_to = str(course.age_to);
  } else {
    boys_age_from = str(course.age_from);
    boys_age_to = str(course.age_to);
  }

  return {
    gender,
    same_age_range: sameAgeRange,
    boys_age_from,
    boys_age_to,
    girls_age_from,
    girls_age_to,
    seats: str(course.seat_capacity ?? course.seats ?? ''),
    start_time: toFormTimeString(course.start_time),
    end_time: toFormTimeString(course.end_time),
  };
}

function mapDiscountFields(course: Record<string, unknown>) {
  const discountType = course.discount_type === 'specific' ? 'specific' : 'total';
  const discountAmount = Number(course.discount_amount ?? 0);
  const discountGroups = Array.isArray(course.discount) ? course.discount : [];
  const hasSpecific = discountGroups.some(
    (group) => Array.isArray((group as Record<string, unknown>).discounts) &&
      ((group as Record<string, unknown>).discounts as unknown[]).length > 0
  );

  const enableDiscount =
    discountType === 'total'
      ? discountAmount > 0
      : discountType === 'specific' && hasSpecific;

  const discount =
    discountType === 'specific' && hasSpecific
      ? discountGroups.map((group) => {
        const record = group as Record<string, unknown>;
        const rows = Array.isArray(record.discounts) ? record.discounts : [];
        return {
          title_ar: str(record.title_ar),
          title_en: str(record.title_en),
          discounts: rows.length
            ? rows.map((row) => {
                const item = row as Record<string, unknown>;
                return {
                  no_of_kids: str(item.no_of_kids),
                  discount: str(item.discount),
                };
              })
            : [{ no_of_kids: '', discount: '' }],
        };
      })
    : [{ ...EMPTY_DISCOUNT_GROUP }];

  return {
    enableDiscount,
    discount_type: discountType as ProgramFormValues['discount_type'],
    discount_amount:
      discountType === 'total' && discountAmount > 0 ? str(discountAmount) : '',
    discount,
  };
}

export function mapCourseToProgramFormValues(course: Record<string, unknown>): ProgramFormValues {
  const defaults = getProgramDefaultValues();
  const bookingType = course.course_type === 'flexible' ? 'flexible' : 'fixed';

  const fieldRaw = course.field_id ?? course.field;
  const fieldId =
    typeof fieldRaw === 'object' && fieldRaw
      ? str((fieldRaw as Record<string, unknown>)._id ?? (fieldRaw as Record<string, unknown>).id)
      : str(fieldRaw);

  const courseImages = (Array.isArray(course.course_images) ? course.course_images : [])
    .map((image) => {
      if (typeof image === 'string') return image;
      const record = image as Record<string, unknown>;
      return str(record.url ?? record.path ?? '');
    })
    .filter(Boolean);

  const daysOffList = convertAbbrevDaysToFull(
    (Array.isArray(course.daysOffList) ? course.daysOffList : []).map(String)
  );
  const datesOffList = (Array.isArray(course.datesOffList) ? course.datesOffList : [])
    .map((date) => parseApiDate(date))
    .filter((date): date is Date => date instanceof Date);

  const questions = Array.isArray(course.additional_questions) ? course.additional_questions : [];
  const materials = Array.isArray(course.addOnMaterials) ? course.addOnMaterials : [];

  return {
    ...defaults,
    bookingType,
    courseImages,
    name_ar: str(course.name_ar),
    name_en: str(course.name_en),
    desc_ar: str(course.desc_ar ?? course.description_ar),
    desc_en: str(course.desc_en ?? course.description_en),
    price: str(course.price ?? ''),
    field_id: fieldId,
    start_date: parseApiDate(course.start_date),
    end_date: parseApiDate(course.end_date),
    daysOffRecurring: daysOffList.length > 0,
    daysOffCustom: datesOffList.length > 0,
    daysOffList,
    datesOffList,
    ...(bookingType === 'fixed' ? mapFixedSessionFields(course) : {}),
    flexibleModels:
      bookingType === 'flexible' ? mapFlexibleModels(course) : defaults.flexibleModels,
    additional_questions: questions.length
      ? questions.map((question) => {
          const record = question as Record<string, unknown>;
          return {
            question_ar: str(record.question_ar),
            question_en: str(record.question_en),
            isFill: Boolean(record.isFill),
            isYesNo: Boolean(record.isYesNo),
            required: Boolean(record.required),
          };
        })
      : [{ ...EMPTY_QUESTION }],
    addOnMaterials: materials.length
      ? materials.map((material) => {
          const record = material as Record<string, unknown>;
          return {
            name_ar: str(record.name_ar),
            name_en: str(record.name_en),
            desc_ar: str(record.desc_ar),
            desc_en: str(record.desc_en),
            price: str(record.price ?? ''),
            required: Boolean(record.required),
          };
        })
      : [{ ...EMPTY_MATERIAL }],
    ...mapDiscountFields(course),
  };
}
