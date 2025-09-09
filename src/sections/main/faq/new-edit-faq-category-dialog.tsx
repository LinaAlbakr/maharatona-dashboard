'use client';

import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { LoadingButton } from '@mui/lab';
import { Stack, Button, Dialog, DialogTitle, DialogActions, DialogContent } from '@mui/material';

import { paths } from 'src/routes/paths';

import { getErrorMessage } from 'src/utils/axios';

import { useTranslate } from 'src/locales';
import { invalidatePath } from 'src/actions/cache-invalidation';
import { newFaqCategory, editFaqCategory } from 'src/actions/faq';

import FormProvider from 'src/components/hook-form/form-provider';
import RHFTextField from 'src/components/hook-form/rhf-text-field-form';

interface Props {
  open: boolean;
  onClose: () => void;
  item?: any | null;
  value?: number;
}

export function NewEditFaqCategoryDialog({ open, onClose, item, value }: Props) {
  const { t } = useTranslate();
  const { enqueueSnackbar } = useSnackbar();
  const methods = useForm({
    resolver: yupResolver(
      yup.object().shape({
        name_ar: yup.string().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
        name_en: yup.string().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
        order: yup.number().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
      })
    ),
    defaultValues: {
      name_ar: item?.name_ar || '',
      name_en: item?.name_en || '',
      order: item?.order || undefined,
    },
  });
  const {
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (item) {
         const payload = {
          ...data,
          created_for: value === 0 ? 'student' : 'center',
        };
        const res = await editFaqCategory(payload, item.id);
        if (res?.error) {
          enqueueSnackbar(`${res?.error}`, { variant: 'error' });
        } else {
          enqueueSnackbar(t('MESSAGE.UPDATED_SUCCESSFULLY'));
        }
      } else {
        const payload = {
          ...data,
          created_for: value === 0 ? 'student' : 'center',
        };
        const res = await newFaqCategory(payload);
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
        {t(item ? 'LABEL.EDIT_CATEGORY' : 'LABEL.NEW_CATEGORY')}
      </DialogTitle>

      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogContent>
          <Stack
            spacing={1}
            sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mt: 1 }}
          >
            <RHFTextField
              name="name_ar"
              label={t('LABEL.CATEGORY_NAME_IN_ARABIC')}
              placeholder={t('PLACEHOLDER.CATEGORY_NAME_IN_ARABIC')}
              fullWidth
              value={watch('name_ar')}
            />
            <RHFTextField
              name="name_en"
              label={t('LABEL.CATEGORY_NAME_IN_ENGLISH')}
              placeholder={t('PLACEHOLDER.CATEGORY_NAME_IN_ENGLISH')}
              fullWidth
              value={watch('name_en')}
            />
            <RHFTextField
              name="order"
              label={t('LABEL.ORDER')}
              fullWidth
              type='number'
              value={watch('order')}
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
            {t(item ? 'BUTTON.EDIT' : 'BUTTON.SAVE')}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
