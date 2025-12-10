'use client';

import { useMemo, useState, useCallback } from 'react';
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

import { useTranslate } from 'src/locales';
import SharedTable from 'src/CustomSharedComponents/SharedTable/SharedTable';

import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import { useBoolean } from 'src/hooks/use-boolean';

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

const SAMPLE_PAYOUTS: Payout[] = [
  {
    id: '1',
    referenceNumber: '#12345678',
    center: 'Center Name',
    amount: 4000,
    transferDate: '19-12-2025',
  },
  {
    id: '2',
    referenceNumber: '#22345678',
    center: 'Center Name',
    amount: 2750,
    transferDate: '11-11-2025',
  },
  {
    id: '3',
    referenceNumber: '#32345678',
    center: 'Center Name',
    amount: 5400,
    transferDate: '02-10-2025',
  },
  {
    id: '4',
    referenceNumber: '#42345678',
    center: 'Center Name',
    amount: 4000,
    transferDate: '19-12-2025',
  },
  {
    id: '5',
    referenceNumber: '#52345678',
    center: 'Center Name',
    amount: 4000,
    transferDate: '19-12-2025',
  },
];

const PayoutsView = ({ searchQuery = '' }: Readonly<Props>) => {
  const settings = useSettingsContext();
  const { t, i18n } = useTranslate();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchQuery);
  const [center, setCenter] = useState('');
  const [amount, setAmount] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [transferDate, setTransferDate] = useState('');
  const [note, setNote] = useState('');

  const payoutDialog = useBoolean();

  const TABLE_HEAD = [
    { id: 'referenceNumber', label: 'LABEL.REFERENCE_NUMBER' },
    { id: 'center', label: 'LABEL.CENTER' },
    { id: 'amount', label: 'LABEL.AMOUNT' },
    { id: 'transferDate', label: 'LABEL.TRANSFER_DATE' },
  ];

  const centers = useMemo(
    () => Array.from(new Set(SAMPLE_PAYOUTS.map((item) => item.center))),
    []
  );

  const formatAmount = useCallback(
    (value: number) =>
      new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
        style: 'currency',
        currency: 'SAR',
        maximumFractionDigits: 0,
      }).format(value),
    [i18n.language]
  );

  const filteredPayouts = useMemo(() => {
    if (!search) return SAMPLE_PAYOUTS;
    return SAMPLE_PAYOUTS.filter((item) =>
      item.center.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

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
              rowGap={1}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(3, 1fr)',
              }}
            >
              <TextField
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="mingcute:search-line" />
                    </InputAdornment>
                  ),
                }}
                placeholder={t('LABEL.SEARCH_BY_CENTER')}
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  createQueryString('search', e.target.value);
                }}
              />
              <Box />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
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
                  renderValue={(val) =>
                    val ? (
                      val
                    ) : (
                      <Typography variant="body2" color="text.disabled">
                        {t('LABEL.SELECT_CENTER')}
                      </Typography>
                    )
                  }
                  IconComponent={(props) => <Iconify icon="eva:arrow-ios-downward-fill" {...props} />}
                >
                  {centers.map((item) => (
                    <MenuItem key={item} value={item}>
                      {item}
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
            onClick={() => {
              payoutDialog.onFalse();
              setCenter('');
              setAmount('');
              setReferenceNumber('');
              setTransferDate('');
              setNote('');
            }}
            sx={{
              bgcolor: '#2BB5C6',
              '&:hover': { bgcolor: '#2398a7' },
              borderRadius: 1,
            }}
          >
            {t('BUTTON.MARK_AS_PAID')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PayoutsView;

