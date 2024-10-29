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

import FormProvider from 'src/components/hook-form/form-provider';
import RHFTextField from 'src/components/hook-form/rhf-text-field-form';
import { editReason, newReason } from 'src/actions/support';

interface Props {
  open: boolean;
  onClose: () => void;
  reason?: any | null;
}

export function NewEditReasonDialog({ open, onClose, reason }: Props) {
  const { t } = useTranslate();
  const { enqueueSnackbar } = useSnackbar();

  const methods = useForm({
    resolver: yupResolver(
      yup.object().shape({
        name_ar: yup.string().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
        name_en: yup.string().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
      })
    ),
    defaultValues: {
      name_ar: reason?.name_ar || '',
      name_en: reason?.name_en || '',
    },
  });
  const {
    setValue,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (reason) {
        await editReason(data, reason.id);
        enqueueSnackbar(t('MESSAGE.REASON_UPDATED_SUCCESSFULLY'));
      } else {
        await newReason(data);
        enqueueSnackbar(t('MESSAGE.REASON_CREATED_SUCCESSFULLY'));
      }
      invalidatePath(paths.dashboard.supportGroup.calls_reasons);
      onClose();
    } catch (error) {
      enqueueSnackbar(getErrorMessage(error), { variant: 'error' });
    }
  });

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <DialogTitle sx={{ pb: 2 }}>
        {t(reason ? 'LABEL.EDIT_REASON' : 'LABEL.NEW_REASON')}
      </DialogTitle>

      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogContent>
          <Stack
            spacing={1}
            sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mt: 1 }}
          >
            <RHFTextField
              name="name_ar"
              label={t('LABEL.REASON_NAME_IN_ARABIC')}
              placeholder={t('PLACEHOLDER.REASON_NAME_IN_ARABIC')}
              fullWidth
              value={watch('name_ar')}
            />
            <RHFTextField
              name="name_en"
              label={t('LABEL.REASON_NAME_IN_ENGLISH')}
              placeholder={t('PLACEHOLDER.REASON_NAME_IN_ENGLISH')}
              fullWidth
              value={watch('name_en')}
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
            {t(reason ? 'BUTTON.EDIT' : 'BUTTON.SAVE')}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
