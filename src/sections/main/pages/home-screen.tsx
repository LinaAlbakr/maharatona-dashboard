'use client';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { LoadingButton } from '@mui/lab';
import { Box, Card, CardActions, CardContent, Container, Typography } from '@mui/material';
import { toFormData } from 'axios';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { editStaticPage } from 'src/actions/static-pages';
import FormProvider, { RHFUploadAvatar } from 'src/components/hook-form';
import RHFEditor from 'src/components/hook-form/rhf-editor';
import { useSettingsContext } from 'src/components/settings';
import { useTranslate } from 'src/locales';
import { StaticPage } from 'src/types/static-pages';
import { useCallback } from 'react';

interface IProps {
  HomeScreen: StaticPage;
}

const HomeScreenView = ({ HomeScreen }: IProps) => {
  const settings = useSettingsContext();
  const { t } = useTranslate();
  const { enqueueSnackbar } = useSnackbar();
  const defaultValues = {
    content_ar: HomeScreen.content_ar.replace("'", '"') || '' || '',
    content_en: HomeScreen.content_en.replace("'", '"') || '' || '',
    image: HomeScreen?.image || null,
  };
  const methods = useForm({
    resolver: yupResolver(
      yup.object().shape({
        content_ar: yup.string().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
        content_en: yup.string().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
        image: yup.mixed<any>().nullable().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
      })
    ),
    defaultValues,
  });

  const {
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = methods;
  const onSubmit = handleSubmit(async (data) => {
    const reqBody = {
      ...data,
      content_ar: data.content_ar.replace('"', "'"),
      content_en: data.content_en.replace('"', "'"),
      static_page_type: 'HOME_SCREEN',
    };
    const formData = new FormData();
    toFormData(reqBody, formData);
    if (typeof data?.image === 'string') {
      formData.delete('image');
    }
    const res = await editStaticPage(formData);
    if (res?.error) {
      enqueueSnackbar(`${res?.error}`, { variant: 'error' });
    } else {
      enqueueSnackbar(t('MESSAGE.CONTENT_PUBLISHED_SUCCESSFULLY'), {
        variant: 'success',
      });
    }
  });
  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue('image', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  return (
    <Container
      maxWidth={settings.themeStretch ? false : 'xl'}
      sx={{ margin: '0px !important', padding: '0px !important', bgcolor: '#FAFAFA' }}
    >
      <Box
        sx={{
          width: '100%',
          backgroundImage: `url(/assets/images/pages/home-screen.jpg)`,
          height: '300px',
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
          {t('LABEL.HOME_SCREEN')}
        </Typography>
      </Box>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Card
          sx={{
            p: 4,
            borderRadius: 0,
          }}
        >
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <RHFUploadAvatar name="image" onDrop={handleDrop} sx={{ mb: 2 }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
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

export default HomeScreenView;
