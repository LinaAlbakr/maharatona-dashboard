'use client';
import { LoadingButton } from '@mui/lab';
import { Box, Card, CardActions, CardContent, Container, Typography } from '@mui/material';
import { toFormData } from 'axios';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { editStaticPage } from 'src/actions/static-pages';
import FormProvider from 'src/components/hook-form';
import RHFEditor from 'src/components/hook-form/rhf-editor';
import { useSettingsContext } from 'src/components/settings';
import { useTranslate } from 'src/locales';
import { StaticPage } from 'src/types/static-pages';

interface IProps {
  termsAndConditions: StaticPage;
}

const TermsAndConditionsView = ({ termsAndConditions }: IProps) => {
  const settings = useSettingsContext();
  const { t } = useTranslate();
  const { enqueueSnackbar } = useSnackbar();

  const defaultValues = {
    content_ar: termsAndConditions.content_ar || '',
    content_en: termsAndConditions.content_en || '',
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
      static_page_type: 'TERMS_AND_CONDITIONS',
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
    <Container
      maxWidth={settings.themeStretch ? false : 'xl'}
      sx={{ margin: '0px !important', padding: '0px !important', bgcolor: '#FAFAFA' }}
    >
      <Box
        sx={{
          width: '100%',
          backgroundImage: `url(/assets/images/pages/terms-and-conditions.jpg)`,
          height: '200px',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          p: 0,
          boxShadow: 'inset 0 0 0 2000px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <Typography variant="h2" color="white">
          {t('LABEL.TERMS_AND_CONDITIONS')}
        </Typography>
      </Box>
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
    </Container>
  );
};

export default TermsAndConditionsView;
