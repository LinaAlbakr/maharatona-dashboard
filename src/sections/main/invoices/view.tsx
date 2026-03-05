'use client';

/* eslint-disable import/no-extraneous-dependencies */
import html2pdf from 'html2pdf.js';
import { useSnackbar } from 'notistack';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import Container from '@mui/material/Container';
import {
  Box,
  Select,
  MenuItem,
  TextField,
  Typography,
  FormControl,
  InputAdornment,
} from '@mui/material';

import axiosInstance, { endpoints } from 'src/utils/axios';

import { useTranslate } from 'src/locales';
import SharedTable from 'src/CustomSharedComponents/SharedTable/SharedTable';

import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';

import InvoiceHidden from './invoice-hidden';

// ----------------------------------
// Types
// ----------------------------------
type InvoiceRow = {
  id: string;
  merchentId: string;
  totalAmount: number;
  noOfCourses: number;
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
  const currentSearch = (searchParams?.get('search') || '').toLowerCase().trim();
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [shouldDownload, setShouldDownload] = useState(false);
  // ----------------------------------
  // Table Head
  // ----------------------------------
  const TABLE_HEAD = [
    { id: 'merchentId', label: 'LABEL.MERCHENT_ID' },
    { id: 'totalAmount', label: 'LABEL.TOTAL_AMOUNT' },
    { id: 'noOfCourses', label: 'LABEL.NO_OF_COURSES' },
    // Special id used by SharedTable to render actions column
    { id: 'rowsActions', label: 'LABEL.ACTION' },
  ];

  // ----------------------------------
  // Fetch invoices
  // ----------------------------------
  useEffect(() => {
    let active = true;

    const loadInvoices = async () => {
      try {
        const res = await axiosInstance.get(
          `${endpoints.invoices.fetch}?limit=${currentLimit}`
        );

        const list = res?.data?.data || [];

        const mapped: InvoiceRow[] = Array.isArray(list)
          ? list.map((inv: any) => ({
            id: inv?._id,
            merchentId: inv?.merchant_id ?? '-',
            totalAmount: Number(inv?.total_price) || 0,
            noOfCourses:
            // eslint-disable-next-line no-nested-ternary
            inv?.type === "package"
              ? Array.isArray(inv?.packages)
                ? inv.packages.length
                : 0
              : Array.isArray(inv?.course)
              ? inv.course.length
              : 0,
          }))
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
  }, [currentLimit, enqueueSnackbar, t]);

  // ----------------------------------
  // Format amount (number only, currency via icon)
  // ----------------------------------
  const formatAmount = useCallback(
    (value: number) =>
      new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
        maximumFractionDigits: 0,
      }).format(value),
    [i18n.language]
  );

  // ----------------------------------
  // Filtered data
  // ----------------------------------
  const filteredInvoices = useMemo(() => {
    if (!currentSearch) return invoices;
    return invoices.filter((inv) => {
      const merch = inv.merchentId?.toLowerCase() || '';
      const total = formatAmount(inv.totalAmount).toLowerCase();
      return merch.includes(currentSearch) || total.includes(currentSearch);
    });
  }, [invoices, currentSearch, formatAmount]);

  // ----------------------------------
  // Handlers
  // ----------------------------------

  const handleDownloadInvoice = async (row: InvoiceRow): Promise<void> => {
    try {
      // 1️⃣ Fetch invoice JSON
      const res = await axiosInstance.get(`/client/download-invoice/${row.id}`);
      const invoice = res?.data;

      if (!invoice) throw new Error('Invoice not found');

      // 2️⃣ Set hidden invoice data
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
        window.open(pdfUrl, '_blank'); // 👀 preview
  
        // cleanup
        setShouldDownload(false);
        setSelectedInvoice(null);
      });
  }, [shouldDownload, selectedInvoice]);

  // ----------------------------------
  // Render
  // ----------------------------------
  return (
    <Container
      maxWidth={settings.themeStretch ? false : 'xl'}
      sx={{ margin: '0px !important', padding: '0px !important' }}
    >
      {/* Header */}
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
            width: '50%',
          }}
        >
          <TextField
            sx={{ maxWidth: 550, width: '100%' }}
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
            placeholder={t('LABEL.SEARCH_BY_MERCHANT_ID')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="mingcute:search-line" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

      </Box>

      {/* Search */}
      {/*  */}

      {/* Table */}
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
      {/* Rows per page (limit) */}
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
            left: '-10000px', // push far off screen
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
