'use client';

import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import { useSnackbar } from 'notistack';

import { getServerRootUrl } from 'src/config-global';
import axiosInstance, { endpoints, getErrorMessage } from 'src/utils/axios';
import { useTranslate } from 'src/locales';

// ----------------------------------------------------------------------

export default function MaintenanceModeSwitch() {
  const { t } = useTranslate();
  const { enqueueSnackbar } = useSnackbar();

  const [parentEnabled, setParentEnabled] = useState(false);
  const [centerEnabled, setCenterEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchState = useCallback(async () => {
    const root = getServerRootUrl();
    if (!root) {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get<{ parentMaintenance?: boolean; centerMaintenance?: boolean }>(
        `${root}/maintenance`
      );
      setParentEnabled(Boolean(res.data?.parentMaintenance));
      setCenterEnabled(Boolean(res.data?.centerMaintenance));
    } catch {
      enqueueSnackbar(t('MESSAGE.MAINTENANCE_LOAD_FAILED'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar, t]);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  const saveMaintenance = async (next: { parentMaintenance?: boolean; centerMaintenance?: boolean }) => {
    setSaving(true);
    try {
      await axiosInstance.post(endpoints.maintenance.set, next);
      enqueueSnackbar(t('MESSAGE.MAINTENANCE_UPDATED'), { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(getErrorMessage(err), { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleParentChange = async (_: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    const previous = parentEnabled;
    setParentEnabled(checked);
    await saveMaintenance({ parentMaintenance: checked });
    // In case save fails, refresh from source of truth.
    if (previous !== checked) {
      await fetchState();
    }
  };

  const handleCenterChange = async (_: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    const previous = centerEnabled;
    setCenterEnabled(checked);
    await saveMaintenance({ centerMaintenance: checked });
    if (previous !== checked) {
      await fetchState();
    }
  };

  if (loading) {
    return <CircularProgress size={22} sx={{ mx: 0.5 }} />;
  }

  return (
    <Tooltip title={t('LABEL.MAINTENANCE_MODE_HINT')}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mr: { xs: 0, sm: 0.5 } }}>
        <Stack direction="row" alignItems="center" spacing={0}>
          <Typography
            variant="caption"
            sx={{
              display: { xs: 'none', md: 'block' },
              maxWidth: 120,
              lineHeight: 1.2,
              color: 'text.secondary',
              fontWeight: 'fontWeightMedium',
            }}
          >
            {t('LABEL.PARENT_MAINTENANCE_MODE')}
          </Typography>
          <Switch
            size="small"
            checked={parentEnabled}
            onChange={handleParentChange}
            disabled={saving || !getServerRootUrl()}
            color="warning"
            inputProps={{ 'aria-label': t('LABEL.PARENT_MAINTENANCE_MODE') }}
          />
        </Stack>
        <Stack direction="row" alignItems="center" spacing={0}>
          <Typography
            variant="caption"
            sx={{
              display: { xs: 'none', md: 'block' },
              maxWidth: 120,
              lineHeight: 1.2,
              color: 'text.secondary',
              fontWeight: 'fontWeightMedium',
            }}
          >
            {t('LABEL.CENTER_MAINTENANCE_MODE')}
          </Typography>
          <Switch
            size="small"
            checked={centerEnabled}
            onChange={handleCenterChange}
            disabled={saving || !getServerRootUrl()}
            color="warning"
            inputProps={{ 'aria-label': t('LABEL.CENTER_MAINTENANCE_MODE') }}
          />
        </Stack>
      </Stack>
    </Tooltip>
  );
}
