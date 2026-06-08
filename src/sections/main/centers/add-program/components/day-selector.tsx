'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import { useTranslate } from 'src/locales';

import { PROGRAM_TEAL, WEEKDAYS } from '../constants';

type Props = {
  value: string[];
  onChange: (days: string[]) => void;
};

export default function DaySelector({ value, onChange }: Props) {
  const { t } = useTranslate();

  const toggleDay = (day: string) => {
    if (value.includes(day)) {
      onChange(value.filter((d) => d !== day));
    } else {
      onChange([...value, day]);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {WEEKDAYS.map((day) => {
        const selected = value.includes(day.value);
        return (
          <Button
            key={day.value}
            size="small"
            onClick={() => toggleDay(day.value)}
            sx={{
              minWidth: 72,
              borderRadius: '20px',
              textTransform: 'none',
              fontWeight: 500,
              bgcolor: selected ? PROGRAM_TEAL : 'grey.100',
              color: selected ? 'common.white' : 'text.secondary',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: selected ? PROGRAM_TEAL : 'grey.200',
                boxShadow: 'none',
              },
            }}
          >
            {t(day.labelKey)}
          </Button>
        );
      })}
    </Box>
  );
}
