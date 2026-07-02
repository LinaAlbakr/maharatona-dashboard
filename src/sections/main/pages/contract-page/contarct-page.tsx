'use client';

import { Box, Container, Typography } from '@mui/material';
import React from 'react';

import { useSettingsContext } from 'src/components/settings';
import { useTranslate } from 'src/locales';

import { ContractOverview } from 'src/types/static-pages';
import ContractCenterView from './contract-center';

export enum SubscriberType {
  center = 'center',
}

type IProps = {
  contractOverview: ContractOverview;
};
const ContractPageView = ({ contractOverview }: IProps) => {
  const settings = useSettingsContext();
  const { t } = useTranslate();

  return (
    <Container
      maxWidth={settings.themeStretch ? false : 'xl'}
      sx={{ bgcolor: '#FAFAFA', py: 3 }}
    >
      <Box
        sx={{
          width: '100%',
          backgroundImage: `url(/assets/images/pages/about-app.jpg)`,
          height: '160px',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: 2,
          boxShadow: 'inset 0 0 0 2000px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          mb: 3,
        }}
      >
        <Typography variant="h2" color="white">
          {t('LABEL.CONTRACT_PAGE')}
        </Typography>
      </Box>
      <ContractCenterView overview={contractOverview} />
    </Container>
  );
};

export default ContractPageView;
