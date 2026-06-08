import {
  EMPTY_DISCOUNT_GROUP,
  EMPTY_MATERIAL,
  EMPTY_QUESTION,
} from './constants';
import type { FixedProgramFormValues } from './types';

export const getFixedProgramDefaultValues = (): FixedProgramFormValues => ({
  bookingType: 'fixed',
  courseImages: [],
  name_ar: '',
  name_en: '',
  desc_ar: '',
  desc_en: '',
  price: '',
  field_id: '',
  start_date: null,
  end_date: null,
  start_time: null,
  end_time: null,
  gender: 'Mixed',
  same_age_range: false,
  boys_age_from: '',
  boys_age_to: '',
  girls_age_from: '',
  girls_age_to: '',
  seats: '',
  additional_questions: [{ ...EMPTY_QUESTION }],
  addOnMaterials: [{ ...EMPTY_MATERIAL }],
  enableDiscount: true,
  discount_type: 'total',
  discount_amount: '',
  discount: [{ ...EMPTY_DISCOUNT_GROUP }],
});
