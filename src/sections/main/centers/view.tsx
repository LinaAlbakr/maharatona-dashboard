'use client';

import Container from '@mui/material/Container';

import { useTranslate } from 'src/locales';

import { useSettingsContext } from 'src/components/settings';

const CentersView = () => {
  const { t } = useTranslate();
  const settings = useSettingsContext();

  return <Container maxWidth={settings.themeStretch ? false : 'xl'}>CentersView</Container>;
};

export default CentersView;
