'use client';

import { useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { useTranslate } from 'src/locales';
import { useTranslation } from 'react-i18next';

import RequiredLabel from './required-label';
import { CALENDAR_SELECTED_COLOR } from '../constants';
import { programFieldSx, programPlaceholderTextSx } from '../styles';
import type { CategoryOption, ProgramFormValues } from '../types';

type Props = {
  categories: CategoryOption[];
};

export default function CategorySelectField({ categories }: Props) {
  const { t } = useTranslate();
  const { i18n } = useTranslation();
  const { control } = useFormContext<ProgramFormValues>();

  const getCategoryName = (category: CategoryOption) => {
    if (i18n.language === 'ar') {
      return category.name_ar || category.name;
    }
    return category.name_en || category.name;
  };

  const activeCategories = useMemo(
    () => categories.filter((category) => category.is_active !== false),
    [categories]
  );

  return (
    <>
      <RequiredLabel required>{t('ADD_PROGRAM.ACTIVE_CATEGORIES')}</RequiredLabel>
      <Controller
        name="field_id"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            select
            fullWidth
            error={!!error}
            helperText={error ? t(String(error.message)) : undefined}
            sx={programFieldSx}
            SelectProps={{
              displayEmpty: true,
              renderValue: (value) => {
                if (!value) {
                  return (
                    <Box component="span" sx={programPlaceholderTextSx}>
                      {t('ADD_PROGRAM.ACTIVE_CATEGORIES')}
                    </Box>
                  );
                }
                const category = categories.find((item) => item.id === value);
                return category ? getCategoryName(category) : '';
              },
            }}
          >
            {activeCategories.map((category) => {
              const selected = field.value === category.id;

              return (
                <MenuItem key={category.id} value={category.id}>
                  <Checkbox
                    checked={selected}
                    size="small"
                    disableRipple
                    tabIndex={-1}
                    sx={{
                      p: 0.5,
                      mr: 1,
                      color: CALENDAR_SELECTED_COLOR,
                      '&.Mui-checked': { color: CALENDAR_SELECTED_COLOR },
                    }}
                  />
                  {getCategoryName(category)}
                </MenuItem>
              );
            })}
          </TextField>
        )}
      />
    </>
  );
}
