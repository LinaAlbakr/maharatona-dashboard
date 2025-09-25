'use client';

import * as yup from 'yup';
import { toFormData } from 'axios';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { SketchPicker } from 'react-color';
import { useState, useCallback } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { getErrorMessage } from 'src/utils/axios';

import { useTranslate } from 'src/locales';
import { invalidatePath } from 'src/actions/cache-invalidation';
import { newCategoriey, editCategoriey } from 'src/actions/categories';

import { RHFUploadAvatar } from 'src/components/hook-form';
import FormProvider from 'src/components/hook-form/form-provider';
import RHFTextField from 'src/components/hook-form/rhf-text-field-form';

interface Props {
  open: boolean;
  onClose: () => void;
  category?: any | null;
}

export function NewEditCategoryDialog({ open, onClose, category }: Props) {
  const { t } = useTranslate();
  const { enqueueSnackbar } = useSnackbar();
  const [color, setColor] = useState(
    // eslint-disable-next-line no-nested-ternary
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
        avatar: yup.mixed<any>().nullable().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
        order: yup.number().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
      })
    ),
    defaultValues: {
      name_ar: category?.name_ar || '',
      name_en: category?.name_en || '',
      color: category?.color || '#ffffff',
      avatar: category?.avatar || null,
      order: category?.order || undefined,
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
        setValue('avatar', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  const onSubmit = handleSubmit(async (data) => {
    const formData = new FormData();
    toFormData(data, formData);
    if (typeof data?.avatar === 'string') {
      formData.delete('avatar');
    }
    try {
      if (category) {
        await editCategoriey(formData, category.id);
        enqueueSnackbar(t('MESSAGE.FEILD_UPDATED_SUCCESSFULLY'));
      } else {
       const res = await newCategoriey(formData);
        enqueueSnackbar(t('MESSAGE.FEILD_CREATED_SUCCESSFULLY'));
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
          <RHFUploadAvatar
            name="avatar"
            // maxSize={3145728}
            onDrop={handleDrop}
            sx={{ mb: 2 }}
          />
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
              label={t('LABEL.NAME_AR')}
              placeholder={t('LABEL.NAME_AR')}
              fullWidth
              value={watch('name_ar')}
            />
            <RHFTextField
              name="name_en"
              label={t('LABEL.NAME_EN')}
              placeholder={t('LABEL.NAME_EN')}
              fullWidth
              value={watch('name_en')}
            />
            <RHFTextField
              name="order"
              label={t('LABEL.ORDER')}
              placeholder={t('LABEL.ORDER')}
              fullWidth
              value={watch('order')}
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
                  color,
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
            {t(category ? 'BUTTON.EDIT' : 'BUTTON.SAVE')}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
