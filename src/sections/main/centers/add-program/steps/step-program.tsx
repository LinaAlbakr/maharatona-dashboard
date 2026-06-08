'use client';

import { Controller, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { DatePicker } from '@mui/x-date-pickers';

import { useTranslate } from 'src/locales';
import { useTranslation } from 'react-i18next';

import Iconify from 'src/components/iconify';

import BookingTypeToggle from '../components/booking-type-toggle';
import ProgramImagesUpload from '../components/program-images-upload';
import RequiredLabel from '../components/required-label';
import WordCountTextarea from '../components/word-count-textarea';
import { PROGRAM_TEAL } from '../constants';
import { programFieldSx } from '../styles';
import type { CategoryOption, FixedProgramFormValues } from '../types';

type Props = {
  categories: CategoryOption[];
};

export default function StepProgram({ categories }: Props) {
  const { t } = useTranslate();
  const { i18n } = useTranslation();
  const { control } = useFormContext<FixedProgramFormValues>();

  const getCategoryName = (category: CategoryOption) => {
    if (i18n.language === 'ar') {
      return category.name_ar || category.name;
    }
    return category.name_en || category.name;
  };

  return (
    <Box>
      <ProgramImagesUpload />

      <Grid container spacing={2.5} sx={{ mt: 2.5 }}>
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
          <WordCountTextarea
            name="desc_ar"
            label={t('ADD_PROGRAM.PROGRAM_DESC_AR')}
            placeholder={t('ADD_PROGRAM.ENTER_DESCRIPTION')}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <WordCountTextarea
            name="desc_en"
            label={t('ADD_PROGRAM.PROGRAM_DESC_EN')}
            placeholder={t('ADD_PROGRAM.ENTER_DESCRIPTION')}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <RequiredLabel required>{t('ADD_PROGRAM.PRICE_VAT')}</RequiredLabel>
          <Controller
            name="price"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                fullWidth
                placeholder={t('ADD_PROGRAM.ENTER_PRICE')}
                error={!!error}
                helperText={error ? t(String(error.message)) : undefined}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="solar:wallet-money-bold" width={22} sx={{ color: PROGRAM_TEAL }} />
                    </InputAdornment>
                  ),
                }}
                sx={programFieldSx}
              />
            )}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <RequiredLabel required>{t('LABEL.CATEGORY')}</RequiredLabel>
          <Controller
            name="field_id"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                select
                fullWidth
                displayEmpty
                error={!!error}
                helperText={error ? t(String(error.message)) : undefined}
                sx={programFieldSx}
              >
                <MenuItem value="" disabled>
                  {t('ADD_PROGRAM.CHOOSE_CATEGORY')}
                </MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {getCategoryName(category)}
                  </MenuItem>
                ))}
              </TextField>
            )}
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
                slotProps={{
                  textField: {
                    fullWidth: true,
                    placeholder: t('ADD_PROGRAM.START_DATE_PLACEHOLDER'),
                    error: !!error,
                    helperText: error ? t(String(error.message)) : undefined,
                    sx: programFieldSx,
                  },
                  openPickerIcon: {
                    sx: { color: PROGRAM_TEAL },
                  },
                }}
                slots={{
                  openPickerIcon: () => (
                    <Iconify icon="solar:calendar-mark-bold-duotone" width={22} sx={{ color: PROGRAM_TEAL }} />
                  ),
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
                slotProps={{
                  textField: {
                    fullWidth: true,
                    placeholder: t('ADD_PROGRAM.END_DATE_PLACEHOLDER'),
                    error: !!error,
                    helperText: error ? t(String(error.message)) : undefined,
                    sx: programFieldSx,
                  },
                }}
                slots={{
                  openPickerIcon: () => (
                    <Iconify icon="solar:calendar-mark-bold-duotone" width={22} sx={{ color: PROGRAM_TEAL }} />
                  ),
                }}
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
