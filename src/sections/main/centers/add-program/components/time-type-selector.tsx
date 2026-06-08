'use client';

import Box from '@mui/material/Box';
import Radio from '@mui/material/Radio';
import Typography from '@mui/material/Typography';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useTranslate } from 'src/locales';

import RequiredLabel from './required-label';
import { PROGRAM_TEAL } from '../constants';
import type { TimeSlotType } from '../types';

type Props = {
  value: TimeSlotType;
  onChange: (value: TimeSlotType) => void;
};

export default function TimeTypeSelector({ value, onChange }: Props) {
  const { t } = useTranslate();

  const options: { value: TimeSlotType; titleKey: string; descKey: string }[] = [
    {
      value: 'open',
      titleKey: 'ADD_PROGRAM.OPEN_TIME_RANGE',
      descKey: 'ADD_PROGRAM.OPEN_TIME_RANGE_DESC',
    },
    {
      value: 'fixed',
      titleKey: 'ADD_PROGRAM.FIXED_TIME_SLOTS',
      descKey: 'ADD_PROGRAM.FIXED_TIME_SLOTS_DESC',
    },
  ];

  return (
    <Box sx={{ mb: 3 }}>
      <RequiredLabel>{t('ADD_PROGRAM.SELECT_TIME')}</RequiredLabel>
      <RadioGroup
        row
        value={value}
        onChange={(e) => onChange(e.target.value as TimeSlotType)}
        sx={{ gap: 2 }}
      >
        {options.map((option) => (
          <Box
            key={option.value}
            sx={{
              flex: 1,
              p: 2,
              borderRadius: '12px',
              border: '1px solid',
              borderColor: value === option.value ? PROGRAM_TEAL : 'grey.300',
              bgcolor: value === option.value ? 'rgba(58, 176, 173, 0.04)' : 'common.white',
            }}
          >
            <FormControlLabel
              value={option.value}
              control={
                <Radio sx={{ color: PROGRAM_TEAL, '&.Mui-checked': { color: PROGRAM_TEAL } }} />
              }
              label={
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {t(option.titleKey)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t(option.descKey)}
                  </Typography>
                </Box>
              }
              sx={{ alignItems: 'flex-start', m: 0 }}
            />
          </Box>
        ))}
      </RadioGroup>
    </Box>
  );
}
