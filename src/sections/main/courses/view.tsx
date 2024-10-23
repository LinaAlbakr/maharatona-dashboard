'use client';

import Container from '@mui/material/Container';
import { useTranslate } from 'src/locales';
import { useSettingsContext } from 'src/components/settings';
import { Box, Card, Grid, InputAdornment, TextField, Typography } from '@mui/material';
import FormProvider from 'src/components/hook-form';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import SharedTable from 'src/CustomSharedComponents/SharedTable/SharedTable';
import { useBoolean } from 'src/hooks/use-boolean';
import { paths } from 'src/routes/paths';
import SendNotification from './components/send-notification';
import i18n from 'src/locales/i18n';
import { set } from 'lodash';
import Iconify from 'src/components/iconify';

type props = {
  count: number;
  courses: any[];
};

const CoursesView = ({ count, courses }: Readonly<props>) => {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();

  const { t } = useTranslate();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [selectedId, setSelectedId] = useState<string | null>();
  const [showSendNotification, setShowSendNotification] = useState<boolean | undefined>(false);
  const [selectedSubscribers, setSelectedSubscribers] = useState<any[] | undefined>();

  useEffect(() => {
    router.push(`${pathname}`);
  }, []);

  const TABLE_HEAD = [
    { id: 'name', label: 'LABEL.COURSE_NAME' },
    { id: 'field', label: 'LABEL.FIELD' },
    { id: 'price', label: 'LABEL.PRICE' },
    { id: 'students', label: 'LABEL.NUMBER_OF_SUBSCRIBERS' },
    { id: 'seats', label: 'LABEL.NUMBER_OF_REMAINING_SEATS' },
    { id: 'start_date', label: 'LABEL.START_DATE' },
    { id: 'end_date', label: 'LABEL.END_DATE' },
    { id: 'average_rate', label: 'LABEL.TOTAL_RATE' },
    { id: '', label: 'LABEL.SETTINGS' },
  ];

  const formDefaultValues = {
    name: '',
  };

  const pathname = usePathname();
  const methods = useForm({
    defaultValues: formDefaultValues,
  });
  const { setValue } = methods;

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set(name, value);
        localStorage.setItem(name, value);
      } else {
        params.delete(name);
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams, setValue]
  );

  const englishDate = (date: string) => {
    return new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'long' }).format(
      new Date(date)
    );
  };
  const arabicDate = (date: string) => {
    return new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'long' }).format(
      new Date(date)
    );
  };
  return (
    <>
      <Container
        maxWidth={settings.themeStretch ? false : 'xl'}
        sx={{ margin: '0px !important', padding: '0px !important' }}
      >
        <Box
          sx={{
            backgroundImage: `url(/assets/images/courses/header.jpeg)`,
            height: '400px',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            p: 0,
            boxShadow: 'inset 0 0 0 2000px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            paddingBlock: 6,
            alignItems: 'center',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <Typography variant="h3" color="white">
            {t('LABEL.EDUCATIONAL_COURSES')}
          </Typography>
          <Grid
            sx={{
              width: '50%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              px: 6,
            }}
          >
            <Card sx={{ p: 1, ml: 3, mb: 1, flexGrow: 1 }} className="text-[125px]">
              <FormProvider methods={methods}>
                <TextField
                  sx={{ width: '100%' }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="mingcute:search-line" />
                      </InputAdornment>
                    ),
                  }}
                  placeholder={t('LABEL.COURSE_NAME')}
                  type="search"
                  onChange={(e) => createQueryString('search', e.target.value)}
                />
              </FormProvider>
            </Card>
          </Grid>
        </Box>
        <SharedTable
          count={count}
          data={courses}
          tableHead={TABLE_HEAD}
          actions={[
            {
              sx: { color: 'info.dark' },
              label: t('LABEL.VIEW'),
              icon: 'lets-icons:view',
              onClick: (item) => {
                router.push(`${paths.dashboard.clients}/${item.id}`);
              },
            },
            {
              sx: { color: 'info.dark' },
              label: t('LABEL.SEND_NOTIFICATION'),
              icon: 'mingcute:notification-fill',
              onClick: (item) => {
                setShowSendNotification(true);
                setSelectedSubscribers(item?.students.map((student: any) => student.id));
              },
            },
          ]}
          customRender={{
            students: (item: any) => (
              <Box>
                {item?.students.length + ' '}
                {t('LABEL.STUDENT')}
              </Box>
            ),
            seats: (item: any) => (
              <Box>
                {item?.seats + ' '}
                {t('LABEL.SEAT')}
              </Box>
            ),
            field: (item: any) =>
              i18n.language === 'ar' ? item?.field?.name : item?.field?.name_en,
            average_rate: (item: any) => item?.average_rate.slice(0, 3),
            start_date: (item: any) =>
              i18n.language === 'ar' ? arabicDate(item?.start_date) : englishDate(item?.start_date),
            end_date: (item: any) =>
              i18n.language === 'ar' ? arabicDate(item?.end_date) : englishDate(item?.end_date),
            // phone: (item: any) => <Box style={{ direction: 'ltr' }}>{item?.phone}</Box>,
            price: (item: any) => (
              <Box>
                {Math.round(item?.price) + ' '} {t('LABEL.SAR')}
              </Box>
            ),
          }}
        />
      </Container>
      {showSendNotification && (
        <SendNotification
          open={showSendNotification}
          onClose={() => {
            setShowSendNotification(false);
            set;
          }}
          selectedSubscribers={selectedSubscribers}
        />
      )}
    </>
  );
};

export default CoursesView;
