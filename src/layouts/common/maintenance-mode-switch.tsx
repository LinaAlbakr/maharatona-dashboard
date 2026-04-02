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

  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchState = useCallback(async () => {
    const root = getServerRootUrl();
    if (!root) {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get<{ maintenance: boolean }>(`${root}/maintenance`);
      setEnabled(Boolean(res.data?.maintenance));
    } catch {
      enqueueSnackbar(t('MESSAGE.MAINTENANCE_LOAD_FAILED'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar, t]);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  const handleChange = async (_: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    const previous = enabled;
    setEnabled(checked);
    setSaving(true);
    try {
      await axiosInstance.post(endpoints.maintenance.set, { enabled: checked });
      enqueueSnackbar(t('MESSAGE.MAINTENANCE_UPDATED'), { variant: 'success' });
    } catch (err) {
      setEnabled(previous);
      enqueueSnackbar(getErrorMessage(err), { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <CircularProgress size={22} sx={{ mx: 0.5 }} />;
  }

  return (
    <Tooltip title={t('LABEL.MAINTENANCE_MODE_HINT')}>
      <Stack direction="row" alignItems="center" spacing={0} sx={{ mr: { xs: 0, sm: 0.5 } }}>
        <Typography
          variant="caption"
          sx={{
            display: { xs: 'none', md: 'block' },
            maxWidth: 100,
            lineHeight: 1.2,
            color: 'text.secondary',
            fontWeight: 'fontWeightMedium',
          }}
        >
          {t('LABEL.MAINTENANCE_MODE')}
        </Typography>
        <Switch
          size="small"
          checked={enabled}
          onChange={handleChange}
          disabled={saving || !getServerRootUrl()}
          color="warning"
          inputProps={{ 'aria-label': t('LABEL.MAINTENANCE_MODE') }}
        />
      </Stack>
    </Tooltip>
  );
}
