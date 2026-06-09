export type BookingType = 'fixed' | 'flexible';

export type DiscountType = 'total' | 'specific';

export type ProgramStep = 0 | 1 | 2 | 3;

export type FlexibleBookingModelKey =
  | 'trial'
  | 'minutes'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly';

export type TimeSlotType = 'open' | 'fixed';

export type AdditionalQuestion = {
  question_ar: string;
  question_en: string;
  isFill: boolean;
  isYesNo: boolean;
  required: boolean;
};

export type AddOnMaterial = {
  name_ar: string;
  name_en: string;
  desc_ar: string;
  desc_en: string;
  price: string;
  required: boolean;
};

export type SpecificDiscountRow = {
  no_of_kids: string;
  discount: string;
};

export type SpecificDiscountGroup = {
  title_ar: string;
  title_en: string;
  discounts: SpecificDiscountRow[];
};

export type FlexiblePackage = {
  title_ar: string;
  title_en: string;
  number_of_classes: string;
  price: string;
};

export type FlexibleSlotDate = {
  id: string;
  date: Date | null;
  label: string;
};

export type FlexibleSlot = {
  title_ar: string;
  title_en: string;
  gender: string;
  same_age_range: boolean;
  boys_age_from: string;
  boys_age_to: string;
  girls_age_from: string;
  girls_age_to: string;
  age_from: string;
  age_to: string;
  selected_days: string[];
  start_time: Date | null;
  end_time: Date | null;
  seat_capacity: string;
  price: string;
  class_time: string;
  recurring_days: boolean;
  fixed_start_date: boolean;
  custom_dates: FlexibleSlotDate[];
};

export type FlexibleModelConfig = {
  enabled: boolean;
  timeType: TimeSlotType;
  packages: FlexiblePackage[];
  slots: FlexibleSlot[];
};

export type ProgramFormValues = {
  bookingType: BookingType;
  courseImages: (File | string)[];
  name_ar: string;
  name_en: string;
  desc_ar: string;
  desc_en: string;
  price: string;
  field_id: string;
  start_date: Date | null;
  end_date: Date | null;
  daysOffRecurring: boolean;
  daysOffCustom: boolean;
  daysOffList: string[];
  datesOffList: Date[];
  start_time: Date | null;
  end_time: Date | null;
  gender: string;
  same_age_range: boolean;
  boys_age_from: string;
  boys_age_to: string;
  girls_age_from: string;
  girls_age_to: string;
  seats: string;
  flexibleModels: Record<FlexibleBookingModelKey, FlexibleModelConfig>;
  additional_questions: AdditionalQuestion[];
  addOnMaterials: AddOnMaterial[];
  enableDiscount: boolean;
  discount_type: DiscountType;
  discount_amount: string;
  discount: SpecificDiscountGroup[];
};

/** @deprecated use ProgramFormValues */
export type FixedProgramFormValues = ProgramFormValues;

export type CategoryOption = {
  id: string;
  name: string;
  name_ar?: string;
  name_en?: string;
};
