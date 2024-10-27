'use client';

import { Box, Card, Container, Grid, Pagination, Typography } from '@mui/material';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { useSettingsContext } from 'src/components/settings';
import { useTranslate } from 'src/locales';
import RateItem from '../components/rate-item';
import CourseCard from '../components/course-card';
interface Props {
  CenterReports?: any;

  CenterCourses?: any;
  CenterReviews?: any;
}
const Reports = ({ CenterCourses, CenterReports, CenterReviews }: Props) => {
  const { t } = useTranslate();
  const settings = useSettingsContext();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const count = (count: number) => {
    if (count / 6 > 1) {
      return Math.ceil(count / 6);
    } else return 1;
  };

  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    createQueryString(value);
  };
  const createQueryString = useCallback(
    (value: number) => {
      if (value) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', String(value));
        router.push(`${pathname}?${params.toString()}`);
      } else {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', String(1));
        router.push(`${pathname}?${params.toString()}`);
      }
    },
    [pathname, router, searchParams]
  );
  return (
    <Container
      maxWidth={settings.themeStretch ? false : 'xl'}
      sx={{ margin: '0px !important', padding: { xs: '5px !important', sm: '0px !important' } }}
    >
      <Grid container spacing={1}>
        <Grid
          item
          md={4}
          sm={12}
          xs={12}
          sx={{
            display: 'flex',
            gap: 2,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: { xs: 'center', md: 'flex-start' },
          }}
        >
          <Box
            sx={{
              display: 'flex ',
              maxWidth: '100%',
              width: '400px',
              height: '150px',
              borderRadius: '10px',
              bgcolor: '#D4E5F7',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body1" color="#2065B2">
                {t('LABEL.NUMBER_OF_SUBSCRIPTIONS')}
              </Typography>
              <Typography variant="h3" color="#2065B2">
                {CenterReports.total_subscriptions}
              </Typography>
              <Typography variant="body1" color="#2065B2">
                {t('LABEL.DURING_THE_PREVIOUS_28_DAYS')}
              </Typography>
            </Box>
            <Image src="/assets/images/centers/sub.svg" alt="image" width={50} height={50} />
          </Box>

          <Box
            sx={{
              display: 'flex ',
              maxWidth: '100%',
              width: '400px',
              height: '150px',
              borderRadius: '10px',
              bgcolor: '#E6DEF9',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body1" color="#9B6AFD">
                {t('LABEL.CUSTOMER_SATISFACTION')}
              </Typography>
              <Typography variant="h3" color="#9B6AFD">
                {CenterReports.average_rate.slice(0, 3)}
              </Typography>
            </Box>
            <Image src="/assets/images/centers/sat.svg" alt="image" width={50} height={50} />
          </Box>

          <Box
            sx={{
              display: 'flex ',
              maxWidth: '100%',
              width: '400px',
              height: '150px',
              borderRadius: '10px',
              bgcolor: '#FCD1DA',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body1" color="#EF1844">
                {t('LABEL.TOTAL_PROFIT')}
              </Typography>
              <Typography variant="h3" color="#EF1844">
                {CenterReports.profits} {t('LABEL.SAR')}
              </Typography>
            </Box>
            <Image src="/assets/images/centers/profit.svg" alt="image" width={50} height={50} />
          </Box>

          <Box
            sx={{
              display: 'flex ',
              maxWidth: '100%',
              width: '400px',
              height: '150px',
              borderRadius: '10px',
              bgcolor: '#FFF3DC',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body1" color="#DA9100">
                {t('LABEL.TOTAL_VIEWS')}
              </Typography>
              <Typography variant="h3" color="#DA9100">
                {CenterReports.total_views}
              </Typography>
            </Box>
            <Image src="/assets/images/centers/views.svg" alt="image" width={50} height={50} />
          </Box>
        </Grid>
        <Grid item md={8} sm={12} xs={12}>
          <Card
            sx={{
              minHeight: '645px',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="h5" color="secondary" sx={{ mb: 1 }}>
                {t('LABEL.CUSTOMER_RATINGS')}
              </Typography>
              {CenterReviews.data.map((item: any) => (
                <RateItem key={item.id} rate={item} />
              ))}
              {CenterReviews.data.length === 0 && (
                <Typography variant="h4" color="secondary" sx={{ textAlign: 'center' }}>
                  {t('LABEL.NO_DATA')}
                </Typography>
              )}
            </Box>
            <Pagination
              sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}
              count={count(CenterReviews.meta.itemCount)}
              page={Number(searchParams.get('page')) || 1}
              color="secondary"
              onChange={handleChange}
            />
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5" color="secondary" sx={{ my: 4 }}>
            {t('LABEL.TOP_THREE_COURSES')}
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
              gap: 2,
            }}
          >
            {CenterCourses.data.slice(0, 3).map((item: any) => (
              <CourseCard key={item.id} course={item} />
            ))}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Reports;
