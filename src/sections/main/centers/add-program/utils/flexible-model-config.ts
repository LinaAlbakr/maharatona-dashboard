import type {
  FlexibleBookingModelKey,
  FlexibleModelConfig,
  FlexiblePackage,
  FlexibleSlot,
} from '../types';

export function isFlexibleSlotConfigured(slot: Partial<FlexibleSlot> | undefined): boolean {
  if (!slot) return false;

  return Boolean(
    slot.title_ar?.trim() ||
      slot.title_en?.trim() ||
      slot.price?.toString().trim() ||
      slot.seat_capacity?.toString().trim() ||
      slot.boys_age_from?.toString().trim() ||
      slot.boys_age_to?.toString().trim() ||
      slot.girls_age_from?.toString().trim() ||
      slot.girls_age_to?.toString().trim() ||
      slot.age_from?.toString().trim() ||
      slot.age_to?.toString().trim() ||
      slot.class_time?.toString().trim() ||
      slot.start_time ||
      slot.end_time ||
      (slot.selected_days && slot.selected_days.length > 0) ||
      (slot.custom_dates && slot.custom_dates.some((entry) => entry.date))
  );
}

export function isFlexiblePackageConfigured(pkg: Partial<FlexiblePackage> | undefined): boolean {
  if (!pkg) return false;

  return Boolean(
    pkg.title_ar?.trim() ||
      pkg.title_en?.trim() ||
      pkg.price?.toString().trim() ||
      pkg.number_of_classes?.toString().trim()
  );
}

export function isFlexibleModelConfigured(
  model: FlexibleModelConfig | undefined,
  modelKey: FlexibleBookingModelKey
): boolean {
  if (!model) return false;

  if (modelKey === 'trial') {
    return (
      model.enabled === true &&
      (model.slots ?? []).some((slot) => isFlexibleSlotConfigured(slot))
    );
  }

  const hasSlots = (model.slots ?? []).some((slot) => isFlexibleSlotConfigured(slot));
  const hasPackages = (model.packages ?? []).some((pkg) => isFlexiblePackageConfigured(pkg));
  return hasSlots || hasPackages;
}

export function getConfiguredFlexibleModelKeys(
  flexibleModels: Record<FlexibleBookingModelKey, FlexibleModelConfig>
): FlexibleBookingModelKey[] {
  return (Object.keys(flexibleModels) as FlexibleBookingModelKey[]).filter((key) =>
    isFlexibleModelConfigured(flexibleModels[key], key)
  );
}

export const MAIN_FLEXIBLE_MODEL_KEYS: FlexibleBookingModelKey[] = [
  'minutes',
  'hourly',
  'daily',
  'weekly',
  'monthly',
];
