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
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export const tabs = [
  {
    value: 'all-information',
    label: 'ALL_INFORMATION',
  },
  {
    value: 'center-courses',
    label: 'CENTER_COURSES',
  },
  {
    value: 'reports',
    label: 'REPORTS',
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
    <Container maxWidth={settings.themeStretch ? false : 'xl'} sx={{ margin: '0px !important', padding: '0px !important' }}>
      <Card sx={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
              src={CenterInfo.logo}
              width={130}
              height={120}
              alt="image"
              style={{
                borderRadius: '50%',
                position: 'absolute',
                bottom: '-60px',
                right: '25px',
                outline: '3px solid rgba(192,192,192,0.5)',
              }}
            />
            <Typography
              variant="h4"
              color="primary.main"
              sx={{ position: 'absolute', bottom: '-40px', left: '170px' }}
            >
              {CenterInfo.name}
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
        {currentTab === 'all-information' && <AllInformation CenterInfo={CenterInfo} />}
        {currentTab === 'center-courses' && <Courses CenterCourses={CenterCourses} />}
        {currentTab === 'reports' && (
          <Reports
            CenterReviews={CenterReviews}
            CenterReports={CenterReports}
            CenterCourses={CenterCourses}
          />
        )}
      </Box>
    </Container>
  );
};

export default CenterDetailsView;
