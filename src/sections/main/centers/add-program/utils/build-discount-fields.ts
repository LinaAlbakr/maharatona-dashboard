import type { ProgramFormValues } from '../types';
import { isTrialBookingActive } from './flexible-model-config';

function buildSpecificDiscounts(values: ProgramFormValues) {
  return values.discount.map((group) => ({
    title_ar: group.title_ar,
    title_en: group.title_en,
    discounts: group.discounts.map((item) => ({
      no_of_kids: Number.parseInt(item.no_of_kids, 10) || 0,
      discount: Number.parseInt(item.discount, 10) || 0,
    })),
  }));
}

export type DiscountFields = {
  discount_type: 'total' | 'specific';
  discount_amount: string;
  discount: ReturnType<typeof buildSpecificDiscounts>;
};

export function hasDiscountConfigured(
  values: Pick<ProgramFormValues, 'discount_type' | 'discount_amount' | 'discount'>
): boolean {
  if (values.discount_type === 'total') {
    return Boolean(values.discount_amount?.trim());
  }

  return (values.discount ?? []).some((group) => {
    const anyTitle = Boolean(group.title_ar?.trim() || group.title_en?.trim());
    const anyRow = (group.discounts ?? []).some(
      (row) => Boolean(row.no_of_kids?.trim() || row.discount?.trim())
    );
    return anyTitle || anyRow;
  });
}

export function buildDiscountFields(values: ProgramFormValues): DiscountFields {
  if (!hasDiscountConfigured(values) || isTrialBookingActive(values.bookingType, values.flexibleModels)) {
    return {
      discount_type: 'total',
      discount_amount: '0',
      discount: [],
    };
  }

  if (values.discount_type === 'specific') {
    return {
      discount_type: 'specific',
      discount_amount: '0',
      discount: buildSpecificDiscounts(values),
    };
  }

  return {
    discount_type: 'total',
    discount_amount: values.discount_amount.trim() || '0',
    discount: [],
  };
}

export function applyDiscountFields(
  map: Record<string, unknown>,
  values: ProgramFormValues,
  options?: { stringifyDiscount?: boolean }
) {
  const { discount_type, discount_amount, discount } = buildDiscountFields(values);

  map.discount_type = discount_type;
  map.discount_amount = discount_amount;
  map.discount = options?.stringifyDiscount === false ? discount : JSON.stringify(discount);
}
