'use client';

import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import { useForm, useFieldArray, Controller, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Button,
  Dialog,
  Grid,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';

import { getErrorMessage } from 'src/utils/axios';
import { useTranslate } from 'src/locales';
import { updateClientDetails } from 'src/actions/clients';
import { fetchCityNeighborhoods } from 'src/actions/centers';
import { ITems } from 'src/components/AutoComplete/CutomAutocompleteView';

import Iconify from 'src/components/iconify';
import FormProvider from 'src/components/hook-form/form-provider';
import RHFTextField from 'src/components/hook-form/rhf-text-field-form';
import { RHFMultiSelect, RHFSelect } from 'src/components/hook-form';

import RequiredLabel from '../../../centers/add-program/components/required-label';
import { dashedAddButtonSx, programFieldSx } from '../../../centers/add-program/styles';
import { PROGRAM_FIELD_HEIGHT } from '../../../centers/add-program/constants';

const SECTION_HEADING_SX = {
  fontSize: '20px',
  fontWeight: 700,
  color: '#3CB8BB',
};

const FIELD_LABEL_SX = {
  fontSize: '15px',
  color: '#2B509C',
  mb: 0.75,
};

type FieldOption = {
  id: string;
  name_en?: string;
  name_ar?: string;
  name?: string;
};

type ChildFormValue = {
  _id?: string;
  name: string;
  age: number | string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  clientInfo: any;
  cities: ITems[];
  fields: FieldOption[];
};

function extractFieldIds(clientInfo: any): string[] {
  if (Array.isArray(clientInfo?.field)) {
    return clientInfo.field
      .map((field: any) => String(field?._id ?? field?.id ?? field ?? '').trim())
      .filter(Boolean);
  }
  if (clientInfo?.field && typeof clientInfo.field === 'object') {
    const id = clientInfo.field?._id ?? clientInfo.field?.id;
    return id ? [String(id)] : [];
  }
  return [];
}

function buildDefaultValues(clientInfo: any) {
  return {
    username: clientInfo?.username ?? clientInfo?.name ?? '',
    email: clientInfo?.email ?? '',
    phone: clientInfo?.phone ?? '',
    city: String(clientInfo?.city?._id ?? clientInfo?.city?.id ?? ''),
    neighborhood: String(clientInfo?.neighborhood?._id ?? clientInfo?.neighborhood?.id ?? ''),
    field: extractFieldIds(clientInfo),
    children: (Array.isArray(clientInfo?.child) ? clientInfo.child : []).map((child: any) => ({
      _id: child?._id ? String(child._id) : '',
      name: child?.name ?? '',
      age: child?.age ?? '',
    })) as ChildFormValue[],
  };
}

type ClientFormValues = ReturnType<typeof buildDefaultValues>;

export default function EditClientDialog({
  open,
  onClose,
  clientInfo,
  cities,
  fields,
}: Props) {
  const { t, i18n } = useTranslate();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const [neighborhoods, setNeighborhoods] = useState<ITems[]>([]);
  const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(false);

  const fieldOptions = useMemo(
    () =>
      fields
        .map((field) => ({
          value: String(field.id),
          label:
            i18n.language === 'ar'
              ? field.name_ar || field.name || field.name_en || ''
              : field.name_en || field.name || field.name_ar || '',
        }))
        .filter((field) => field.value && field.label),
    [fields, i18n.language]
  );

  const methods = useForm<ClientFormValues>({
    resolver: yupResolver(
      yup.object().shape({
        username: yup.string().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
        phone: yup.string().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
        email: yup.string().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
        city: yup.string().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
        neighborhood: yup.string().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
        field: yup.array().of(yup.string()),
        children: yup.array().of(
          yup.object().shape({
            _id: yup.string().optional(),
            name: yup.string().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
            age: yup
              .mixed<number | string>()
              .test('is-valid-age', t('LABEL.THIS_FIELD_IS_REQUIRED'), (value) => {
                if (value === '' || value === null || value === undefined) return false;
                return !Number.isNaN(Number(value));
              }),
          })
        ),
      })
    ) as Resolver<ClientFormValues>,
    defaultValues: buildDefaultValues(clientInfo),
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const {
    reset,
    setValue,
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const { fields: childFields, append, remove } = useFieldArray({
    control,
    name: 'children',
  });

  const selectedCity = watch('city');
  const prevCityRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open) return;
    reset(buildDefaultValues(clientInfo));
  }, [open, clientInfo, reset]);

  useEffect(() => {
    if (!open) {
      prevCityRef.current = null;
      return;
    }
    if (prevCityRef.current && prevCityRef.current !== selectedCity) {
      setValue('neighborhood', '', { shouldValidate: true });
    }
    prevCityRef.current = selectedCity;
  }, [open, selectedCity, setValue]);

  useEffect(() => {
    if (!open || !selectedCity) {
      setNeighborhoods([]);
      return;
    }

    let active = true;
    setLoadingNeighborhoods(true);

    fetchCityNeighborhoods({ cityId: selectedCity })
      .then((items) => {
        if (active) setNeighborhoods(items);
      })
      .catch(() => {
        if (active) setNeighborhoods([]);
      })
      .finally(() => {
        if (active) setLoadingNeighborhoods(false);
      });

    return () => {
      active = false;
    };
  }, [open, selectedCity]);

  const onSubmit = handleSubmit(async (data) => {
    const clientId = String(clientInfo?._id ?? clientInfo?.id ?? '').trim();
    if (!clientId) {
      enqueueSnackbar(t('LABEL.THIS_FIELD_IS_REQUIRED'), { variant: 'error' });
      return;
    }

    try {
      const res = await updateClientDetails(clientId, {
        username: data.username,
        email: data.email,
        phone: data.phone,
        city: data.city,
        neighborhood: data.neighborhood,
        field: data.field,
        child: data.children.map((child) => ({
          ...(child._id ? { _id: child._id } : {}),
          name: child.name,
          age: Number(child.age),
        })),
      });

      if (res?.error) {
        enqueueSnackbar(res.error, { variant: 'error' });
        return;
      }

      enqueueSnackbar(
        i18n.language === 'ar'
          ? 'تم تحديث بيانات العميل بنجاح.'
          : 'Client updated successfully.'
      );
      onClose();
      router.refresh();
    } catch (error) {
      enqueueSnackbar(getErrorMessage(error), { variant: 'error' });
    }
  });

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={onClose} scroll="paper">
      <Box sx={{ px: 3, pt: 3, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography component="p" sx={SECTION_HEADING_SX}>
          {`${t('BUTTON.EDIT')} ${t('LABEL.CLIENT')} ${t('LABEL.DETAILS')}`}
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'error.main' }}>
          <Iconify icon="mingcute:close-line" width={22} />
        </IconButton>
      </Box>

      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Box
          sx={{
            px: 3,
            pb: 3,
            '& .MuiInputBase-input': { color: '#2B509C' },
            '& .MuiSelect-select': { color: '#2B509C' },
            '& .MuiOutlinedInput-root:not(.Mui-error):hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#D9D9D9',
            },
            '& .MuiOutlinedInput-root:not(.Mui-error).Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#D9D9D9',
              borderWidth: '1px',
            },
          }}
        >
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <RequiredLabel required sx={FIELD_LABEL_SX}>
                {t('LABEL.NAME')}
              </RequiredLabel>
              <RHFTextField name="username" fullWidth sx={programFieldSx} />
            </Grid>
            <Grid item xs={12} md={6}>
              <RequiredLabel required sx={FIELD_LABEL_SX}>
                {t('LABEL.EMAIL')}
              </RequiredLabel>
              <RHFTextField name="email" fullWidth sx={programFieldSx} />
            </Grid>

            <Grid item xs={12} md={6}>
              <RequiredLabel required sx={FIELD_LABEL_SX}>
                {t('LABEL.PHONE_NUMBER')}
              </RequiredLabel>
              <RHFTextField name="phone" fullWidth sx={programFieldSx} />
            </Grid>
            <Grid item xs={12} md={6}>
              <RequiredLabel sx={FIELD_LABEL_SX}>{t('LABEL.INTERESTS')}</RequiredLabel>
              <RHFMultiSelect
                name="field"
                options={fieldOptions}
                chip
                sx={{
                  ...programFieldSx,
                  '& .MuiChip-root': {
                    bgcolor: '#3CB8BB',
                    color: '#FFFFFF',
                  },
                  '& .MuiChip-root .MuiChip-deleteIcon': {
                    color: '#FFFFFF',
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <RequiredLabel required sx={FIELD_LABEL_SX}>
                {t('LABEL.CITY')}
              </RequiredLabel>
              <RHFSelect name="city" label="" sx={programFieldSx}>
                {cities.map((city) => (
                  <MenuItem key={city.id} value={String(city.id)}>
                    {city.name}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Grid>
            <Grid item xs={12} md={6}>
              <RequiredLabel required sx={FIELD_LABEL_SX}>
                {t('LABEL.NEIGHBORHOOD')}
              </RequiredLabel>
              <RHFSelect
                name="neighborhood"
                label=""
                disabled={!selectedCity || loadingNeighborhoods}
                sx={programFieldSx}
              >
                {neighborhoods.map((neighborhood) => (
                  <MenuItem key={neighborhood.id} value={String(neighborhood.id)}>
                    {neighborhood.name}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Grid>
          </Grid>

          <Box
            sx={{
              mt: 3,
              p: 2.5,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '12px',
            }}
          >
            <Typography component="p" sx={{ ...SECTION_HEADING_SX, mb: 2 }}>
              {t('LABEL.CHILDREN')}
            </Typography>

            {childFields.map((child, index) => (
              <Box
                key={child.id}
                sx={{
                  display: 'flex',
                  gap: 2,
                  alignItems: 'flex-end',
                  mb: 2,
                  flexWrap: { xs: 'wrap', md: 'nowrap' },
                }}
              >
                <Box sx={{ flex: 1, minWidth: { xs: '100%', md: 0 } }}>
                  <RequiredLabel required sx={FIELD_LABEL_SX}>
                    {t('LABEL.NAME')}
                  </RequiredLabel>
                  <RHFTextField
                    name={`children.${index}.name`}
                    fullWidth
                    sx={programFieldSx}
                  />
                </Box>
                <Box sx={{ flex: 1, minWidth: { xs: '100%', md: 0 } }}>
                  <RequiredLabel required sx={FIELD_LABEL_SX}>
                    {t('LABEL.AGE')}
                  </RequiredLabel>
                  <Controller
                    name={`children.${index}.age`}
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type="number"
                        value={field.value === 0 ? '' : field.value ?? ''}
                        onChange={(event) => field.onChange(event.target.value)}
                        error={!!error}
                        helperText={error?.message}
                        sx={programFieldSx}
                      />
                    )}
                  />
                </Box>
                <Box
                  sx={{
                    flexShrink: 0,
                    alignSelf: 'flex-end',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: PROGRAM_FIELD_HEIGHT,
                    width: PROGRAM_FIELD_HEIGHT,
                  }}
                >
                  <IconButton
                    onClick={() => remove(index)}
                    aria-label={t('BUTTON.DELETE')}
                    sx={{
                      p: 0,
                      width: PROGRAM_FIELD_HEIGHT,
                      height: PROGRAM_FIELD_HEIGHT,
                      color: '#FF0000',
                      '&:hover': {
                        bgcolor: 'rgba(255, 0, 0, 0.08)',
                      },
                    }}
                  >
                    <Iconify icon="solar:trash-bin-trash-bold" width={20} height={26} />
                  </IconButton>
                </Box>
              </Box>
            ))}

            <Button
              fullWidth
              variant="outlined"
              onClick={() => append({ _id: '', name: '', age: '' })}
              startIcon={<Iconify icon="mingcute:add-line" />}
              sx={{ ...dashedAddButtonSx, mt: 1, mb: 0 }}
            >
              {t('BUTTON.ADD_CHILD')}
            </Button>
          </Box>

          <LoadingButton
            type="submit"
            fullWidth
            loading={isSubmitting}
            variant="contained"
            sx={{
              mt: 4,
              py: 1.5,
              borderRadius: '12px',
              bgcolor: '#3CB8BB',
              fontSize: 16,
              fontWeight: 600,
              '&:hover': {
                bgcolor: '#2fa8ab',
              },
            }}
          >
            {t('BUTTON.SAVE')}
          </LoadingButton>
        </Box>
      </FormProvider>
    </Dialog>
  );
}
