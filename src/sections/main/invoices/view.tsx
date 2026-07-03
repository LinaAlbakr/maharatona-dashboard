'use client';

/* eslint-disable import/no-extraneous-dependencies */
import html2pdf from 'html2pdf.js';
import { useSnackbar } from 'notistack';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { format, isValid, parse } from 'date-fns';

import Container from '@mui/material/Container';
import {
  Box,
  Select,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  FormControl,
  InputAdornment,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';

import axiosInstance, { endpoints } from 'src/utils/axios';

import { useTranslate } from 'src/locales';
import SharedTable from 'src/CustomSharedComponents/SharedTable/SharedTable';

import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';

import InvoiceHidden from './invoice-hidden';

// ----------------------------------
// Types
// ----------------------------------
type BuyerType = 'center' | 'client';

type InvoiceRow = {
  id: string;
  merchentId: string;
  buyerType: BuyerType;
  buyerName: string;
  totalAmount: number;
  noOfCourses: number;
  /** ISO timestamp of invoice creation, used by the date filter. */
  createdAt: string | null;
  /** Formatted invoice date for the table column (DD-MM-YYYY). */
  date: string;
  /** Formatted invoice time for the table column (e.g. 1:00 PM). */
  time: string;
};

// ----------------------------------
// Helpers
// ----------------------------------
/** Invoice creation date as DD-MM-YYYY (e.g. 03-03-2026). */
const formatInvoiceDate = (value: string | null): string => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}-${month}-${date.getFullYear()}`;
};

/** Invoice creation time in 12-hour format with AM/PM (local). */
const formatInvoiceTime = (value: string | null, language: string): string => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

// ----------------------------------
// Component
// ----------------------------------
type Props = {
  searchQuery?: string;
};

const InvoicesView = ({ searchQuery = '' }: Readonly<Props>) => {
  const settings = useSettingsContext();
  const { t, i18n } = useTranslate();
  const { enqueueSnackbar } = useSnackbar();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const currentLimit = Number(searchParams?.get('limit')) || 20;
  const selectedDate = searchParams?.get('date') || '';
  // Local input state drives the field instantly; the URL is updated debounced.
  // Binding the field directly to the URL param made fast typing drop characters
  // because each keystroke triggered an async router.push round-trip.
  const [searchInput, setSearchInput] = useState(searchParams?.get('search') || '');
  const activeSearch = useMemo(() => searchInput.toLowerCase().trim(), [searchInput]);
  const [dateOpen, setDateOpen] = useState(false);
  const selectedDateValue = useMemo(() => {
    if (!selectedDate) return null;
    const parsed = parse(selectedDate, 'yyyy-MM-dd', new Date());
    return isValid(parsed) ? parsed : null;
  }, [selectedDate]);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [shouldDownload, setShouldDownload] = useState(false);

  const TABLE_HEAD = [
    { id: 'merchentId', label: 'LABEL.MERCHENT_ID' },
    { id: 'buyerType', label: 'LABEL.BUYER_TYPE' },
    { id: 'buyerName', label: 'LABEL.BUYER_NAME' },
    { id: 'totalAmount', label: 'LABEL.TOTAL_AMOUNT' },
    { id: 'noOfCourses', label: 'LABEL.NO_OF_COURSES' },
    { id: 'date', label: 'LABEL.DATE' },
    { id: 'time', label: 'LABEL.TIME' },
    { id: 'rowsActions', label: 'LABEL.ACTION' },
  ];

  useEffect(() => {
    let active = true;

    const loadInvoices = async () => {
      try {
        const res = await axiosInstance.get(
          `${endpoints.invoices.fetch}?limit=${currentLimit}`
        );

        const list = res?.data?.data || [];

        const mapped: InvoiceRow[] = Array.isArray(list)
          ? list.map((inv: any) => {
              const isCenterBuyer = inv?.type === 'package';
              const buyerName = isCenterBuyer
                ? inv?.center_id?.name
                : inv?.client_id?.username;
              const createdAt = inv?.createdAt ?? null;

              return {
                id: inv?._id,
                merchentId: inv?.merchant_id ?? '-',
                buyerType: (isCenterBuyer ? 'center' : 'client') as BuyerType,
                buyerName: buyerName?.trim() ? buyerName : '-',
                totalAmount: Number(inv?.total_price) || 0,
                createdAt,
                date: formatInvoiceDate(createdAt),
                time: formatInvoiceTime(createdAt, i18n.language),
                noOfCourses:
                  inv?.type === 'package'
                    ? Array.isArray(inv?.packages)
                      ? inv.packages.length
                      : 0
                    : Array.isArray(inv?.course)
                      ? inv.course.length
                      : 0,
              };
            })
          : [];

        if (active) {
          setInvoices(mapped);
        }
      } catch (error) {
        console.error('Failed to load invoices', error);
        enqueueSnackbar(t('ERROR.FAILED_TO_LOAD'), { variant: 'error' });
        if (active) {
          setInvoices([]);
        }
      }
    };

    loadInvoices();

    return () => {
      active = false;
    };
  }, [currentLimit, enqueueSnackbar, t, i18n.language]);

  const formatAmount = useCallback(
    (value: number) =>
      new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
        maximumFractionDigits: 0,
      }).format(value),
    [i18n.language]
  );

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (activeSearch) {
        const merch = inv.merchentId?.toLowerCase() || '';
        const total = formatAmount(inv.totalAmount).toLowerCase();
        const buyer = inv.buyerName?.toLowerCase() || '';
        const matchesSearch =
          merch.includes(activeSearch) ||
          total.includes(activeSearch) ||
          buyer.includes(activeSearch);
        if (!matchesSearch) return false;
      }

      if (selectedDate) {
        if (!inv.createdAt) return false;
        const created = new Date(inv.createdAt);
        if (Number.isNaN(created.getTime())) return false;
        const y = created.getFullYear();
        const m = String(created.getMonth() + 1).padStart(2, '0');
        const d = String(created.getDate()).padStart(2, '0');
        if (`${y}-${m}-${d}` !== selectedDate) return false;
      }

      return true;
    });
  }, [invoices, activeSearch, selectedDate, formatAmount]);

  const updateParam = useCallback(
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

  // Debounce syncing the search input to the URL (persistence only; filtering is
  // instant via `activeSearch`). Skips when the value already matches the URL.
  useEffect(() => {
    const urlSearch = searchParams?.get('search') || '';
    if (searchInput === urlSearch) return undefined;

    const handle = setTimeout(() => {
      updateParam('search', searchInput);
    }, 400);

    return () => clearTimeout(handle);
  }, [searchInput, searchParams, updateParam]);

  const handleDownloadInvoice = async (row: InvoiceRow): Promise<void> => {
    try {
      const res = await axiosInstance.get(`/client/download-invoice/${row.id}`);
      const invoice = res?.data;

      if (!invoice) throw new Error('Invoice not found');

      setSelectedInvoice(invoice);
      setShouldDownload(true);
    } catch (error) {
      console.error('Failed to download invoice', error);
      enqueueSnackbar(t('ERROR.FAILED_TO_DOWNLOAD_INVOICE'), {
        variant: 'error',
      });
    }
  };

  useEffect(() => {
    if (!shouldDownload || !selectedInvoice) return;

    const element = document.getElementById('invoice-pdf');
    if (!element) return;

    html2pdf()
      .set({
        margin: 1,
        filename: `invoice-${selectedInvoice._id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 1,
          windowWidth: 780,
          useCORS: true,
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
        },
      })
      .from(element)
      .outputPdf('bloburl')
      .then((pdfUrl) => {
        window.open(pdfUrl, '_blank');
        setShouldDownload(false);
        setSelectedInvoice(null);
      });
  }, [shouldDownload, selectedInvoice]);

  return (
    <Container
      maxWidth={settings.themeStretch ? false : 'xl'}
      sx={{ margin: '0px !important', padding: '0px !important' }}
    >
      <Box
        sx={{
          backgroundImage: `url(/assets/images/invoices/invoices.png)`,
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
        <Typography
          variant="h3"
          color="white"
          sx={{ textShadow: '0 6px 16px rgba(0,0,0,0.25)' }}
        >
          {t('LABEL.INVOICES')}
        </Typography>
        <Box
          sx={{
            backgroundColor: 'white',
            borderRadius: 2,
            p: 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            width: { xs: '90%', md: '70%' },
          }}
        >
          <TextField
            sx={{ flex: '1 1 260px', minWidth: 220 }}
            size="small"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('LABEL.SEARCH_BY_MERCHANT_ID')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="mingcute:search-line" />
                </InputAdornment>
              ),
            }}
          />
          <DatePicker
            label={t('LABEL.DATE')}
            format="dd-MM-yyyy"
            value={selectedDateValue}
            open={dateOpen}
            onOpen={() => setDateOpen(true)}
            onClose={() => setDateOpen(false)}
            onChange={(newValue) => {
              if (!newValue || !isValid(newValue)) {
                updateParam('date', '');
                return;
              }
              updateParam('date', format(newValue, 'yyyy-MM-dd'));
            }}
            slotProps={{
              textField: {
                size: 'small',
                sx: { flex: '0 1 190px', minWidth: 160 },
                onClick: () => setDateOpen(true),
                inputProps: { readOnly: true, style: { cursor: 'pointer' } },
                InputProps: {
                  endAdornment: (
                    <InputAdornment position="end">
                      {selectedDateValue && (
                        <IconButton
                          size="small"
                          aria-label={t('BUTTON.CLEAR')}
                          onClick={(e) => {
                            e.stopPropagation();
                            updateParam('date', '');
                          }}
                        >
                          <Iconify icon="mingcute:close-line" width={18} />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        aria-label={t('LABEL.DATE')}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDateOpen(true);
                        }}
                      >
                        <Iconify icon="solar:calendar-linear" width={20} />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              },
            }}
          />
        </Box>
      </Box>

      <SharedTable
        count={filteredInvoices.length}
        data={filteredInvoices}
        tableHead={TABLE_HEAD}
        actions={[
          {
            label: t('BUTTON.DOWNLOAD_INVOICE'),
            icon: 'solar:download-bold',
            onClick: handleDownloadInvoice,
          },
        ]}
        disablePagination
        customRender={{
          buyerType: (row) => (
            <Box>{row.buyerType === 'center' ? t('LABEL.CENTER') : t('LABEL.CLIENT')}</Box>
          ),
          buyerName: (row) => <Box>{row.buyerName || '-'}</Box>,
          date: (row) => <Box>{row.date}</Box>,
          time: (row) => <Box>{formatInvoiceTime(row.createdAt, i18n.language)}</Box>,
          totalAmount: (row) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box
                component="img"
                src="/assets/icons/rial.svg"
                alt="Riyal"
                sx={{ width: 16, height: 16 }}
              />
              {formatAmount(row.totalAmount)}
            </Box>
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
                params.delete('page');
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

      {selectedInvoice && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: '-10000px',
            width: '800px',
            visibility: 'hidden',
            pointerEvents: 'none',
            zIndex: -1,
          }}
        >
          <InvoiceHidden invoice={selectedInvoice} />
        </div>
      )}
    </Container>
  );
};

export default InvoicesView;
