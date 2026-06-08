'use client';

import { Controller, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import Chip from '@mui/material/Chip';
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
import { DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';

import { useTranslate } from 'src/locales';

import { CalendarIcon, ClockIcon, DeleteIcon, RiyalIcon } from './course-icons';
import DaySelector from './day-selector';
import PriceVatLabel from './price-vat-label';
import RequiredLabel from './required-label';
import { FLEXIBLE_BOOKING_MODELS, GENDER_OPTIONS, PROGRAM_TEAL } from '../constants';
import { innerCardSx, programFieldSx, programRadioLabelSx } from '../styles';
import type { FlexibleBookingModelKey, ProgramFormValues, TimeSlotType } from '../types';

type Props = {
  modelKey: FlexibleBookingModelKey;
  slotIndex: number;
  timeType: TimeSlotType;
  onRemove?: () => void;
};

export default function FlexibleSlotCard({ modelKey, slotIndex, timeType, onRemove }: Props) {
  const { t } = useTranslate();
  const { control, watch, setValue } = useFormContext<ProgramFormValues>();

  const modelConfig = FLEXIBLE_BOOKING_MODELS.find((m) => m.key === modelKey)!;
  const basePath = `flexibleModels.${modelKey}.slots.${slotIndex}` as const;
  const recurringDays = watch(`${basePath}.recurring_days`);
  const customDates = watch(`${basePath}.custom_dates`) || [];

  const seatLabelKey = getSeatCapacityLabel(modelKey, timeType);
  const priceLabelKey = getPriceLabel(modelKey, timeType);

  const handleAddDate = (date: Date | null) => {
    if (!date) return;
    const label = format(date, 'dd MM dd MMM, yyyy');
    const id = `${Date.now()}-${slotIndex}`;
    setValue(`${basePath}.custom_dates`, [...customDates, { id, date, label }]);
  };

  const handleRemoveDate = (dateId: string) => {
    setValue(
      `${basePath}.custom_dates`,
      customDates.filter((d) => d.id !== dateId)
    );
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
                placeholder="Evening Classes"
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
                placeholder="Evening Classes"
                error={!!error}
                helperText={error ? t(String(error.message)) : undefined}
                sx={programFieldSx}
              />
            )}
          />
        </Grid>

        <Grid xs={12} md={modelConfig.hasRecurring ? 12 : 6}>
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

        <Grid xs={12} md={6}>
          <RequiredLabel required size="sm">
            {t('ADD_PROGRAM.AGE_FROM')}
          </RequiredLabel>
          <Controller
            name={`${basePath}.age_from`}
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
        </Grid>
        <Grid xs={12} md={6}>
          <RequiredLabel required size="sm">
            {t('ADD_PROGRAM.AGE_TO')}
          </RequiredLabel>
          <Controller
            name={`${basePath}.age_to`}
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
        </Grid>

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
                    control={<Radio sx={{ color: PROGRAM_TEAL, '&.Mui-checked': { color: PROGRAM_TEAL } }} />}
                    label={t('ADD_PROGRAM.YES')}
                    sx={programRadioLabelSx}
                  />
                  <FormControlLabel
                    value="no"
                    control={<Radio sx={{ color: PROGRAM_TEAL, '&.Mui-checked': { color: PROGRAM_TEAL } }} />}
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
                    control={<Radio sx={{ color: PROGRAM_TEAL, '&.Mui-checked': { color: PROGRAM_TEAL } }} />}
                    label={t('ADD_PROGRAM.YES')}
                    sx={programRadioLabelSx}
                  />
                  <FormControlLabel
                    value="no"
                    control={<Radio sx={{ color: PROGRAM_TEAL, '&.Mui-checked': { color: PROGRAM_TEAL } }} />}
                    label={t('ADD_PROGRAM.NO')}
                    sx={programRadioLabelSx}
                  />
                </RadioGroup>
              )}
            />
          </Grid>
        ) : null}

        {modelConfig.hasRecurring && !recurringDays ? (
          <Grid xs={12}>
            <RequiredLabel required>{t('ADD_PROGRAM.SELECT_DATES')}</RequiredLabel>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
              {customDates.map((item) => (
                <Chip
                  key={item.id}
                  label={item.label || (item.date ? format(item.date, 'dd MM dd MMM, yyyy') : '')}
                  onDelete={() => handleRemoveDate(item.id)}
                  sx={{
                    bgcolor: PROGRAM_TEAL,
                    color: 'common.white',
                    '& .MuiChip-deleteIcon': { color: 'common.white' },
                  }}
                />
              ))}
            </Box>
            <DatePicker
              onChange={handleAddDate}
              slotProps={{
                textField: {
                  size: 'small',
                  placeholder: t('ADD_PROGRAM.ADD_DATES'),
                  sx: { maxWidth: 200 },
                },
              }}
              slots={{
                openPickerIcon: CalendarIcon,
              }}
            />
          </Grid>
        ) : (
          <Grid xs={12}>
            <RequiredLabel required>{t('ADD_PROGRAM.SELECT_DAYS')}</RequiredLabel>
            <Controller
              name={`${basePath}.selected_days`}
              control={control}
              render={({ field }) => (
                <DaySelector value={field.value || []} onChange={field.onChange} />
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
