'use client';

import { Box, Card, Container, Grid, InputAdornment, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';

import Iconify from 'src/components/iconify';
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
  const [search, setSearch] = useState('');

  return (
    <Container
      maxWidth={settings.themeStretch ? false : 'xl'}
      sx={{ bgcolor: '#FAFAFA', py: 3 }}
    >
      <Box
        sx={{
          width: '100%',
          backgroundImage: `url(/assets/images/pages/about-app.jpg)`,
          height: '240px',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: 2,
          boxShadow: 'inset 0 0 0 2000px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 3,
          mb: 3,
        }}
      >
        <Typography variant="h2" color="white">
          {t('LABEL.CONTRACT_PAGE')}
        </Typography>
        <Grid
          sx={{
            width: { xs: '90%', sm: '60%', md: '50%' },
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Card sx={{ p: 1, flexGrow: 1 }}>
            <TextField
              fullWidth
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="mingcute:search-line" />
                  </InputAdornment>
                ),
              }}
              placeholder={t('LABEL.SEARCH_VERSION_OR_CONTENT')}
              type="search"
            />
          </Card>
        </Grid>
      </Box>
      <ContractCenterView overview={contractOverview} search={search} />
    </Container>
  );
};

export default ContractPageView;
