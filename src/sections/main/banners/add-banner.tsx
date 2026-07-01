/* eslint-disable no-plusplus */
import { useState } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Dialog, { DialogProps } from '@mui/material/Dialog';

import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { LoadingButton } from '@mui/lab';
import FormProvider, { RHFSelect } from 'src/components/hook-form';
import { useTranslate } from 'src/locales';
import { toFormData } from 'axios';
import { useSnackbar } from 'notistack';
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Box, MenuItem, Typography } from '@mui/material';
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
  fileName?: string;
  error?: string;
  onChange: (file: File | null) => void;
};

function LocaleMediaUpload({ label, value, fileName, error, onChange }: LocaleUploadProps) {
  const { t } = useTranslate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        p: 2,
        borderRadius: 1,
        border: '1px solid',
        borderColor: error ? 'error.main' : 'divider',
      }}
    >
      <Typography variant="subtitle2" color="secondary.main">
        {label}
      </Typography>
      <Button
        variant="contained"
        component="label"
        sx={{
          backgroundColor: '#007BFF',
          px: 2,
          py: 1.4,
          color: '#fff',
          alignSelf: 'flex-start',
          '&:hover': { backgroundColor: '#0056b3' },
        }}
      >
        {t('LABEL.UPLOAD_FILE')}
        <input
          type="file"
          accept="image/jpeg,image/png,video/mp4"
          hidden
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </Button>
      {(fileName || value?.name) && (
        <Typography variant="body2" color="text.secondary">
          {fileName || value?.name}
        </Typography>
      )}
      {error ? (
        <Typography color="error" variant="body2">
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

  const methods = useForm<FormValues>({
    resolver: yupResolver(
      yup.object().shape({
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
      })
    ),
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
