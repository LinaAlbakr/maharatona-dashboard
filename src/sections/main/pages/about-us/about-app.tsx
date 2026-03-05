'use client';

import { TabContext, TabList } from '@mui/lab';
import { Box, Container, Stack, Tab, Typography } from '@mui/material';
import React, { useState } from 'react';

import { useSettingsContext } from 'src/components/settings';
import { useTranslate } from 'src/locales';

import { StaticPage } from 'src/types/static-pages';
import AboutClientView from './about-client';
import AboutCenterView from './about-center';

export enum SubscriberType {
  client = 'client',
  center = 'center',
}

type IProps = {
  aboutClient: StaticPage;
  aboutCenter: StaticPage;
};
const AboutAppView = ({ aboutClient, aboutCenter }: IProps) => {

  const settings = useSettingsContext();
  const { t } = useTranslate();

  const [value, setValue] = useState<SubscriberType>(SubscriberType.client);

  const handleChange = (event: React.SyntheticEvent, newValue: SubscriberType) => {
    setValue(newValue);
  };
  return (
      <Container
        maxWidth={settings.themeStretch ? false : 'xl'}
        sx={{ margin: '0px !important', padding: '0px !important', bgcolor: '#FAFAFA' }}
      >
        <Box
          sx={{
            width: '100%',
            backgroundImage: `url(/assets/images/pages/about-app.jpg)`,
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
            {t('LABEL.ABOUT_APP')}
          </Typography>
        </Box>

        <TabContext value={value}>
          <Stack
            sx={{
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#FAFAFA',
              p: 2,
              my: 2,
            }}
          >
            <TabList
              onChange={handleChange}
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
                value="client"
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
                value="center"
                sx={{
                  color: 'primary.contrastText',
                  position: 'relative',
                  zIndex: 1,
                  px: 4,
                }}
              />
            </TabList>
          </Stack>
          <AboutClientView aboutClient={aboutClient} />
          <AboutCenterView aboutCenter={aboutCenter} />
        </TabContext>
      </Container>
  );
};

export default AboutAppView;
