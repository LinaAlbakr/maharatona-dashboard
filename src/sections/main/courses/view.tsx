'use client';

import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { enqueueSnackbar } from 'notistack';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import Container from '@mui/material/Container';
import useMediaQuery from '@mui/material/useMediaQuery';
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

import i18n from 'src/locales/i18n';
import { useTranslate } from 'src/locales';
import { deleteCousre, editCourseStatus, updateCourseEnrollmentStatus } from 'src/actions/courses';
import SharedTable from 'src/CustomSharedComponents/SharedTable/SharedTable';
import { cellAlignment } from 'src/CustomSharedComponents/SharedTable/types';

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
import { useAdminEntityListsRealtimeRefresh } from 'src/hooks/use-admin-entity-lists-realtime';

type props = {
  count: number;
  courses: any[];
};

const getDiscountedPrice = (course: any): number | null => {
  const basePrice = Number(course?.price ?? 0);
  const discountAmount = Number(course?.discount_amount ?? 0);
  const discountType = String(course?.discount_type ?? '').toLowerCase();

  if (!Number.isFinite(basePrice) || basePrice <= 0) return null;
  if (!Number.isFinite(discountAmount) || discountAmount <= 0) return null;

  // Current backend exposes total/specific with numeric amount; treat as percentage for display.
  if (discountType !== 'total' && discountType !== 'specific') return null;

  const discounted = basePrice - (basePrice * discountAmount) / 100;
  if (!Number.isFinite(discounted)) return null;

  return Math.max(0, Math.round(discounted * 100) / 100);
};

/** Programs whose end date is in the past use this color. */
const PAST_COURSE_COLOR = '#6D6968';

/** A program is "past" when its end date is strictly before today (date-only compare). */
const isPastCourse = (course: any): boolean => {
  const end = course?.end_date;
  if (!end) return false;
  const endDate = new Date(end);
  if (Number.isNaN(endDate.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);
  return endDate.getTime() < today.getTime();
};

/**
 * Cell text color:
 * - inactive programs stay red (original behavior, unchanged)
 * - active-but-ended/past programs are gray
 * - otherwise normal
 */
const courseTextColor = (course: any): string => {
  if (course?.is_active === false) return 'red';
  if (isPastCourse(course)) return PAST_COURSE_COLOR;
  return 'inherit';
};

const parseDateMs = (value: unknown): number => {
  if (!value) return Number.POSITIVE_INFINITY;
  const date = new Date(value as string);
  return Number.isNaN(date.getTime()) ? Number.POSITIVE_INFINITY : date.getTime();
};

/**
 * List sort tier:
 * 0 — active, not ended, enrollment open (includes full)
 * 1 — active, not ended, enrollment closed
 * 2 — ended (past end date, gray)
 * 3 — inactive (red, bottom)
 */
const getCourseSortTier = (course: any): number => {
  if (course?.is_active === false) return 3;
  if (isPastCourse(course)) return 2;
  if (course?.enrollmentStatus === 'closed') return 1;
  return 0;
};

/** Active/open & closed: nearest start date first; ended: most recent end date first. */
const compareCoursesForList = (a: any, b: any): number => {
  const tierA = getCourseSortTier(a);
  const tierB = getCourseSortTier(b);
  if (tierA !== tierB) return tierA - tierB;

  if (tierA === 2 || tierA === 3) {
    return parseDateMs(b?.end_date) - parseDateMs(a?.end_date);
  }

  return parseDateMs(a?.start_date) - parseDateMs(b?.start_date);
};

/** Numeric date in DD-MM-YYYY (e.g. 03-03-2026), language-independent. */
const numericDate = (value: any): string => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}-${month}-${date.getFullYear()}`;
};

const CoursesView = ({ count, courses }: Readonly<props>) => {
  const settings = useSettingsContext();
  const { t } = useTranslate();
  const isIpadViewport = useMediaQuery(
    '(min-width: 768px) and (max-width: 1366px) and (pointer: coarse)'
  );
  useAdminEntityListsRealtimeRefresh();
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

  // Open → closed → ended (gray) → inactive; start/end date ordering within each tier.
  const sortedCourses = useMemo(() => {
    const list = Array.isArray(courses) ? [...courses] : [];
    return list.sort(compareCoursesForList);
  }, [courses]);

  const TABLE_HEAD = [
    { id: 'name', label: 'LABEL.PROGRAM', align: cellAlignment.left },
    { id: 'center', label: 'LABEL.CENTER', align: cellAlignment.center },
    { id: 'field', label: 'LABEL.CATEGORY', align: cellAlignment.center },
    { id: 'price', label: 'LABEL.PRICE', align: cellAlignment.center },
    { id: 'type', label: 'LABEL.TYPE', align: cellAlignment.center },
    { id: 'students', label: 'LABEL.BOOKED', align: cellAlignment.center },
    { id: 'seats', label: 'LABEL.SEATS_LEFT', align: cellAlignment.center },
    { id: 'start_date', label: 'LABEL.START', align: cellAlignment.center },
    { id: 'end_date', label: 'LABEL.END', align: cellAlignment.center },
    { id: 'enrollment_status', label: 'LABEL.ENROLLMENT', align: cellAlignment.center },
    { id: '', label: 'LABEL.SETTINGS', align: cellAlignment.center },
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
      enqueueSnackbar(t('MESSAGE.PROGRAM_DELETED_SUCCESSFULLY'), {
        variant: 'success',
      });
    }
    confirmDelete.onFalse();
  };

  const handleConfirmActivate = async () => {
    const res = await editCourseStatus(selectedCourse);
    if (!res?.error) {
      enqueueSnackbar(t('MESSAGE.PROGRAM_ACTIVATED_SUCCESSFULLY'));
      confirmActivate.onFalse();
    } else {
      enqueueSnackbar(`${res.error}`, { variant: 'error' });
    }
  };
  const handleConfirmDeactivate = async () => {
    const res = await editCourseStatus(selectedCourse);
    if (!res?.error) {
      enqueueSnackbar(t('MESSAGE.PROGRAM_DEACTIVATED_SUCCESSFULLY'));
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
                  placeholder={t('LABEL.SEARCH_PROGRAM_OR_CENTER')}
                  type="search"
                  onChange={(e) => createQueryString('search', e.target.value)}
                />
              </FormProvider>
            </Card>
          </Grid>
        </Box>

        <SharedTable
          count={count}
          data={sortedCourses}
          tableHead={TABLE_HEAD}
          disablePagination
          actions={[
            {
              sx: { color: 'info.dark' },
              label: t('LABEL.VIEW'),
              icon: 'lets-icons:view',
              onClick: (item) => {
                router.push(paths.dashboard.courseDetails(item.id));
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
              <Box sx={{ color: courseTextColor(item) }}>
                {(i18n.language === 'ar'
                  ? item?.name_ar || item?.name_en
                  : item?.name_en || item?.name_ar) ||
                  item?.name ||
                  '-'}
              </Box>
            ),
            center: (item: any) => (
              <Box sx={{ color: courseTextColor(item) }}>{item?.center?.name || '-'}</Box>
            ),
            students: (item: any) => (
              <Box sx={{ color: courseTextColor(item) }}>{item?.students?.length || 0}</Box>
            ),
            seats: (item: any) => {
              const seatsNum = Number(item?.seats);
              const isFlexible = item?.course_type !== 'fixed';
              return (
                <Box sx={{ color: courseTextColor(item) }}>
                  {isFlexible || !Number.isFinite(seatsNum) ? '-' : seatsNum}
                </Box>
              );
            },
            type: (item: any) => (
              <Box sx={{ color: courseTextColor(item) }}>
                {item?.course_type === 'fixed' ? t('LABEL.FIXED') : t('LABEL.FLEXIBLE')}
              </Box>
            ),
            field: (item: any) => (
              <Box sx={{ color: courseTextColor(item) }}>
                {i18n.language === 'ar'
                  ? (item?.field?.name_ar || item?.field?.name || '-')
                  : (item?.field?.name_en || item?.field?.name || '-')}
              </Box>
            ),
            start_date: (item: any) => (
              <Box sx={{ color: courseTextColor(item) }}>{numericDate(item?.start_date)}</Box>
            ),
            end_date: (item: any) => (
              <Box sx={{ color: courseTextColor(item) }}>{numericDate(item?.end_date)}</Box>
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
              const keepStatusInlineForIpad = isFixed && isIpadViewport;

              return (
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="center"
                  spacing={1}
                  flexWrap="wrap"
                  sx={{ py: 0.5 }}
                >
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      columnGap: 1,
                      whiteSpace: keepStatusInlineForIpad ? 'nowrap' : 'normal',
                    }}
                  >
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
                  </Box>
                  {busy ? <CircularProgress size={18} thickness={5} /> : null}
                </Stack>
              );
            },

            price: (item: any) => {
              if (item?.course_type !== 'fixed') {
                return <Box sx={{ color: courseTextColor(item) }}>-</Box>;
              }
              const discountedPrice = getDiscountedPrice(item);
              const basePrice = Math.round(item?.price ?? 0);
              const sarIcon = item?.is_active
                ? '/assets/images/sar-logo.svg'
                : '/assets/images/red-sar-logo.svg';
              return (
                <Stack
                  direction="column"
                  alignItems="center"
                  spacing={0.5}
                  sx={{ color: courseTextColor(item) }}
                >
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    <Image src={sarIcon} alt="sar logo" height={20} width={20} />
                    <span
                      style={
                        discountedPrice != null
                          ? { textDecoration: 'line-through', opacity: 0.85 }
                          : undefined
                      }
                    >
                      {basePrice}
                    </span>
                  </Stack>
                  {discountedPrice != null ? (
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                      <Image src={sarIcon} alt="sar logo" height={20} width={20} />
                      <span style={{ fontWeight: 700 }}>{Math.round(discountedPrice)}</span>
                    </Stack>
                  ) : null}
                </Stack>
              );
            },
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
            variant="outlined"
            disabled={!!enrollmentSavingId}
            onClick={() => setEnrollmentConfirm(null)}
            sx={enrollmentConfirmButtonCancelSx}
          >
            {t('BUTTON.CANCEL')}
          </Button>
          <Button
            variant="contained"
            disabled={!!enrollmentSavingId}
            onClick={handleConfirmEnrollmentChange}
            sx={enrollmentConfirmButtonConfirmSx}
          >
            {t('BUTTON.CONFIRM')}
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
