'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { enqueueSnackbar } from 'notistack';
import { useRouter } from 'next/navigation';

import { useTranslate } from 'src/locales';
import { fetchCourseInfo, mergeCourseFlexibleEnrollment } from 'src/actions/courses';
import type { FlexibleBookingModelKey } from './flexible-model-config';
import { FLEX_MODEL_ROWS } from './flexible-model-config';

type Props = {
  open: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
};

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

  const handleToggle = async (modelKey: FlexibleBookingModelKey, checked: boolean) => {
    const next = checked ? 'open' : 'closed';
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('TITLE.FLEXIBLE_ENROLLMENT')}</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {courseTitle}
        </Typography>
        {loading ? (
          <Stack alignItems="center" py={4}>
            <CircularProgress />
          </Stack>
        ) : activeRows.length === 0 ? (
          <Typography color="text.secondary">{t('MESSAGE.NO_FLEXIBLE_MODELS')}</Typography>
        ) : (
          <List disablePadding>
            {activeRows.map((row) => {
              const isOpen = rawFlex[row.key] !== 'closed';
              const busy = savingKey === row.key;
              return (
                <ListItem
                  key={row.key}
                  sx={{
                    px: 0,
                    py: 1.5,
                    borderBottom: 1,
                    borderColor: 'divider',
                  }}
                  secondaryAction={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      {busy ? <CircularProgress size={20} thickness={5} /> : null}
                      <Switch
                        size="small"
                        checked={isOpen}
                        disabled={busy}
                        color="success"
                        onChange={(_, c) => handleToggle(row.key, c)}
                      />
                    </Stack>
                  }
                >
                  <ListItemText
                    primary={t(row.labelKey)}
                    secondary={
                      <Chip
                        label={isOpen ? t('LABEL.ENROLLMENT_OPEN') : t('LABEL.ENROLLMENT_CLOSED')}
                        size="small"
                        color={isOpen ? 'success' : 'warning'}
                        variant={isOpen ? 'filled' : 'outlined'}
                        sx={{ mt: 0.5, fontWeight: 600 }}
                      />
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}
