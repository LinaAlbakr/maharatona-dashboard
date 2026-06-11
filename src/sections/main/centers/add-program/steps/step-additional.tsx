'use client';

import { useEffect } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Unstable_Grid2';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'src/locales';

import Iconify from 'src/components/iconify';

import { DeleteIcon, RiyalIcon } from '../components/course-icons';
import PriceVatLabel from '../components/price-vat-label';
import RequiredLabel from '../components/required-label';
import WordCountTextarea from '../components/word-count-textarea';
import {
  EMPTY_MATERIAL,
  EMPTY_QUESTION,
  FIELD_LABEL_COLOR,
  PROGRAM_TEAL,
  STEP_INACTIVE_COLOR,
} from '../constants';
import {
  dashedAddButtonSx,
  disabledProgramSectionSx,
  programFieldSx,
  programItemCardSx,
  programStepHeadingSx,
  programSwitchSx,
} from '../styles';
import type { ProgramFormValues } from '../types';
import { isTrialBookingActive } from '../utils/flexible-model-config';
import { applyTrialBookingSideEffects } from '../utils/trial-booking-side-effects';

export default function StepAdditional() {
  const { t } = useTranslate();
  const { control, watch, setValue } = useFormContext<ProgramFormValues>();
  const bookingType = watch('bookingType');
  const flexibleModels = watch('flexibleModels');
  const isTrialActive = isTrialBookingActive(bookingType, flexibleModels);

  useEffect(() => {
    if (!isTrialActive) return;
    applyTrialBookingSideEffects(setValue);
  }, [isTrialActive, setValue]);

  const {
    fields: questionFields,
    append: appendQuestion,
    remove: removeQuestion,
  } = useFieldArray({ control, name: 'additional_questions' });

  const {
    fields: materialFields,
    append: appendMaterial,
    remove: removeMaterial,
  } = useFieldArray({ control, name: 'addOnMaterials' });

  return (
    <Box>
      <Typography sx={programStepHeadingSx}>{t('ADD_PROGRAM.QUESTIONS')}</Typography>

      {questionFields.map((field, index) => (
        <Card key={field.id} sx={programItemCardSx}>
          <Grid container spacing={2.5}>
            <Grid xs={12}>
              <RequiredLabel required>{t('ADD_PROGRAM.QUESTION_AR')}</RequiredLabel>
              <Controller
                name={`additional_questions.${index}.question_ar`}
                control={control}
                render={({ field: inputField, fieldState: { error } }) => (
                  <TextField
                    {...inputField}
                    fullWidth
                    placeholder={t('ADD_PROGRAM.ENTER_QUESTION')}
                    error={!!error}
                    helperText={error ? t(String(error.message)) : undefined}
                    sx={programFieldSx}
                  />
                )}
              />
            </Grid>

            <Grid xs={12}>
              <RequiredLabel required>{t('ADD_PROGRAM.QUESTION_EN')}</RequiredLabel>
              <Controller
                name={`additional_questions.${index}.question_en`}
                control={control}
                render={({ field: inputField, fieldState: { error } }) => (
                  <TextField
                    {...inputField}
                    fullWidth
                    placeholder={t('ADD_PROGRAM.ENTER_QUESTION')}
                    error={!!error}
                    helperText={error ? t(String(error.message)) : undefined}
                    sx={programFieldSx}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 2,
              mt: 2,
            }}
          >
            <Controller
              name={`additional_questions.${index}.isFill`}
              control={control}
              render={({ field: inputField }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={inputField.value}
                      onChange={(event) => inputField.onChange(event.target.checked)}
                      sx={{ color: PROGRAM_TEAL, '&.Mui-checked': { color: PROGRAM_TEAL } }}
                    />
                  }
                  label={t('ADD_PROGRAM.FILL')}
                />
              )}
            />
            <Controller
              name={`additional_questions.${index}.isYesNo`}
              control={control}
              render={({ field: inputField }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={inputField.value}
                      onChange={(event) => inputField.onChange(event.target.checked)}
                      sx={{ color: PROGRAM_TEAL, '&.Mui-checked': { color: PROGRAM_TEAL } }}
                    />
                  }
                  label={t('ADD_PROGRAM.YES_NO')}
                />
              )}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Controller
                name={`additional_questions.${index}.required`}
                control={control}
                render={({ field: inputField }) => (
                  <Switch
                    checked={inputField.value}
                    onChange={(event) => inputField.onChange(event.target.checked)}
                    sx={programSwitchSx}
                  />
                )}
              />
              <Typography variant="body2" sx={{ color: FIELD_LABEL_COLOR, fontWeight: 500 }}>
                {t('ADD_PROGRAM.REQUIRED')}
              </Typography>
            </Box>
            {questionFields.length > 1 ? (
              <>
                <Typography sx={{ color: 'grey.400', fontWeight: 300, userSelect: 'none' }}>|</Typography>
                <IconButton onClick={() => removeQuestion(index)} sx={{ p: 0.75 }}>
                  <DeleteIcon />
                </IconButton>
              </>
            ) : null}
          </Box>
        </Card>
      ))}

      <Button
        fullWidth
        variant="outlined"
        startIcon={<Iconify icon="mingcute:add-line" />}
        onClick={() => appendQuestion({ ...EMPTY_QUESTION })}
        sx={{ ...dashedAddButtonSx, mb: 0 }}
      >
        {t('ADD_PROGRAM.ADD_MORE_QUESTIONS')}
      </Button>

      <Box sx={isTrialActive ? disabledProgramSectionSx : undefined}>
        <Typography
          sx={{
            ...programStepHeadingSx,
            mt: 4,
            ...(isTrialActive ? { color: STEP_INACTIVE_COLOR } : {}),
          }}
        >
          {t('ADD_PROGRAM.ADDONS_MATERIALS')}
        </Typography>

      {materialFields.map((field, index) => (
        <Card key={field.id} sx={programItemCardSx}>
          <Grid container spacing={2.5}>
            <Grid xs={12} md={6}>
              <RequiredLabel required>{t('ADD_PROGRAM.NAME_AR')}</RequiredLabel>
              <Controller
                name={`addOnMaterials.${index}.name_ar`}
                control={control}
                render={({ field: inputField, fieldState: { error } }) => (
                  <TextField
                    {...inputField}
                    fullWidth
                    placeholder={t('ADD_PROGRAM.TYPE_NAME')}
                    error={!!error}
                    helperText={error ? t(String(error.message)) : undefined}
                    sx={programFieldSx}
                  />
                )}
              />
            </Grid>

            <Grid xs={12} md={6}>
              <RequiredLabel required>{t('ADD_PROGRAM.NAME_EN')}</RequiredLabel>
              <Controller
                name={`addOnMaterials.${index}.name_en`}
                control={control}
                render={({ field: inputField, fieldState: { error } }) => (
                  <TextField
                    {...inputField}
                    fullWidth
                    placeholder={t('ADD_PROGRAM.TYPE_NAME')}
                    error={!!error}
                    helperText={error ? t(String(error.message)) : undefined}
                    sx={programFieldSx}
                  />
                )}
              />
            </Grid>

            <Grid xs={12}>
              <WordCountTextarea
                name={`addOnMaterials.${index}.desc_ar`}
                label={t('ADD_PROGRAM.ARABIC_DESCRIPTION')}
                placeholder={t('ADD_PROGRAM.ENTER_DESCRIPTION')}
              />
            </Grid>

            <Grid xs={12}>
              <WordCountTextarea
                name={`addOnMaterials.${index}.desc_en`}
                label={t('ADD_PROGRAM.ENGLISH_DESCRIPTION')}
                placeholder={t('ADD_PROGRAM.ENTER_DESCRIPTION')}
              />
            </Grid>

            <Grid xs={12}>
              <PriceVatLabel required labelKey="ADD_PROGRAM.PRICE_VAT" />
              <Controller
                name={`addOnMaterials.${index}.price`}
                control={control}
                render={({ field: inputField, fieldState: { error } }) => (
                  <TextField
                    {...inputField}
                    fullWidth
                    placeholder={t('ADD_PROGRAM.ENTER_PRICE')}
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

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 2,
              mt: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Controller
                name={`addOnMaterials.${index}.required`}
                control={control}
                render={({ field: inputField }) => (
                  <Switch
                    checked={inputField.value}
                    onChange={(event) => inputField.onChange(event.target.checked)}
                    sx={programSwitchSx}
                  />
                )}
              />
              <Typography variant="body2" sx={{ color: FIELD_LABEL_COLOR, fontWeight: 500 }}>
                {t('ADD_PROGRAM.REQUIRED')}
              </Typography>
            </Box>
            {materialFields.length > 1 ? (
              <>
                <Typography sx={{ color: 'grey.400', fontWeight: 300, userSelect: 'none' }}>|</Typography>
                <IconButton onClick={() => removeMaterial(index)} sx={{ p: 0.75 }}>
                  <DeleteIcon />
                </IconButton>
              </>
            ) : null}
          </Box>
        </Card>
      ))}

      <Button
        fullWidth
        variant="outlined"
        startIcon={<Iconify icon="mingcute:add-line" />}
        onClick={() => appendMaterial({ ...EMPTY_MATERIAL })}
        disabled={isTrialActive}
        sx={{ ...dashedAddButtonSx, mb: 0 }}
      >
        {t('ADD_PROGRAM.ADD_MORE_MATERIALS')}
      </Button>
      </Box>
    </Box>
  );
}
