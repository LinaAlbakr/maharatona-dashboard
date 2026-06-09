'use client';

import Box from '@mui/material/Box';

import { useTranslate } from 'src/locales';

import type { FlexibleBookingModelKey } from 'src/sections/main/centers/add-program/types';

import { RiyalIcon, SlotIcon } from 'src/sections/main/centers/add-program/components/course-icons';

import { detailCardSx, detailGridSx, detailValueSx } from '../styles';
import { getSlotDetailFields, getSlotTitle } from '../flexible-utils';
import DetailField from './detail-field';

function PriceValue({ amount }: { amount: number | string | null | undefined }) {
  if (amount === null || amount === undefined || amount === '') return <>-</>;
  return (
    <Box sx={{ ...detailValueSx, display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
      <RiyalIcon />
      <Box component="span">{Math.floor(Number(amount))}</Box>
    </Box>
  );
}

type Props = {
  modelKey: FlexibleBookingModelKey;
  slot: any;
  index: number;
  isArabic: boolean;
};

export default function FlexibleSlotDetailCard({ modelKey, slot, index, isArabic }: Props) {
  const { t } = useTranslate();
  const title = getSlotTitle(slot, isArabic, t, index);
  const fields = getSlotDetailFields(modelKey, slot, t, isArabic);

  return (
    <Box sx={{ ...detailCardSx, mb: 2 }}>
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
