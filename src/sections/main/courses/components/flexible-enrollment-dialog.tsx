'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { enqueueSnackbar } from 'notistack';
import { useRouter } from 'next/navigation';

import i18n from 'src/locales/i18n';
import { useTranslate } from 'src/locales';
import { fetchCourseInfo, mergeCourseFlexibleEnrollment } from 'src/actions/courses';
import Iconify from 'src/components/iconify';
import type { FlexibleBookingModelKey } from './flexible-model-config';
import { FLEX_MODEL_ROWS } from './flexible-model-config';
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
} from './enrollment-confirm-dialog-styles';

type FlexModelRow = (typeof FLEX_MODEL_ROWS)[number];

/** Manage Enrollment modal — brand switch (#3CB8BB) and exact dimensions. */
const MANAGE_ENROLLMENT_SWITCH_SX = {
  overflow: 'visible',
  width: 51.47,
  height: 25.29,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    overflow: 'visible',
    padding: '3px',
  },
  '& .MuiSwitch-track': {
    overflow: 'visible',
    opacity: 1,
  },
  '& .MuiSwitch-switchBase.Mui-checked': {
    color: '#ffffff',
    '&:hover': {
      backgroundColor: 'rgba(60, 184, 187, 0.18)',
    },
  },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
    backgroundColor: '#3CB8BB',
    opacity: 1,
  },
} as const;

const STATUS_COLOR = {
  open: '#00D250',
  full: '#A300EF',
  closed: '#FFAB01',
} as const;

type Props = {
  open: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
};

/**
 * Seat-full for flexible models that use SeatPool (daily/weekly/monthly): embedded
 * `seat_capacity` stays as configured max; use pool `remaining_seats` when the API sends pools.
 */
function isSlotModelFull(course: Record<string, unknown> | null, row: FlexModelRow): boolean {
  const slots = course?.[row.slotField];
  if (!Array.isArray(slots) || slots.length === 0) return false;

  if (row.key === 'daily') {
    const pools = course?.daily_seat_pools;
    if (Array.isArray(pools) && pools.length > 0) {
      return pools.every((p: { remaining_seats?: number }) => Number(p?.remaining_seats ?? 0) <= 0);
    }
  }
  if (row.key === 'weekly') {
    const pools = course?.weekly_seat_pools;
    if (Array.isArray(pools) && pools.length > 0) {
      return pools.every((p: { remaining_seats?: number }) => Number(p?.remaining_seats ?? 0) <= 0);
    }
  }
  if (row.key === 'monthly') {
    const pools = course?.monthly_seat_pools;
    if (Array.isArray(pools) && pools.length > 0) {
      return pools.every((p: { remaining_seats?: number }) => Number(p?.remaining_seats ?? 0) <= 0);
    }
  }

  return slots.every((s: any) => Number(s?.seat_capacity ?? 0) <= 0);
}

export default function FlexibleEnrollmentDialog({
  open,
  onClose,
  courseId,
  courseTitle,
}: Readonly<Props>) {
  const { t } = useTranslate();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [savingKey, setSavingKey] = useState<FlexibleBookingModelKey | null>(null);
  const [course, setCourse] = useState<any>(null);
  const [pendingConfirm, setPendingConfirm] = useState<{
    modelKey: FlexibleBookingModelKey;
    next: 'open' | 'closed';
  } | null>(null);

  const load = useCallback(async () => {
    if (!courseId || !open) return;
    setLoading(true);
    try {
      const res = await fetchCourseInfo(courseId);
      setCourse(res?.data ?? null);
    } catch {
      setCourse(null);
      enqueueSnackbar(t('MESSAGE.SOMETHING_WRONG'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [courseId, open, t]);

  useEffect(() => {
    if (open) load();
    else setCourse(null);
  }, [open, load]);

  const activeRows = useMemo(() => {
    if (!course) return [];
    return FLEX_MODEL_ROWS.filter(
      (row) => Array.isArray(course[row.slotField]) && course[row.slotField].length > 0
    );
  }, [course]);

  const rawFlex = (course?.flexibleEnrollmentByModel || {}) as Record<string, string | undefined>;

  const applyEnrollmentChange = async (
    modelKey: FlexibleBookingModelKey,
    next: 'open' | 'closed'
  ) => {
    setSavingKey(modelKey);
    const res = await mergeCourseFlexibleEnrollment(courseId, { [modelKey]: next });
    setSavingKey(null);
    if (res?.error) {
      enqueueSnackbar(res.error, { variant: 'error' });
      return;
    }
    enqueueSnackbar(t('MESSAGE.ENROLLMENT_STATUS_UPDATED'), { variant: 'success' });
    setCourse((prev: any) =>
      prev
        ? {
            ...prev,
            flexibleEnrollmentByModel: {
              ...(prev.flexibleEnrollmentByModel || {}),
              [modelKey]: next,
            },
          }
        : prev
    );
    router.refresh();
  };

  const handleConfirmPending = async () => {
    if (!pendingConfirm) return;
    const { modelKey, next } = pendingConfirm;
    setPendingConfirm(null);
    await applyEnrollmentChange(modelKey, next);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            overflow: 'visible',
          },
        }}
      >
        <DialogTitle
          sx={{
            color: '#2B53A1',
            fontWeight: 700,
            fontSize: 24,
            lineHeight: 1.3,
            px: 3,
            pb: 1,
          }}
        >
          {t('TITLE.MANAGE_ENROLLMENT')}
        </DialogTitle>
        <DialogContent
          sx={{
            overflowX: 'visible',
            overflowY: 'auto',
            px: 3,
            pt: 0,
            pb: 3,
          }}
        >
          <Typography variant="body2" sx={{ mb: 2 }}>
            <Box component="span" sx={{ color: '#919EAB', fontSize: 20, lineHeight: 1.4 }}>
              {t('LABEL.PROGRAM')}:{' '}
            </Box>
            <Box component="span" sx={{ color: '#3CB8BB', fontWeight: 700, fontSize: 22, lineHeight: 1.4 }}>
              {courseTitle}
            </Box>
          </Typography>

          {loading ? (
            <Stack alignItems="center" py={4}>
              <CircularProgress />
            </Stack>
          ) : activeRows.length === 0 ? (
            <Typography color="text.secondary">{t('MESSAGE.NO_FLEXIBLE_MODELS')}</Typography>
          ) : (
            <Table
              size="small"
              sx={{ borderCollapse: 'separate', overflow: 'visible', '& .MuiTableCell-root': { overflow: 'visible' } }}
            >
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell
                    sx={{
                      textAlign: 'left',
                      fontWeight: 600,
                      fontSize: 14,
                      color: '#3CB8BB',
                      borderBottom: '1px dashed',
                      borderColor: 'divider',
                    }}
                  >
                    {t('LABEL.FLEX_ENROLL_COL_MODEL')}
                  </TableCell>
                  <TableCell
                    sx={{
                      textAlign: 'left',
                      fontWeight: 600,
                      fontSize: 14,
                      color: '#3CB8BB',
                      borderBottom: '1px dashed',
                      borderColor: 'divider',
                    }}
                  >
                    {t('LABEL.FLEX_ENROLL_COL_STATUS')}
                  </TableCell>
                  <TableCell
                    sx={{
                      textAlign: 'center',
                      fontWeight: 600,
                      fontSize: 14,
                      color: '#3CB8BB',
                      borderBottom: '1px dashed',
                      borderColor: 'divider',
                      width: 120,
                    }}
                  >
                    {t('LABEL.FLEX_ENROLL_COL_ACTION')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activeRows.map((row) => {
                  const isFull = isSlotModelFull(course, row);
                  const isOpen = rawFlex[row.key] !== 'closed';
                  const busy = savingKey === row.key;
                  const switchOn = isFull ? false : isOpen;
                  const status = isFull
                    ? { label: t('LABEL.ENROLLMENT_FULL'), color: STATUS_COLOR.full }
                    : isOpen
                      ? { label: t('LABEL.ENROLLMENT_OPEN'), color: STATUS_COLOR.open }
                      : { label: t('LABEL.ENROLLMENT_CLOSED'), color: STATUS_COLOR.closed };

                  return (
                    <TableRow key={row.key}>
                      <TableCell
                        sx={{
                          textAlign: 'left',
                          verticalAlign: 'middle',
                          borderBottom: '1px dashed',
                          borderColor: 'divider',
                          color: '#2B53A1',
                          fontWeight: 600,
                          fontSize: 14,
                        }}
                      >
                        {t(row.labelKey)}
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: 'left',
                          verticalAlign: 'middle',
                          borderBottom: '1px dashed',
                          borderColor: 'divider',
                        }}
                      >
                        <Typography
                          component="span"
                          variant="body2"
                          sx={{ fontWeight: 600, color: status.color, fontSize: 16 }}
                        >
                          {status.label}
                        </Typography>
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: 'center',
                          verticalAlign: 'middle',
                          borderBottom: '1px dashed',
                          borderColor: 'divider',
                        }}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="center"
                          spacing={0.5}
                          sx={{ overflow: 'visible' }}
                        >
                          {busy ? <CircularProgress size={20} thickness={5} /> : null}
                          <Switch
                            size="small"
                            checked={switchOn}
                            disabled={busy || isFull}
                            sx={MANAGE_ENROLLMENT_SWITCH_SX}
                            onChange={(_, checked) => {
                              if (isFull || busy) return;
                              const next = checked ? 'open' : 'closed';
                              setPendingConfirm({ modelKey: row.key, next });
                            }}
                          />
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!pendingConfirm}
        onClose={() => setPendingConfirm(null)}
        maxWidth={false}
        fullWidth={false}
        PaperProps={{
          sx: enrollmentConfirmDialogPaperSx,
        }}
        BackdropProps={{
          sx: { backgroundColor: 'rgba(15, 23, 42, 0.65)' },
        }}
      >
        <DialogTitle sx={enrollmentConfirmDialogTitleSx}>
          {t('TITLE.MANAGE_ENROLLMENT')}
          <IconButton
            aria-label={i18n.language === 'ar' ? 'إغلاق' : 'Close'}
            onClick={() => setPendingConfirm(null)}
            disabled={!!savingKey}
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
            {pendingConfirm &&
              (i18n.language === 'ar' ? (
                pendingConfirm.next === 'open' ? (
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
              ) : pendingConfirm.next === 'open' ? (
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
            disabled={!!savingKey}
            onClick={handleConfirmPending}
            sx={enrollmentConfirmButtonConfirmSx}
          >
            {t('BUTTON.CONFIRM')}
          </Button>
          <Button
            variant="outlined"
            disabled={!!savingKey}
            onClick={() => setPendingConfirm(null)}
            sx={enrollmentConfirmButtonCancelSx}
          >
            {t('BUTTON.CANCEL')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
