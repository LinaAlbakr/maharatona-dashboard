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

import { ClockIcon } from '../components/course-icons';
import RequiredLabel from '../components/required-label';
import { GENDER_OPTIONS, PROGRAM_TEAL } from '../constants';
import { programFieldSx, programRadioLabelSx } from '../styles';
import type { ProgramFormValues } from '../types';
import { parseFormBoolean } from '../utils/course-api-helpers';

type AgeRangeFieldsProps = {
  fromName: 'boys_age_from' | 'girls_age_from';
  toName: 'boys_age_to' | 'girls_age_to';
  sectionLabel?: string;
};

function AgeRangeFields({ fromName, toName, sectionLabel }: AgeRangeFieldsProps) {
  const { t } = useTranslate();
  const { control } = useFormContext<ProgramFormValues>();

  return (
    <Grid xs={12} data-field={toName}>
      {sectionLabel ? (
        <RequiredLabel sx={{ mb: 0.75, fontWeight: 700 }}>{sectionLabel}</RequiredLabel>
      ) : null}
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
            name={fromName}
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
            name={toName}
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

export default function StepSession() {
  const { t } = useTranslate();
  const { control, watch, setValue } = useFormContext<ProgramFormValues>();
  const gender = watch('gender');
  const sameAgeRange = watch('same_age_range');

  const isMixed = gender === 'Mixed';
  const showSameAgeRange = isMixed;
  const showSharedAgeField = isMixed && sameAgeRange;
  const showBoysAgeRange = isMixed && !sameAgeRange;
  const showGirlsAgeRange = isMixed && !sameAgeRange;
  const showSingleGenderAgeRange = !isMixed;

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
                  openPickerIcon: ClockIcon,
                }}
              />
            )}
          />
        </Grid>

        <Grid xs={12} md={6} data-field="end_time">
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
                  openPickerIcon: ClockIcon,
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
                onChange={(event) => {
                  const nextGender = event.target.value;
                  field.onChange(nextGender);
                  if (nextGender !== 'Mixed') {
                    setValue('same_age_range', false);
                  }
                }}
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

        {showSameAgeRange ? (
          <Grid xs={12}>
            <RequiredLabel required sx={{ fontWeight: 700 }}>
              {t('ADD_PROGRAM.SAME_AGE_RANGE')}
            </RequiredLabel>
            <Controller
              name="same_age_range"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  row
                  value={parseFormBoolean(field.value) ? 'yes' : 'no'}
                  onChange={(event) => {
                    const isYes = event.target.value === 'yes';
                    field.onChange(isYes);
                    if (isYes) {
                      setValue('girls_age_from', '');
                      setValue('girls_age_to', '');
                    }
                  }}
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

        {showSharedAgeField ? (
          <AgeRangeFields fromName="boys_age_from" toName="boys_age_to" />
        ) : null}

        {showBoysAgeRange ? (
          <AgeRangeFields
            fromName="boys_age_from"
            toName="boys_age_to"
            sectionLabel={t('ADD_PROGRAM.BOYS')}
          />
        ) : null}

        {showGirlsAgeRange ? (
          <AgeRangeFields
            fromName="girls_age_from"
            toName="girls_age_to"
            sectionLabel={t('ADD_PROGRAM.GIRLS')}
          />
        ) : null}

        {showSingleGenderAgeRange ? (
          <AgeRangeFields
            fromName={gender === 'Girls' ? 'girls_age_from' : 'boys_age_from'}
            toName={gender === 'Girls' ? 'girls_age_to' : 'boys_age_to'}
          />
        ) : null}

        <Grid xs={12} data-field="seats">
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
