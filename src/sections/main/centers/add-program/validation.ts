import * as yup from 'yup';

import type { ProgramStep } from './types';

const requiredMsg = 'LABEL.THIS_FIELD_IS_REQUIRED';

const numberField = (label: string) =>
  yup
    .string()
    .required(requiredMsg)
    .test('is-number', requiredMsg, (value) => value !== '' && !Number.isNaN(Number(value)));

export const getStepSchema = (step: ProgramStep) => {
  switch (step) {
    case 0:
      return yup.object({
        courseImages: yup.array().min(1, requiredMsg),
        name_ar: yup.string().required(requiredMsg),
        name_en: yup.string().required(requiredMsg),
        price: numberField('price'),
        field_id: yup.string().required(requiredMsg),
        start_date: yup.date().nullable().required(requiredMsg),
        end_date: yup
          .date()
          .nullable()
          .required(requiredMsg)
          .min(yup.ref('start_date'), 'LABEL.END_DATE_MUST_BE_AFTER_START_DATE'),
      });
    case 1:
      return yup.object({
        start_time: yup.date().nullable().required(requiredMsg),
        end_time: yup.date().nullable().required(requiredMsg),
        gender: yup.string().required(requiredMsg),
        same_age_range: yup.boolean().required(requiredMsg),
        boys_age_from: numberField('boys_age_from'),
        boys_age_to: numberField('boys_age_to'),
        girls_age_from: numberField('girls_age_from'),
        girls_age_to: numberField('girls_age_to'),
        seats: numberField('seats'),
      });
    case 2:
      return yup.object({
        additional_questions: yup.array().of(
          yup.object({
            question_ar: yup.string().required(requiredMsg),
            question_en: yup.string().required(requiredMsg),
          })
        ),
        addOnMaterials: yup.array().of(
          yup.object({
            name_ar: yup.string().required(requiredMsg),
            name_en: yup.string().required(requiredMsg),
            price: numberField('price'),
          })
        ),
      });
    case 3:
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
                      no_of_kids: numberField('no_of_kids'),
                      discount: numberField('discount'),
                    })
                  ),
              })
            ),
          otherwise: (schema) => schema,
        }),
      });
    default:
      return yup.object();
  }
};

export const countWords = (text: string) =>
  text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
