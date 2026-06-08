'use client';

import { Controller, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useTranslate } from 'src/locales';

import DaySelector from './day-selector';
import RequiredLabel from './required-label';
import { PROGRAM_TEAL } from '../constants';
import type { ProgramFormValues } from '../types';

export default function DaysOffSection() {
  const { t } = useTranslate();
  const { control, watch, setValue } = useFormContext<ProgramFormValues>();
  const daysOffRecurring = watch('daysOffRecurring');
  const daysOffList = watch('daysOffList');

  return (
    <Box sx={{ mt: 2.5 }}>
      <RequiredLabel>{t('ADD_PROGRAM.DAYS_OFF')}</RequiredLabel>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <Controller
          name="daysOffRecurring"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Checkbox
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  sx={{ color: PROGRAM_TEAL, '&.Mui-checked': { color: PROGRAM_TEAL } }}
                />
              }
              label={t('ADD_PROGRAM.RECURRING_DAYS')}
            />
          )}
        />
      </Box>

      {daysOffRecurring ? (
        <DaySelector
          value={daysOffList}
          onChange={(days) => setValue('daysOffList', days, { shouldValidate: true })}
        />
      ) : null}
    </Box>
  );
}
