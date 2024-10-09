'use client';

import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';

import { useTranslate } from 'src/locales';

import { useSettingsContext } from 'src/components/settings';

import AppWidgetSummary from './cards';
import AppAreaInstalled from './home-chart';
import EcommerceSalesOverview from './sales-overview';

// ----------------------------------------------------------------------

export default function MainPage() {
  const { t } = useTranslate();
  const settings = useSettingsContext();
  const salesData = [
    {
      label: t('Sam Mart'),
      value: 63,
    },
    {
      label: t('Food Stuffs'),
      value: 88,
    },
    {
      label: t('Antiques and Gifts'),
      value: 38,
    },
  ];

  const cards = [
    { title: t('Clients'), percent: 10, total: 1500, icon: 'fluent:people-28-regular' },
    { title: t('Products'), percent: 5, total: 450, icon: 'ion:grid' },
    { title: t('Employees'), percent: 16, total: 800, icon: 'clarity:employee-group-line' },
    { title: t('Delivery Agents'), percent: 8, total: 720, icon: 'mdi:cart-outline' },
    { title: t('Orders'), percent: 20, total: 950, icon: 'healthicons:city-worker' },
    { title: t('Announcements'), percent: -2, total: 20, icon: 'tabler:ad' },
  ];

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Grid container spacing={3}>
        {cards.map((card, index) => (
          <Grid item xs={12} md={4} key={card.title}>
            <AppWidgetSummary
              title={card.title}
              percent={card.percent}
              total={card.total}
              icon={card.icon}
            />
          </Grid>
        ))}

        <Grid item xs={12} md={6} lg={7}>
          <AppAreaInstalled
            title={`${t('Total Sales')}`}
            chart={{
              categories: [t('Sun'), t('Mon'), t('Tue'), t('Wed'), t('Thu'), t('Fri'), t('Sat')],
              series: [
                {
                  week: t('First Week'),
                  data: [
                    {
                      name: t('Food Stuffs'),
                      data: [10, 41, 35, 51, 49, 62, 69],
                    },
                    {
                      name: t('Antiques and Gifts'),
                      data: [25, 25, 13, 60, 77, 88, 50],
                    },
                    {
                      name: t('Sam Mart'),
                      data: [30, 34, 20, 56, 40, 35, 60],
                    },
                  ],
                },
                {
                  week: t('Second Week'),
                  data: [
                    {
                      name: t('Food Stuffs'),
                      data: [51, 35, 41, 20, 91, 69, 62],
                    },
                    {
                      name: t('Antiques and Gifts'),
                      data: [56, 13, 34, 10, 77, 99, 88],
                    },
                    {
                      name: t('Sam Mart'),
                      data: [30, 20, 34, 35, 25, 74, 65],
                    },
                  ],
                },
              ],
            }}
          />
        </Grid>

        <Grid item xs={12} md={5}>
          <EcommerceSalesOverview
            title={`${t('Main Categories')}`}
            subheader={`${t(
              'Information on the ratio of products versus each major classification.'
            )}`}
            data={salesData}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
