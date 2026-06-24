'use client';

import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Dialog,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';

import { getErrorMessage } from 'src/utils/axios';
import { useTranslate } from 'src/locales';
import { fetchCityNeighborhoods, updateCenterDetails } from 'src/actions/centers';
import { ITems } from 'src/components/AutoComplete/CutomAutocompleteView';

import Iconify from 'src/components/iconify';
import FormProvider from 'src/components/hook-form/form-provider';
import RHFTextField from 'src/components/hook-form/rhf-text-field-form';
import { RHFMultiSelect, RHFSelect, RHFUploadAvatar } from 'src/components/hook-form';

import RequiredLabel from '../../add-program/components/required-label';
import WordCountTextarea from '../../add-program/components/word-count-textarea';
import { FIELD_LABEL_COLOR, MAX_DESCRIPTION_WORDS, PROGRAM_SECTION_HEADING_COLOR } from '../../add-program/constants';
import { programFieldSx } from '../../add-program/styles';
import { countWords } from '../../add-program/validation';

const FIELD_LABEL_SX = {
  fontSize: 13,
  color: FIELD_LABEL_COLOR,
  mb: 0.75,
};

const IMAGE_LABEL_SX = {
  mt: 1,
  fontSize: '15px',
  fontWeight: 700,
  color: '#006C9C',
  lineHeight: 1.4,
};

const IMAGE_SECTION_HEADING_SX = {
  mt: 3,
  mb: 2,
  fontSize: '18px',
  fontWeight: 600,
  color: '#3CB8BB',
};

type FieldOption = {
  id: string;
  name_en?: string;
  name_ar?: string;
  name?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  centerInfo: any;
  cities: ITems[];
  fields: FieldOption[];
};

function buildDefaultValues(centerInfo: any) {
  const fieldIds = Array.isArray(centerInfo?.fields)
    ? centerInfo.fields
        .map((field: any) => String(field?._id ?? field?.id ?? '').trim())
        .filter(Boolean)
    : [];

  const latitude = centerInfo?.latitude;
  const longitude = centerInfo?.longitude;
  const hasCoords =
    latitude !== undefined &&
    latitude !== null &&
    longitude !== undefined &&
    longitude !== null &&
    `${latitude}`.trim() !== '' &&
    `${longitude}`.trim() !== '';

  return {
    name: centerInfo?.name ?? '',
    phone: centerInfo?.phone ?? '',
    email: centerInfo?.email ?? '',
    website: centerInfo?.website ?? '',
    desc_ar: centerInfo?.desc_ar ?? '',
    desc_en: centerInfo?.desc_en ?? '',
    fields: fieldIds,
    bank_account_number: centerInfo?.bank_account_number ?? '',
    city: String(centerInfo?.city?._id ?? centerInfo?.city?.id ?? ''),
    neighborhood: String(centerInfo?.neighborhood?._id ?? centerInfo?.neighborhood?.id ?? ''),
    center_location: hasCoords ? `${latitude}, ${longitude}` : '',
    place_desc: centerInfo?.place_desc ?? '',
    center_image: centerInfo?.center_image ?? null,
    bank_image: centerInfo?.bank_image ?? null,
    commercial_register_image: centerInfo?.commercial_register_image ?? null,
  };
}

type CenterFormValues = ReturnType<typeof buildDefaultValues>;

function parseCenterLocation(value: string): { latitude?: string; longitude?: string } {
  const parts = value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length < 2) {
    return {};
  }

  const latitude = parts[0];
  const longitude = parts[1];

  if (Number.isNaN(Number(latitude)) || Number.isNaN(Number(longitude))) {
    return {};
  }

  return { latitude, longitude };
}

export default function EditCenterDialog({
  open,
  onClose,
  centerInfo,
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

  const methods = useForm<CenterFormValues>({
    resolver: yupResolver(
      yup.object().shape({
        name: yup.string().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
        phone: yup.string().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
        email: yup.string().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
        website: yup.string().nullable(),
        desc_ar: yup.string().test('max-words', t('ADD_PROGRAM.MAX_WORDS_EXCEEDED'), (value) =>
          countWords(value || '') <= MAX_DESCRIPTION_WORDS
        ),
        desc_en: yup.string().test('max-words', t('ADD_PROGRAM.MAX_WORDS_EXCEEDED'), (value) =>
          countWords(value || '') <= MAX_DESCRIPTION_WORDS
        ),
        fields: yup
          .array()
          .of(yup.string())
          .min(1, t('LABEL.THIS_FIELD_IS_REQUIRED'))
          .required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
        bank_account_number: yup.string().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
        city: yup.string().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
        neighborhood: yup.string().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
        center_location: yup.string().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
        place_desc: yup.string().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
        center_image: yup.mixed().nullable(),
        bank_image: yup.mixed().nullable(),
        commercial_register_image: yup.mixed().nullable(),
      })
    ) as Resolver<CenterFormValues>,
    defaultValues: buildDefaultValues(centerInfo),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const {
    reset,
    setValue,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const selectedCity = watch('city');
  const prevCityRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open) {
      prevCityRef.current = null;
      return;
    }
    if (prevCityRef.current && prevCityRef.current !== selectedCity) {
      setValue('neighborhood', '', { shouldValidate: false });
    }
    prevCityRef.current = selectedCity;
  }, [open, selectedCity, setValue]);

  useEffect(() => {
    if (!open) return;
    reset(buildDefaultValues(centerInfo));
  }, [open, centerInfo, reset]);

  useEffect(() => {
    if (!open || !selectedCity) {
      setNeighborhoods([]);
      return;
    }

    let active = true;
    setLoadingNeighborhoods(true);

    fetchCityNeighborhoods({ cityId: selectedCity })
      .then((items) => {
        if (active) {
          setNeighborhoods(items);
        }
      })
      .catch(() => {
        if (active) {
          setNeighborhoods([]);
        }
      })
      .finally(() => {
        if (active) {
          setLoadingNeighborhoods(false);
        }
      });

    return () => {
      active = false;
    };
  }, [open, selectedCity]);

  const makeImageDropHandler = useCallback(
    (fieldName: 'center_image' | 'bank_image' | 'commercial_register_image') =>
      (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        const newFile = Object.assign(file, {
          preview: URL.createObjectURL(file),
        });

        setValue(fieldName, newFile, { shouldValidate: true });
      },
    [setValue]
  );

  const onSubmit = handleSubmit(async (data) => {
    const centerId = String(centerInfo?._id ?? centerInfo?.id ?? '').trim();
    if (!centerId) {
      enqueueSnackbar(t('LABEL.THIS_FIELD_IS_REQUIRED'), { variant: 'error' });
      return;
    }

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('phone', data.phone);
    formData.append('email', data.email);
    if (data.website) {
      formData.append('website', data.website);
    }
    formData.append('desc_ar', data.desc_ar);
    formData.append('desc_en', data.desc_en);
    formData.append('bank_account_number', data.bank_account_number);
    formData.append('place_desc', data.place_desc);
    formData.append('city', data.city);
    formData.append('neighborhood', data.neighborhood);
    formData.append('fields', JSON.stringify(data.fields));

    const coords = parseCenterLocation(data.center_location);
    if (coords.latitude && coords.longitude) {
      formData.append('latitude', coords.latitude);
      formData.append('longitude', coords.longitude);
    }

    if (data.center_image && typeof data.center_image !== 'string') {
      formData.append('center_image', data.center_image);
    } else if (typeof data.center_image === 'string' && data.center_image.trim()) {
      formData.append('center_image', data.center_image);
    }
    if (data.bank_image && typeof data.bank_image !== 'string') {
      formData.append('bank_image', data.bank_image);
    } else if (typeof data.bank_image === 'string' && data.bank_image.trim()) {
      formData.append('bank_image', data.bank_image);
    }
    if (data.commercial_register_image && typeof data.commercial_register_image !== 'string') {
      formData.append('commercial_register_image', data.commercial_register_image);
    } else if (
      typeof data.commercial_register_image === 'string' &&
      data.commercial_register_image.trim()
    ) {
      formData.append('commercial_register_image', data.commercial_register_image);
    }

    try {
      const res = await updateCenterDetails(centerId, formData);
      if (res?.error) {
        enqueueSnackbar(res.error, { variant: 'error' });
        return;
      }

      enqueueSnackbar(t('MESSAGE.UPDATED_SUCCESSFULLY'));
      onClose();
      router.refresh();
    } catch (error) {
      enqueueSnackbar(getErrorMessage(error), { variant: 'error' });
    }
  });

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={onClose} scroll="paper">
      <Box sx={{ px: 3, pt: 3, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ fontSize: 18, fontWeight: 600, color: PROGRAM_SECTION_HEADING_COLOR }}>
          {`${t('BUTTON.EDIT')} ${t('LABEL.CENTER')} ${t('LABEL.DETAILS')}`}
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'error.main' }}>
          <Iconify icon="mingcute:close-line" width={22} />
        </IconButton>
      </Box>

      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Box sx={{ px: 3, pb: 3 }}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <RequiredLabel required sx={FIELD_LABEL_SX}>
                {t('LABEL.CENTER_NAME')}
              </RequiredLabel>
              <RHFTextField name="name" fullWidth sx={programFieldSx} />
            </Grid>
            <Grid item xs={12} md={6}>
              <RequiredLabel required sx={FIELD_LABEL_SX}>
                {t('LABEL.PHONE_NUMBER')}
              </RequiredLabel>
              <RHFTextField name="phone" fullWidth sx={programFieldSx} />
            </Grid>

            <Grid item xs={12} md={6}>
              <RequiredLabel required sx={FIELD_LABEL_SX}>
                {t('LABEL.EMAIL')}
              </RequiredLabel>
              <RHFTextField name="email" fullWidth sx={programFieldSx} />
            </Grid>
            <Grid item xs={12} md={6}>
              <RequiredLabel sx={FIELD_LABEL_SX}>{t('LABEL.WEBSITE')}</RequiredLabel>
              <RHFTextField name="website" fullWidth sx={programFieldSx} />
            </Grid>

            <Grid item xs={12} md={6}>
              <WordCountTextarea
                name="desc_ar"
                label={`${t('LABEL.CENTER_DESCRIPTION')} ${t('LABEL.ARABIC')}`}
                labelSx={FIELD_LABEL_SX}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <WordCountTextarea
                name="desc_en"
                label={`${t('LABEL.CENTER_DESCRIPTION')} ${t('LABEL.ENGLISH')}`}
                labelSx={FIELD_LABEL_SX}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <RequiredLabel required sx={FIELD_LABEL_SX}>
                {t('LABEL.CATEGORIES')}
              </RequiredLabel>
              <RHFMultiSelect
                name="fields"
                options={fieldOptions}
                chip
                sx={programFieldSx}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <RequiredLabel required sx={FIELD_LABEL_SX}>
                {t('LABEL.IBAN')}
              </RequiredLabel>
              <RHFTextField
                name="bank_account_number"
                fullWidth
                sx={programFieldSx}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <RequiredLabel required sx={FIELD_LABEL_SX}>
                {t('LABEL.CITY')}
              </RequiredLabel>
              <RHFSelect
                name="city"
                label=""
                sx={programFieldSx}
              >
                {cities.map((city) => (
                  <MenuItem key={city.id} value={city.id}>
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
                  <MenuItem key={neighborhood.id} value={neighborhood.id}>
                    {neighborhood.name}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Grid>

            <Grid item xs={12} md={6}>
              <RequiredLabel required sx={FIELD_LABEL_SX}>
                {t('LABEL.CENTER_LOCATION')}
              </RequiredLabel>
              <RHFTextField
                name="center_location"
                fullWidth
                multiline
                minRows={4}
                sx={programFieldSx}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <RequiredLabel required sx={FIELD_LABEL_SX}>
                {t('LABEL.ADDRESS_DETAILS')}
              </RequiredLabel>
              <RHFTextField
                name="place_desc"
                fullWidth
                multiline
                minRows={4}
                sx={programFieldSx}
              />
            </Grid>
          </Grid>

          <Typography component="p" variant="body1" sx={IMAGE_SECTION_HEADING_SX}>
            {t('LABEL.IMAGES')}
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={3}
            justifyContent="space-evenly"
            alignItems="flex-start"
          >
            <Box sx={{ textAlign: 'center' }}>
              <RHFUploadAvatar
                name="center_image"
                onDrop={makeImageDropHandler('center_image')}
                sx={{ width: 120, height: 120 }}
              />
              <Typography variant="body2" sx={IMAGE_LABEL_SX}>
                {`${t('LABEL.CENTER')} ${t('LABEL.CENTER_IMAGE')}`}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <RHFUploadAvatar
                name="commercial_register_image"
                onDrop={makeImageDropHandler('commercial_register_image')}
                sx={{ width: 120, height: 120 }}
              />
              <Typography variant="body2" sx={IMAGE_LABEL_SX}>
                {t('LABEL.COMMERIAL_REGISTER')}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <RHFUploadAvatar
                name="bank_image"
                onDrop={makeImageDropHandler('bank_image')}
                sx={{ width: 120, height: 120 }}
              />
              <Typography variant="body2" sx={IMAGE_LABEL_SX}>
                {t('LABEL.BANK_ACCOUNT_IMAGE')}
              </Typography>
            </Box>
          </Stack>

          <LoadingButton
            type="submit"
            fullWidth
            loading={isSubmitting}
            variant="contained"
            sx={{
              mt: 4,
              py: 1.5,
              borderRadius: '12px',
              bgcolor: PROGRAM_SECTION_HEADING_COLOR,
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
