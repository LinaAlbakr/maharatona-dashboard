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
import { newQuestion, editQuestion } from 'src/actions/faq';
import { invalidatePath } from 'src/actions/cache-invalidation';

import { RHFTextarea } from 'src/components/hook-form';
import FormProvider from 'src/components/hook-form/form-provider';
import RHFTextField from 'src/components/hook-form/rhf-text-field-form';

import { CategoryQuestion } from 'src/types/faq';

interface Props {
  open: boolean;
  onClose: () => void;
  item?: CategoryQuestion | null;
  categoryId: string;
}

export function NewEditQuestionDialog({ open, onClose, item, categoryId }: Props) {
  const { t } = useTranslate();
  const { enqueueSnackbar } = useSnackbar();
  const methods = useForm({
    resolver: yupResolver(
      yup.object().shape({
        question_ar: yup.string().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
        question_en: yup.string().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
        answer_ar: yup.string().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
        answer_en: yup.string().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
        order: yup.number().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
      })
    ),
    defaultValues: {
      question_ar: item?.question_ar || '',
      question_en: item?.question_en || '',
      answer_ar: item?.answer_ar || '',
      answer_en: item?.answer_en || '',
      order: item?.order || 1,
    },
  });
  const {
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {

    const reqBody = {
      ...data,
      faq_category_id: categoryId,
    };
    try {
      if (item) {
        const res = await editQuestion(reqBody, item.id);
        if (res?.error) {
          enqueueSnackbar(`${res?.error}`, { variant: 'error' });
        } else {
          enqueueSnackbar(t('MESSAGE.UPDATED_SUCCESSFULLY'));
        }
      } else {
        const res = await newQuestion(reqBody);
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
    <Dialog fullWidth maxWidth="md" open={open} onClose={onClose}>
      <DialogTitle sx={{ pb: 2 }}>
        {t(item ? 'LABEL.EDIT_QUESTION' : 'LABEL.NEW_QUESTION')}
      </DialogTitle>

      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogContent>
          <Stack
            spacing={1}
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 2,
              mt: 1,
            }}
          >
            <RHFTextField
              name="question_ar"
              label={t('LABEL.QUESTION_NAME_IN_ARABIC')}
              fullWidth
              value={watch('question_ar')}
            />
            <RHFTextField
              name="question_en"
              label={t('LABEL.QUESTION_NAME_IN_ENGLISH')}
              fullWidth
              value={watch('question_en')}
            />
            <RHFTextarea
              minRows={10}
              name="answer_ar"
              label={t('LABEL.QUESTION_ANSWER_IN_ARABIC')}
              fullWidth
              value={watch('answer_ar')}
            />
            <RHFTextarea
              minRows={10}
              name="answer_en"
              label={t('LABEL.QUESTION_ANSWER_IN_ENGLISH')}
              fullWidth
              value={watch('answer_en')}
            />
            <RHFTextField name="order" label={t('LABEL.ORDER')} fullWidth value={watch('order')} />
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
