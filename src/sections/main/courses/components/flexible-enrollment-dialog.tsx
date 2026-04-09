'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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
import type { FlexibleBookingModelKey } from './flexible-model-config';
import { FLEX_MODEL_ROWS, enrollmentTurquoiseSwitchSx } from './flexible-model-config';

type FlexModelRow = (typeof FLEX_MODEL_ROWS)[number];

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
        <DialogTitle sx={{ color: 'info.main', fontWeight: 700, px: 3, pb: 1 }}>
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
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            <Box component="span" sx={{ color: 'text.secondary' }}>
              {t('LABEL.PROGRAM')}:{' '}
            </Box>
            <Box component="span" sx={{ color: '#2EC4B6', fontWeight: 600 }}>
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
                <TableRow>
                  <TableCell
                    sx={{
                      textAlign: 'left',
                      fontWeight: 400,
                      color: '#2EC4B6',
                      borderBottom: '1px dashed',
                      borderColor: 'divider',
                    }}
                  >
                    {t('LABEL.FLEX_ENROLL_COL_MODEL')}
                  </TableCell>
                  <TableCell
                    sx={{
                      textAlign: 'left',
                      fontWeight: 400,
                      color: '#2EC4B6',
                      borderBottom: '1px dashed',
                      borderColor: 'divider',
                    }}
                  >
                    {t('LABEL.FLEX_ENROLL_COL_STATUS')}
                  </TableCell>
                  <TableCell
                    sx={{
                      textAlign: 'center',
                      fontWeight: 400,
                      color: '#2EC4B6',
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
                    ? { label: t('LABEL.ENROLLMENT_FULL'), color: '#7B1FA2' as const }
                    : isOpen
                      ? { label: t('LABEL.ENROLLMENT_OPEN'), color: 'success.main' as const }
                      : { label: t('LABEL.ENROLLMENT_CLOSED'), color: 'warning.main' as const };

                  return (
                    <TableRow key={row.key}>
                      <TableCell
                        sx={{
                          textAlign: 'left',
                          verticalAlign: 'middle',
                          borderBottom: '1px dashed',
                          borderColor: 'divider',
                          color: 'info.main',
                          fontWeight: 600,
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
                          sx={{ fontWeight: 600, color: status.color }}
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
                            sx={enrollmentTurquoiseSwitchSx}
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
          sx: {
            maxWidth: 340,
            width: 'calc(100% - 32px)',
            overflow: 'hidden',
            '& .MuiDialogContent-root': { overflow: 'hidden' },
          },
        }}
        BackdropProps={{
          sx: { backgroundColor: 'rgba(15, 23, 42, 0.65)' },
        }}
      >
        <DialogTitle sx={{ color: 'info.main', fontWeight: 700, pb: 1, px: 2.5, pt: 2 }}>
          {t('TITLE.MANAGE_ENROLLMENT')}
        </DialogTitle>
        <DialogContent sx={{ px: 2.5, pt: 0, pb: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ pt: 0.5 }}>
            {pendingConfirm &&
              (i18n.language === 'ar' ? (
                pendingConfirm.next === 'open' ? (
                  <>
                    هل أنت متأكد من{' '}
                    <Box component="span" sx={{ fontWeight: 700 }}>
                      فتح التسجيل
                    </Box>
                    ؟
                  </>
                ) : (
                  <>
                    هل أنت متأكد من{' '}
                    <Box component="span" sx={{ fontWeight: 700 }}>
                      إغلاق التسجيل
                    </Box>
                    ؟
                  </>
                )
              ) : pendingConfirm.next === 'open' ? (
                <>
                  Are you sure you want to{' '}
                  <Box component="span" sx={{ fontWeight: 700 }}>
                    open enrollment
                  </Box>
                  ?
                </>
              ) : (
                <>
                  Are you sure you want to{' '}
                  <Box component="span" sx={{ fontWeight: 700 }}>
                    close enrollment
                  </Box>
                  ?
                </>
              ))}
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{
            px: 2.5,
            pb: 2,
            pt: 0.5,
            gap: 1,
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
          }}
        >
          <Button
            variant="contained"
            size="small"
            disabled={!!savingKey}
            onClick={handleConfirmPending}
            sx={{
              py: 0.5,
              px: 1.5,
              minWidth: 0,
              minHeight: 30,
              fontSize: '0.8125rem',
              fontWeight: 600,
              lineHeight: 1.2,
              borderRadius: 1.5,
              textTransform: 'none',
              bgcolor: '#2EC4B6',
              color: '#fff',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#26b0a3', boxShadow: 'none' },
            }}
          >
            {t('BUTTON.CONFIRM')}
          </Button>
          <Button
            variant="outlined"
            size="small"
            disabled={!!savingKey}
            onClick={() => setPendingConfirm(null)}
            sx={{
              py: 0.5,
              px: 1.5,
              minWidth: 0,
              minHeight: 30,
              fontSize: '0.8125rem',
              fontWeight: 600,
              lineHeight: 1.2,
              borderRadius: 1.5,
              textTransform: 'none',
              borderColor: 'grey.400',
              color: 'grey.800',
              bgcolor: 'background.paper',
              boxShadow: 'none',
              '&:hover': {
                borderColor: 'grey.500',
                bgcolor: 'grey.100',
                boxShadow: 'none',
              },
            }}
          >
            {t('BUTTON.CANCEL')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
