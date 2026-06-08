'use client';

import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import Button from '@mui/material/Button';
import Radio from '@mui/material/Radio';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useTranslate } from 'src/locales';

import Iconify from 'src/components/iconify';

import RequiredLabel from '../components/required-label';
import { EMPTY_DISCOUNT_GROUP, EMPTY_DISCOUNT_ROW, PROGRAM_TEAL } from '../constants';
import {
  dashedAddButtonSx,
  innerCardSx,
  programFieldSx,
  programSectionTitleSx,
  programSwitchSx,
} from '../styles';
import type { FixedProgramFormValues } from '../types';

export default function StepDiscount() {
  const { t } = useTranslate();
  const { control, watch } = useFormContext<FixedProgramFormValues>();
  const enableDiscount = watch('enableDiscount');
  const discountType = watch('discount_type');

  const {
    fields: discountGroups,
    append: appendDiscountGroup,
    remove: removeDiscountGroup,
  } = useFieldArray({ control, name: 'discount' });

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography sx={programSectionTitleSx}>{t('ADD_PROGRAM.ENABLE_DISCOUNT')}</Typography>
        <Controller
          name="enableDiscount"
          control={control}
          render={({ field }) => (
            <Switch
              checked={field.value}
              onChange={(event) => field.onChange(event.target.checked)}
              sx={programSwitchSx}
            />
          )}
        />
      </Box>

      {enableDiscount ? (
        <Box>
          <Controller
            name="discount_type"
            control={control}
            render={({ field }) => (
              <RadioGroup value={field.value} onChange={(event) => field.onChange(event.target.value)}>
                <FormControlLabel
                  value="total"
                  control={<Radio sx={{ color: PROGRAM_TEAL, '&.Mui-checked': { color: PROGRAM_TEAL } }} />}
                  label={
                    <Box sx={{ width: 1 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                        {t('ADD_PROGRAM.TOTAL_DISCOUNT')}
                      </Typography>
                      {discountType === 'total' ? (
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
                      ) : null}
                    </Box>
                  }
                  sx={{ alignItems: 'flex-start', mb: 3 }}
                />

                <FormControlLabel
                  value="specific"
                  control={<Radio sx={{ color: PROGRAM_TEAL, '&.Mui-checked': { color: PROGRAM_TEAL } }} />}
                  label={
                    <Box sx={{ width: 1 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                        {t('ADD_PROGRAM.SPECIFIC_DISCOUNT')}
                      </Typography>
                    </Box>
                  }
                  sx={{ alignItems: 'flex-start', mb: 1 }}
                />
              </RadioGroup>
            )}
          />

          {discountType === 'specific'
            ? discountGroups.map((group, groupIndex) => (
                <Box key={group.id} sx={{ ...innerCardSx, ml: 4 }}>
                  <Grid container spacing={2.5}>
                    <Grid xs={12} md={6}>
                      <RequiredLabel required>{t('ADD_PROGRAM.TITLE_AR')}</RequiredLabel>
                      <Controller
                        name={`discount.${groupIndex}.title_ar`}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <TextField
                            {...field}
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
                        render={({ field, fieldState: { error } }) => (
                          <TextField
                            {...field}
                            fullWidth
                            placeholder="ex: Sibling Discount"
                            error={!!error}
                            helperText={error ? t(String(error.message)) : undefined}
                            sx={programFieldSx}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 2.5, p: 2, borderRadius: '12px', bgcolor: 'grey.50' }}>
                    <DiscountRows groupIndex={groupIndex} />
                  </Box>

                  {discountGroups.length > 1 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                      <IconButton color="error" onClick={() => removeDiscountGroup(groupIndex)}>
                        <Iconify icon="material-symbols:delete-outline-rounded" />
                      </IconButton>
                    </Box>
                  ) : null}
                </Box>
              ))
            : null}

          {discountType === 'specific' ? (
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={() => appendDiscountGroup({ ...EMPTY_DISCOUNT_GROUP })}
              sx={{ ...dashedAddButtonSx, mt: 2 }}
            >
              {t('ADD_PROGRAM.ADD_MORE_DISCOUNTS')}
            </Button>
          ) : null}
        </Box>
      ) : null}
    </Box>
  );
}

function DiscountRows({ groupIndex }: { groupIndex: number }) {
  const { t } = useTranslate();
  const { control } = useFormContext<FixedProgramFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: `discount.${groupIndex}.discounts`,
  });

  return (
    <Box>
      {fields.map((field, rowIndex) => (
        <Grid container spacing={2} key={field.id} sx={{ mb: rowIndex < fields.length - 1 ? 2 : 0 }}>
          <Grid xs={12} md={5}>
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
          <Grid xs={12} md={5}>
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
          </Grid>
          <Grid xs={12} md={1} sx={{ display: 'flex', alignItems: 'flex-end', pb: 0.5 }}>
            {fields.length > 1 ? (
              <IconButton color="error" onClick={() => remove(rowIndex)}>
                <Iconify icon="material-symbols:delete-outline-rounded" />
              </IconButton>
            ) : null}
          </Grid>
        </Grid>
      ))}

      <Button
        variant="text"
        startIcon={<Iconify icon="mingcute:add-line" />}
        onClick={() => append({ ...EMPTY_DISCOUNT_ROW })}
        sx={{ mt: 1, color: PROGRAM_TEAL, fontWeight: 600 }}
      >
        {t('ADD_PROGRAM.ADD_MORE_OPTIONS')}
      </Button>
    </Box>
  );
}
