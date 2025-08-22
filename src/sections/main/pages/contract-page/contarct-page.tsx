'use client';

import { Box, Container, Typography } from '@mui/material';
import React from 'react';

import { useSettingsContext } from 'src/components/settings';
import { useTranslate } from 'src/locales';

import { StaticPage } from 'src/types/static-pages';
import ContractCenterView from './contract-center';

export enum SubscriberType {
  center = 'center',
}

type IProps = {
  contractCenter: StaticPage;
};
const ContractPageView = ({ contractCenter }: IProps) => {
  const settings = useSettingsContext();
  const { t } = useTranslate();

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
          {t('LABEL.CONTRACT_PAGE')}
        </Typography>
      </Box>
      <ContractCenterView ContractCenter={contractCenter} />
    </Container>
  );
};

export default ContractPageView;
