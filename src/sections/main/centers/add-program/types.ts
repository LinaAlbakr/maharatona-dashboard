export type BookingType = 'fixed' | 'flexible';

export type DiscountType = 'total' | 'specific';

export type ProgramStep = 0 | 1 | 2 | 3;

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

export type FixedProgramFormValues = {
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
  start_time: Date | null;
  end_time: Date | null;
  gender: string;
  same_age_range: boolean;
  boys_age_from: string;
  boys_age_to: string;
  girls_age_from: string;
  girls_age_to: string;
  seats: string;
  additional_questions: AdditionalQuestion[];
  addOnMaterials: AddOnMaterial[];
  enableDiscount: boolean;
  discount_type: DiscountType;
  discount_amount: string;
  discount: SpecificDiscountGroup[];
};

export type CategoryOption = {
  id: string;
  name: string;
  name_ar?: string;
  name_en?: string;
};
