'use client';

import * as yup from 'yup';
import { toFormData } from 'axios';
import { useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Stack,
  Button,
  Dialog,
  MenuItem,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { getErrorMessage } from 'src/utils/axios';

import { useTranslate } from 'src/locales';
import { newBanner, editBanner } from 'src/actions/banners';
import { invalidatePath } from 'src/actions/cache-invalidation';

import FormProvider from 'src/components/hook-form/form-provider';
import RHFTextField from 'src/components/hook-form/rhf-text-field-form';
import { RHFSelect, RHFTextarea, RHFUploadAvatar } from 'src/components/hook-form';

import { Banner } from 'src/types/banners';

const OPTIONS = ['MAIN', 'FIELD', 'BOTH'];
interface Props {
  open: boolean;
  onClose: () => void;
  banner?: Banner;
}

export function NewEditBannerDialog({ open, onClose, banner }: Props) {
  const { t } = useTranslate();
  const { enqueueSnackbar } = useSnackbar();

  const methods = useForm({
    resolver: yupResolver(
      yup.object().shape({
        image_cover: yup.mixed<any>().nullable().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
        name_ar: yup.string().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
        name_en: yup.string().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
        description_ar: yup.string().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
        description_en: yup.string().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
        price: yup.number().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
        duration: yup.number().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
        advertisement_type: yup.string().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
        order: yup.number().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
      })
    ),
    defaultValues: {
      image_cover: banner?.image_cover || null,
      name_ar: banner?.name_ar || '',
      name_en: banner?.name_en || '',
      description_ar: banner?.description_ar || '',
      description_en: banner?.description_en || '',
      duration: banner?.duration || undefined,
      price: banner?.price || undefined,
      order: banner?.order || undefined,
      advertisement_type: banner?.advertisementType || '',
    },
  });
  const {
    setValue,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = methods;

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue('image_cover', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  const onSubmit = handleSubmit(async (data) => {
    const formData = new FormData();
    toFormData(data, formData);
    if (typeof data?.image_cover === 'string') {
      formData.delete('image_cover');
    }
    try {
      if (banner) {
        const res = await editBanner(formData, banner.id);

        if (res?.error) {
          enqueueSnackbar(`${res?.error}`, { variant: 'error' });
        } else {
          enqueueSnackbar(t('MESSAGE.UPDATED_SUCCESSFULLY'));
        }
      } else {
        const res = await newBanner(formData);

        if (res?.error) {
          enqueueSnackbar(`${res?.error}`, { variant: 'error' });
        } else {
          enqueueSnackbar(t('MESSAGE.CREATED_SUCCESSFULLY'));
        }
      }
      invalidatePath(paths.dashboard.faq);
      onClose();
    } catch (error) {
      enqueueSnackbar(getErrorMessage(error), { variant: 'error' });
    }
  });

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <DialogTitle sx={{ pb: 2 }}>
        {t(banner ? 'TITLE.EDIT_PACKAGE' : 'TITLE.NEW_PACKAGE')}
      </DialogTitle>

      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogContent>
          <Stack spacing={1}>
            <RHFUploadAvatar name="image_cover" onDrop={handleDrop} sx={{ mb: 2 }} />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { sm: ' 1fr', md: ' 1fr 1fr' },
                alignItems: 'center',
                gap: 2,
              }}
            >
              <RHFTextField
                name="name_ar"
                label={t('LABEL.NAME_AR')}
                fullWidth
                value={watch('name_ar')}
              />
              <RHFTextField
                name="name_en"
                label={t('LABEL.NAME_EN')}
                fullWidth
                value={watch('name_en')}
              />
              <RHFTextarea
                minRows={10}
                name="description_ar"
                label={t('LABEL.DESCRIPTION_IN_ARABIC')}
                fullWidth
                value={watch('description_ar')}
              />
              <RHFTextarea
                minRows={10}
                name="description_en"
                label={t('LABEL.DESCRIPTION_IN_ENGLISH')}
                fullWidth
                value={watch('description_en')}
              />
              <RHFTextField
                name="price"
                label={t('LABEL.PRICE')}
                fullWidth
                type="number"
                value={watch('price')}
              />
              <RHFTextField
                name="duration"
                label={t('LABEL.DURATION')}
                fullWidth
                value={watch('duration')}
                type="number"
              />
              <RHFSelect name="advertisement_type" label={`${t('LABEL.TYPE')}`}>
                {/*     <MenuItem value="">None</MenuItem>
                <Divider sx={{ borderStyle: 'dashed' }} /> */}
                {OPTIONS.map((option: string, index: number) => (
                  <MenuItem key={index} value={option}>
                    {t(`LABEL.${option}`)}
                  </MenuItem>
                ))}
              </RHFSelect>
              <RHFTextField
                minRows={10}
                name="order"
                label={t('LABEL.ORDER')}
                fullWidth
                value={watch('order')}
                type="number"
              />
            </Box>
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
            {t(banner ? 'BUTTON.EDIT' : 'BUTTON.SAVE')}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
