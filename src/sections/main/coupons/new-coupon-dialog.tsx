'use client';

import * as yup from 'yup';

import { useSnackbar } from 'notistack';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { LoadingButton } from '@mui/lab';
import {
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Select,
  MenuItem,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { getErrorMessage } from 'src/utils/axios';

import { useTranslate } from 'src/locales';

import FormProvider from 'src/components/hook-form/form-provider';
import RHFTextField from 'src/components/hook-form/rhf-text-field-form';

import { DatePicker } from '@mui/x-date-pickers';
import { RHFSelect } from 'src/components/hook-form';
import { newReason } from 'src/actions/support';
import { newCoupon } from 'src/actions/coupons';
import { invalidatePath } from 'src/actions/cache-invalidation';
import { useMemo } from 'react';
import { start } from 'nprogress';
import { format } from 'date-fns';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const types = [
  { name_en: 'percentage', name_ar: 'ادمن', value: 'percentage' },
  { name_en: 'value', name_ar: 'مركز', value: 'value' },
];
export function NewCouponDialog({ open, onClose }: Props) {
  const { t } = useTranslate();
  const { enqueueSnackbar } = useSnackbar();
  const schema = yup.object().shape({
    code: yup.string().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
    discount: yup.number().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
    discountType: yup.string().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
    startDate: yup.date().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
    endDate: yup
      .date()
      .required(t('LABEL.THIS_FIELD_IS_REQUIRED'))
      .min(yup.ref('startDate'), t('LABEL.END_DATE_MUST_BE_AFTER_START_DATE')),
    timesUsed: yup.number().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
  });

  const defaultValues = useMemo(
    () => ({
      code: '',
      timesUsed: 0,
      endDate: new Date(),
      startDate: new Date(),
      discountType: '',
      discount: 0,
    }),
    []
  );

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues,
    mode: 'onChange',
  });

  const {
    handleSubmit,
    trigger,
    control,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    const reqBody = {
      ...data,
      startDate: format(data.startDate, 'yyyy-MM-dd'),
      endDate: format(data.endDate, 'yyyy-MM-dd'),
    };

    const res = await newCoupon(reqBody);
    if (res?.error) {
      enqueueSnackbar(`${res?.error}`, { variant: 'error' });
    } else {
      enqueueSnackbar(t('MESSAGE.COUPON_CREATED_SUCCESSFULLY'), {
        variant: 'success',
      });

      onClose();
    }
  });

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={onClose}>
      <DialogTitle sx={{ pb: 2 }}>{t('LABEL.CREATE_COUPON')}</DialogTitle>

      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogContent>
          <Stack
            spacing={1}
            sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mt: 1 }}
          >
            <RHFTextField
              name="code"
              label={t('LABEL.COUPON')}
              placeholder={t('PLACEHOLDER.REASON_NAME_IN_ARABIC')}
              fullWidth
            />
            <RHFTextField
              name="timesUsed"
              label={t('LABEL.NUMBER_OF_USAGES')}
              placeholder={t('PLACEHOLDER.NUMBER_OF_USAGES')}
              fullWidth
              type="number"
            />
            <Controller
              name="startDate"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <DatePicker
                  label={t('LABEL.USAGE_START_DATE')}
                  format="dd-MM-yyyy"
                  value={new Date(field.value)}
                  onChange={(newValue) => {
                    field.onChange(newValue);
                    trigger(['startDate', 'endDate']);
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!error,
                      helperText: error?.message,
                    },
                    actionBar: { actions: ['clear'] },
                  }}
                />
              )}
            />
            <Controller
              name="endDate"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <DatePicker
                  label={t('LABEL.USAGE_END_DATE')}
                  format="dd-MM-yyyy"
                  value={new Date(field.value)}
                  onChange={(newValue) => {
                    field.onChange(newValue);
                    trigger(['startDate', 'endDate']);
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!error,
                      helperText: error?.message,
                    },
                    actionBar: { actions: ['clear'] },
                  }}
                />
              )}
            />
            <RHFSelect
              label={t('LABEL.DISCOUNT_TYPE')}
              placeholder={t('LABEL.DISCOUNT_TYPE')}
              name="discountType"
              InputLabelProps={{ shrink: true }}
              sx={{ flexGrow: 1 }}
            >
              {types.map((type: any) => (
                <MenuItem key={type.value} value={type.value}>
                  {t('LABEL.' + type?.value.toUpperCase())}
                </MenuItem>
              ))}
            </RHFSelect>
            <RHFTextField
              name="discount"
              label={t('LABEL.VALUE')}
              placeholder={t('PLACEHOLDER.VALUE')}
              fullWidth
              type="number"
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            variant="contained"
            sx={{
              color: 'primary.common',
              bgcolor: 'white',
              border: '1px solid #DBE0E4',
              '&:hover': {
                bgcolor: '#DBE0E5',
                border: '1px solid #DBE0E4',
              },
            }}
            onClick={onClose}
          >
            {t('BUTTON.CANCEL')}
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {t('BUTTON.CREATE')}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
