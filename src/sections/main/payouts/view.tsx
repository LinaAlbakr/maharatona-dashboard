'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import { useSnackbar } from 'notistack';

import { useTranslate } from 'src/locales';
import SharedTable from 'src/CustomSharedComponents/SharedTable/SharedTable';

import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import { useBoolean } from 'src/hooks/use-boolean';
import axiosInstance, { endpoints } from 'src/utils/axios';

type Payout = {
  id: string;
  referenceNumber: string;
  center: string;
  amount: number;
  transferDate: string;
};

type Props = {
  searchQuery?: string;
};

type CenterOption = {
  id: string;
  name: string;
};

const PayoutsView = ({ searchQuery = '' }: Readonly<Props>) => {
  const settings = useSettingsContext();
  const { t, i18n } = useTranslate();
  const { enqueueSnackbar } = useSnackbar();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [center, setCenter] = useState('');
  const [amount, setAmount] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [transferDate, setTransferDate] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [centers, setCenters] = useState<CenterOption[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const currentLimit = Number(searchParams?.get('limit')) || 20;

  const payoutDialog = useBoolean();

  const TABLE_HEAD = [
    { id: 'referenceNumber', label: 'LABEL.REFERENCE_NUMBER' },
    { id: 'center', label: 'LABEL.CENTER' },
    { id: 'amount', label: 'LABEL.AMOUNT' },
    { id: 'transferDate', label: 'LABEL.TRANSFER_DATE' },
  ];

  useEffect(() => {
    let active = true;
    const loadCenters = async () => {
      try {
        const res = await axiosInstance.get(endpoints.centers.centerNames);
        const list = res?.data?.data || res?.data || [];
        const mapped: CenterOption[] = Array.isArray(list)
          ? list.map((c: any) => ({
              id: c?._id ?? c?.id ?? '',
              name: c?.name ?? c?._id ?? '',
            }))
          : [];
        if (active) {
          setCenters(mapped);
        }
      } catch (error) {
        console.error('Failed to load centers', error);
        if (active) {
          setCenters([]);
        }
      }
    };
    loadCenters();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const loadPayouts = async () => {
      try {
        const res = await axiosInstance.get(
          `${endpoints.payouts.fetch}?limit=${currentLimit}`
        );
        const list = res?.data?.data || res?.data || [];
        const mapped: Payout[] = Array.isArray(list)
          ? list.map((p: any) => ({
              id: p?._id ?? p?.id ?? '',
              referenceNumber: p?.referenceNumber ?? '',
              center: p?.center?.name ?? p?.center ?? '',
              amount: Number(p?.amount) || 0,
              transferDate: p?.transferDate
                ? new Date(p.transferDate).toISOString()
                : '',
            }))
          : [];
        if (active) {
          setPayouts(mapped);
        }
      } catch (error) {
        console.error('Failed to load payouts', error);
        if (active) {
          setPayouts([]);
        }
      }
    };
    loadPayouts();
    return () => {
      active = false;
    };
  }, [currentLimit]);

  const formatAmount = useCallback(
    (value: number) =>
      new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
        style: 'currency',
        currency: 'SAR',
        maximumFractionDigits: 0,
      }).format(value),
    [i18n.language]
  );

  const formatDate = useCallback(
    (value: string) => {
      if (!value) return '-';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return '-';
      return new Intl.DateTimeFormat(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
        month: 'long',
        day: '2-digit',
        year: '2-digit',
      }).format(date);
    },
    [i18n.language]
  );

  const filteredPayouts = useMemo(() => payouts, [payouts]);

  const handleSubmit = async () => {
    if (!center) {
      enqueueSnackbar(t('LABEL.SELECT_CENTER'), { variant: 'warning' });
      return;
    }
    if (!amount) {
      enqueueSnackbar(t('LABEL.ENTER_AMOUNT'), { variant: 'warning' });
      return;
    }
    if (!transferDate) {
      enqueueSnackbar(t('LABEL.TRANSFER_DATE'), { variant: 'warning' });
      return;
    }
    setSubmitting(true);
    try {
      const payload: any = {
        center,
        amount: Number(amount),
        transferDate: new Date(transferDate).toISOString(),
        referenceNumber,
      };
      if (note) {
        payload.additionalNote = note;
      }
      await axiosInstance.post(endpoints.payouts.create, payload);
      enqueueSnackbar(t('MESSAGE.CREATED_SUCCESSFULLY'), { variant: 'success' });
      payoutDialog.onFalse();
      setCenter('');
      setAmount('');
      setReferenceNumber('');
      setTransferDate('');
      setNote('');
      // refresh list
      const refreshed = await axiosInstance.get(`${endpoints.payouts.fetch}?limit=${currentLimit}`);
      const list = refreshed?.data?.data || refreshed?.data || [];
      const mapped: Payout[] = Array.isArray(list)
        ? list.map((p: any) => ({
            id: p?._id ?? p?.id ?? '',
            referenceNumber: p?.referenceNumber ?? '',
            center: p?.center?.name ?? p?.center ?? '',
            amount: Number(p?.amount) || 0,
            transferDate: p?.transferDate ? new Date(p.transferDate).toISOString() : '',
          }))
        : [];
      setPayouts(mapped);
    } catch (error: any) {
      enqueueSnackbar(error?.message || 'Failed to create payout', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container
      maxWidth={settings.themeStretch ? false : 'xl'}
      sx={{ margin: '0px !important', padding: '0px !important' }}
    >
      <Box
        sx={{
          backgroundImage:
            'linear-gradient(135deg, rgba(38, 198, 218, 0.82), rgba(204, 56, 166, 0.72)), url(/assets/images/overlay_2.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: { sm: '300px', xs: '360px' },
          p: 0,
          boxShadow: 'inset 0 0 0 2000px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          paddingBlock: 6,
          alignItems: 'center',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        <Typography variant="h3" color="white" sx={{ textShadow: '0 6px 16px rgba(0,0,0,0.25)' }}>
          {t('LABEL.PAYOUTS')}
        </Typography>
        <Grid
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            px: 4,
          }}
        >
          <Card
            sx={{
              p: 1.5,
              ml: 3,
              mb: 1,
              flexGrow: 1,
              boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
              borderRadius: 3,
            }}
          >
            <Box
              display="flex"
              justifyContent="flex-end"
              alignItems="center"
            >
              <Button
                variant="contained"
                onClick={payoutDialog.onTrue}
                sx={{
                  bgcolor: 'white',
                  color: '#CC38A6',
                  px: 3,
                  boxShadow: '0 10px 24px rgba(0,0,0,0.12)',
                  '&:hover': {
                    bgcolor: '#f7e8f3',
                    color: '#b62f92',
                  },
                }}
              >
                {t('BUTTON.ADD_PAYOUT')}
              </Button>
            </Box>
          </Card>
        </Grid>
      </Box>

      <SharedTable
        count={filteredPayouts.length}
        data={filteredPayouts}
        tableHead={TABLE_HEAD}
        disablePagination
        customRender={{
          amount: (row) => formatAmount(row.amount),
          transferDate: (row) => formatDate(row.transferDate),
        }}
      />
      <Dialog
        open={payoutDialog.value}
        onClose={payoutDialog.onFalse}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle>{t('BUTTON.ADD_PAYOUT')}</DialogTitle>
        <DialogContent sx={{ pt: 1.5 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <Select
                  value={center}
                  displayEmpty
                  onChange={(e) => setCenter(e.target.value)}
                  renderValue={(val) => {
                    if (!val) {
                      return (
                        <Typography variant="body2" color="text.disabled">
                          {t('LABEL.SELECT_CENTER')}
                        </Typography>
                      );
                    }
                    const selected = centers.find((c) => c.id === val);
                    return selected?.name || selected?.id || val;
                  }}
                  IconComponent={(props) => <Iconify icon="eva:arrow-ios-downward-fill" {...props} />}
                >
                  {centers.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                placeholder={t('LABEL.ENTER_AMOUNT')}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                placeholder={t('LABEL.TRANSFER_DATE')}
                value={transferDate}
                onChange={(e) => setTransferDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="solar:calendar-bold" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                placeholder={t('LABEL.REFERENCE_NUMBER')}
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={4}
                placeholder={t('LABEL.ADDITIONAL_NOTE')}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
            sx={{
              bgcolor: '#2BB5C6',
              '&:hover': { bgcolor: '#2398a7' },
              borderRadius: 1,
            }}
          >
            {submitting ? t('BUTTON.PUBLISH') : t('BUTTON.MARK_AS_PAID')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PayoutsView;

