'use client';

import { useEffect, useRef, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useTranslate } from 'src/locales';

import Iconify from 'src/components/iconify';

import DaySelector from './day-selector';
import MultiDateCalendarPopover from './multi-date-calendar-popover';
import RequiredLabel from './required-label';
import SelectedDateGroupTag from './selected-date-group-tag';
import { ADD_BOX_TEXT_COLOR, PROGRAM_TEAL } from '../constants';
import { programRadioControlLabelSx } from '../styles';
import type { ProgramFormValues } from '../types';
import {
  groupDatesByWeekAndMonth,
  mergeUniqueDates,
  removeDateGroup,
} from '../utils/custom-dates';

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

  const weekGroups = groupDatesByWeekAndMonth(datesOffList);
  const weekLabelFor = (weekNumber: number) =>
    t('ADD_PROGRAM.WEEK_NUMBER', { number: weekNumber });

  useEffect(() => {
    if (daysOffCustom && !prevCustomRef.current) {
      setDatePickerOpen(true);
    }
    if (!daysOffCustom) {
      setDatePickerOpen(false);
    }
    prevCustomRef.current = daysOffCustom;
  }, [daysOffCustom]);

  const handleConfirmDates = (dates: Date[]) => {
    setValue('datesOffList', mergeUniqueDates(datesOffList, dates), { shouldValidate: true });
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
              sx={programRadioControlLabelSx}
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
              sx={programRadioControlLabelSx}
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
            {weekGroups.map((group) => (
              <SelectedDateGroupTag
                key={group.key}
                group={group}
                weekLabel={weekLabelFor(group.weekNumber)}
                onRemove={() =>
                  setValue('datesOffList', removeDateGroup(datesOffList, group), {
                    shouldValidate: true,
                  })
                }
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

            <MultiDateCalendarPopover
              open={datePickerOpen}
              anchorEl={calendarAnchorRef.current}
              onClose={() => setDatePickerOpen(false)}
              onConfirm={handleConfirmDates}
            />
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}
