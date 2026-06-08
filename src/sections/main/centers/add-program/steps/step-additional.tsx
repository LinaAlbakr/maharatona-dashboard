'use client';

import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
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
import RequiredLabel from '../components/required-label';
import WordCountTextarea from '../components/word-count-textarea';
import { EMPTY_MATERIAL, EMPTY_QUESTION, PROGRAM_TEAL } from '../constants';
import { dashedAddButtonSx, innerCardSx, programFieldSx, programSectionTitleSx, programSwitchSx } from '../styles';
import type { FixedProgramFormValues } from '../types';

export default function StepAdditional() {
  const { t } = useTranslate();
  const { control } = useFormContext<FixedProgramFormValues>();

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
      <Typography sx={programSectionTitleSx}>{t('ADD_PROGRAM.QUESTIONS')}</Typography>

      {questionFields.map((field, index) => (
        <Box key={field.id} sx={innerCardSx}>
          <Grid container spacing={2.5}>
            <Grid xs={12} md={6}>
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

            <Grid xs={12} md={6}>
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
              justifyContent: 'space-between',
              gap: 2,
              mt: 2,
            }}
          >
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
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
                <Typography variant="body2">{t('ADD_PROGRAM.REQUIRED')}</Typography>
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
              </Box>
            </Box>

            {questionFields.length > 1 ? (
              <IconButton onClick={() => removeQuestion(index)} sx={{ p: 0.75 }}>
                <DeleteIcon />
              </IconButton>
            ) : null}
          </Box>
        </Box>
      ))}

      <Button
        fullWidth
        variant="outlined"
        startIcon={<Iconify icon="mingcute:add-line" />}
        onClick={() => appendQuestion({ ...EMPTY_QUESTION })}
        sx={dashedAddButtonSx}
      >
        {t('ADD_PROGRAM.ADD_MORE_QUESTIONS')}
      </Button>

      <Typography sx={{ ...programSectionTitleSx, mt: 4 }}>{t('ADD_PROGRAM.ADDONS_MATERIALS')}</Typography>

      {materialFields.map((field, index) => (
        <Box key={field.id} sx={innerCardSx}>
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

            <Grid xs={12} md={6}>
              <WordCountTextarea
                name={`addOnMaterials.${index}.desc_ar`}
                label={t('ADD_PROGRAM.ARABIC_DESCRIPTION')}
                placeholder={t('ADD_PROGRAM.ENTER_DESCRIPTION')}
              />
            </Grid>

            <Grid xs={12} md={6}>
              <WordCountTextarea
                name={`addOnMaterials.${index}.desc_en`}
                label={t('ADD_PROGRAM.ENGLISH_DESCRIPTION')}
                placeholder={t('ADD_PROGRAM.ENTER_DESCRIPTION')}
              />
            </Grid>

            <Grid xs={12}>
              <RequiredLabel required>{t('ADD_PROGRAM.PRICE_VAT')}</RequiredLabel>
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

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2, mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">{t('ADD_PROGRAM.REQUIRED')}</Typography>
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
            </Box>
            {materialFields.length > 1 ? (
              <IconButton onClick={() => removeMaterial(index)} sx={{ p: 0.75 }}>
                <DeleteIcon />
              </IconButton>
            ) : null}
          </Box>
        </Box>
      ))}

      <Button
        fullWidth
        variant="outlined"
        startIcon={<Iconify icon="mingcute:add-line" />}
        onClick={() => appendMaterial({ ...EMPTY_MATERIAL })}
        sx={dashedAddButtonSx}
      >
        {t('ADD_PROGRAM.ADD_MORE_MATERIALS')}
      </Button>
    </Box>
  );
}
