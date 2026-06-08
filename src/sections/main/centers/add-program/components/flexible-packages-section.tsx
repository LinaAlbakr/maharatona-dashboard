'use client';

import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { useTranslate } from 'src/locales';

import Iconify from 'src/components/iconify';

import { DeleteIcon, RiyalIcon } from './course-icons';
import RequiredLabel from './required-label';
import { EMPTY_FLEXIBLE_PACKAGE } from '../constants';
import { dashedAddButtonSx, innerCardSx, programFieldSx, programSectionTitleSx } from '../styles';
import type { FlexibleBookingModelKey, ProgramFormValues } from '../types';

type Props = {
  modelKey: FlexibleBookingModelKey;
};

export default function FlexiblePackagesSection({ modelKey }: Props) {
  const { t } = useTranslate();
  const { control } = useFormContext<ProgramFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: `flexibleModels.${modelKey}.packages`,
  });

  return (
    <Box sx={{ mb: 3 }}>
      <Typography sx={programSectionTitleSx}>{t('ADD_PROGRAM.CREATE_PACKAGES')}</Typography>

      {fields.map((field, index) => (
        <Box key={field.id} sx={innerCardSx}>
          <Grid container spacing={2.5}>
            <Grid xs={12} md={6}>
              <RequiredLabel required>{t('ADD_PROGRAM.TITLE_AR')}</RequiredLabel>
              <Controller
                name={`flexibleModels.${modelKey}.packages.${index}.title_ar`}
                control={control}
                render={({ field: inputField, fieldState: { error } }) => (
                  <TextField
                    {...inputField}
                    fullWidth
                    error={!!error}
                    helperText={error ? t(String(error.message)) : undefined}
                    sx={programFieldSx}
                  />
                )}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <RequiredLabel required>{t('ADD_PROGRAM.TITLE_EN')}</RequiredLabel>
              <Controller
                name={`flexibleModels.${modelKey}.packages.${index}.title_en`}
                control={control}
                render={({ field: inputField, fieldState: { error } }) => (
                  <TextField
                    {...inputField}
                    fullWidth
                    error={!!error}
                    helperText={error ? t(String(error.message)) : undefined}
                    sx={programFieldSx}
                  />
                )}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <RequiredLabel required>{t('ADD_PROGRAM.NUMBER_OF_SESSIONS')}</RequiredLabel>
              <Controller
                name={`flexibleModels.${modelKey}.packages.${index}.number_of_classes`}
                control={control}
                render={({ field: inputField, fieldState: { error } }) => (
                  <TextField
                    {...inputField}
                    fullWidth
                    error={!!error}
                    helperText={error ? t(String(error.message)) : undefined}
                    sx={programFieldSx}
                  />
                )}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <RequiredLabel required>{t('ADD_PROGRAM.PRICE_VAT')}</RequiredLabel>
              <Controller
                name={`flexibleModels.${modelKey}.packages.${index}.price`}
                control={control}
                render={({ field: inputField, fieldState: { error } }) => (
                  <TextField
                    {...inputField}
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
          </Grid>

          {fields.length > 1 ? (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <IconButton onClick={() => remove(index)} sx={{ p: 0.75 }}>
                <DeleteIcon />
              </IconButton>
            </Box>
          ) : null}
        </Box>
      ))}

      <Button
        fullWidth
        variant="outlined"
        startIcon={<Iconify icon="mingcute:add-line" />}
        onClick={() => append({ ...EMPTY_FLEXIBLE_PACKAGE })}
        sx={dashedAddButtonSx}
      >
        {t('ADD_PROGRAM.ADD_MORE_PACKAGES')}
      </Button>
    </Box>
  );
}
