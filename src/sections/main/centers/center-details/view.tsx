'use client';

import { Box, Card, Container, ListItemText, Tab, Tabs, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import { useQueryString } from 'src/hooks/use-queryString';
import { useTranslate } from 'src/locales';
import AllInformation from './tabs/all-Information';
import Reports from './tabs/reports';
import Courses from './tabs/courses';
import Image from 'next/image';

export const tabs = [
  {
    value: 'all-information',
    label: 'All information',
    // icon: 'material-symbols-light:id-card',
  },
  {
    value: 'courses',
    label: 'Courses',
    // icon: 'f7:sportscourt-fill',
  },
  {
    value: 'reports',
    label: 'Reports',
    // icon: 'clarity:employee-group-solid',
  },
];

interface Props {
  tab?: string;
  CenterReports?: any;
  CenterInfo?: any;
  CenterCourses?: any;
  CenterReviews?: any;
}

const CenterDetailsView = ({
  tab,
  CenterInfo,
  CenterCourses,
  CenterReports,
  CenterReviews,
}: Props) => {
  const { t } = useTranslate();
  const settings = useSettingsContext();

  const currentTab = useMemo(
    () =>
      typeof tab === 'string' && tabs.find((item) => item.value === tab) ? tab : 'all-information',
    [tab]
  );

  const { createQueryString } = useQueryString();

  const handleChangeTab = (event: React.SyntheticEvent, newValue: string) => {
    createQueryString([{ name: 'tab', value: newValue }], true);
  };
  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Card sx={{ pt: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Box
          sx={{
            backgroundImage: `url(/assets/images/centers/image.png)`,
            height: { sm: '250px', xs: '300px' },
            backgroundRepeat: 'no-repeat',
            backgroundSize: '100% 100%',
            gap: 4,
            position: 'relative',
          }}
        >
          <Box>
            <Image
              src="/assets/images/centers/profile.jpeg"
              width={130}
              height={120}
              alt="image"
              style={{
                borderRadius: '50%',
                position: 'absolute',
                bottom: '-50px',
                right: '20px',
                outline: '3px solid rgba(192,192,192,0.5)',
              }}
            />
            <Typography variant="body1" color="initial">
              {'center name'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mx: 4, display: 'flex', gap: 4, flexDirection: { sm: 'row', xs: 'column' } }}>
          <Tabs value={currentTab} onChange={handleChangeTab} sx={{ color: 'secondary.main' }}>
            {tabs.map((item) => (
              <Tab
                key={item.value}
                value={item.value}
                // icon={typeof item.icon === 'string' ? <Iconify icon={item.icon} /> : item.icon}
                label={t(item.label)}
              />
            ))}
          </Tabs>
        </Box>
      </Card>

      <Box mt={3}>
        {currentTab === 'all-information' && <AllInformation CenterInfo={CenterInfo} />}
        {currentTab === 'courses' && <Courses />}
        {currentTab === 'reports' && <Reports />}
      </Box>
    </Container>
  );
};

export default CenterDetailsView;
