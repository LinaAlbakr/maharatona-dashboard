/* eslint-disable no-plusplus */
import { useMemo, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Dialog, { DialogProps } from '@mui/material/Dialog';

import * as yup from 'yup';
import { useDropzone } from 'react-dropzone';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { LoadingButton } from '@mui/lab';
import { alpha } from '@mui/material/styles';
import FormProvider, { RHFSelect } from 'src/components/hook-form';
import { useTranslate } from 'src/locales';
import { toFormData } from 'axios';
import { useSnackbar } from 'notistack';
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Box, MenuItem, Typography } from '@mui/material';
import Iconify from 'src/components/iconify';
import { addBanner } from 'src/actions/banners';
import i18n from 'src/locales/i18n';

// ----------------------------------------------------------------------

interface Props extends DialogProps {
  open: boolean;
  onClose: VoidFunction;
  fieldsName: any[];
  id: string | undefined;
  isMain: boolean;
}

type FormValues = {
  media_ar: File | null;
  media_en: File | null;
  field: string;
};

const VALID_MEDIA_TYPES = ['image/jpeg', 'image/png', 'video/mp4'];

function resolveMediaType(file: File): 'IMAGE' | 'VIDEO' {
  return file.type === 'video/mp4' ? 'VIDEO' : 'IMAGE';
}

function validateMediaFile(file: File | null | undefined): string | true {
  if (!file) return 'File is required.';
  if (!VALID_MEDIA_TYPES.includes(file.type)) {
    return 'Only JPG, PNG, or MP4 files are allowed.';
  }
  return true;
}

type LocaleUploadProps = {
  label: string;
  value: File | null;
  error?: string;
  onChange: (file: File | null) => void;
};

function LocaleMediaUpload({ label, value, error, onChange }: LocaleUploadProps) {
  const { t } = useTranslate();

  const isVideo = value?.type === 'video/mp4';
  const previewUrl = useMemo(
    () => (value ? URL.createObjectURL(value) : ''),
    [value]
  );

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'video/mp4': [],
    },
    onDrop: (acceptedFiles) => {
      if (acceptedFiles?.[0]) onChange(acceptedFiles[0]);
    },
  });

  return (
    <Box sx={{ width: '100%' }}>
      <Typography
        variant="subtitle2"
        sx={{ mb: 1, color: 'secondary.main', fontWeight: 700 }}
      >
        {label}{' '}
        <Box component="span" sx={{ color: 'error.main' }}>
          *
        </Box>
      </Typography>

      <Box
        {...getRootProps()}
        sx={{
          position: 'relative',
          minHeight: 150,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          p: 2,
          cursor: 'pointer',
          borderRadius: 2,
          overflow: 'hidden',
          border: (theme) =>
            `1px dashed ${
              error
                ? theme.palette.error.main
                : alpha(theme.palette.grey[500], 0.32)
            }`,
          bgcolor: (theme) =>
            error
              ? alpha(theme.palette.error.main, 0.08)
              : alpha(theme.palette.grey[500], 0.04),
          transition: (theme) => theme.transitions.create(['opacity', 'border-color']),
          '&:hover': { opacity: 0.72 },
          ...(isDragActive && { opacity: 0.72 }),
        }}
      >
        <input {...getInputProps()} />

        {value ? (
          isVideo ? (
            <Stack spacing={1} alignItems="center">
              <Box
                component="video"
                src={previewUrl}
                sx={{ maxHeight: 130, maxWidth: '100%', borderRadius: 1 }}
              />
              <Typography variant="caption" color="text.secondary" noWrap>
                {value.name}
              </Typography>
            </Stack>
          ) : (
            <Box
              component="img"
              src={previewUrl}
              alt={value.name}
              sx={{
                maxHeight: 130,
                maxWidth: '100%',
                objectFit: 'contain',
                borderRadius: 1,
              }}
            />
          )
        ) : (
          <Stack spacing={1} alignItems="center" sx={{ color: 'text.secondary' }}>
            <Iconify icon="solar:gallery-add-outline" width={40} />
            <Typography variant="body2">{t('LABEL.BANNER_UPLOAD_MEDIA')}</Typography>
          </Stack>
        )}
      </Box>

      {error ? (
        <Typography color="error" variant="caption" sx={{ mt: 0.5, display: 'block' }}>
          {error}
        </Typography>
      ) : null}
    </Box>
  );
}

export default function FileManagerNewFolderDialog({
  open,
  onClose,
  fieldsName,
  id,
  isMain,
}: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslate();

  const bannerSchema = yup.object().shape({
    media_ar: yup
      .mixed<File>()
      .nullable()
      .required(t('LABEL.THIS_FIELD_IS_REQUIRED'))
      .test('media-ar-type', 'Only JPG, PNG, or MP4 files are allowed.', (value) =>
        validateMediaFile(value) === true
      ),
    media_en: yup
      .mixed<File>()
      .nullable()
      .required(t('LABEL.THIS_FIELD_IS_REQUIRED'))
      .test('media-en-type', 'Only JPG, PNG, or MP4 files are allowed.', (value) =>
        validateMediaFile(value) === true
      ),
    field: yup
      .string()
      .nullable()
      .when([], () => {
        if (!isMain) {
          return yup.string().required(t('LABEL.THIS_FIELD_IS_REQUIRED'));
        }
        return yup.string().nullable();
      }),
  });

  const methods = useForm<FormValues>({
    resolver: yupResolver(bannerSchema) as Resolver<FormValues>,
    defaultValues: {
      media_ar: null,
      media_en: null,
      field: '',
    },
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting, errors },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    const reqBody = {
      advertisement_id: id,
      field_id: data.field,
      media_ar: data.media_ar,
      media_en: data.media_en,
      mediaTypeAr: resolveMediaType(data.media_ar!),
      mediaTypeEn: resolveMediaType(data.media_en!),
    };
    const formData = new FormData();
    toFormData(reqBody, formData);

    const res = await addBanner(formData);

    if (res?.error) {
      enqueueSnackbar(`${res?.error}`, { variant: 'error' });
    } else {
      enqueueSnackbar(t('MESSAGE.BANNER_ADDED_SUCCESSFULLY'));
      reset();
      onClose();
    }
  });

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <DialogTitle sx={{ color: 'secondary.main' }}>{t('LABEL.ADD_BANNER')}</DialogTitle>
      <DialogContent dividers sx={{ pt: 1, pb: 0, border: 'none' }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          {t('LABEL.BANNER_IMAGE_DIMENSION_HINT')}
        </Alert>
        <FormProvider methods={methods} onSubmit={onSubmit}>
          <DialogContent sx={{ px: 0 }}>
            <Stack spacing={2}>
              <Controller
                name="media_ar"
                control={control}
                render={({ field }) => (
                  <LocaleMediaUpload
                    label={t('LABEL.BANNER_IMAGE_AR')}
                    value={field.value}
                    error={errors.media_ar?.message}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                name="media_en"
                control={control}
                render={({ field }) => (
                  <LocaleMediaUpload
                    label={t('LABEL.BANNER_IMAGE_EN')}
                    value={field.value}
                    error={errors.media_en?.message}
                    onChange={field.onChange}
                  />
                )}
              />
              {!isMain ? (
                <RHFSelect name="field" label={t('LABEL.FIELD')}>
                  {fieldsName.map((field: any) => (
                    <MenuItem key={field._id} value={field._id}>
                      {i18n.language === 'ar' ? field.name_ar : field.name_en || ''}
                    </MenuItem>
                  ))}
                </RHFSelect>
              ) : null}
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
              onClick={() => {
                reset();
                onClose();
              }}
              disabled={isSubmitting}
            >
              {t('BUTTON.CANCEL')}
            </Button>
            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              {t('BUTTON.SAVE')}
            </LoadingButton>
          </DialogActions>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
