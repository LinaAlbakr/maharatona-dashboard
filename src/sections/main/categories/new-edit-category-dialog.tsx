'use client';

import * as yup from 'yup';
import { toFormData } from 'axios';
import { use, useCallback, useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { LoadingButton } from '@mui/lab';
import {
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Box,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { getErrorMessage } from 'src/utils/axios';

import { useTranslate } from 'src/locales';
import { invalidatePath } from 'src/actions/cache-invalidation';

import FormProvider from 'src/components/hook-form/form-provider';
import RHFTextField from 'src/components/hook-form/rhf-text-field-form';
import { RHFUploadAvatar } from 'src/components/hook-form';
import { SketchPicker } from 'react-color';
import { set } from 'lodash';
import { editCategoriey, newCategoriey } from 'src/actions/categories';

interface Props {
  open: boolean;
  onClose: () => void;
  category?: any | null;
}

export function NewEditBrandDialog({ open, onClose, category }: Props) {
  const { t } = useTranslate();
  const { enqueueSnackbar } = useSnackbar();
  const [color, setColor] = useState(
    category?.color.charAt(0) === '#'
      ? category?.color
      : category?.color.charAt(0) !== '#'
        ? `#${category?.color}`
        : '#ffffff'
  );
  const [showPicker, setShowPicker] = useState(false);

  const methods = useForm({
    resolver: yupResolver(
      yup.object().shape({
        name_ar: yup.string().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
        name_en: yup.string().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
        color: yup.string().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
        avatar: yup.mixed<File | string>().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
      })
    ),
    defaultValues: {
      name_ar: category?.name_ar || '',
      name_en: category?.name_en || '',
      color: category?.color || '',
      avatar: category?.avatar || '',
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
      const file = Object.assign(acceptedFiles[0], {
        preview: URL.createObjectURL(acceptedFiles[0]),
      });
      setValue('avatar', file);
    },
    [setValue]
  );

  const onSubmit = handleSubmit(async (data) => {
    const formData = new FormData();
    toFormData(data, formData);
    try {
      if (category) {
        await editCategoriey(formData, category.id);
        enqueueSnackbar(t('Brand updated successfully'));
      } else {
        await newCategoriey(formData);
        enqueueSnackbar(t('Brand created successfully'));
      }
      invalidatePath(paths.dashboard.categories);
      onClose();
    } catch (error) {
      enqueueSnackbar(getErrorMessage(error), { variant: 'error' });
    }
  });

  const handleColorChange = (newColor: { hex: any }) => {
    setColor(newColor.hex);
    setValue('color', newColor.hex);
  };
  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <DialogTitle sx={{ pb: 2 }}>
        {t(category ? 'TITLE.EDIT_CATEGORY' : 'TITLE.NEW_CATEGORY')}
      </DialogTitle>

      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogContent style={{ height: '600px' }}>
          <RHFUploadAvatar name="avatar" maxSize={3145728} onDrop={handleDrop} sx={{ mb: 2 }} />
          <Stack
            spacing={1}
            sx={{
              display: 'grid',
              gridTemplateColumns: { sm: ' 1fr', md: ' 1fr 1fr' },
              alignItems: 'center',
            }}
          >
            <RHFTextField
              name="name_ar"
              label={t('Name in Arabic')}
              placeholder={t('Name in Arabic')}
              fullWidth
              value={watch('name_ar')}
            />
            <RHFTextField
              name="name_en"
              label={t('Name in English')}
              placeholder={t('Name in English')}
              fullWidth
              value={watch('name_en')}
            />
            <RHFTextField
              name="color"
              label={t('color')}
              placeholder={t('color')}
              fullWidth
              value={watch('color')}
              disabled
            />
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setShowPicker(!showPicker)}
              >
                Pick Color
              </Button>
              <Box
                style={{
                  backgroundColor: color,
                  color: color,
                  marginInline: '5px',
                  border: '1px solid #000',
                  cursor: 'unset',
                }}
                sx={{
                  height: '36px',
                  width: '84px',
                  borderRadius: '6px',
                  position: 'relative',
                }}
              >
                {showPicker && (
                  <Box
                    mt={2}
                    sx={{ position: 'absolute', bottom: '-320px', left: '-100px', zIndex: 66 }}
                  >
                    <SketchPicker color={color} onChange={handleColorChange} />
                  </Box>
                )}
              </Box>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" color="inherit" onClick={onClose}>
            {t('BUTTON.CANCEL')}
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {t(category ? 'BUTTON.EDIT' : 'BUTTON.SAVE')}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
