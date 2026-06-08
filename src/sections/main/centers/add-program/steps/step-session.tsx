'use client';

import { Controller, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { TimePicker } from '@mui/x-date-pickers';

import { useTranslate } from 'src/locales';

import Iconify from 'src/components/iconify';

import RequiredLabel from '../components/required-label';
import { GENDER_OPTIONS, PROGRAM_TEAL } from '../constants';
import { programFieldSx } from '../styles';
import type { FixedProgramFormValues } from '../types';

export default function StepSession() {
  const { t } = useTranslate();
  const { control } = useFormContext<FixedProgramFormValues>();

  return (
    <Box>
      <Grid container spacing={2.5}>
        <Grid xs={12} md={6}>
          <RequiredLabel required>{t('ADD_PROGRAM.START_TIME')}</RequiredLabel>
          <Controller
            name="start_time"
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
                  openPickerIcon: () => (
                    <Iconify icon="solar:clock-circle-outline" width={22} sx={{ color: PROGRAM_TEAL }} />
                  ),
                }}
              />
            )}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <RequiredLabel required>{t('ADD_PROGRAM.END_TIME')}</RequiredLabel>
          <Controller
            name="end_time"
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
                  openPickerIcon: () => (
                    <Iconify icon="solar:clock-circle-outline" width={22} sx={{ color: PROGRAM_TEAL }} />
                  ),
                }}
              />
            )}
          />
        </Grid>

        <Grid xs={12}>
          <RequiredLabel required>{t('ADD_PROGRAM.GENDER')}</RequiredLabel>
          <Controller
            name="gender"
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
                {GENDER_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {t(option.labelKey)}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>

        <Grid xs={12}>
          <RequiredLabel required>{t('ADD_PROGRAM.SAME_AGE_RANGE')}</RequiredLabel>
          <Controller
            name="same_age_range"
            control={control}
            render={({ field }) => (
              <RadioGroup
                row
                value={field.value ? 'yes' : 'no'}
                onChange={(event) => field.onChange(event.target.value === 'yes')}
              >
                <FormControlLabel
                  value="yes"
                  control={<Radio sx={{ color: PROGRAM_TEAL, '&.Mui-checked': { color: PROGRAM_TEAL } }} />}
                  label={t('ADD_PROGRAM.YES')}
                />
                <FormControlLabel
                  value="no"
                  control={<Radio sx={{ color: PROGRAM_TEAL, '&.Mui-checked': { color: PROGRAM_TEAL } }} />}
                  label={t('ADD_PROGRAM.NO')}
                />
              </RadioGroup>
            )}
          />
        </Grid>

        <Grid xs={12}>
          <RequiredLabel>{t('ADD_PROGRAM.BOYS')}</RequiredLabel>
        </Grid>

        <Grid xs={12} md={6}>
          <RequiredLabel required>{t('ADD_PROGRAM.AGE_FROM')}</RequiredLabel>
          <Controller
            name="boys_age_from"
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
          <RequiredLabel required>{t('ADD_PROGRAM.AGE_TO')}</RequiredLabel>
          <Controller
            name="boys_age_to"
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

        <Grid xs={12}>
          <RequiredLabel>{t('ADD_PROGRAM.GIRLS')}</RequiredLabel>
        </Grid>

        <Grid xs={12} md={6}>
          <RequiredLabel required>{t('ADD_PROGRAM.AGE_FROM')}</RequiredLabel>
          <Controller
            name="girls_age_from"
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
          <RequiredLabel required>{t('ADD_PROGRAM.AGE_TO')}</RequiredLabel>
          <Controller
            name="girls_age_to"
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

        <Grid xs={12}>
          <RequiredLabel required>{t('ADD_PROGRAM.SEAT_CAPACITY')}</RequiredLabel>
          <Controller
            name="seats"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                fullWidth
                placeholder={t('ADD_PROGRAM.ENTER_SEATS')}
                error={!!error}
                helperText={error ? t(String(error.message)) : undefined}
                sx={programFieldSx}
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
