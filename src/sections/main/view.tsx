'use client';

import Container from '@mui/material/Container';

import { useTranslate } from 'src/locales';

import { useSettingsContext } from 'src/components/settings';

// ----------------------------------------------------------------------

export default function MainPage() {
  const { t } = useTranslate();
  const settings = useSettingsContext();

  return <Container maxWidth={settings.themeStretch ? false : 'xl'}>Home Page</Container>;
}
