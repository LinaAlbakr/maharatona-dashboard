import * as Yup from 'yup';
import { useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useTranslate } from 'src/locales';

import { Grid } from '@mui/material';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { ICenter } from 'src/types/centers';
import { sendMessageToClient } from 'src/actions/notifications';

type Props = {
  open: boolean;
  onClose: VoidFunction;
  selectedCenter: ICenter | undefined;
};

export default function SendNotification({ open, onClose, selectedCenter }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslate();

  const NewMessageSchema = Yup.object().shape({
    message_ar: Yup.string().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
    message_en: Yup.string().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
    title_ar: Yup.string().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
    title_en: Yup.string().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
    sendTo: Yup.string().optional(),
  });

  const defaultValues = useMemo(
    () => ({
      message_ar: '',
      message_en: '',
      title_ar: "مهاراتنا",
      title_en: "Maharatona",
      sendTo: (selectedCenter?.name || (selectedCenter as any)?.username || '') as string,
    }),
    [selectedCenter]
  );

  const methods = useForm({
    resolver: yupResolver(NewMessageSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (selectedCenter) {
      setValue('sendTo', selectedCenter?.name || (selectedCenter as any)?.username || '');
    }
  }, [selectedCenter, setValue]);

  const values = watch();
  const onSubmit = handleSubmit(async (data) => {
    const newMessage = {
      title_ar: "مهاراتنا",
      title_en: "Maharatona",
      message_ar: data.message_ar,
      message_en: data.message_en,
      user_id: selectedCenter?.id || (selectedCenter as any)?._id || selectedCenter?.user_id,
    };

    const res = await sendMessageToClient(newMessage);
    if (res?.error) {
      enqueueSnackbar(`${res.error}`, { variant: 'error' });
    } else {
      enqueueSnackbar(t('MESSAGE.SEND_SUCCESSFULLY'), { variant: 'success' });
      onClose();
    }
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
          <Box sx={{ mt: 2 }}>
            <RHFTextField
              name="sendTo"
              label={t('LABEL.SEND_TO')}
              type="text"
              disabled
            />
          </Box>
          <Grid rowGap={2} mt={1} container columnSpacing={{ xs: 1, sm: 2 }}>
            <Grid item sm={6} xs={12}>
              <RHFTextField name="title_ar" defaultValue="مهاراتنا" label={t('LABEL.TITLE_AR')} type="text" disabled />
            </Grid>
            <Grid item sm={6} xs={12}>
              <RHFTextField name="title_en" defaultValue="Maharatona" label={t('LABEL.TITLE_EN')} type="text" disabled />
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
            {t('BUTTON.SEND')}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
