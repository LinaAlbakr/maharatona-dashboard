'use client';

import { Controller, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers';

import { useTranslate } from 'src/locales';

import CategorySelectField from '../components/category-select-field';
import { CalendarIcon } from '../components/course-icons';
import DaysOffSection from '../components/days-off-section';
import ProgramImagesUpload from '../components/program-images-upload';
import RequiredLabel from '../components/required-label';
import WordCountTextarea from '../components/word-count-textarea';
import { programDatePickerDaySlotProps, programFieldSx } from '../styles';
import type { CategoryOption, ProgramFormValues } from '../types';
import {
  getProgramEndDateMin,
  getProgramMinSelectableDate,
} from '../utils/course-api-helpers';

type Props = {
  categories: CategoryOption[];
};

export default function StepFlexibleProgram({ categories }: Props) {
  const { t } = useTranslate();
  const { control, watch } = useFormContext<ProgramFormValues>();
  const startDate = watch('start_date');
  const minSelectableDate = getProgramMinSelectableDate();
  const endDateMin = getProgramEndDateMin(startDate);

  return (
    <Box>
      <ProgramImagesUpload />

      <Grid container spacing={2.5} sx={{ mt: 2.5 }}>
        <Grid xs={12} md={6}>
          <RequiredLabel required>{t('ADD_PROGRAM.PROGRAM_NAME_EN')}</RequiredLabel>
          <Controller
            name="name_en"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                fullWidth
                placeholder={t('ADD_PROGRAM.ENTER_NAME')}
                error={!!error}
                helperText={error ? t(String(error.message)) : undefined}
                sx={programFieldSx}
              />
            )}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <RequiredLabel required>{t('ADD_PROGRAM.PROGRAM_NAME_AR')}</RequiredLabel>
          <Controller
            name="name_ar"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                fullWidth
                placeholder={t('ADD_PROGRAM.ENTER_NAME')}
                error={!!error}
                helperText={error ? t(String(error.message)) : undefined}
                sx={programFieldSx}
              />
            )}
          />
        </Grid>

        <Grid xs={12}>
          <WordCountTextarea
            name="desc_en"
            label={t('ADD_PROGRAM.PROGRAM_DESC_EN')}
            placeholder={t('ADD_PROGRAM.ENTER_DESCRIPTION')}
          />
        </Grid>

        <Grid xs={12}>
          <WordCountTextarea
            name="desc_ar"
            label={t('ADD_PROGRAM.PROGRAM_DESC_AR')}
            placeholder={t('ADD_PROGRAM.ENTER_DESCRIPTION')}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <RequiredLabel required>{t('LABEL.START_DATE')}</RequiredLabel>
          <Controller
            name="start_date"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <DatePicker
                value={field.value}
                onChange={(value) => field.onChange(value)}
                format="dd-MM-yyyy"
                minDate={minSelectableDate}
                disablePast
                slotProps={{
                  day: programDatePickerDaySlotProps,
                  textField: {
                    fullWidth: true,
                    placeholder: t('ADD_PROGRAM.START_DATE_PLACEHOLDER'),
                    error: !!error,
                    helperText: error ? t(String(error.message)) : undefined,
                    sx: programFieldSx,
                  },
                }}
                slots={{
                  openPickerIcon: CalendarIcon,
                }}
              />
            )}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <RequiredLabel required>{t('LABEL.END_DATE')}</RequiredLabel>
          <Controller
            name="end_date"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <DatePicker
                value={field.value}
                onChange={(value) => field.onChange(value)}
                format="dd-MM-yyyy"
                minDate={endDateMin}
                disablePast
                slotProps={{
                  day: programDatePickerDaySlotProps,
                  textField: {
                    fullWidth: true,
                    placeholder: t('ADD_PROGRAM.END_DATE_PLACEHOLDER'),
                    error: !!error,
                    helperText: error ? t(String(error.message)) : undefined,
                    sx: programFieldSx,
                  },
                }}
                slots={{
                  openPickerIcon: CalendarIcon,
                }}
              />
            )}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <CategorySelectField categories={categories} />
        </Grid>
      </Grid>

      <DaysOffSection />
    </Box>
  );
}
