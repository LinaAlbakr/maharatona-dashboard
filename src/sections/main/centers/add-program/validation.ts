import * as yup from 'yup';

import { FLEXIBLE_BOOKING_MODELS } from './constants';
import type { BookingType, FlexibleBookingModelKey, ProgramStep } from './types';
import {
  getConfiguredFlexibleModelKeys,
  hasTrialAndMainModelConflict,
  isTrialBookingActive,
} from './utils/flexible-model-config';

const requiredMsg = 'LABEL.THIS_FIELD_IS_REQUIRED';

const numberField = () =>
  yup
    .string()
    .required(requiredMsg)
    .test('is-number', requiredMsg, (value) => value !== '' && !Number.isNaN(Number(value)));

const seatsMustBePositiveMsg = 'ADD_PROGRAM.SEATS_MUST_BE_GREATER_THAN_ZERO';

const positiveNumberField = () =>
  numberField().test(
    'positive',
    seatsMustBePositiveMsg,
    (value) => value !== '' && Number(value) > 0
  );

const endTimeAfterStartMsg = 'ADD_PROGRAM.END_TIME_MUST_BE_AFTER_START_TIME';
const ageToMustBeGreaterMsg = 'ADD_PROGRAM.AGE_TO_MUST_BE_GREATER_THAN_AGE_FROM';

const timeField = () => yup.date().nullable().required(requiredMsg);

const ageToField = (fromField: string) =>
  numberField().test('age-order', ageToMustBeGreaterMsg, function validateAgeTo(to) {
    const from = (this.parent as Record<string, string | undefined>)[fromField];
    if (!from?.trim() || !to?.trim()) return true;
    return Number(to) >= Number(from);
  });

const endTimeAfterStartTime = () =>
  timeField().test('after-start', endTimeAfterStartMsg, function validateEndTime(endTime) {
    const { start_time: startTime } = this.parent as { start_time?: Date | null };
    if (!startTime || !endTime) return true;
    return endTime.getTime() > startTime.getTime();
  });

const hourlyClassTimeField = () =>
  numberField()
    .test('min-60', 'ADD_PROGRAM.errorMinClassTime60', (value) => {
      if (!value?.trim()) return true;
      return Number(value) >= 60;
    })
    .test('increment-15', 'ADD_PROGRAM.errorTimeIncrement15', (value) => {
      if (!value?.trim()) return true;
      return Number(value) % 15 === 0;
    });

const slotSchema = (opts: {
  modelKey?: FlexibleBookingModelKey;
  hasPrice: boolean;
  hasTimeType?: boolean;
  timeType?: string;
  hasRecurring?: boolean;
}) =>
  yup.object({
    title_ar: yup.string(),
    title_en: yup.string(),
    gender: yup.string().required(requiredMsg),
    same_age_range: yup.boolean(),
    boys_age_from: yup.string(),
    boys_age_to: yup.string(),
    girls_age_from: yup.string(),
    girls_age_to: yup.string(),
    age_from: numberField(),
    age_to: ageToField('age_from'),
    selected_days: yup.array().when(['recurring_days'], {
      is: (recurring_days: boolean) => opts.hasRecurring ? recurring_days !== false : true,
      then: (schema) => schema.min(1, requiredMsg),
      otherwise: (schema) => schema,
    }),
    start_time: timeField(),
    end_time: endTimeAfterStartTime(),
    seat_capacity: positiveNumberField(),
    price: opts.hasPrice ? numberField() : yup.string(),
    class_time:
      opts.hasTimeType && opts.timeType === 'fixed'
        ? opts.modelKey === 'hourly'
          ? hourlyClassTimeField()
          : numberField()
        : yup.string(),
    custom_dates: yup.array().when(['recurring_days'], {
      is: (recurring_days: boolean) => opts.hasRecurring && recurring_days === false,
      then: (schema) => schema.min(1, requiredMsg),
      otherwise: (schema) => schema,
    }),
  });

const packageSchema = yup
  .object({
    title_ar: yup.string(),
    title_en: yup.string(),
    number_of_classes: yup.string(),
    price: yup.string(),
  })
  .test('complete-or-empty', requiredMsg, (row) => {
    const titleAr = row?.title_ar?.trim() ?? '';
    const titleEn = row?.title_en?.trim() ?? '';
    const sessions = row?.number_of_classes?.trim() ?? '';
    const price = row?.price?.trim() ?? '';
    const anyFilled = Boolean(titleAr || titleEn || sessions || price);
    if (!anyFilled) return true;
    if (!titleAr || !titleEn || !sessions || !price) return false;
    return !Number.isNaN(Number(sessions)) && !Number.isNaN(Number(price));
  });

const fixedStep0Schema = yup.object({
  courseImages: yup.array().min(1, requiredMsg),
  name_ar: yup.string().required(requiredMsg),
  name_en: yup.string().required(requiredMsg),
  price: numberField(),
  field_id: yup.string().required(requiredMsg),
  start_date: yup.date().nullable().required(requiredMsg),
  end_date: yup
    .date()
    .nullable()
    .required(requiredMsg)
    .min(yup.ref('start_date'), 'LABEL.END_DATE_MUST_BE_AFTER_START_DATE'),
});

const flexibleStep0Schema = yup.object({
  courseImages: yup.array().min(1, requiredMsg),
  name_ar: yup.string().required(requiredMsg),
  name_en: yup.string().required(requiredMsg),
  field_id: yup.string().required(requiredMsg),
  start_date: yup.date().nullable().required(requiredMsg),
  end_date: yup
    .date()
    .nullable()
    .required(requiredMsg)
    .min(yup.ref('start_date'), 'LABEL.END_DATE_MUST_BE_AFTER_START_DATE'),
});

const fixedStep1Schema = yup.object({
  start_time: timeField(),
  end_time: endTimeAfterStartTime(),
  gender: yup.string().required(requiredMsg),
  same_age_range: yup.boolean().when('gender', {
    is: 'Mixed',
    then: (schema) => schema.required(requiredMsg),
    otherwise: (schema) => schema,
  }),
  boys_age_from: yup.string().when(['gender', 'same_age_range'], {
    is: (gender: string, same_age_range: boolean) =>
      gender === 'Boys' || gender === 'Mixed',
    then: () => numberField(),
    otherwise: (schema) => schema,
  }),
  boys_age_to: yup.string().when(['gender', 'same_age_range'], {
    is: (gender: string) => gender === 'Boys' || gender === 'Mixed',
    then: () => ageToField('boys_age_from'),
    otherwise: (schema) => schema,
  }),
  girls_age_from: yup.string().when(['gender', 'same_age_range'], {
    is: (gender: string, same_age_range: boolean) =>
      gender === 'Girls' || (gender === 'Mixed' && !same_age_range),
    then: () => numberField(),
    otherwise: (schema) => schema,
  }),
  girls_age_to: yup.string().when(['gender', 'same_age_range'], {
    is: (gender: string, same_age_range: boolean) =>
      gender === 'Girls' || (gender === 'Mixed' && !same_age_range),
    then: () => ageToField('girls_age_from'),
    otherwise: (schema) => schema,
  }),
  seats: positiveNumberField(),
});

const buildFlexibleStep1Schema = (flexibleModels: Record<string, any>) => {
  if (hasTrialAndMainModelConflict(flexibleModels)) {
    return yup.object({
      flexibleModels: yup
        .mixed()
        .test('trial-combine', 'ADD_PROGRAM.TRIAL_CANNOT_COMBINE', () => false),
    });
  }

  const enabledKeys = getConfiguredFlexibleModelKeys(flexibleModels);

  if (enabledKeys.length === 0) {
    return yup.object({
      flexibleModels: yup
        .mixed()
        .test('models', 'ADD_PROGRAM.SELECT_AT_LEAST_ONE_MODEL', () => false),
    });
  }

  return yup.object({
    flexibleModels: yup.object().shape(
      Object.fromEntries(
        enabledKeys.map((key) => [
          key,
          yup.object({
            packages: FLEXIBLE_BOOKING_MODELS.find((m) => m.key === key)?.hasPackages
              ? yup.array().of(packageSchema)
              : yup.array(),
            slots: yup
              .array()
              .of(
                slotSchema({
                  modelKey: key as FlexibleBookingModelKey,
                  hasPrice: key !== 'trial',
                  hasTimeType: FLEXIBLE_BOOKING_MODELS.find((m) => m.key === key)?.hasTimeType,
                  timeType: flexibleModels[key]?.timeType,
                  hasRecurring: FLEXIBLE_BOOKING_MODELS.find((m) => m.key === key)?.hasRecurring,
                })
              )
              .min(1),
          }),
        ])
      )
    ),
  });
};

const optionalRowComplete = (fields: (string | undefined)[]) => {
  const values = fields.map((value) => value?.trim() ?? '');
  const anyFilled = values.some(Boolean);
  if (!anyFilled) return true;
  return values.every(Boolean);
};

const buildStep2Schema = (
  bookingType: BookingType,
  flexibleModels?: Record<string, any>
) => {
  const trialActive = isTrialBookingActive(bookingType, flexibleModels);

  return yup.object({
    additional_questions: yup.array().of(
      yup
        .object({
          question_ar: yup.string(),
          question_en: yup.string(),
        })
        .test('complete-or-empty', requiredMsg, (row) =>
          optionalRowComplete([row?.question_ar, row?.question_en])
        )
    ),
    addOnMaterials: trialActive
      ? yup.array()
      : yup.array().of(
          yup
            .object({
              name_ar: yup.string(),
              name_en: yup.string(),
              desc_ar: yup.string(),
              desc_en: yup.string(),
              price: yup.string(),
            })
            .test('complete-or-empty', requiredMsg, (row) => {
              const nameAr = row?.name_ar?.trim() ?? '';
              const nameEn = row?.name_en?.trim() ?? '';
              const price = row?.price?.trim() ?? '';
              const anyFilled = Boolean(
                nameAr || nameEn || price || row?.desc_ar?.trim() || row?.desc_en?.trim()
              );
              if (!anyFilled) return true;
              return Boolean(nameAr && nameEn && price && !Number.isNaN(Number(price)));
            })
        ),
  });
};

const buildStep3Schema = (
  bookingType: BookingType,
  flexibleModels?: Record<string, any>
) => {
  const trialActive = isTrialBookingActive(bookingType, flexibleModels);

  if (trialActive) {
    return yup.object({
      enableDiscount: yup.boolean(),
    });
  }

  return yup.object({
    enableDiscount: yup.boolean(),
    discount_type: yup.string(),
    discount_amount: yup.string().when(['enableDiscount', 'discount_type'], {
      is: (enableDiscount: boolean, discount_type: string) =>
        enableDiscount && discount_type === 'total',
      then: (schema) => schema.required(requiredMsg),
      otherwise: (schema) => schema,
    }),
    discount: yup.array().when(['enableDiscount', 'discount_type'], {
      is: (enableDiscount: boolean, discount_type: string) =>
        enableDiscount && discount_type === 'specific',
      then: (schema) =>
        schema.of(
          yup.object({
            title_ar: yup.string().required(requiredMsg),
            title_en: yup.string().required(requiredMsg),
            discounts: yup
              .array()
              .min(1)
              .of(
                yup.object({
                  no_of_kids: numberField(),
                  discount: numberField(),
                })
              ),
          })
        ),
      otherwise: (schema) => schema,
    }),
  });
};

export const getStepSchema = (
  step: ProgramStep,
  bookingType: BookingType,
  flexibleModels?: Record<string, any>
) => {
  switch (step) {
    case 0:
      return bookingType === 'flexible' ? flexibleStep0Schema : fixedStep0Schema;
    case 1:
      return bookingType === 'flexible'
        ? buildFlexibleStep1Schema(flexibleModels || {})
        : fixedStep1Schema;
    case 2:
      return buildStep2Schema(bookingType, flexibleModels);
    case 3:
      return buildStep3Schema(bookingType, flexibleModels);
    default:
      return yup.object();
  }
};

export const countWords = (text: string) =>
  text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
