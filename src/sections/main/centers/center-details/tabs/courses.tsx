'use client';

import { Container } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import { useTranslate } from 'src/locales';

const Courses = () => {
  const { t } = useTranslate();
  const settings = useSettingsContext();
  return <Container maxWidth={settings.themeStretch ? false : 'xl'}>
    Courses
  </Container>;
};

export default Courses;
