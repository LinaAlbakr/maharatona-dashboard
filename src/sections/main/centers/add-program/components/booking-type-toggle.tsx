'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'src/locales';

import { PROGRAM_TEAL } from '../constants';
import type { BookingType } from '../types';

type Props = {
  value: BookingType;
  onChange: (value: BookingType) => void;
};

export default function BookingTypeToggle({ value, onChange }: Props) {
  const { t } = useTranslate();

  const options: { key: BookingType; titleKey: string; subtitleKey: string }[] = [
    {
      key: 'fixed',
      titleKey: 'ADD_PROGRAM.FIXED_BOOKING',
      subtitleKey: 'ADD_PROGRAM.FIXED_BOOKING_DESC',
    },
    {
      key: 'flexible',
      titleKey: 'ADD_PROGRAM.FLEXIBLE_BOOKING',
      subtitleKey: 'ADD_PROGRAM.FLEXIBLE_BOOKING_DESC',
    },
  ];

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 4 }}>
      {options.map((option) => {
        const selected = value === option.key;

        return (
          <Box
            key={option.key}
            onClick={() => onChange(option.key)}
            sx={{
              p: 2.5,
              borderRadius: '12px',
              cursor: 'pointer',
              textAlign: 'center',
              bgcolor: selected ? PROGRAM_TEAL : 'grey.100',
              color: selected ? 'common.white' : 'text.secondary',
              transition: (theme) =>
                theme.transitions.create(['background-color', 'color'], { duration: 200 }),
            }}
          >
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
              {t(option.titleKey)}
            </Typography>
            <Typography variant="caption" sx={{ opacity: selected ? 0.95 : 0.8 }}>
              {t(option.subtitleKey)}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
