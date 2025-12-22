'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

import { useSnackbar } from 'notistack';

import Container from '@mui/material/Container';
import { Box, Typography } from '@mui/material';

import axiosInstance, { endpoints } from 'src/utils/axios';

import { useTranslate } from 'src/locales';
import SharedTable from 'src/CustomSharedComponents/SharedTable/SharedTable';

import { useSettingsContext } from 'src/components/settings';

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

  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const currentLimit = Number(searchParams?.get('limit')) || 20;

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
              noOfCourses: Array.isArray(inv?.course)
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
  // Format currency
  // ----------------------------------
  const formatAmount = useCallback(
    (value: number) =>
      new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
        style: 'currency',
        currency: 'SAR',
        maximumFractionDigits: 0,
      }).format(value),
    [i18n.language]
  );

  // ----------------------------------
  // Filtered data
  // ----------------------------------
  const filteredInvoices = useMemo(() => invoices, [invoices]);

  // ----------------------------------
  // Handlers
  // ----------------------------------
  
const handleDownloadInvoice = async (row: InvoiceRow): Promise<void> => {
  console.log(row);
  try {
    // ✅ Use your actual endpoint
    const response = await axiosInstance.get(
      `/client/download-invoice/${row.id}`,
      { responseType: 'blob' } // ensures we get binary PDF data
    );
    console.log(response);

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `invoice-${row.id}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Release memory
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download invoice', error);
    enqueueSnackbar(t('ERROR.FAILED_TO_DOWNLOAD_INVOICE'), { variant: 'error' });
  }
};

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
          backgroundImage:
            'linear-gradient(135deg, rgba(38, 198, 218, 0.82), rgba(204, 56, 166, 0.72)), url(/assets/images/overlay_2.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: { sm: '300px', xs: '360px' },
          boxShadow: 'inset 0 0 0 2000px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          paddingBlock: 6,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 3,
          mb: 3,
        }}
      >
        <Typography
          variant="h3"
          color="white"
          sx={{ textShadow: '0 6px 16px rgba(0,0,0,0.25)' }}
        >
          {t('LABEL.INVOICES')}
        </Typography>
      </Box>

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
          totalAmount: (row) => formatAmount(row.totalAmount),
        }}
      />
    </Container>
  );
};

export default InvoicesView;
