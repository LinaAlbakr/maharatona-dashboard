import type {
  BookingType,
  FlexibleBookingModelKey,
  FlexibleModelConfig,
  ProgramFormValues,
} from '../types';
import {
  MAIN_FLEXIBLE_MODEL_KEYS,
  isFlexibleModelConfigured,
  isFlexiblePackageConfigured,
  isTrialBookingActive,
} from './flexible-model-config';

export function parsePriceValue(value: string | undefined | null): number | null {
  if (value == null || !String(value).trim()) return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

/** Slot/package/program price: required numeric value that may be 0. */
export function isNonNegativePrice(value: string | undefined | null): boolean {
  const n = parsePriceValue(value);
  return n !== null && n >= 0;
}

/**
 * Collect every filled slot/package price across main flexible models
 * (trial has no price and is excluded).
 */
export function collectFlexibleProgramPrices(
  flexibleModels: Record<FlexibleBookingModelKey, FlexibleModelConfig> | undefined
): number[] {
  if (!flexibleModels) return [];

  const prices: number[] = [];

  for (const key of MAIN_FLEXIBLE_MODEL_KEYS) {
    const model = flexibleModels[key];
    if (!isFlexibleModelConfigured(model, key)) continue;

    for (const slot of model.slots ?? []) {
      const n = parsePriceValue(slot?.price);
      if (n !== null) prices.push(n);
    }

    for (const pkg of model.packages ?? []) {
      if (!isFlexiblePackageConfigured(pkg)) continue;
      const n = parsePriceValue(pkg?.price);
      if (n !== null) prices.push(n);
    }
  }

  return prices;
}

/** If any price is 0 and any other is > 0, free pricing is inconsistent. */
export function hasMixedFreeAndPaidPrices(prices: number[]): boolean {
  const hasZero = prices.some((p) => p === 0);
  const hasPositive = prices.some((p) => p > 0);
  return hasZero && hasPositive;
}

export function isAllPricesFree(prices: number[]): boolean {
  return prices.length > 0 && prices.every((p) => p === 0);
}

/** Fixed price 0, or every flexible slot/package price is 0. */
export function isFreeProgramPricing(
  bookingType: BookingType,
  values: Pick<ProgramFormValues, 'price' | 'flexibleModels'>
): boolean {
  if (isTrialBookingActive(bookingType, values.flexibleModels)) {
    return true;
  }

  if (bookingType === 'fixed') {
    const n = parsePriceValue(values.price);
    return n !== null && n === 0;
  }

  return isAllPricesFree(collectFlexibleProgramPrices(values.flexibleModels));
}
