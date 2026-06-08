'use client';

import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import { DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';

import { useTranslate } from 'src/locales';

import Iconify from 'src/components/iconify';

import DaySelector from './day-selector';
import RequiredLabel from './required-label';
import { PROGRAM_TEAL } from '../constants';
import type { ProgramFormValues } from '../types';

export default function DaysOffSection() {
  const { t } = useTranslate();
  const { control, watch, setValue } = useFormContext<ProgramFormValues>();
  const [pickerOpen, setPickerOpen] = useState(false);
  const daysOffRecurring = watch('daysOffRecurring');
  const daysOffCustom = watch('daysOffCustom');
  const daysOffList = watch('daysOffList');
  const datesOffList = watch('datesOffList');

  const handleAddDate = (date: Date | null) => {
    if (!date) return;
    if (!datesOffList.some((d) => d && format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))) {
      setValue('datesOffList', [...datesOffList, date], { shouldValidate: true });
    }
    setPickerOpen(false);
  };

  const handleRemoveDate = (index: number) => {
    setValue(
      'datesOffList',
      datesOffList.filter((_, i) => i !== index),
      { shouldValidate: true }
    );
  };

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
        <Controller
          name="daysOffCustom"
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
              label={t('ADD_PROGRAM.CUSTOM_DATES')}
            />
          )}
        />
      </Box>

      {daysOffRecurring ? (
        <Box sx={{ mb: 2 }}>
          <DaySelector
            value={daysOffList}
            onChange={(days) => setValue('daysOffList', days, { shouldValidate: true })}
          />
        </Box>
      ) : null}

      {daysOffCustom ? (
        <Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
            {datesOffList.map((date, index) => (
              <Chip
                key={`${date}-${index}`}
                label={date ? format(date, 'dd MM dd MMM, yyyy') : ''}
                onDelete={() => handleRemoveDate(index)}
                sx={{
                  bgcolor: PROGRAM_TEAL,
                  color: 'common.white',
                  '& .MuiChip-deleteIcon': { color: 'common.white' },
                }}
              />
            ))}
          </Box>
          <DatePicker
            open={pickerOpen}
            onClose={() => setPickerOpen(false)}
            onChange={handleAddDate}
            slotProps={{
              textField: { sx: { display: 'none' } },
            }}
          />
          <Button
            variant="outlined"
            size="small"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => setPickerOpen(true)}
            sx={{
              borderRadius: '20px',
              borderColor: PROGRAM_TEAL,
              color: PROGRAM_TEAL,
            }}
          >
            {t('ADD_PROGRAM.ADD_DATES')}
          </Button>
        </Box>
      ) : null}
    </Box>
  );
}
