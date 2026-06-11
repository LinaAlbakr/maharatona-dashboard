'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import { useTranslate } from 'src/locales';

import { FIELD_LABEL_COLOR, PROGRAM_TEAL, WEEKDAYS } from '../constants';

type Props = {
  value: string[];
  onChange: (days: string[]) => void;
  disabledDays?: string[];
};

export default function DaySelector({ value, onChange, disabledDays = [] }: Props) {
  const { t } = useTranslate();

  const disabledSet = new Set(disabledDays);

  const toggleDay = (day: string) => {
    if (disabledSet.has(day)) return;

    if (value.includes(day)) {
      onChange(value.filter((d) => d !== day));
    } else {
      onChange([...value, day]);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 1,
        flexWrap: { xs: 'wrap', sm: 'nowrap' },
      }}
    >
      {WEEKDAYS.map((day) => {
        const selected = value.includes(day.value);
        const isDisabled = disabledSet.has(day.value);
        return (
          <Button
            key={day.value}
            disabled={isDisabled}
            onClick={() => toggleDay(day.value)}
            sx={{
              width: 100,
              height: 49,
              minWidth: 100,
              flexShrink: 0,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 500,
              fontSize: 16,
              lineHeight: 1,
              px: 0,
              bgcolor: selected ? PROGRAM_TEAL : 'grey.100',
              color: selected ? 'common.white' : FIELD_LABEL_COLOR,
              boxShadow: 'none',
              ...(isDisabled && {
                opacity: 0.45,
                cursor: 'not-allowed',
                color: 'text.disabled',
              }),
              '&:hover': {
                bgcolor: isDisabled ? 'grey.100' : selected ? PROGRAM_TEAL : 'grey.200',
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
