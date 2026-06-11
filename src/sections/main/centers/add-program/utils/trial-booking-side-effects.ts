import type { UseFormSetValue } from 'react-hook-form';

import { EMPTY_DISCOUNT_GROUP } from '../constants';
import type { ProgramFormValues } from '../types';

export function applyTrialBookingSideEffects(setValue: UseFormSetValue<ProgramFormValues>) {
  setValue('addOnMaterials', [], { shouldDirty: true, shouldValidate: true });
  setValue('enableDiscount', false, { shouldDirty: true });
  setValue('discount_amount', '', { shouldDirty: true });
  setValue('discount', [{ ...EMPTY_DISCOUNT_GROUP }], { shouldDirty: true });
}
