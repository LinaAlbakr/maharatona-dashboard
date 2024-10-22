'use client';

import { Box, Card, Container, ListItemText, Tab, Tabs, Typography } from '@mui/material';
import React, { useMemo } from 'react';

import { useSettingsContext } from 'src/components/settings';
import { useQueryString } from 'src/hooks/use-queryString';
import { useTranslate } from 'src/locales';
import AllInformation from './tabs/all-Information';

import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Courses from './tabs/courses';

export const tabs = [
  {
    value: 'all-information',
    label: 'ALL_INFORMATION',
  },
  {
    value: 'children',
    label: 'CHILDREN',
  },
  {
    value: 'courses',
    label: 'COURSES',
  },
];

interface Props {
  tab?: string;
  ClientInfo?: any;
  ClientCourses?: any;
}

const ClientDetailsView = ({ tab, ClientInfo, ClientCourses }: Props) => {
  const { t } = useTranslate();
  const settings = useSettingsContext();
  const pathname = usePathname();
  const router = useRouter();

  const currentTab = useMemo(
    () =>
      typeof tab === 'string' && tabs.find((item) => item.value === tab) ? tab : 'all-information',
    [tab]
  );

  const { createQueryString } = useQueryString();

  const handleChangeTab = (event: React.SyntheticEvent, newValue: string) => {
    createQueryString([{ name: 'tab', value: newValue }], true);
    router.push(`${pathname}?tab=${newValue}`);
  };
  return (
    <Container
      maxWidth={settings.themeStretch ? false : 'xl'}
      sx={{ margin: '0px !important', padding: '0px !important' }}
    >
      <Card sx={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Box
          sx={{
            backgroundImage: `url(/assets/images/clients/children.jpeg)`,
            height: { sm: '250px', xs: '300px' },
            backgroundRepeat: 'no-repeat',
            backgroundSize: '100% 100%',
            gap: 4,
            position: 'relative',
          }}
        >
          <Box>
            <Typography
              variant="h4"
              color="primary.main"
              sx={{ position: 'absolute', bottom: '-40px', left: '50px' }}
            >
              {ClientInfo.name}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{ mx: 4, mt: 4, display: 'flex', gap: 4, flexDirection: { sm: 'row', xs: 'column' } }}
        >
          <Tabs value={currentTab} onChange={handleChangeTab} sx={{ color: 'secondary.main' }}>
            {tabs.map((item) => (
              <Tab key={item.value} value={item.value} label={t(`LABEL.${item.label}`)} />
            ))}
          </Tabs>
        </Box>
      </Card>

      <Box mt={3}>
        {currentTab === 'all-information' && <AllInformation ClientInfo={ClientInfo} />}
        {currentTab === 'courses' && <Courses ClientCourses={ClientCourses} />}
      </Box>
    </Container>
  );
};

export default ClientDetailsView;
