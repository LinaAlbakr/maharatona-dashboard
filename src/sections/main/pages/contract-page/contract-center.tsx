'use client';

import { LoadingButton } from '@mui/lab';
import { Box, Card, CardActions, CardContent, Typography } from '@mui/material';
import { toFormData } from 'axios';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { editStaticPage } from 'src/actions/static-pages';
import FormProvider from 'src/components/hook-form';
import RHFEditor from 'src/components/hook-form/rhf-editor';
import { useTranslate } from 'src/locales';
import { StaticPage } from 'src/types/static-pages';

interface IProps {
  ContractCenter: StaticPage;
}

const ContractCenterView = ({ ContractCenter }: IProps) => {
  const { t } = useTranslate();
  const { enqueueSnackbar } = useSnackbar();

  const defaultValues = {
    content_ar: ContractCenter.content_ar || '',
    content_en: ContractCenter.content_en || '',
  };
  const methods = useForm({
    defaultValues,
  });

  const {
    handleSubmit,

    formState: { isSubmitting },
  } = methods;
  const onSubmit = handleSubmit(async (data) => {
    const reqBody = {
      ...data,
      content_ar: data.content_ar.replace('"', '\n"'),
      content_en: data.content_en.replace('"', '\n"'),
      static_page_type: 'CONTRACT_PAGE_CENTER',
    };

    const formData = new FormData();
    toFormData(reqBody, formData);

    const res = await editStaticPage(formData);

    if (res?.error) {
      enqueueSnackbar(`${res?.error}`, { variant: 'error' });
    } else {
      enqueueSnackbar(t('MESSAGE.CONTENT_PUBLISHED_SUCCESSFULLY'), {
        variant: 'success',
      });
    }
  });

  return (
 
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Card
          sx={{
            p: 4,
            borderRadius: 0,
          }}
        >
          <CardContent sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box>
              <Typography variant="h4" color="info.dark" marginBlock={1}>
                {t('LABEL.ARABIC_CONTENT')}
              </Typography>
              <RHFEditor
                name="content_ar"
                sx={{
                  '& .ql-editor': {
                    minHeight: '200px',
                  },
                }}
              />{' '}
            </Box>
            <Box>
              <Typography variant="h4" color="info.dark" marginBlock={1}>
                {t('LABEL.ENGLISH_CONTENT')}
              </Typography>
              <RHFEditor
                name="content_en"
                sx={{
                  '& .ql-editor': {
                    minHeight: '200px',
                  },
                }}
              />
            </Box>
          </CardContent>
          <CardActions
            sx={{
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
          >
            <LoadingButton
              type="submit"
              loading={isSubmitting}
              sx={{
                color: 'primary.contrastText',
                backgroundColor: 'secondary.main',
              }}
            >
              {t('BUTTON.PUBLISH')}
            </LoadingButton>
          </CardActions>
        </Card>
      </FormProvider>
  );
};

export default ContractCenterView;
