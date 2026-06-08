import type { ProgramStep } from './types';

export const PROGRAM_TEAL = '#3AB0AD';
export const PROGRAM_TEAL_DARK = '#2C8B8E';

export const PROGRAM_STEPS: { key: ProgramStep; labelKey: string }[] = [
  { key: 0, labelKey: 'ADD_PROGRAM.STEP_PROGRAM' },
  { key: 1, labelKey: 'ADD_PROGRAM.STEP_SESSION' },
  { key: 2, labelKey: 'ADD_PROGRAM.STEP_ADDITIONAL' },
  { key: 3, labelKey: 'ADD_PROGRAM.STEP_DISCOUNT' },
];

export const GENDER_OPTIONS = [
  { value: 'Mixed', labelKey: 'ADD_PROGRAM.GENDER_MIXED' },
  { value: 'Boys', labelKey: 'ADD_PROGRAM.GENDER_BOYS' },
  { value: 'Girls', labelKey: 'ADD_PROGRAM.GENDER_GIRLS' },
];

export const MAX_DESCRIPTION_WORDS = 500;

export const EMPTY_QUESTION = {
  question_ar: '',
  question_en: '',
  isFill: true,
  isYesNo: true,
  required: false,
};

export const EMPTY_MATERIAL = {
  name_ar: '',
  name_en: '',
  desc_ar: '',
  desc_en: '',
  price: '',
  required: true,
};

export const EMPTY_DISCOUNT_ROW = {
  no_of_kids: '',
  discount: '',
};

export const EMPTY_DISCOUNT_GROUP = {
  title_ar: '',
  title_en: '',
  discounts: [{ ...EMPTY_DISCOUNT_ROW }, { ...EMPTY_DISCOUNT_ROW }],
};
