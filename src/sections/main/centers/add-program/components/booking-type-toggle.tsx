'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'src/locales';

import { PROGRAM_TEAL } from '../constants';
import { programCardSx } from '../styles';
import type { BookingType } from '../types';

const UNSELECTED_BG = '#DBDBDB';
const UNSELECTED_TEXT = '#878787';

type Props = {
  value: BookingType;
  onChange: (value: BookingType) => void;
  disabled?: boolean;
};

export default function BookingTypeToggle({ value, onChange, disabled = false }: Props) {
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
    <Card
      sx={{
        ...programCardSx,
        height: 103,
        borderRadius: '52px',
        display: 'flex',
        alignItems: 'center',
        p: 0,
        px: { xs: 2, md: 2.5 },
        mb: 3,
        width: '100%',
        opacity: disabled ? 0.92 : 1,
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2,
          width: '100%',
        }}
      >
        {options.map((option) => {
          const selected = value === option.key;
          const textColor = selected ? '#FFFFFF' : UNSELECTED_TEXT;
          const isClickable = !disabled && !selected;

          return (
            <Box
              key={option.key}
              onClick={() => {
                if (!isClickable) return;
                onChange(option.key);
              }}
              sx={{
                height: 77,
                borderRadius: '38px',
                cursor: isClickable ? 'pointer' : 'default',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                px: 2,
                bgcolor: selected ? PROGRAM_TEAL : UNSELECTED_BG,
                transition: (theme) =>
                  theme.transitions.create(['background-color', 'color'], { duration: 200 }),
              }}
            >
              <Typography
                sx={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: textColor,
                  lineHeight: 1.3,
                  mb: 0.5,
                }}
              >
                {t(option.titleKey)}
              </Typography>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 400,
                  color: textColor,
                  lineHeight: 1.35,
                }}
              >
                {t(option.subtitleKey)}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Card>
  );
}
