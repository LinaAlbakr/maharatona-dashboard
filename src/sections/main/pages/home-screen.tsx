'use client';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { LoadingButton } from '@mui/lab';
import { Box, Card, CardActions, CardContent, Container, Typography } from '@mui/material';
import { toFormData } from 'axios';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { editStaticPage, createStaticPage } from 'src/actions/static-pages';
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
    content_ar: HomeScreen.content_ar || '',
    content_en: HomeScreen.content_en || '',
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
    const pageId = (HomeScreen as any)?.id ?? (HomeScreen as any)?._id ?? (HomeScreen as any)?.data?._id;

    const hasNewFile = !!data?.image && typeof data.image !== 'string';

    // Build payload (FormData when file present, JSON otherwise)
    let payload: any;
    if (hasNewFile) {
      const formData = new FormData();
      formData.append('content_ar', data.content_ar || '');
      formData.append('content_en', data.content_en || '');
      formData.append('static_page_type', 'HOME_SCREEN');
      // Backend expects the file field key to be 'file'
      formData.append('file', data.image as File);
      payload = formData;
    } else {
      payload = {
        content_ar: data.content_ar,
        content_en: data.content_en,
        static_page_type: 'HOME_SCREEN',
      };
    }

    const res = !pageId ? await createStaticPage(payload) : await editStaticPage(pageId, payload);
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
                <Typography variant="h4" sx={{ color: 'info.dark', mt: 2, mb: 1 }}>
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
              <Box>
                <Typography variant="h4" sx={{ color: 'info.dark', mt: 2, mb: 1 }}>
                  {t('LABEL.ARABIC_CONTENT')}
                </Typography>
                <RHFEditor
                  name="content_ar"
                  sx={{
                    '& .ql-editor': {
                      minHeight: '200px',
                      // direction: 'rtl',
                      // textAlign: 'right',
                    },
                  }}
                />{' '}
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
