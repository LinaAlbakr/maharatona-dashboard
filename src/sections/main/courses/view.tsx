'use client';

import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { enqueueSnackbar } from 'notistack';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import Container from '@mui/material/Container';
import {
  Box,
  Card,
  Grid,
  Button,
  TextField,
  Typography,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Stack,
  Switch,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';

import { arabicDate, englishDate } from 'src/utils/format-time';

import i18n from 'src/locales/i18n';
import { useTranslate } from 'src/locales';
import { deleteCousre, editCourseStatus, updateCourseEnrollmentStatus } from 'src/actions/courses';
import SharedTable from 'src/CustomSharedComponents/SharedTable/SharedTable';

import Iconify from 'src/components/iconify';
import FormProvider from 'src/components/hook-form';
import { useSettingsContext } from 'src/components/settings';
import { ConfirmDialog } from 'src/components/custom-dialog';

import SendNotification from './components/send-notification';
import FlexibleEnrollmentDialog from './components/flexible-enrollment-dialog';
import {
  enrollmentConfirmButtonCancelSx,
  enrollmentConfirmButtonConfirmSx,
  enrollmentConfirmDialogActionsSx,
  enrollmentConfirmDialogBoldPhraseSx,
  enrollmentConfirmCloseIconifySx,
  enrollmentConfirmDialogCloseIconButtonSx,
  enrollmentConfirmDialogContentSx,
  enrollmentConfirmDialogMessageSx,
  enrollmentConfirmDialogPaperSx,
  enrollmentConfirmDialogTitleSx,
} from './components/enrollment-confirm-dialog-styles';
import { enrollmentTurquoiseSwitchSx } from './components/flexible-model-config';

type props = {
  count: number;
  courses: any[];
};

const CoursesView = ({ count, courses }: Readonly<props>) => {
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
  const [enrollmentSavingId, setEnrollmentSavingId] = useState<string | null>(null);
  const [enrollmentConfirm, setEnrollmentConfirm] = useState<{
    item: any;
    next: 'open' | 'closed';
  } | null>(null);
  const [flexibleEnrollmentModal, setFlexibleEnrollmentModal] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    router.push(`${pathname}`);
  }, [pathname, router]);
  const currentLimit = Number(searchParams?.get('limit')) || 20;

  const TABLE_HEAD = [
    { id: 'name', label: 'LABEL.COURSE_NAME' },
    { id: 'field', label: 'LABEL.FIELD' },
    { id: 'price', label: 'LABEL.PRICE' },
    { id: 'students', label: 'LABEL.NUMBER_OF_SUBSCRIBERS' },
    { id: 'seats', label: 'LABEL.NUMBER_OF_REMAINING_SEATS' },
    { id: 'start_date', label: 'LABEL.START_DATE' },
    { id: 'end_date', label: 'LABEL.END_DATE' },
    { id: 'average_rate', label: 'LABEL.TOTAL_RATE' },
    { id: 'enrollment_status', label: 'LABEL.ENROLLMENT' },
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
    if (!res?.error) {
      enqueueSnackbar(t('MESSAGE.ACTIVATED_SUCCESSFULLY'));
      confirmActivate.onFalse();
    } else {
      enqueueSnackbar(`${res.error}`, { variant: 'error' });
    }
  };
  const handleConfirmDeactivate = async () => {
    const res = await editCourseStatus(selectedCourse);
    if (!res?.error) {
      enqueueSnackbar(t('MESSAGE.DEACTIVATED_SUCCESSFULLY'));
      confirmDeactivate.onFalse();
    } else {
      enqueueSnackbar(`${res.error}`, { variant: 'error' });
    }
  };

  const handleConfirmEnrollmentChange = async () => {
    if (!enrollmentConfirm) return;
    const { item, next } = enrollmentConfirm;
    setEnrollmentConfirm(null);
    setEnrollmentSavingId(item.id);
    const res = await updateCourseEnrollmentStatus(item.id, next);
    setEnrollmentSavingId(null);
    if (res?.error) {
      enqueueSnackbar(res.error, { variant: 'error' });
      return;
    }
    enqueueSnackbar(t('MESSAGE.ENROLLMENT_STATUS_UPDATED'), { variant: 'success' });
    router.refresh();
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
          disablePagination
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
                  item?.students?.map((student: any) => student.client?.user_id).filter(Boolean) || []
                );
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
              hide: (row: any) => row.is_active === true,
            },
            {
              sx: { color: 'error.dark' },
              label: t('LABEL.DEACTIVATE'),
              icon: 'streamline:synchronize-disable-solid',
              onClick: (item: any) => {
                setSelectedCourse(item);
                confirmDeactivate.onTrue();
              },
              hide: (row: any) => row.is_active === false,
            },
            {
              sx: { color: 'error.dark' },
              label: t('LABEL.DELETE'),
              icon: 'mingcute:delete-fill',
              onClick: (item) => {
                setSelectedId(item.id);
                confirmDelete.onTrue();
              },
              dividerBefore: true,
            },
          ]}
          customRender={{
            name: (item: any) => (
              <Box sx={{ color: item?.is_active ? 'inherit' : 'red' }}>
                {item?.name || (i18n.language === 'ar' ? item?.name_ar : item?.name_en) || '-'}
              </Box>
            ),
            students: (item: any) => (
              <Box sx={{ color: item?.is_active ? 'inherit' : 'red' }}>
                {`${item?.students?.length || 0} `}
                {t('LABEL.STUDENT')}
              </Box>
            ),
            seats: (item: any) => (
              <Box sx={{ color: item?.is_active ? 'inherit' : 'red' }}>
                {item?.course_type === 'fixed'
                  ? `${item?.seats ?? ''} ${t('LABEL.SEAT')}`
                  : t('LABEL.FLEXIBLE_COURSE')}
              </Box>
            ),
            field: (item: any) => (
              <Box sx={{ color: item?.is_active ? 'inherit' : 'red' }}>
                {' '}
                {i18n.language === 'ar'
                  ? (item?.field?.name_ar || item?.field?.name || '-')
                  : (item?.field?.name_en || item?.field?.name || '-')}
              </Box>
            ),
            average_rate: (item: any) => (
              <Box sx={{ color: item?.is_active ? 'inherit' : 'red' }}>
                {item?.average_rate ? String(item.average_rate).slice(0, 3) : '-'}
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
            enrollment_status: (item: any) => {
              const isFixed = item?.course_type === 'fixed';
              if (!isFixed) {
                const displayName =
                  item?.name || (i18n.language === 'ar' ? item?.name_ar : item?.name_en) || '';
                return (
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    onClick={() =>
                      setFlexibleEnrollmentModal({
                        id: String(item.id ?? item._id),
                        name: displayName,
                      })
                    }
                    sx={{ textTransform: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}
                  >
                    {t('BUTTON.MANAGE')}
                  </Button>
                );
              }
              const remainingSeats = item?.seats;
              const isFull = typeof remainingSeats === 'number' && remainingSeats === 0;
              const isOpen = item?.enrollmentStatus !== 'closed';
              const busy = enrollmentSavingId === item.id;
              const switchChecked = isFull ? false : isOpen;
              const statusText = isFull
                ? t('LABEL.ENROLLMENT_FULL')
                : isOpen
                  ? t('LABEL.ENROLLMENT_OPEN')
                  : t('LABEL.ENROLLMENT_CLOSED');
              const statusColor = isFull
                ? '#7B1FA2'
                : isOpen
                  ? 'success.main'
                  : 'warning.main';

              return (
                <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" sx={{ py: 0.5 }}>
                  <Switch
                    size="small"
                    checked={switchChecked}
                    disabled={busy || isFull}
                    sx={enrollmentTurquoiseSwitchSx}
                    onChange={() => {
                      if (isFull) return;
                      const next = isOpen ? 'closed' : 'open';
                      setEnrollmentConfirm({ item, next });
                    }}
                  />
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: statusColor,
                      ...(!item?.is_active ? { opacity: 0.85 } : {}),
                    }}
                  >
                    {statusText}
                  </Typography>
                  {busy ? <CircularProgress size={18} thickness={5} /> : null}
                </Stack>
              );
            },

            price: (item: any) => (
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.75}
                sx={{ color: item?.is_active ? 'inherit' : 'red' }}
              >
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
                <span>{Math.round(item?.price ?? 0)}</span>
              </Stack>
            ),
          }}
        />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            py: 2,
            px: 2,
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
            backgroundColor: (theme) => theme.palette.background.paper,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Rows per page:
            </Typography>
            <FormControl size="small" sx={{ minWidth: 80 }}>
              <Select
                value={currentLimit}
                onChange={(e) => {
                  const newLimit = e.target.value as number;
                  const params = new URLSearchParams(searchParams.toString());
                  params.set('limit', String(newLimit));
                  params.delete('page'); // Remove page parameter since we're not using pagination
                  router.push(`${pathname}?${params.toString()}`);
                }}
                sx={{
                  '& .MuiSelect-select': {
                    py: 1,
                  },
                }}
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={15}>15</MenuItem>
                <MenuItem value={20}>20</MenuItem>
                <MenuItem value={30}>30</MenuItem>
                <MenuItem value={40}>40</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
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
      {flexibleEnrollmentModal ? (
        <FlexibleEnrollmentDialog
          open
          courseId={flexibleEnrollmentModal.id}
          courseTitle={flexibleEnrollmentModal.name}
          onClose={() => setFlexibleEnrollmentModal(null)}
        />
      ) : null}
      <Dialog
        open={!!enrollmentConfirm}
        onClose={() => setEnrollmentConfirm(null)}
        maxWidth={false}
        fullWidth={false}
        PaperProps={{
          sx: enrollmentConfirmDialogPaperSx,
        }}
        BackdropProps={{
          sx: { backgroundColor: 'rgba(15, 23, 42, 0.65)' },
        }}
      >
        <DialogTitle variant="inherit" sx={enrollmentConfirmDialogTitleSx}>
          {t('TITLE.MANAGE_ENROLLMENT')}
          <IconButton
            aria-label={i18n.language === 'ar' ? 'إغلاق' : 'Close'}
            onClick={() => setEnrollmentConfirm(null)}
            disabled={!!enrollmentSavingId}
            size="small"
            sx={enrollmentConfirmDialogCloseIconButtonSx}
          >
            <Iconify
              icon="mingcute:close-line"
              width={enrollmentConfirmCloseIconifySx.width}
              sx={enrollmentConfirmCloseIconifySx}
            />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={enrollmentConfirmDialogContentSx}>
          <Typography variant="body2" sx={enrollmentConfirmDialogMessageSx}>
            {enrollmentConfirm &&
              (i18n.language === 'ar' ? (
                enrollmentConfirm.next === 'open' ? (
                  <>
                    هل أنت متأكد من{' '}
                    <Box component="span" sx={enrollmentConfirmDialogBoldPhraseSx}>
                      فتح التسجيل
                    </Box>
                    ؟
                  </>
                ) : (
                  <>
                    هل أنت متأكد من{' '}
                    <Box component="span" sx={enrollmentConfirmDialogBoldPhraseSx}>
                      إغلاق التسجيل
                    </Box>
                    ؟
                  </>
                )
              ) : enrollmentConfirm.next === 'open' ? (
                <>
                  Are you sure you want to{' '}
                  <Box component="span" sx={enrollmentConfirmDialogBoldPhraseSx}>
                    open enrollment
                  </Box>
                  ?
                </>
              ) : (
                <>
                  Are you sure you want to{' '}
                  <Box component="span" sx={enrollmentConfirmDialogBoldPhraseSx}>
                    close enrollment
                  </Box>
                  ?
                </>
              ))}
          </Typography>
        </DialogContent>
        <DialogActions sx={enrollmentConfirmDialogActionsSx}>
          <Button
            variant="contained"
            disabled={!!enrollmentSavingId}
            onClick={handleConfirmEnrollmentChange}
            sx={enrollmentConfirmButtonConfirmSx}
          >
            {t('BUTTON.CONFIRM')}
          </Button>
          <Button
            variant="outlined"
            disabled={!!enrollmentSavingId}
            onClick={() => setEnrollmentConfirm(null)}
            sx={enrollmentConfirmButtonCancelSx}
          >
            {t('BUTTON.CANCEL')}
          </Button>
        </DialogActions>
      </Dialog>
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
