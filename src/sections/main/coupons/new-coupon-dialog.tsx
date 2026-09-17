'use client';

import * as yup from 'yup';

import { useSnackbar } from 'notistack';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useMemo, useState } from 'react';

import { LoadingButton } from '@mui/lab';
import {
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  MenuItem,
  CircularProgress,
} from '@mui/material';

import { useTranslate } from 'src/locales';
import i18n from 'src/locales/i18n';

import FormProvider from 'src/components/hook-form/form-provider';
import RHFTextField from 'src/components/hook-form/rhf-text-field-form';

import { DatePicker } from '@mui/x-date-pickers';
import { RHFMultiSelect, RHFSelect } from 'src/components/hook-form';
import { newCoupon } from 'src/actions/coupons';
import { fetchCenters } from 'src/actions/centers';
import { fetchCourses } from 'src/actions/courses';

interface Props {
  open: boolean;
  onClose: () => void;
}

type CenterOption = { id: string; name: string };
type CourseOption = {
  id: string;
  name: string;
  centerId: string;
  startDate: string | null;
};

export const types = [
  { name_en: 'percentage', name_ar: 'ادمن', value: 'percentage' },
  { name_en: 'value', name_ar: 'مركز', value: 'value' },
];

export function NewCouponDialog({ open, onClose }: Props) {
  const { t } = useTranslate();
  const { enqueueSnackbar } = useSnackbar();
  const [centers, setCenters] = useState<CenterOption[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

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
    centerId: yup.string().optional(),
    courseIds: yup.array().of(yup.string()).optional(),
  });

  const defaultValues = useMemo(
    () => ({
      code: '',
      timesUsed: 0,
      endDate: new Date(),
      startDate: new Date(),
      discountType: '',
      discount: 0,
      centerId: '',
      courseIds: [] as string[],
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
    watch,
    setValue,
    reset,
    formState: { isSubmitting },
  } = methods;

  const selectedCenterId = watch('centerId');

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    const load = async () => {
      setLoadingOptions(true);
      try {
        const [centersRes, coursesRes] = await Promise.all([
          fetchCenters({ limit: 200 }),
          fetchCourses({ limit: 500 }),
        ]);
        if (cancelled) return;

        const isAr = i18n.language === 'ar';
        setCenters(
          (Array.isArray(centersRes?.data) ? centersRes.data : []).map((c: any) => ({
            id: String(c.id || c._id),
            name: c.name || '-',
          }))
        );
        setCourses(
          (Array.isArray(coursesRes?.data) ? coursesRes.data : []).map((c: any) => ({
            id: String(c.id || c._id),
            name:
              (isAr ? c.name_ar || c.name_en : c.name_en || c.name_ar) ||
              c.name ||
              '-',
            centerId: String(c.center_id?._id || c.center_id || c.center?._id || c.center?.id || ''),
            startDate: c.start_date ?? null,
          }))
        );
      } catch (error) {
        enqueueSnackbar(t('ERROR.FAILED_TO_LOAD'), { variant: 'error' });
      } finally {
        if (!cancelled) setLoadingOptions(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [open, enqueueSnackbar, t]);

  // Clear selected programs whenever the center changes
  useEffect(() => {
    setValue('courseIds', []);
  }, [selectedCenterId, setValue]);

  const programOptions = useMemo(() => {
    if (!selectedCenterId) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return courses
      .filter((c) => {
        if (c.centerId !== selectedCenterId) return false;
        if (!c.startDate) return false;
        const start = new Date(c.startDate);
        if (Number.isNaN(start.getTime())) return false;
        start.setHours(0, 0, 0, 0);
        // Upcoming only: start date is strictly after today
        return start.getTime() > today.getTime();
      })
      .map((c) => ({ label: c.name, value: c.id }));
  }, [courses, selectedCenterId]);

  const onSubmit = handleSubmit(async (data) => {
    const start = new Date(data.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(data.endDate);
    end.setHours(23, 59, 59, 999);

    const courseIds = (data.courseIds || []).filter(Boolean) as string[];
    const centerId = data.centerId || '';

    const payload: Record<string, unknown> = {
      code: data.code,
      discount_type:
        String(data.discountType || '').toLowerCase() === 'percentage' ? 'Percentage' : 'Value',
      discount: Number(data.discount ?? 0),
      usage_limit: Number(data.timesUsed ?? 0),
      start_date: start.toISOString(),
      end_date: end.toISOString(),
    };

    if (courseIds.length) {
      payload.course_id = courseIds;
    }
    if (centerId) {
      payload.center_id = centerId;
    }

    const res = await newCoupon(payload);
    if (res?.error) {
      enqueueSnackbar(`${res?.error}`, { variant: 'error' });
    } else {
      enqueueSnackbar(t('MESSAGE.COUPON_CREATED_SUCCESSFULLY'), {
        variant: 'success',
      });
      reset(defaultValues);
      onClose();
    }
  });

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={onClose}>
      <DialogTitle sx={{ pb: 2 }}>{t('LABEL.CREATE_COUPON')}</DialogTitle>

      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogContent>
          {loadingOptions ? (
            <Stack alignItems="center" py={4}>
              <CircularProgress size={32} />
            </Stack>
          ) : (
            <Stack
              spacing={1}
              sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mt: 1 }}
            >
              <RHFTextField
                name="code"
                label={t('LABEL.COUPON')}
                placeholder={t('LABEL.COUPON')}
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
              <RHFSelect
                label={t('LABEL.CENTER')}
                name="centerId"
                InputLabelProps={{ shrink: true }}
                sx={{ flexGrow: 1 }}
              >
                <MenuItem value="">
                  <em>{t('LABEL.SELECT_CENTER')}</em>
                </MenuItem>
                {centers.map((center) => (
                  <MenuItem key={center.id} value={center.id}>
                    {center.name}
                  </MenuItem>
                ))}
              </RHFSelect>
              <RHFMultiSelect
                name="courseIds"
                label={t('LABEL.PROGRAM_NAME')}
                chip
                disabled={!selectedCenterId}
                helperText={
                  !selectedCenterId
                    ? t('LABEL.SELECT_CENTER_FIRST')
                    : programOptions.length === 0
                      ? t('LABEL.NO_PROGRAMS_FOR_CENTER')
                      : undefined
                }
                options={programOptions}
                sx={{
                  '& .MuiChip-root': {
                    bgcolor: '#3CB8BB',
                    color: '#FFFFFF',
                  },
                  '& .MuiChip-deleteIcon': {
                    color: '#FFFFFF',
                    opacity: 0.9,
                    '&:hover': { color: '#FFFFFF', opacity: 1 },
                  },
                }}
              />
            </Stack>
          )}
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
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting}
            disabled={loadingOptions}
          >
            {t('BUTTON.CREATE')}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
