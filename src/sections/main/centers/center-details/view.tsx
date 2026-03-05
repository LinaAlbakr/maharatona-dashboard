'use client';

import { Box, Card, Container, Tab, Tabs, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import { useSettingsContext } from 'src/components/settings';
import { useQueryString } from 'src/hooks/use-queryString';



import { useTranslate } from 'src/locales';


// ORIGINAL: import Reports from './tabs/reports';

import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

import i18n from 'src/locales/i18n';

import Courses from './tabs/courses';
import Reports from './tabs/reports';
import AllInformation from './tabs/all-Information';



export const tabs = [
  {
    value: 'all-information',
    label: 'ALL_INFORMATION',
  },
  {
    value: 'center-courses',
    label: 'CENTER_COURSES',
  },
{ value: 'reports', label: 'REPORTS' },
];

interface Props {
  tab?: string;
  CenterInfo?: any;
  CenterCourses?: any;
  CenterReports?: any;
  // ORIGINAL: CenterReports?: any;
  // ORIGINAL: CenterReviews?: any;
}

const CenterDetailsView = ({
  tab,
  CenterInfo,
  CenterCourses,
  CenterReports,
  // ORIGINAL: CenterReports,
  // ORIGINAL: CenterReviews,
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
    <Container
      maxWidth={settings.themeStretch ? false : 'xl'}
      sx={{ margin: '0px !important', padding: '0px !important' }}
    >
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
              src={CenterInfo.center_image || '/assets/images/centers/gray.jpeg'} // ✅
              width={130}
              height={120}
              alt="Center logo"
              style={{
                borderRadius: '50%',
                position: 'absolute',
                bottom: '-60px',
                right: i18n.language === 'ar' ? '25px' : '',
                left: i18n.language === 'en' ? '25px' : '',
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
            CenterReports={CenterReports}
           />
         )}
        
      </Box>
    </Container>
  );
};

export default CenterDetailsView;
