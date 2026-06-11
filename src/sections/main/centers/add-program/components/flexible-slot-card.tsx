'use client';

import { useMemo, useRef, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import Button from '@mui/material/Button';
import Radio from '@mui/material/Radio';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputAdornment from '@mui/material/InputAdornment';
import { TimePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';

import { useTranslate } from 'src/locales';

import Iconify from 'src/components/iconify';

import { CalendarIcon, ClockIcon, DeleteIcon, RiyalIcon } from './course-icons';
import DaySelector from './day-selector';
import PriceVatLabel from './price-vat-label';
import RequiredLabel from './required-label';
import MultiDateCalendarPopover from './multi-date-calendar-popover';
import SelectedDateGroupTag from './selected-date-group-tag';
import {
  ADD_BOX_TEXT_COLOR,
  FIELD_BORDER_COLOR,
  FLEXIBLE_BOOKING_MODELS,
  GENDER_OPTIONS,
  PROGRAM_SECTION_HEADING_COLOR,
  PROGRAM_TEAL,
} from '../constants';
import { innerCardSx, programFieldSx, programRadioLabelSx } from '../styles';
import type { FlexibleBookingModelKey, ProgramFormValues, TimeSlotType } from '../types';
import {
  getDateDisplayGroups,
  mergeUniqueDates,
  removeDateGroup,
} from '../utils/custom-dates';
import { getDaysOffRestrictions } from '../utils/days-off-restrictions';

type Props = {
  modelKey: FlexibleBookingModelKey;
  slotIndex: number;
  timeType: TimeSlotType;
  onRemove?: () => void;
};

type SlotAgeRangeFieldsProps = {
  basePath: `flexibleModels.${FlexibleBookingModelKey}.slots.${number}`;
  fromName: 'age_from';
  toName: 'age_to';
};

function SlotAgeRangeFields({ basePath, fromName, toName }: SlotAgeRangeFieldsProps) {
  const { t } = useTranslate();
  const { control } = useFormContext<ProgramFormValues>();

  return (
    <Grid xs={12} data-field={`${basePath}.${toName}`}>
      <Box
        sx={{
          display: 'flex',
          gap: 2.5,
          width: 1,
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <RequiredLabel required size="sm">
            {t('ADD_PROGRAM.AGE_FROM')}
          </RequiredLabel>
          <Controller
            name={`${basePath}.${fromName}`}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                fullWidth
                placeholder={t('ADD_PROGRAM.MINIMUM')}
                error={!!error}
                helperText={error ? t(String(error.message)) : undefined}
                sx={programFieldSx}
              />
            )}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <RequiredLabel required size="sm">
            {t('ADD_PROGRAM.AGE_TO')}
          </RequiredLabel>
          <Controller
            name={`${basePath}.${toName}`}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                fullWidth
                placeholder={t('ADD_PROGRAM.MAXIMUM')}
                error={!!error}
                helperText={error ? t(String(error.message)) : undefined}
                sx={programFieldSx}
              />
            )}
          />
        </Box>
      </Box>
    </Grid>
  );
}

export default function FlexibleSlotCard({ modelKey, slotIndex, timeType, onRemove }: Props) {
  const { t } = useTranslate();
  const { control, watch, setValue, getFieldState, formState } = useFormContext<ProgramFormValues>();

  const modelConfig = FLEXIBLE_BOOKING_MODELS.find((m) => m.key === modelKey)!;
  const basePath = `flexibleModels.${modelKey}.slots.${slotIndex}` as const;
  const recurringDays = watch(`${basePath}.recurring_days`);
  const customDates = watch(`${basePath}.custom_dates`) || [];
  const daysOffRecurring = watch('daysOffRecurring');
  const daysOffCustom = watch('daysOffCustom');
  const daysOffList = watch('daysOffList');
  const datesOffList = watch('datesOffList');

  const daysOffRestrictions = useMemo(
    () =>
      getDaysOffRestrictions({
        daysOffRecurring,
        daysOffCustom,
        daysOffList,
        datesOffList,
      }),
    [daysOffRecurring, daysOffCustom, daysOffList, datesOffList]
  );

  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const addDatesRef = useRef<HTMLButtonElement>(null);

  const seatLabelKey = getSeatCapacityLabel(modelKey, timeType);
  const priceLabelKey = getPriceLabel(modelKey, timeType);
  const customDatesError = getFieldState(`${basePath}.custom_dates`, formState).error;

  const slotDates = customDates
    .map((entry) => entry.date)
    .filter((date): date is Date => date instanceof Date);
  const isWeeklyModel = modelKey === 'weekly';
  const dateGroups = getDateDisplayGroups(slotDates, isWeeklyModel);
  const weekLabelFor = (weekNumber: number) =>
    t('ADD_PROGRAM.WEEK_NUMBER', { number: weekNumber });

  const setSlotDates = (dates: Date[]) => {
    setValue(
      `${basePath}.custom_dates`,
      dates.map((date, index) => ({
        id: `${date.getTime()}-${index}`,
        date,
        label: format(date, 'yyyy-MM-dd'),
      })),
      { shouldValidate: true }
    );
  };

  const handleConfirmDates = (dates: Date[]) => {
    setSlotDates(mergeUniqueDates(slotDates, dates));
  };

  return (
    <Box sx={innerCardSx}>
      <Grid container spacing={2.5}>
        <Grid xs={12} md={6}>
          <RequiredLabel>{t('ADD_PROGRAM.TITLE_AR')}</RequiredLabel>
          <Controller
            name={`${basePath}.title_ar`}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                fullWidth
                placeholder={t('ADD_PROGRAM.SLOT_TITLE_PLACEHOLDER')}
                error={!!error}
                helperText={error ? t(String(error.message)) : undefined}
                sx={programFieldSx}
              />
            )}
          />
        </Grid>
        <Grid xs={12} md={6}>
          <RequiredLabel>{t('ADD_PROGRAM.TITLE_EN')}</RequiredLabel>
          <Controller
            name={`${basePath}.title_en`}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                fullWidth
                placeholder={t('ADD_PROGRAM.SLOT_TITLE_PLACEHOLDER')}
                error={!!error}
                helperText={error ? t(String(error.message)) : undefined}
                sx={programFieldSx}
              />
            )}
          />
        </Grid>

        <Grid xs={12}>
          <RequiredLabel required>{t('ADD_PROGRAM.GENDER')}</RequiredLabel>
          <Controller
            name={`${basePath}.gender`}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                select
                fullWidth
                error={!!error}
                helperText={error ? t(String(error.message)) : undefined}
                sx={programFieldSx}
                onChange={(event) => field.onChange(event.target.value)}
              >
                {GENDER_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {t(opt.labelKey)}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>

        <SlotAgeRangeFields basePath={basePath} fromName="age_from" toName="age_to" />

        {modelConfig.hasRecurring && modelConfig.hasFixStartDate ? (
          <Grid xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Box>
                <RequiredLabel required>{t('ADD_PROGRAM.RECURRING_DAYS')}</RequiredLabel>
                <Controller
                  name={`${basePath}.recurring_days`}
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      row
                      value={field.value ? 'yes' : 'no'}
                      onChange={(e) => field.onChange(e.target.value === 'yes')}
                    >
                      <FormControlLabel
                        value="yes"
                        control={
                          <Radio sx={{ color: PROGRAM_TEAL, '&.Mui-checked': { color: PROGRAM_TEAL } }} />
                        }
                        label={t('ADD_PROGRAM.YES')}
                        sx={programRadioLabelSx}
                      />
                      <FormControlLabel
                        value="no"
                        control={
                          <Radio sx={{ color: PROGRAM_TEAL, '&.Mui-checked': { color: PROGRAM_TEAL } }} />
                        }
                        label={t('ADD_PROGRAM.NO')}
                        sx={programRadioLabelSx}
                      />
                    </RadioGroup>
                  )}
                />
              </Box>

              <Box
                sx={{
                  width: '1px',
                  alignSelf: 'stretch',
                  bgcolor: FIELD_BORDER_COLOR,
                  flexShrink: 0,
                }}
              />

              <Box>
                <RequiredLabel required>{t('ADD_PROGRAM.FIX_START_DATE')}</RequiredLabel>
                <Controller
                  name={`${basePath}.fixed_start_date`}
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      row
                      value={field.value ? 'yes' : 'no'}
                      onChange={(e) => field.onChange(e.target.value === 'yes')}
                    >
                      <FormControlLabel
                        value="yes"
                        control={
                          <Radio sx={{ color: PROGRAM_TEAL, '&.Mui-checked': { color: PROGRAM_TEAL } }} />
                        }
                        label={t('ADD_PROGRAM.YES')}
                        sx={programRadioLabelSx}
                      />
                      <FormControlLabel
                        value="no"
                        control={
                          <Radio sx={{ color: PROGRAM_TEAL, '&.Mui-checked': { color: PROGRAM_TEAL } }} />
                        }
                        label={t('ADD_PROGRAM.NO')}
                        sx={programRadioLabelSx}
                      />
                    </RadioGroup>
                  )}
                />
              </Box>
            </Box>
          </Grid>
        ) : (
          <>
            {modelConfig.hasRecurring ? (
              <Grid xs={12}>
                <RequiredLabel required>{t('ADD_PROGRAM.RECURRING_DAYS')}</RequiredLabel>
                <Controller
                  name={`${basePath}.recurring_days`}
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      row
                      value={field.value ? 'yes' : 'no'}
                      onChange={(e) => field.onChange(e.target.value === 'yes')}
                    >
                      <FormControlLabel
                        value="yes"
                        control={
                          <Radio sx={{ color: PROGRAM_TEAL, '&.Mui-checked': { color: PROGRAM_TEAL } }} />
                        }
                        label={t('ADD_PROGRAM.YES')}
                        sx={programRadioLabelSx}
                      />
                      <FormControlLabel
                        value="no"
                        control={
                          <Radio sx={{ color: PROGRAM_TEAL, '&.Mui-checked': { color: PROGRAM_TEAL } }} />
                        }
                        label={t('ADD_PROGRAM.NO')}
                        sx={programRadioLabelSx}
                      />
                    </RadioGroup>
                  )}
                />
              </Grid>
            ) : null}

            {modelConfig.hasFixStartDate ? (
              <Grid xs={12}>
                <RequiredLabel required>{t('ADD_PROGRAM.FIX_START_DATE')}</RequiredLabel>
                <Controller
                  name={`${basePath}.fixed_start_date`}
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      row
                      value={field.value ? 'yes' : 'no'}
                      onChange={(e) => field.onChange(e.target.value === 'yes')}
                    >
                      <FormControlLabel
                        value="yes"
                        control={
                          <Radio sx={{ color: PROGRAM_TEAL, '&.Mui-checked': { color: PROGRAM_TEAL } }} />
                        }
                        label={t('ADD_PROGRAM.YES')}
                        sx={programRadioLabelSx}
                      />
                      <FormControlLabel
                        value="no"
                        control={
                          <Radio sx={{ color: PROGRAM_TEAL, '&.Mui-checked': { color: PROGRAM_TEAL } }} />
                        }
                        label={t('ADD_PROGRAM.NO')}
                        sx={programRadioLabelSx}
                      />
                    </RadioGroup>
                  )}
                />
              </Grid>
            ) : null}
          </>
        )}

        {modelConfig.hasRecurring && !recurringDays ? (
          <Grid xs={12} data-field={`${basePath}.custom_dates`}>
            <RequiredLabel required>{t('ADD_PROGRAM.SELECT_DATES')}</RequiredLabel>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
              {dateGroups.map((group) => (
                <SelectedDateGroupTag
                  key={group.key}
                  group={group}
                  weekLabel={
                    isWeeklyModel && 'weekNumber' in group
                      ? weekLabelFor(group.weekNumber)
                      : undefined
                  }
                  onRemove={() => setSlotDates(removeDateGroup(slotDates, group))}
                />
              ))}
            </Box>
            <Box sx={{ display: 'inline-block' }}>
              <Box
                ref={addDatesRef}
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
                anchorEl={addDatesRef.current}
                onClose={() => setDatePickerOpen(false)}
                onConfirm={handleConfirmDates}
                daysOffRestrictions={daysOffRestrictions}
              />
            </Box>
            {customDatesError ? (
              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                {t(String(customDatesError.message))}
              </Typography>
            ) : null}
          </Grid>
        ) : (
          <Grid xs={12}>
            <RequiredLabel required>{t('ADD_PROGRAM.SELECT_DAYS')}</RequiredLabel>
            <Controller
              name={`${basePath}.selected_days`}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Box data-field={`${basePath}.selected_days`}>
                  <DaySelector
                    value={field.value || []}
                    onChange={field.onChange}
                    disabledDays={daysOffRestrictions.disabledWeekdays}
                  />
                  {error ? (
                    <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                      {t(String(error.message))}
                    </Typography>
                  ) : null}
                </Box>
              )}
            />
          </Grid>
        )}

        <Grid xs={12} md={6}>
          <RequiredLabel required>{t('ADD_PROGRAM.START_TIME')}</RequiredLabel>
          <Controller
            name={`${basePath}.start_time`}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TimePicker
                value={field.value}
                onChange={(value) => field.onChange(value)}
                ampm={false}
                format="HH:mm"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    placeholder: '00:00',
                    error: !!error,
                    helperText: error ? t(String(error.message)) : undefined,
                    sx: programFieldSx,
                  },
                }}
                slots={{
                  openPickerIcon: ClockIcon,
                }}
              />
            )}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <RequiredLabel required>{t('ADD_PROGRAM.END_TIME')}</RequiredLabel>
          <Controller
            name={`${basePath}.end_time`}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TimePicker
                value={field.value}
                onChange={(value) => field.onChange(value)}
                ampm={false}
                format="HH:mm"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    placeholder: '00:00',
                    error: !!error,
                    helperText: error ? t(String(error.message)) : undefined,
                    sx: programFieldSx,
                  },
                }}
                slots={{
                  openPickerIcon: ClockIcon,
                }}
              />
            )}
          />
        </Grid>

        {modelConfig.hasTimeType && timeType === 'fixed' ? (
          <>
            <Grid xs={12} md={6}>
              <RequiredLabel required>{t('ADD_PROGRAM.DURATION')}</RequiredLabel>
              <Controller
                name={`${basePath}.class_time`}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    placeholder={t('ADD_PROGRAM.MINUTES_PLACEHOLDER')}
                    error={!!error}
                    helperText={error ? t(String(error.message)) : undefined}
                    sx={programFieldSx}
                  />
                )}
              />
            </Grid>

            <Grid xs={12} md={6}>
              <RequiredLabel required>{t(seatLabelKey)}</RequiredLabel>
              <Controller
                name={`${basePath}.seat_capacity`}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    error={!!error}
                    helperText={error ? t(String(error.message)) : undefined}
                    sx={programFieldSx}
                  />
                )}
              />
            </Grid>

            {modelKey !== 'trial' ? (
              <Grid xs={12}>
                <PriceVatLabel required labelKey={priceLabelKey} />
                <Controller
                  name={`${basePath}.price`}
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      error={!!error}
                      helperText={error ? t(String(error.message)) : undefined}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <RiyalIcon />
                          </InputAdornment>
                        ),
                      }}
                      sx={programFieldSx}
                    />
                  )}
                />
              </Grid>
            ) : null}
          </>
        ) : modelKey === 'daily' || modelKey === 'weekly' ? (
          <>
            <Grid xs={12} md={6}>
              <RequiredLabel required>{t(seatLabelKey)}</RequiredLabel>
              <Controller
                name={`${basePath}.seat_capacity`}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    error={!!error}
                    helperText={error ? t(String(error.message)) : undefined}
                    sx={programFieldSx}
                  />
                )}
              />
            </Grid>

            <Grid xs={12} md={6}>
              <PriceVatLabel required labelKey={priceLabelKey} />
              <Controller
                name={`${basePath}.price`}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    error={!!error}
                    helperText={error ? t(String(error.message)) : undefined}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <RiyalIcon />
                        </InputAdornment>
                      ),
                    }}
                    sx={programFieldSx}
                  />
                )}
              />
            </Grid>
          </>
        ) : (
          <>
            {modelKey !== 'trial' ? (
              <Grid xs={12} md={6}>
                <PriceVatLabel required labelKey={priceLabelKey} />
                <Controller
                  name={`${basePath}.price`}
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      error={!!error}
                      helperText={error ? t(String(error.message)) : undefined}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <RiyalIcon />
                          </InputAdornment>
                        ),
                      }}
                      sx={programFieldSx}
                    />
                  )}
                />
              </Grid>
            ) : null}

            <Grid xs={12} md={6}>
              <RequiredLabel required>{t(seatLabelKey)}</RequiredLabel>
              <Controller
                name={`${basePath}.seat_capacity`}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    error={!!error}
                    helperText={error ? t(String(error.message)) : undefined}
                    sx={programFieldSx}
                  />
                )}
              />
            </Grid>
          </>
        )}
      </Grid>

      {onRemove ? (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
          <IconButton onClick={onRemove} sx={{ p: 0.75 }}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ) : null}
    </Box>
  );
}

function getSeatCapacityLabel(modelKey: FlexibleBookingModelKey, timeType: TimeSlotType): string {
  if (modelKey === 'trial') return 'ADD_PROGRAM.SEAT_CAPACITY';
  if (modelKey === 'minutes' || modelKey === 'hourly') {
    return timeType === 'open'
      ? 'ADD_PROGRAM.SEAT_CAPACITY_OPEN_PERIOD'
      : 'ADD_PROGRAM.SEAT_CAPACITY_PER_SLOT';
  }
  if (modelKey === 'daily') return 'ADD_PROGRAM.SEAT_CAPACITY_PER_DAY';
  if (modelKey === 'weekly') return 'ADD_PROGRAM.SEAT_CAPACITY_PER_WEEK';
  if (modelKey === 'monthly') return 'ADD_PROGRAM.SEAT_CAPACITY_PER_MONTH';
  return 'ADD_PROGRAM.SEAT_CAPACITY';
}

function getPriceLabel(modelKey: FlexibleBookingModelKey, timeType: TimeSlotType): string {
  if (modelKey === 'minutes') {
    return timeType === 'open'
      ? 'ADD_PROGRAM.PRICE_PER_15_MIN'
      : 'ADD_PROGRAM.PRICE_PER_SLOT';
  }
  if (modelKey === 'hourly') {
    return timeType === 'open'
      ? 'ADD_PROGRAM.PRICE_PER_HOUR'
      : 'ADD_PROGRAM.PRICE_PER_SLOT';
  }
  if (modelKey === 'daily') return 'ADD_PROGRAM.PRICE_PER_DAY';
  if (modelKey === 'weekly') return 'ADD_PROGRAM.PRICE_PER_WEEK';
  if (modelKey === 'monthly') return 'ADD_PROGRAM.PRICE_PER_MONTH';
  return 'ADD_PROGRAM.PRICE_VAT';
}
