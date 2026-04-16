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
  FormHelperText,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { useSnackbar } from 'notistack';

import { useTranslate } from 'src/locales';
import SharedTable from 'src/CustomSharedComponents/SharedTable/SharedTable';
import { ConfirmDialog } from 'src/components/custom-dialog';

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
  additionalNote?: string;
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
  const [referenceError, setReferenceError] = useState('');
  const [transferDate, setTransferDate] = useState('');
  const [centerError, setCenterError] = useState('');
  const [amountError, setAmountError] = useState('');
  const [transferDateError, setTransferDateError] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [centers, setCenters] = useState<CenterOption[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const currentLimit = Number(searchParams?.get('limit')) || 20;

  const CalendarIcon = (props: any) => <Iconify icon="solar:calendar-bold" {...props} />;

  const payoutDialog = useBoolean();
  const confirmDelete = useBoolean();
  const [selectedPayoutId, setSelectedPayoutId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const TABLE_HEAD = [
    { id: 'referenceNumber', label: 'LABEL.REFERENCE_NUMBER' },
    { id: 'center', label: 'LABEL.CENTER' },
    { id: 'amount', label: 'LABEL.AMOUNT' },
    { id: 'transferDate', label: 'LABEL.TRANSFER_DATE' },
    { id: 'additionalNote', label: 'LABEL.ADDITIONAL_NOTE' },
    { id: '', label: 'LABEL.SETTINGS' },
  ];

  const mapPayouts = useCallback(
    (list: any[]): Payout[] =>
      list.map((p: any) => ({
        id: p?._id ?? p?.id ?? '',
        referenceNumber: p?.referenceNumber ?? '',
        center: p?.center?.name ?? p?.center ?? '',
        additionalNote: p?.additionalNote ?? '',
        amount: Number(p?.amount) || 0,
        transferDate: p?.transferDate ? new Date(p.transferDate).toISOString() : '',
      })),
    []
  );

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

  const loadPayouts = useCallback(async () => {
    try {
      const res = await axiosInstance.get(`${endpoints.payouts.fetch}?limit=${currentLimit}`);
      const list = res?.data?.data || res?.data || [];
      setPayouts(Array.isArray(list) ? mapPayouts(list) : []);
    } catch (error) {
      console.error('Failed to load payouts', error);
      setPayouts([]);
    }
  }, [currentLimit, mapPayouts]);

  useEffect(() => {
    loadPayouts();
  }, [loadPayouts]);

  const formatAmount = useCallback(
    (value: number) =>
      new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 20,
      }).format(value),
    [i18n.language]
  );

  const formatDate = useCallback(
    (value: string) => {
      if (!value) return '-';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return '-';
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    },
    []
  );

  const currentSearch = (searchParams?.get('search') || '').toLowerCase().trim();

  const filteredPayouts = useMemo(() => {
    if (!currentSearch) return payouts;
    return payouts.filter((payout) => {
      const reference = payout.referenceNumber?.toLowerCase() || '';
      const centerName = payout.center?.toLowerCase() || '';
      const noteText = payout.additionalNote?.toLowerCase() || '';
      return (
        reference.includes(currentSearch) ||
        centerName.includes(currentSearch) ||
        noteText.includes(currentSearch)
      );
    });
  }, [payouts, currentSearch]);

  const handleSubmit = async () => {
    if (!referenceNumber.trim()) {
      // setReferenceError('LABEL.THIS_FIELD_IS_REQUIRED');
      setReferenceError(t('LABEL.THIS_FIELD_IS_REQUIRED'));
      return;
    }
    setReferenceError('');
    if (!center) {
      setCenterError(t('LABEL.THIS_FIELD_IS_REQUIRED'));
      return;
    }
    setCenterError('');
    if (!amount) {
      setAmountError(t('LABEL.THIS_FIELD_IS_REQUIRED'));
      return;
    }
    setAmountError('');
    if (!transferDate) {
      setTransferDateError(t('LABEL.THIS_FIELD_IS_REQUIRED'));
      return;
    }
    setTransferDateError('');
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
      setCenterError('');
      setAmountError('');
      setTransferDateError('');
      setReferenceError('');
      await loadPayouts();
    } catch (error: any) {
      enqueueSnackbar(error?.message || 'Failed to create payout', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePayout = async () => {
    if (!selectedPayoutId) return;
    setIsDeleting(true);
    try {
      await axiosInstance.delete(endpoints.payouts.delete(selectedPayoutId));
      enqueueSnackbar(t('MESSAGE.DELETED_SUCCESSFULLY'), { variant: 'success' });
      confirmDelete.onFalse();
      setSelectedPayoutId(null);
      await loadPayouts();
    } catch (error: any) {
      enqueueSnackbar(error?.message || 'Failed to delete payout', { variant: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Container
      maxWidth={settings.themeStretch ? false : 'xl'}
      sx={{ margin: '0px !important', padding: '0px !important' }}
    >
      <Box
        sx={{
          backgroundImage: `url(/assets/images/payouts/payouts.png)`,
          height: { sm: '300px', xs: '400px' },
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          p: 0,
          boxShadow: 'inset 0 0 0 2000px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          paddingBlock: 6,
          alignItems: 'center',
          flexDirection: 'column',
          gap: 4,
          width: '100%',
        }}
      >
        <Typography variant="h3" color="white" sx={{ textShadow: '0 6px 16px rgba(0,0,0,0.25)' }}>
          {t('LABEL.PAYOUTS')}
        </Typography>
        <Grid
          sx={{
            width: '100%',
            // height: '100%',
            display: 'flex',
            flexDirection: 'column',
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
              justifyContent="space-between"
              alignItems="center"
            >
              <TextField
                fullWidth
                sx={{ minWidth: 500 }}
                size="small"
                value={searchParams?.get('search') || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  const params = new URLSearchParams(searchParams.toString());
                  if (value) {
                    params.set('search', value);
                  } else {
                    params.delete('search');
                  }
                  router.push(`${pathname}?${params.toString()}`);
                }}
                placeholder={t('LABEL.SEARCH_BY_CENTER_OR_REFERENCE_NUMBER')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="mingcute:search-line" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Card>
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
        </Grid>
      </Box>

      <SharedTable
        count={filteredPayouts.length}
        data={filteredPayouts}
        tableHead={TABLE_HEAD}
        disablePagination
        actions={[
          {
            sx: { color: 'error.dark' },
            label: t('LABEL.DELETE'),
            icon: 'eva:trash-2-outline',
            onClick: (row) => {
              setSelectedPayoutId(row.id);
              confirmDelete.onTrue();
            },
          },
        ]}
        customRender={{
          amount: (row) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box
                component="img"
                src="/assets/icons/rial.svg"
                alt="Riyal"
                sx={{ width: 16, height: 16 }}
              />
              {formatAmount(row.amount)}
            </Box>
          ),
          transferDate: (row) => formatDate(row.transferDate),
          additionalNote: (row) => row?.additionalNote || '-',
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
              <FormControl fullWidth error={Boolean(centerError)}>
                <Select
                  value={center}
                  displayEmpty
                  onChange={(e) => {
                    setCenter(e.target.value);
                    if (centerError && e.target.value) {
                      setCenterError('');
                    }
                  }}
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
                {centerError && <FormHelperText>{centerError}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                placeholder={t('LABEL.ENTER_AMOUNT')}
                value={amount}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box
                        component="img"
                        src="/assets/icons/rial.svg"
                        alt="Amount icon"
                        sx={{ width: 20, height: 20 }}
                      />
                    </InputAdornment>
                  ),
                }}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (amountError && e.target.value) {
                    setAmountError('');
                  }
                }}
                error={Boolean(amountError)}
                helperText={amountError}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label={t('LABEL.TRANSFER_DATE')}
                format="dd-MM-yyyy"
                value={transferDate ? new Date(transferDate) : null}
                onChange={(newValue) => {
                  if (newValue) {
                    setTransferDate(newValue.toISOString());
                    if (transferDateError) {
                      setTransferDateError('');
                    }
                  } else {
                    setTransferDate('');
                  }
                }}
                slots={{
                  openPickerIcon: CalendarIcon,
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: Boolean(transferDateError),
                    helperText: transferDateError,
                    InputLabelProps: { shrink: true },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                placeholder={t('LABEL.REFERENCE_NUMBER')}
                value={referenceNumber}
                onChange={(e) => {
                  setReferenceNumber(e.target.value);
                  if (referenceError && e.target.value.trim()) {
                    setReferenceError('');
                  }
                }}
                error={Boolean(referenceError)}
                helperText={referenceError}
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
      <ConfirmDialog
        open={confirmDelete.value}
        onClose={confirmDelete.onFalse}
        title={t('TITLE.DELETE_PAYOUT')}
        content={t('MESSAGE.CONFIRM_DELETE_PAYOUT')}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={handleDeletePayout}
            disabled={isDeleting}
          >
            {t('BUTTON.DELETE')}
          </Button>
        }
      />
    </Container>
  );
};

export default PayoutsView;

