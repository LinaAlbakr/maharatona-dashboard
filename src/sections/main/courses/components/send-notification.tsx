import * as Yup from 'yup';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

// import { Units } from 'src/@types/units';
import { useTranslate } from 'src/locales';
// import { addUnit, updateUnit } from 'src/actions/units-actions';

import { Grid } from '@mui/material';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { sendMessage } from 'src/actions/notifications';
import { toFormData } from 'axios';

type Props = {
  open: boolean;
  onClose: VoidFunction;
  selectedSubscribers: string[] | undefined;
};

export default function SendNotification({ open, onClose, selectedSubscribers }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslate();
  const NewMessageSchema = Yup.object().shape({
    message_ar: Yup.string().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
    message_en: Yup.string().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
    title_ar: Yup.string().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
    title_en: Yup.string().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
  });


  const defaultValues = useMemo(
    () => ({
      message_ar: '',
      message_en: '',
      title_ar: '',
      title_en: '',
    }),
    [selectedSubscribers]
  );

  const methods = useForm({
    resolver: yupResolver(NewMessageSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();
  const onSubmit = handleSubmit(async (data) => {
    const newMessage = {
      ...data,
      users_id: [selectedSubscribers],
    };

    const res = await sendMessage(newMessage);
    if (res === 201) {
      enqueueSnackbar(t('MESSAGE.SEND_SUCCESSFULLY'));
    } else {
      enqueueSnackbar(`${res?.error}`, { variant: 'error' });
    }
    onClose();
  });

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { maxWidth: 720 },
      }}
    >
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>{t('TITLE.SEND_NOTIFICATON')}</DialogTitle>
        <DialogContent>
          <Grid rowGap={2} mt={1} container columnSpacing={{ xs: 1, sm: 2 }}>
            <Grid item sm={6} xs={12}>
              <RHFTextField name="title_ar" label={t('LABEL.TITLE_AR')} type="text" />
            </Grid>
            <Grid item sm={6} xs={12}>
              <RHFTextField name="title_en" label={t('LABEL.TITLE_EN')} type="text" />
            </Grid>

            <Grid item sm={6} xs={12}>
              <RHFTextField
                multiline
                rows={4}
                maxRows={4}
                type="text"
                name="message_ar"
                label={t('LABEL.CONTENT_AR')}
              />
            </Grid>
            <Grid item sm={6} xs={12}>
              <RHFTextField
                multiline
                rows={4}
                maxRows={4}
                type="text"
                name="message_en"
                label={t('LABEL.CONTENT_EN')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            {t('BUTTON.CANCEL')}
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {t('BUTTON.SEND')}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
