'use client';

import { useEffect, useRef, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Popover from '@mui/material/Popover';
import FormControlLabel from '@mui/material/FormControlLabel';
import { DateCalendar } from '@mui/x-date-pickers';

import { useTranslate } from 'src/locales';

import Iconify from 'src/components/iconify';

import DaySelector from './day-selector';
import RequiredLabel from './required-label';
import SelectedDateTag from './selected-date-tag';
import { ADD_BOX_TEXT_COLOR, PROGRAM_TEAL } from '../constants';
import { programDatePickerDaySlotProps } from '../styles';
import type { ProgramFormValues } from '../types';

export default function DaysOffSection() {
  const { t } = useTranslate();
  const { control, watch, setValue } = useFormContext<ProgramFormValues>();
  const daysOffRecurring = watch('daysOffRecurring');
  const daysOffCustom = watch('daysOffCustom');
  const daysOffList = watch('daysOffList');
  const datesOffList = watch('datesOffList') || [];

  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const calendarAnchorRef = useRef<HTMLButtonElement>(null);
  const prevCustomRef = useRef(daysOffCustom);

  useEffect(() => {
    if (daysOffCustom && !prevCustomRef.current) {
      setDatePickerOpen(true);
    }
    if (!daysOffCustom) {
      setDatePickerOpen(false);
    }
    prevCustomRef.current = daysOffCustom;
  }, [daysOffCustom]);

  const handleAddDate = (date: Date | null) => {
    if (!date) return;
    const alreadySelected = datesOffList.some(
      (selected) => selected.toDateString() === date.toDateString()
    );
    if (alreadySelected) {
      setDatePickerOpen(false);
      return;
    }
    setValue('datesOffList', [...datesOffList, date], { shouldValidate: true });
    setDatePickerOpen(false);
  };

  const handleRemoveDate = (index: number) => {
    setValue(
      'datesOffList',
      datesOffList.filter((_, itemIndex) => itemIndex !== index),
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
                  onChange={(event) => {
                    const checked = event.target.checked;
                    field.onChange(checked);
                    if (!checked) {
                      setValue('daysOffList', [], { shouldValidate: true });
                    }
                  }}
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
                  onChange={(event) => {
                    const checked = event.target.checked;
                    field.onChange(checked);
                    if (!checked) {
                      setValue('datesOffList', [], { shouldValidate: true });
                    }
                  }}
                  sx={{ color: PROGRAM_TEAL, '&.Mui-checked': { color: PROGRAM_TEAL } }}
                />
              }
              label={t('ADD_PROGRAM.CUSTOM_DATES')}
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

      {daysOffCustom ? (
        <Box sx={{ mt: daysOffRecurring ? 2 : 0 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 1.5,
              mb: 1.5,
            }}
          >
            {datesOffList.map((date, index) => (
              <SelectedDateTag
                key={`${date.toISOString()}-${index}`}
                date={date}
                onRemove={() => handleRemoveDate(index)}
              />
            ))}
          </Box>

          <Box sx={{ display: 'inline-block' }}>
            <Box
              ref={calendarAnchorRef}
              component="button"
              type="button"
              onClick={() => setDatePickerOpen(true)}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.75,
                boxSizing: 'border-box',
                width: 116,
                minWidth: 116,
                height: 28,
                minHeight: 28,
                px: 1,
                py: 0,
                borderRadius: '8px',
                border: '1px dotted',
                borderColor: ADD_BOX_TEXT_COLOR,
                bgcolor: 'transparent',
                color: ADD_BOX_TEXT_COLOR,
                fontSize: 16,
                fontWeight: 500,
                fontFamily: 'inherit',
                lineHeight: 1,
                cursor: 'pointer',
                outline: 'none',
                whiteSpace: 'nowrap',
                '&:hover': {
                  borderColor: ADD_BOX_TEXT_COLOR,
                  bgcolor: 'transparent',
                  color: ADD_BOX_TEXT_COLOR,
                },
              }}
            >
              <Iconify
                icon="solar:calendar-linear"
                width={16}
                sx={{ color: ADD_BOX_TEXT_COLOR, flexShrink: 0, pointerEvents: 'none' }}
              />
              <Box component="span" sx={{ pointerEvents: 'none' }}>
                {t('ADD_PROGRAM.ADD_DATES')}
              </Box>
            </Box>

            <Popover
              open={datePickerOpen}
              anchorEl={calendarAnchorRef.current}
              onClose={() => setDatePickerOpen(false)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              PaperProps={{ sx: { mt: 0.5 } }}
            >
              <DateCalendar
                slotProps={{
                  day: programDatePickerDaySlotProps,
                }}
                onChange={handleAddDate}
              />
            </Popover>
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}
