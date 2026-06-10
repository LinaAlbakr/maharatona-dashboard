import type { FlexibleBookingModelKey, FlexibleModelConfig, ProgramStep } from './types';

export const PROGRAM_TEAL = '#3AB0AD';
export const PROGRAM_SECTION_HEADING_COLOR = '#3CB8BB';
export const PROGRAM_TEAL_DARK = '#2C8B8E';
export const FIELD_LABEL_COLOR = '#2B509C';
export const CALENDAR_SELECTED_COLOR = '#40E0D0';
export const STEP_INACTIVE_COLOR = '#BABABA';
export const FIELD_BORDER_COLOR = '#D9D9D9';
export const FIELD_PLACEHOLDER_COLOR = '#A29F9D';
export const ADD_BOX_TEXT_COLOR = '#8B8D91';
export const ADD_BOX_BG_COLOR = '#8B8D9152';
export const FREE_BOOKING_COLOR = '#CC3899';
export const PROGRAM_FIELD_HEIGHT = 51;

/** Dev-only: bypass step validation so the wizard can be navigated without filling every field. */
export const SKIP_PROGRAM_STEP_VALIDATION = false;

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

export const WEEKDAYS = [
  { value: 'Sunday', labelKey: 'ADD_PROGRAM.SUNDAY' },
  { value: 'Monday', labelKey: 'ADD_PROGRAM.MONDAY' },
  { value: 'Tuesday', labelKey: 'ADD_PROGRAM.TUESDAY' },
  { value: 'Wednesday', labelKey: 'ADD_PROGRAM.WEDNESDAY' },
  { value: 'Thursday', labelKey: 'ADD_PROGRAM.THURSDAY' },
  { value: 'Friday', labelKey: 'ADD_PROGRAM.FRIDAY' },
  { value: 'Saturday', labelKey: 'ADD_PROGRAM.SATURDAY' },
] as const;

export const FLEXIBLE_BOOKING_MODELS: {
  key: FlexibleBookingModelKey;
  labelKey: string;
  hasPackages: boolean;
  hasTimeType: boolean;
  hasRecurring: boolean;
  hasFixStartDate: boolean;
}[] = [
  { key: 'trial', labelKey: 'ADD_PROGRAM.FREE', hasPackages: false, hasTimeType: false, hasRecurring: false, hasFixStartDate: false },
  { key: 'minutes', labelKey: 'LABEL.BOOKING_MODEL_MINUTES', hasPackages: true, hasTimeType: true, hasRecurring: false, hasFixStartDate: false },
  { key: 'hourly', labelKey: 'LABEL.BOOKING_MODEL_HOURLY', hasPackages: true, hasTimeType: true, hasRecurring: false, hasFixStartDate: false },
  { key: 'daily', labelKey: 'LABEL.BOOKING_MODEL_DAILY', hasPackages: true, hasTimeType: false, hasRecurring: true, hasFixStartDate: false },
  { key: 'weekly', labelKey: 'LABEL.BOOKING_MODEL_WEEKLY', hasPackages: true, hasTimeType: false, hasRecurring: true, hasFixStartDate: false },
  { key: 'monthly', labelKey: 'LABEL.BOOKING_MODEL_MONTHLY', hasPackages: true, hasTimeType: false, hasRecurring: true, hasFixStartDate: true },
];

export const EMPTY_FLEXIBLE_PACKAGE = {
  title_ar: '',
  title_en: '',
  number_of_classes: '',
  price: '',
};

export const EMPTY_FLEXIBLE_SLOT = {
  title_ar: '',
  title_en: '',
  gender: 'Boys',
  same_age_range: false,
  boys_age_from: '',
  boys_age_to: '',
  girls_age_from: '',
  girls_age_to: '',
  age_from: '',
  age_to: '',
  selected_days: [] as string[],
  start_time: null as Date | null,
  end_time: null as Date | null,
  seat_capacity: '',
  price: '',
  class_time: '',
  recurring_days: true,
  fixed_start_date: false,
  custom_dates: [] as { id: string; date: Date | null; label: string }[],
};

export const createEmptyFlexibleModel = (): FlexibleModelConfig => ({
  enabled: false,
  timeType: 'open',
  packages: [{ ...EMPTY_FLEXIBLE_PACKAGE }],
  slots: [{ ...EMPTY_FLEXIBLE_SLOT }],
});

export const createDefaultFlexibleModels = (): Record<FlexibleBookingModelKey, FlexibleModelConfig> =>
  Object.fromEntries(
    FLEXIBLE_BOOKING_MODELS.map(({ key }) => [key, createEmptyFlexibleModel()])
  ) as Record<FlexibleBookingModelKey, FlexibleModelConfig>;
