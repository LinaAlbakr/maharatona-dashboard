'use client';

import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { enqueueSnackbar } from 'notistack';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import Container from '@mui/material/Container';
import { Box, Card, Grid, Button, TextField, Typography, InputAdornment } from '@mui/material';

import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';

import { arabicDate, englishDate } from 'src/utils/format-time';

import i18n from 'src/locales/i18n';
import { useTranslate } from 'src/locales';
import { deleteCousre, editCourseStatus } from 'src/actions/courses';
import SharedTable from 'src/CustomSharedComponents/SharedTable/SharedTable';

import Iconify from 'src/components/iconify';
import FormProvider from 'src/components/hook-form';
import { useSettingsContext } from 'src/components/settings';
import { ConfirmDialog } from 'src/components/custom-dialog';

import SendNotification from './components/send-notification';

type props = {
  count: number;
  courses: any[];
};

const CoursesView = ({ count, courses }: Readonly<props>) => {
  console.log('courses', courses);
  const settings = useSettingsContext();
  const { t } = useTranslate();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [showSendNotification, setShowSendNotification] = useState<boolean | undefined>(false);
  const [selectedSubscribers, setSelectedSubscribers] = useState<any[] | undefined>();
  const [selectedCourse, setSelectedCourse] = useState<any>();
  const [selectedId, setSelectedId] = useState<string>('');
  const confirmDelete = useBoolean();
  const confirmActivate = useBoolean();
  const confirmDeactivate = useBoolean();

  useEffect(() => {
    router.push(`${pathname}`);
  }, [pathname, router]);

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

  const methods = useForm({
    defaultValues: formDefaultValues,
  });

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
    [pathname, router, searchParams]
  );

  const handleconfirmDelete = async () => {
    const res = await deleteCousre(selectedId);
    if (res?.error) {
      enqueueSnackbar(`${res?.error}`, { variant: 'error' });
    } else {
      enqueueSnackbar(t('MESSAGE.DELETED_SUCCESS'), {
        variant: 'success',
      });
    }
    confirmDelete.onFalse();
  };

  const handleConfirmActivate = async () => {
    const res = await editCourseStatus(selectedCourse);
    if (res.statusCode === 200) {
      enqueueSnackbar(t('MESSAGE.ACTIVATED_SUCCESSFULLY'));
      confirmActivate.onFalse();
    } else {
      enqueueSnackbar(`${res.error}`, { variant: 'error' });
    }
  };
  const handleConfirmDeactivate = async () => {
    const res = await editCourseStatus(selectedCourse);
    if (res.statusCode === 200) {
      enqueueSnackbar(t('MESSAGE.DEACTIVATED_SUCCESSFULLY'));
      confirmDeactivate.onFalse();
    } else {
      enqueueSnackbar(`${res.error}`, { variant: 'error' });
    }
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
                router.push(`${paths.dashboard.courses}/${item.id}`);
              },
            },
            {
              sx: { color: 'info.dark' },
              label: t('LABEL.SEND_NOTIFICATION'),
              icon: 'mingcute:notification-fill',
              onClick: (item) => {
                setShowSendNotification(true);
                setSelectedSubscribers(
                  item?.students.map((student: any) => student.client.user_id)
                );
              },
            },
            {
              sx: { color: 'error.dark' },
              label: t('LABEL.DELETE'),
              icon: 'mingcute:delete-fill',
              onClick: (item) => {
                setSelectedId(item.id);
                confirmDelete.onTrue();
              },
            },
            {
              sx: { color: 'info.dark' },

              label: t('LABEL.ACTIVATE'),
              icon: 'uim:process',
              onClick: (item: any) => {
                setSelectedCourse(item);
                confirmActivate.onTrue();
              },
              hide: (row) => row.is_active === true,
            },
            {
              sx: { color: 'error.dark' },
              label: t('LABEL.DEACTIVATE'),
              icon: 'streamline:synchronize-disable-solid',
              onClick: (item: any) => {
                setSelectedCourse(item);
                confirmDeactivate.onTrue();
              },
              hide: (row) => row.is_active === false,
            },
          ]}
          customRender={{
            name: (item: any) => (
              <Box sx={{ color: item?.is_active ? 'inherit' : 'red' }}>{item?.name}</Box>
            ),
            students: (item: any) => (
              <Box sx={{ color: item?.is_active ? 'inherit' : 'red' }}>
                {`${item?.students.length} `}
                {t('LABEL.STUDENT')}
              </Box>
            ),
            seats: (item: any) => (
              <Box sx={{ color: item?.is_active ? 'inherit' : 'red' }}>
                {`${item?.seats} `}
                {t('LABEL.SEAT')}
              </Box>
            ),
            field: (item: any) => (
              <Box sx={{ color: item?.is_active ? 'inherit' : 'red' }}>
                {' '}
                {i18n.language === 'ar' ? item?.field?.name : item?.field?.name}
              </Box>
            ),
            average_rate: (item: any) => (
              <Box sx={{ color: item?.is_active ? 'inherit' : 'red' }}>
                {item?.average_rate.slice(0, 3)}
              </Box>
            ),
            start_date: (item: any) => (
              <Box sx={{ color: item?.is_active ? 'inherit' : 'red' }}>
                {i18n.language === 'ar'
                  ? arabicDate(item?.start_date)
                  : englishDate(item?.start_date)}
              </Box>
            ),
            end_date: (item: any) => (
              <Box sx={{ color: item?.is_active ? 'inherit' : 'red' }}>
                {i18n.language === 'ar' ? arabicDate(item?.end_date) : englishDate(item?.end_date)}{' '}
              </Box>
            ),

            price: (item: any) => (
              <Box sx={{ color: item?.is_active ? 'inherit' : 'red' }}>
                {`${Math.round(item?.price)} `}{' '}
                {item?.is_active ? (
                  <Image src="/assets/images/sar-logo.svg" alt="sar logo" height={20} width={20} />
                ) : (
                  <Image
                    src="/assets/images/red-sar-logo.svg"
                    alt="sar logo"
                    height={20}
                    width={20}
                  />
                )}
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
            setSelectedSubscribers(undefined);
          }}
          selectedSubscribers={selectedSubscribers}
        />
      )}
      <ConfirmDialog
        open={confirmDelete.value}
        onClose={confirmDelete.onFalse}
        title={t('TITLE.DELETE_COURSE')}
        content={t('MESSAGE.CONFIRM_DELETE_COURSE')}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleconfirmDelete();
            }}
          >
            {t('BUTTON.DELETE')}
          </Button>
        }
      />
      <ConfirmDialog
        open={confirmActivate.value}
        onClose={confirmActivate.onFalse}
        title={t('TITLE.ACTIVATE_COURSE')}
        content={t('MESSAGE.CONFIRM_ACTIVATE_COURSE')}
        action={
          <Button
            variant="contained"
            color="info"
            onClick={() => {
              handleConfirmActivate();
            }}
          >
            {t('BUTTON.ACTIVATE')}
          </Button>
        }
      />
      <ConfirmDialog
        open={confirmDeactivate.value}
        onClose={confirmDeactivate.onFalse}
        title={t('TITLE.DEACTIVATE_COURSE')}
        content={t('MESSAGE.CONFIRM_DEACTIVATE_COURSE')}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleConfirmDeactivate();
            }}
          >
            {t('BUTTON.DEACTIVATE')}
          </Button>
        }
      />
    </>
  );
};

export default CoursesView;
