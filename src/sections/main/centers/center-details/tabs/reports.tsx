'use client';

import Image from 'next/image';
import { useMemo, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import { Box, Card, Grid, Container, Pagination, Typography } from '@mui/material';

import { useTranslate } from 'src/locales';
import i18n from 'src/locales/i18n';
import SharedTable from 'src/CustomSharedComponents/SharedTable/SharedTable';

import { useSettingsContext } from 'src/components/settings';

import RateItem from '../components/rate-item';
import CourseCardReport from '../components/course-card-report';

const REVIEWS_PER_PAGE = 6;
const PAYOUTS_PER_PAGE = 6;

interface Props {
  CenterReports?: any;
}

type PayoutRow = {
  id: string;
  referenceNumber: string;
  amount: number;
  transferDate: string;
  additionalNote?: string;
};

const Reports = ({ CenterReports }: Props) => {
  const { t } = useTranslate();
  const settings = useSettingsContext();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const pageCount = (count: number, perPage: number) => {
    if (count / perPage > 1) {
      return Math.ceil(count / perPage);
    }
    return 1;
  };

  const handleReviewsPageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(value));
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePayoutsPageChange = useCallback(
    (_event: React.ChangeEvent<unknown>, value: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('payoutPage', String(value));
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  const formatAmount = useCallback(
    (value: number) =>
      new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 20,
      }).format(value),
    []
  );

  const formatDate = useCallback((value: string) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }, []);

  const payouts: PayoutRow[] = useMemo(() => {
    const list = CenterReports?.data?.payouts ?? [];
    return list.map((p: any) => ({
      id: p?.id ?? p?._id ?? '',
      referenceNumber: p?.referenceNumber ?? '',
      amount: Number(p?.amount) || 0,
      transferDate: p?.transferDate ? new Date(p.transferDate).toISOString() : '',
      additionalNote: p?.additionalNote ?? '',
    }));
  }, [CenterReports?.data?.payouts]);

  const reviews = CenterReports?.data?.CenterReviews ?? [];
  const reviewPage = Number(searchParams.get('page')) || 1;
  const payoutPage = Number(searchParams.get('payoutPage')) || 1;

  const paginatedReviews = reviews.slice(
    (reviewPage - 1) * REVIEWS_PER_PAGE,
    reviewPage * REVIEWS_PER_PAGE
  );

  const paginatedPayouts = payouts.slice(
    (payoutPage - 1) * PAYOUTS_PER_PAGE,
    payoutPage * PAYOUTS_PER_PAGE
  );

  const PAYOUT_TABLE_HEAD = [
    { id: 'referenceNumber', label: 'LABEL.REFERENCE_NUMBER' },
    { id: 'amount', label: 'LABEL.AMOUNT' },
    { id: 'transferDate', label: 'LABEL.TRANSFER_DATE' },
    { id: 'additionalNote', label: 'LABEL.ADDITIONAL_NOTE' },
  ];

  return (
    <Container
      maxWidth={settings.themeStretch ? false : 'xl'}
      sx={{ margin: '0px !important', padding: { xs: '5px !important', sm: '0px !important' } }}
    >
      <Grid container spacing={2}>
        {/* Top row: KPI cards + Payouts table */}
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
                {CenterReports?.data?.totalSubscriptions}
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
                {CenterReports?.data?.customerSatisfaction}
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
                {CenterReports?.data?.totalProfit}{' '}
                <Image
                  src="/assets/images/red-sar-logo.svg"
                  alt="sar logo"
                  height={40}
                  width={40}
                />
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
                {CenterReports?.data?.totalViews}
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
              <Typography variant="h5" color="secondary" sx={{ mb: 2 }}>
                {t('LABEL.PAYOUTS')}
              </Typography>
              <SharedTable
                count={payouts.length}
                data={paginatedPayouts}
                tableHead={PAYOUT_TABLE_HEAD}
                disablePagination
                headColor="secondary.main"
                customRender={{
                  amount: (row) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box
                        component="img"
                        src="/assets/icons/rial.svg"
                        alt="Riyal"
                        sx={{ width: 16, height: 16 }}
                      />
                      {formatAmount(row.amount)}
                    </Box>
                  ),
                  transferDate: (row) => formatDate(row.transferDate),
                  additionalNote: (row) => row?.additionalNote || '-',
                }}
              />
            </Box>
            <Pagination
              sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}
              count={pageCount(payouts.length, PAYOUTS_PER_PAGE)}
              page={payoutPage}
              color="secondary"
              onChange={handlePayoutsPageChange}
            />
          </Card>
        </Grid>

        {/* Client Reviews - full width */}
        <Grid item xs={12}>
          <Card
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="h5" color="secondary" sx={{ mb: 2 }}>
                {t('LABEL.CLIENT_REVIEWS')}
              </Typography>
              {paginatedReviews.map((item: any) => (
                <RateItem key={item.id ?? item._id} rate={item} />
              ))}
              {reviews.length === 0 && (
                <Typography variant="h6" color="secondary" sx={{ textAlign: 'center', py: 4 }}>
                  {t('LABEL.NO_DATA')}
                </Typography>
              )}
            </Box>
            <Pagination
              sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}
              count={pageCount(reviews.length, REVIEWS_PER_PAGE)}
              page={reviewPage}
              color="secondary"
              onChange={handleReviewsPageChange}
            />
          </Card>
        </Grid>

        {/* Top Programs */}
        <Grid item xs={12}>
          <Typography variant="h5" color="secondary" sx={{ mb: 2 }}>
            {t('LABEL.TOP_PROGRAMS')}
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
              gap: 2,
            }}
          >
            {CenterReports?.data?.topCourses?.map((item: any) => (
              <CourseCardReport key={item.id ?? item._id} course={item} />
            ))}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Reports;
