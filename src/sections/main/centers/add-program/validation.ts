import * as yup from 'yup';

import { FLEXIBLE_BOOKING_MODELS } from './constants';
import type { BookingType, ProgramStep } from './types';

const requiredMsg = 'LABEL.THIS_FIELD_IS_REQUIRED';

const numberField = () =>
  yup
    .string()
    .required(requiredMsg)
    .test('is-number', requiredMsg, (value) => value !== '' && !Number.isNaN(Number(value)));

const timeField = () => yup.date().nullable().required(requiredMsg);

const slotSchema = (opts: {
  hasPrice: boolean;
  hasTimeType?: boolean;
  timeType?: string;
  hasRecurring?: boolean;
}) =>
  yup.object({
    title_ar: yup.string(),
    title_en: yup.string(),
    gender: yup.string().required(requiredMsg),
    age_from: numberField(),
    age_to: numberField(),
    selected_days: yup.array().when(['recurring_days'], {
      is: (recurring_days: boolean) => opts.hasRecurring ? recurring_days !== false : true,
      then: (schema) => schema.min(1, requiredMsg),
      otherwise: (schema) => schema,
    }),
    start_time: timeField(),
    end_time: timeField(),
    seat_capacity: numberField(),
    price: opts.hasPrice ? numberField() : yup.string(),
    class_time:
      opts.hasTimeType && opts.timeType === 'fixed' ? numberField() : yup.string(),
    custom_dates: yup.array().when(['recurring_days'], {
      is: (recurring_days: boolean) => opts.hasRecurring && recurring_days === false,
      then: (schema) => schema.min(1, requiredMsg),
      otherwise: (schema) => schema,
    }),
  });

const packageSchema = yup.object({
  title_ar: yup.string().required(requiredMsg),
  title_en: yup.string().required(requiredMsg),
  number_of_classes: numberField(),
  price: numberField(),
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
  end_time: timeField(),
  gender: yup.string().required(requiredMsg),
  same_age_range: yup.boolean().required(requiredMsg),
  boys_age_from: numberField(),
  boys_age_to: numberField(),
  girls_age_from: numberField(),
  girls_age_to: numberField(),
  seats: numberField(),
});

const buildFlexibleStep1Schema = (flexibleModels: Record<string, any>) => {
  const enabledKeys = (Object.keys(flexibleModels) as string[]).filter(
    (key) => flexibleModels[key]?.enabled
  );

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
              ? yup.array().of(packageSchema).min(1)
              : yup.array(),
            slots: yup
              .array()
              .of(
                slotSchema({
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

const step2Schema = yup.object({
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
  addOnMaterials: yup.array().of(
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
        const anyFilled = Boolean(nameAr || nameEn || price || row?.desc_ar?.trim() || row?.desc_en?.trim());
        if (!anyFilled) return true;
        return Boolean(nameAr && nameEn && price && !Number.isNaN(Number(price)));
      })
  ),
});

const step3Schema = yup.object({
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
      return step2Schema;
    case 3:
      return step3Schema;
    default:
      return yup.object();
  }
};

export const countWords = (text: string) =>
  text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
