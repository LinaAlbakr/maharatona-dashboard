'use client';

import Box from '@mui/material/Box';

import { useTranslate } from 'src/locales';

import type { FlexibleBookingModelKey } from 'src/sections/main/centers/add-program/types';

import { SlotIcon } from 'src/sections/main/centers/add-program/components/course-icons';

import { detailCardSx, detailGridSx, freeTrialSlotCardSx } from '../styles';
import { getSlotDetailFields, getSlotTitle } from '../flexible-utils';
import DetailField from './detail-field';
import PriceValue from './price-value';

type Props = {
  modelKey: FlexibleBookingModelKey;
  slot: any;
  index: number;
  isArabic: boolean;
  variant?: 'default' | 'trial';
};

export default function FlexibleSlotDetailCard({
  modelKey,
  slot,
  index,
  isArabic,
  variant = 'default',
}: Props) {
  const { t } = useTranslate();
  const title = getSlotTitle(slot, isArabic, t, index);
  const fields = getSlotDetailFields(modelKey, slot, t, isArabic);
  const cardSx = variant === 'trial' ? freeTrialSlotCardSx : { ...detailCardSx, mb: 2 };

  return (
    <Box sx={cardSx}>
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.75,
          bgcolor: 'rgba(43, 80, 156, 0.08)',
          color: '#2B509C',
          px: 1.5,
          py: 0.75,
          borderRadius: '8px',
          fontSize: 14,
          fontWeight: 600,
          mb: 2,
        }}
      >
        <SlotIcon />
        {title}
      </Box>
      <Box sx={detailGridSx}>
        {fields.map((field) => (
          <DetailField
            key={field.label}
            label={field.label}
            value={
              field.label.toLowerCase().includes('price') ? (
                <PriceValue amount={field.value as number | string} />
              ) : (
                field.value
              )
            }
          />
        ))}
      </Box>
    </Box>
  );
}
