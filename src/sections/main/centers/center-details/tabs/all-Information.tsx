'use client';

import { Container } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import { useTranslate } from 'src/locales';

const AllInformation = (CenterInfo: any) => {
  const { t } = useTranslate();
  const settings = useSettingsContext();
  console.log(CenterInfo);

  return <Container maxWidth={settings.themeStretch ? false : 'xl'}>AllInformation</Container>;
};

export default AllInformation;
