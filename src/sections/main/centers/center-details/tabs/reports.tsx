'use client';

import { Container } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import { useTranslate } from 'src/locales';

const Reports = () => {
  const { t } = useTranslate();
  const settings = useSettingsContext();
  return <Container maxWidth={settings.themeStretch ? false : 'xl'}>Reports</Container>;
};

export default Reports;
