'use client';

import { LoadingButton } from '@mui/lab';
import { Box, Card, CardActions, CardContent, Container, Tab, Tabs, Typography } from '@mui/material';
import { toFormData } from 'axios';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { editStaticPage } from 'src/actions/static-pages';
import FormProvider from 'src/components/hook-form';
import RHFEditor from 'src/components/hook-form/rhf-editor';
import { useSettingsContext } from 'src/components/settings';
import { useTranslate } from 'src/locales';
import { StaticPage } from 'src/types/static-pages';

interface IProps {
  termsAndConditionsStudent: StaticPage;
  termsAndConditionsCenter: StaticPage;
}

const TermsAndConditionsView = ({ termsAndConditionsStudent, termsAndConditionsCenter }: IProps) => {
  const settings = useSettingsContext();
  const { t } = useTranslate();
  const { enqueueSnackbar } = useSnackbar();

  const [value, setValue] = useState<number>(0);

  // keep both tab contents in state
  const [tabContents, setTabContents] = useState({
    student: {
      content_ar: termsAndConditionsStudent?.content_ar || '',
      content_en: termsAndConditionsStudent?.content_en || '',
    },
    center: {
      content_ar: termsAndConditionsCenter?.content_ar || '',
      content_en: termsAndConditionsCenter?.content_en || '',
    },
  });

  // initialize form with student by default
  const methods = useForm({
    defaultValues: tabContents.student,
  });

  const {
    handleSubmit,
    getValues,
    reset,
    formState: { isSubmitting },
  } = methods;

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    // save current tab values before switching
    const currentData = getValues();
    setTabContents((prev) => ({
      ...prev,
      [value === 0 ? 'student' : 'center']: currentData,
    }));

    // load new tab values
    reset(newValue === 0 ? tabContents.student : tabContents.center);
    setValue(newValue);
  };

  const onSubmit = handleSubmit(async (data) => {
    const reqBody = {
      ...data,
      content_ar: data.content_ar.replace('"', '\n"'),
      content_en: data.content_en.replace('"', '\n"'),
      static_page_type: value === 0 ? 'TERMS_AND_CONDITIONS_STUDENT' : 'TERMS_AND_CONDITIONS_CENTER',
    };

    const formData = new FormData();
    toFormData(reqBody, formData);

    const res = await editStaticPage(formData);
    if (res?.error) {
      enqueueSnackbar(`${res?.error}`, { variant: 'error' });
    } else {
      enqueueSnackbar(t('MESSAGE.CONTENT_PUBLISHED_SUCCESSFULLY'), { variant: 'success' });
    }
  });

  return (
    <Container
      maxWidth={settings.themeStretch ? false : 'xl'}
      sx={{ margin: '0px !important', padding: '0px !important', bgcolor: '#FAFAFA' }}
    >
      {/* Hero Section */}
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
          gap: 1,
        }}
      >
        <Typography variant="h2" color="white">
          {t('LABEL.TERMS_AND_CONDITIONS')}
        </Typography>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="terms tabs"
          sx={{
            borderRadius: '2rem',
            '& .MuiTabs-indicator': {
              height: '100%',
              backgroundColor: 'primary',
              borderRadius: '2rem',
            },
            backgroundColor: 'primary.contrastText',
          }}
        >
          <Tab
            label={t('LABEL.STUDENT')}
            sx={{
              color: 'primary.contrastText',
              position: 'relative',
              zIndex: 1,
              px: 4,
              m: '0 !important',
            }}
          />
          <Tab
            label={t('LABEL.CENTER')}
            sx={{
              color: 'primary.contrastText',
              position: 'relative',
              zIndex: 1,
              px: 4,
            }}
          />
        </Tabs>
      </Box>

      {/* Form */}
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
              />
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
