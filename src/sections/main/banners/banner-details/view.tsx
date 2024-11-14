'use client';

import { Container } from '@mui/material';
import React from 'react';
import { useSettingsContext } from 'src/components/settings';

const BannerDetailsView = () => {
  const settings = useSettingsContext();

  return (
    <Container
      maxWidth={settings.themeStretch ? false : 'xl'}
      sx={{ margin: '0px !important', padding: '0px !important' }}
    >
      Banner Details
    </Container>
  );
};

export default BannerDetailsView;
