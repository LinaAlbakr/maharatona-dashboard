import type { ProgramFormValues } from '../types';
import { applyDiscountFields } from './build-discount-fields';
import {
  cleanFormData,
  formatDateForApi,
  formatTimeForApi,
  isAddOnMaterialConfigured,
  isAdditionalQuestionConfigured,
  normalizeGender,
} from './course-api-helpers';

function buildAdditionalQuestions(values: ProgramFormValues) {
  return values.additional_questions
    .filter(isAdditionalQuestionConfigured)
    .map((option) => ({
      question_ar: option.question_ar,
      question_en: option.question_en,
      isFill: option.isFill,
      isYesNo: option.isYesNo,
      required: option.required,
    }));
}

function buildAddOnMaterials(values: ProgramFormValues) {
  return values.addOnMaterials
    .filter(isAddOnMaterialConfigured)
    .map((material) => ({
      name_ar: material.name_ar,
      name_en: material.name_en,
      desc_ar: material.desc_ar,
      desc_en: material.desc_en,
      price: Number.parseFloat(material.price) || 0,
      required: material.required,
    }));
}

export function buildFixedCourseFormMap(values: ProgramFormValues): Record<string, unknown> {
  const map: Record<string, unknown> = {
    name_ar: values.name_ar,
    name_en: values.name_en,
    start_date: formatDateForApi(values.start_date),
    end_date: formatDateForApi(values.end_date),
    start_time: formatTimeForApi(values.start_time),
    end_time: formatTimeForApi(values.end_time),
    field_id: values.field_id,
    modifiable: 'true',
    course_type: 'fixed',
    is_active: 'true',
    additional_questions: JSON.stringify(buildAdditionalQuestions(values)),
    addOnMaterials: JSON.stringify(buildAddOnMaterials(values)),
  };

  if (values.price.trim()) map.price = values.price;
  if (values.seats.trim()) map.seats = values.seats;
  if (values.desc_ar.trim()) map.desc_ar = values.desc_ar;
  if (values.desc_en.trim()) map.desc_en = values.desc_en;

  const gender = normalizeGender(values.gender);
  const isMixed = gender === 'Mixed';

  if (isMixed && !values.same_age_range) {
    if (values.boys_age_from.trim()) map.boys_age_from = values.boys_age_from;
    if (values.boys_age_to.trim()) map.boys_age_to = values.boys_age_to;
    if (values.girls_age_from.trim()) map.girls_age_from = values.girls_age_from;
    if (values.girls_age_to.trim()) map.girls_age_to = values.girls_age_to;
    map.same_age_range = 'false';
  } else if (isMixed && values.same_age_range) {
    if (values.boys_age_from.trim()) map.age_from = values.boys_age_from;
    if (values.boys_age_to.trim()) map.age_to = values.boys_age_to;
    map.same_age_range = 'true';
  } else {
    const ageFrom =
      gender === 'Girls' ? values.girls_age_from.trim() : values.boys_age_from.trim();
    const ageTo = gender === 'Girls' ? values.girls_age_to.trim() : values.boys_age_to.trim();
    if (ageFrom) map.age_from = ageFrom;
    if (ageTo) map.age_to = ageTo;
  }

  if (gender) map.gender = gender;

  applyDiscountFields(map, values);

  return cleanFormData(map);
}
