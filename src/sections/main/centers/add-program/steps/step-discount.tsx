'use client';

import { useEffect } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Unstable_Grid2';
import Button from '@mui/material/Button';
import Radio from '@mui/material/Radio';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useTranslate } from 'src/locales';

import Iconify from 'src/components/iconify';

import { DeleteIcon } from '../components/course-icons';
import RequiredLabel from '../components/required-label';
import {
  ADD_BOX_TEXT_COLOR,
  EMPTY_DISCOUNT_GROUP,
  EMPTY_DISCOUNT_ROW,
  PROGRAM_FIELD_HEIGHT,
  PROGRAM_TEAL,
  STEP_INACTIVE_COLOR,
} from '../constants';
import {
  dashedAddButtonSx,
  disabledProgramSectionSx,
  innerCardSx,
  programFieldSx,
  programItemCardSx,
  programRadioControlLabelSx,
  programStepHeadingSx,
  programSwitchSx,
} from '../styles';
import type { ProgramFormValues } from '../types';
import { isTrialBookingActive } from '../utils/flexible-model-config';
import { applyTrialBookingSideEffects } from '../utils/trial-booking-side-effects';

export default function StepDiscount() {
  const { t } = useTranslate();
  const { control, watch, setValue } = useFormContext<ProgramFormValues>();
  const bookingType = watch('bookingType');
  const flexibleModels = watch('flexibleModels');
  const isTrialActive = isTrialBookingActive(bookingType, flexibleModels);
  const enableDiscount = watch('enableDiscount');
  const discountType = watch('discount_type');

  useEffect(() => {
    if (!isTrialActive) return;
    applyTrialBookingSideEffects(setValue);
  }, [isTrialActive, setValue]);

  const { fields: discountGroups, append: appendDiscountGroup } = useFieldArray({
    control,
    name: 'discount',
  });

  return (
    <Box sx={isTrialActive ? disabledProgramSectionSx : undefined}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography
          sx={{
            ...programStepHeadingSx,
            mb: 0,
            ...(isTrialActive ? { color: STEP_INACTIVE_COLOR } : {}),
          }}
        >
          {t('ADD_PROGRAM.ENABLE_DISCOUNT')}
        </Typography>
        <Controller
          name="enableDiscount"
          control={control}
          render={({ field }) => (
            <Switch
              checked={field.value}
              disabled={isTrialActive}
              onChange={(event) => {
                const checked = event.target.checked;
                field.onChange(checked);
                if (!checked) {
                  setValue('discount_amount', '');
                  setValue('discount', [{ ...EMPTY_DISCOUNT_GROUP }]);
                }
              }}
              sx={programSwitchSx}
            />
          )}
        />
      </Box>

      {enableDiscount && !isTrialActive ? (
        <Box>
          <Controller
            name="discount_type"
            control={control}
            render={({ field }) => (
              <>
                <Card sx={programItemCardSx}>
                  <FormControlLabel
                    value="total"
                    control={
                      <Radio
                        checked={field.value === 'total'}
                        onChange={() => {
                          field.onChange('total');
                          setValue('discount', [{ ...EMPTY_DISCOUNT_GROUP }]);
                        }}
                        sx={{ color: PROGRAM_TEAL, '&.Mui-checked': { color: PROGRAM_TEAL } }}
                      />
                    }
                    label={t('ADD_PROGRAM.TOTAL_DISCOUNT')}
                    sx={programRadioControlLabelSx}
                  />
                  {discountType === 'total' ? (
                    <Box sx={{ width: 1, mt: 1.5 }}>
                      <Controller
                        name="discount_amount"
                        control={control}
                        render={({ field: amountField, fieldState: { error } }) => (
                          <TextField
                            {...amountField}
                            fullWidth
                            placeholder={t('ADD_PROGRAM.ENTER_DISCOUNT')}
                            error={!!error}
                            helperText={error ? t(String(error.message)) : undefined}
                            sx={programFieldSx}
                          />
                        )}
                      />
                    </Box>
                  ) : null}
                </Card>

                <Card sx={programItemCardSx}>
                  <FormControlLabel
                    value="specific"
                    control={
                      <Radio
                        checked={field.value === 'specific'}
                        onChange={() => {
                          field.onChange('specific');
                          setValue('discount_amount', '');
                        }}
                        sx={{ color: PROGRAM_TEAL, '&.Mui-checked': { color: PROGRAM_TEAL } }}
                      />
                    }
                    label={t('ADD_PROGRAM.SPECIFIC_DISCOUNT')}
                    sx={programRadioControlLabelSx}
                  />

                  {discountType === 'specific' ? (
                    <Box sx={{ mt: 2.5 }}>
                      {discountGroups.map((group, groupIndex) => (
                        <Box key={group.id} sx={{ mb: groupIndex < discountGroups.length - 1 ? 2.5 : 0 }}>
                          <Card sx={innerCardSx}>
                            <Grid container spacing={2.5}>
                              <Grid xs={12} md={6}>
                                <RequiredLabel required>{t('ADD_PROGRAM.TITLE_AR')}</RequiredLabel>
                                <Controller
                                  name={`discount.${groupIndex}.title_ar`}
                                  control={control}
                                  render={({ field: titleField, fieldState: { error } }) => (
                                    <TextField
                                      {...titleField}
                                      fullWidth
                                      placeholder="Ex: Sibling Discount"
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
                                  name={`discount.${groupIndex}.title_en`}
                                  control={control}
                                  render={({ field: titleField, fieldState: { error } }) => (
                                    <TextField
                                      {...titleField}
                                      fullWidth
                                      placeholder="Ex: Sibling Discount"
                                      error={!!error}
                                      helperText={error ? t(String(error.message)) : undefined}
                                      sx={programFieldSx}
                                    />
                                  )}
                                />
                              </Grid>
                            </Grid>
                          </Card>

                          <Card sx={{ ...innerCardSx, mt: 2.5 }}>
                            <DiscountRows groupIndex={groupIndex} />
                          </Card>
                        </Box>
                      ))}

                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Iconify icon="mingcute:add-line" />}
                        onClick={() => appendDiscountGroup({ ...EMPTY_DISCOUNT_GROUP })}
                        sx={{ ...dashedAddButtonSx, mt: 2, mb: 0 }}
                      >
                        {t('ADD_PROGRAM.ADD_MORE_DISCOUNTS')}
                      </Button>
                    </Box>
                  ) : null}
                </Card>
              </>
            )}
          />
        </Box>
      ) : null}
    </Box>
  );
}

function DiscountRows({ groupIndex }: { groupIndex: number }) {
  const { t } = useTranslate();
  const { control } = useFormContext<ProgramFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: `discount.${groupIndex}.discounts`,
  });

  return (
    <Box>
      {fields.map((field, rowIndex) => (
        <Grid
          container
          spacing={2.5}
          key={field.id}
          sx={{ mb: rowIndex < fields.length - 1 ? 2.5 : 0 }}
        >
          <Grid xs={12} md={6}>
            <RequiredLabel required>{t('ADD_PROGRAM.NO_OF_KIDS')}</RequiredLabel>
            <Controller
              name={`discount.${groupIndex}.discounts.${rowIndex}.no_of_kids`}
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
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <RequiredLabel required>{t('ADD_PROGRAM.DISCOUNT_PERCENT')}</RequiredLabel>
                <Controller
                  name={`discount.${groupIndex}.discounts.${rowIndex}.discount`}
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
              </Box>
              {fields.length > 1 ? (
                <Box sx={{ flexShrink: 0 }}>
                  <RequiredLabel sx={{ visibility: 'hidden', userSelect: 'none' }}>&nbsp;</RequiredLabel>
                  <Box
                    sx={{
                      height: PROGRAM_FIELD_HEIGHT,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <IconButton onClick={() => remove(rowIndex)} sx={{ p: 0.75 }}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              ) : null}
            </Box>
          </Grid>
        </Grid>
      ))}

      <Button
        variant="text"
        startIcon={<Iconify icon="mingcute:add-line" />}
        onClick={() => append({ ...EMPTY_DISCOUNT_ROW })}
        sx={{
          mt: 1,
          color: ADD_BOX_TEXT_COLOR,
          fontWeight: 600,
          '&:hover': { bgcolor: 'transparent', color: ADD_BOX_TEXT_COLOR },
          '& .MuiButton-startIcon': { color: ADD_BOX_TEXT_COLOR },
        }}
      >
        {t('ADD_PROGRAM.ADD_MORE_OPTIONS')}
      </Button>
    </Box>
  );
}
