'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  LinearProgress,
  Menu,
  MenuItem,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from '@mui/material';

import Iconify from 'src/components/iconify';
import FormProvider from 'src/components/hook-form';
import RHFEditor from 'src/components/hook-form/rhf-editor';
import { useTranslate } from 'src/locales';
import { fDateTime } from 'src/utils/format-time';
import { fetchAcceptedCenters, publishContractVersion } from 'src/actions/contract';
import {
  AcceptedCentersResponse,
  ContractOverview,
  ContractVersion,
} from 'src/types/static-pages';

const CONTRACT_TYPE = 'CONTRACT_PAGE_CENTER';

interface IProps {
  overview: ContractOverview;
}

type PreviewState = {
  open: boolean;
  label: string;
  subtitle: string;
  content_en: string;
  content_ar: string;
};

const SummaryItem = ({
  iconSrc,
  label,
  value,
}: {
  iconSrc?: string;
  label: string;
  value: React.ReactNode;
}) => (
  <Stack direction="row" spacing={1.5} alignItems="center">
    {iconSrc && (
      <Box
        component="img"
        src={iconSrc}
        alt=""
        sx={{ width: 50, height: 50, flexShrink: 0 }}
      />
    )}
    <Box>
      <Typography sx={{ fontSize: 16, color: '#3CB8BB', fontWeight: 600, lineHeight: 1.2 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 14, color: '#6D6968', lineHeight: 1.2, mt: 0.5 }}>
        {value}
      </Typography>
    </Box>
  </Stack>
);

const DialogCloseButton = ({ onClose }: { onClose: () => void }) => (
  <IconButton
    onClick={onClose}
    sx={{ position: 'absolute', top: 12, right: 12, p: 0.5 }}
  >
    <Box
      component="img"
      src="/assets/icons/contractpage/cross.svg"
      alt="close"
      sx={{ width: 24, height: 24 }}
    />
  </IconButton>
);

const AcceptanceBar = ({ accepted, total }: { accepted: number; total: number }) => {
  const pct = total > 0 ? Math.round((accepted / total) * 100) : 0;
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 160 }}>
      <LinearProgress
        variant="determinate"
        value={pct}
        color="secondary"
        sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
      />
      <Typography variant="caption" sx={{ whiteSpace: 'nowrap' }}>
        {accepted}/{total}
      </Typography>
    </Stack>
  );
};

const ContractCenterView = ({ overview }: IProps) => {
  const { t } = useTranslate();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const current = overview?.current || null;
  const history = overview?.history || [];
  const totalCenters = overview?.total_centers || 0;

  const nextVersion = (current?.version || 0) + 1;

  const [publishOpen, setPublishOpen] = useState(false);

  // Agreement preview (tabbed) dialog
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [previewTab, setPreviewTab] = useState(0);

  // Accepted centers dialog
  const [acceptedOpen, setAcceptedOpen] = useState(false);
  const [acceptedLoading, setAcceptedLoading] = useState(false);
  const [acceptedData, setAcceptedData] = useState<AcceptedCentersResponse | null>(null);

  // Row menu
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuVersion, setMenuVersion] = useState<ContractVersion | null>(null);

  const defaultValues = useMemo(
    () => ({
      content_ar: current?.content_ar || '',
      content_en: current?.content_en || '',
    }),
    [current]
  );

  const methods = useForm({ defaultValues });
  const {
    watch,
    reset,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const openPreview = (data: {
    label: string;
    subtitle: string;
    content_en: string;
    content_ar: string;
  }) => {
    setPreviewTab(0);
    setPreview({ open: true, ...data });
  };

  const handlePublish = async () => {
    const values = watch();
    const res = await publishContractVersion(CONTRACT_TYPE, {
      content_ar: values.content_ar || '',
      content_en: values.content_en || '',
    });
    setPublishOpen(false);

    if (res?.error) {
      enqueueSnackbar(`${res.error}`, { variant: 'error' });
      return;
    }
    enqueueSnackbar(t('MESSAGE.CONTENT_PUBLISHED_SUCCESSFULLY'), { variant: 'success' });
    router.refresh();
  };

  const openAcceptedCenters = async (version: ContractVersion) => {
    setMenuAnchor(null);
    setAcceptedOpen(true);
    setAcceptedLoading(true);
    setAcceptedData(null);
    const data = await fetchAcceptedCenters(version._id);
    setAcceptedData(
      data || {
        version: version.version,
        label: version.label,
        accepted_centers: version.accepted_centers,
        total_centers: version.total_centers,
        centers: [],
      }
    );
    setAcceptedLoading(false);
  };

  const downloadAgreement = (version: ContractVersion) => {
    setMenuAnchor(null);
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${version.label}</title></head>
<body style="font-family:Arial,sans-serif;line-height:1.5;max-width:800px;margin:24px auto;padding:0 16px;">
<h2>Center Agreement ${version.label}</h2>
<hr/>
<h3>English</h3>
<div>${version.content_en || ''}</div>
<hr/>
<h3 dir="rtl">العربية</h3>
<div dir="rtl">${version.content_ar || ''}</div>
</body></html>`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `center-agreement-${version.label}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <FormProvider methods={methods}>
      <Stack spacing={3}>
        {/* Current version summary */}
        <Card sx={{ height: 83, display: 'flex', alignItems: 'center', px: 3, py: 0 }}>
          <Box
            sx={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: 3,
            }}
          >
            <SummaryItem
              iconSrc="/assets/icons/contractpage/CurrentVersionIcon.svg"
              label={t('LABEL.CURRENT_VERSION')}
              value={current ? current.label : '—'}
            />
            <SummaryItem
              label={t('LABEL.PUBLISHED_ON')}
              value={current ? fDateTime(current.published_at, 'd-MM-yyyy, p') : '—'}
            />
            <SummaryItem
              label={t('LABEL.ACCEPTANCE')}
              value={
                current
                  ? `${current.accepted_centers}/${current.total_centers} ${t('LABEL.CENTERS')}`
                  : `0/${totalCenters} ${t('LABEL.CENTERS')}`
              }
            />
          </Box>
        </Card>

        {/* Editors */}
        <Card sx={{ p: 3 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Box>
              <Typography variant="h6" sx={{ color: 'info.dark', mb: 1 }}>
                {t('LABEL.ENGLISH_CONTENT')}
              </Typography>
              <RHFEditor name="content_en" sx={{ '& .ql-editor': { minHeight: '260px' } }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ color: 'info.dark', mb: 1 }}>
                {t('LABEL.ARABIC_CONTENT')}
              </Typography>
              <RHFEditor name="content_ar" sx={{ '& .ql-editor': { minHeight: '260px' } }} />
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            justifyContent="flex-end"
          >
            <Typography sx={{ fontSize: 12, color: '#767676' }}>
              {t('LABEL.EDIT_TO_PUBLISH_NEW_VERSION')}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="solar:eye-bold" />}
              onClick={() => {
                const values = watch();
                openPreview({
                  label: `v${nextVersion}.0`,
                  subtitle: t('LABEL.NEW_VERSION_OF_CENTER_AGREEMENT'),
                  content_en: values.content_en || '',
                  content_ar: values.content_ar || '',
                });
              }}
              sx={{
                width: 128,
                height: 47,
                borderRadius: '24px',
                border: '1px solid #3CB8BB',
                bgcolor: '#FFFFFF',
                color: '#3CB8BB',
                fontSize: 16,
                fontWeight: 700,
                textTransform: 'none',
                whiteSpace: 'nowrap',
                '&:hover': { border: '1px solid #3CB8BB', bgcolor: '#FFFFFF' },
              }}
            >
              {t('BUTTON.PREVIEW')}
            </Button>
            <Button
              variant="contained"
              startIcon={<Iconify icon="solar:check-circle-bold" />}
              onClick={() => setPublishOpen(true)}
              sx={{
                minWidth: 128,
                height: 47,
                px: 3,
                borderRadius: '24px',
                border: '1px solid #3CB8BB',
                bgcolor: '#3CB8BB',
                color: '#FFFFFF',
                fontSize: 16,
                fontWeight: 700,
                textTransform: 'none',
                whiteSpace: 'nowrap',
                '&:hover': { bgcolor: '#3CB8BB', border: '1px solid #3CB8BB' },
              }}
            >
              {t('BUTTON.PUBLISH_AS_NEW_VERSION')}
            </Button>
          </Stack>
        </Card>

        {/* Version history */}
        <Card sx={{ p: 3 }}>
          <Typography sx={{ color: '#3CB8BB', fontSize: 24, fontWeight: 700, mb: 2 }}>
            {t('LABEL.VERSION_HISTORY')}
          </Typography>
          <TableContainer>
            <Table
              sx={{
                '& .MuiTableHead-root .MuiTableCell-root': {
                  color: '#3CB8BB',
                  fontSize: 14,
                  fontWeight: 700,
                  bgcolor: '#F4F6F8',
                },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell>{t('LABEL.VERSION')}</TableCell>
                  <TableCell>{t('LABEL.PUBLISHED')}</TableCell>
                  <TableCell>{t('LABEL.STATUS')}</TableCell>
                  <TableCell>{t('LABEL.ACCEPTED_CENTERS')}</TableCell>
                  <TableCell align="right">{t('LABEL.SETTINGS')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ color: 'text.secondary' }}>
                      {t('LABEL.NO_DATA')}
                    </TableCell>
                  </TableRow>
                )}
                {history.map((v) => (
                  <TableRow key={v._id}>
                    <TableCell>
                      <Chip label={v.label} color="secondary" size="small" />
                    </TableCell>
                    <TableCell>{fDateTime(v.published_at, 'd-M-yyyy, p')}</TableCell>
                    <TableCell>
                      {v.status === 'LATEST' ? (
                        <Chip
                          label={t('LABEL.LATEST')}
                          color="secondary"
                          size="small"
                          icon={<Iconify icon="solar:check-circle-bold" width={16} />}
                        />
                      ) : (
                        <Chip label={t('LABEL.ARCHIVED')} variant="outlined" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      <AcceptanceBar accepted={v.accepted_centers} total={v.total_centers} />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={(e) => {
                          setMenuAnchor(e.currentTarget);
                          setMenuVersion(v);
                        }}
                      >
                        <Iconify icon="eva:more-vertical-fill" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Stack>

      {/* Row settings menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              '& .MuiMenuItem-root': { color: '#2B509C', fontSize: 12 },
            },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            if (menuVersion) openAcceptedCenters(menuVersion);
          }}
        >
          <Box
            component="img"
            src="/assets/icons/contractpage/ViewCenters.svg"
            alt=""
            sx={{ width: 18, height: 18, mr: 1 }}
          />
          {t('BUTTON.VIEW_CENTERS')}
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuVersion) {
              openPreview({
                label: menuVersion.label,
                subtitle: t('LABEL.NEW_VERSION_OF_CENTER_AGREEMENT'),
                content_en: menuVersion.content_en,
                content_ar: menuVersion.content_ar,
              });
            }
            setMenuAnchor(null);
          }}
        >
          <Box
            component="img"
            src="/assets/icons/contractpage/ViewAgreement.svg"
            alt=""
            sx={{ width: 18, height: 18, mr: 1 }}
          />
          {t('BUTTON.VIEW_AGREEMENT')}
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuVersion) downloadAgreement(menuVersion);
          }}
        >
          <Box
            component="img"
            src="/assets/icons/contractpage/download%201.svg"
            alt=""
            sx={{ width: 18, height: 18, mr: 1 }}
          />
          {t('BUTTON.DOWNLOAD')}
        </MenuItem>
      </Menu>

      {/* Agreement preview dialog (tabbed) */}
      <Dialog
        open={Boolean(preview?.open)}
        onClose={() => setPreview(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: 'secondary.main', fontSize: 20, fontWeight: 700 }}>
          {t('LABEL.AGREEMENT_PREVIEW')}
          <DialogCloseButton onClose={() => setPreview(null)} />
        </DialogTitle>
        <DialogContent dividers>
          <Typography sx={{ mb: 2, color: '#767676', fontSize: 14 }}>
            {preview?.subtitle}
          </Typography>
          <Chip
            label={preview?.label}
            color="secondary"
            size="small"
            sx={{ mb: 2, borderRadius: '12px' }}
          />
          <Tabs
            value={previewTab}
            onChange={(_e, val) => setPreviewTab(val)}
            textColor="secondary"
            indicatorColor="secondary"
            sx={{
              mb: 2,
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': { color: '#878787', fontSize: 14 },
              '& .MuiTab-root.Mui-selected': { color: '#3CB8BB' },
            }}
          >
            <Tab label={t('LABEL.ENGLISH')} />
            <Tab label={t('LABEL.ARABIC')} />
          </Tabs>
          <Box
            sx={{
              bgcolor: 'background.neutral',
              borderRadius: 1,
              p: 2,
              maxHeight: 360,
              overflowY: 'auto',
              '& p': { m: 0 },
            }}
          >
            {previewTab === 0 ? (
              <Box dangerouslySetInnerHTML={{ __html: preview?.content_en || '' }} />
            ) : (
              <Box dir="rtl" dangerouslySetInnerHTML={{ __html: preview?.content_ar || '' }} />
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Accepted centers dialog */}
      <Dialog open={acceptedOpen} onClose={() => setAcceptedOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: 'secondary.main', fontSize: 20, fontWeight: 700 }}>
          {t('LABEL.ACCEPTED_CENTERS')}
          <DialogCloseButton onClose={() => setAcceptedOpen(false)} />
        </DialogTitle>
        <DialogContent dividers>
          <Stack direction="row" spacing={3} sx={{ mb: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#767676' }} />
              <Typography sx={{ color: '#767676', fontSize: 14 }}>
                {t('LABEL.VERSION')} {acceptedData?.label ?? ''}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#767676' }} />
              <Typography sx={{ color: '#767676', fontSize: 14 }}>
                {acceptedData?.accepted_centers ?? 0}/{acceptedData?.total_centers ?? 0}{' '}
                {t('LABEL.CENTERS_ACCEPTED')}
              </Typography>
            </Stack>
          </Stack>

          {acceptedLoading ? (
            <Stack alignItems="center" sx={{ py: 4 }}>
              <CircularProgress color="secondary" />
            </Stack>
          ) : (
            <TableContainer>
              <Table
                sx={{
                  '& .MuiTableHead-root .MuiTableCell-root': {
                    color: '#3CB8BB',
                    fontSize: 14,
                    fontWeight: 700,
                  },
                  '& .MuiTableBody-root .MuiTableCell-root': {
                    color: '#2B509C',
                    fontSize: 14,
                  },
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell>{t('LABEL.CENTER_NAME')}</TableCell>
                    <TableCell>{t('LABEL.ACCEPTED_DATE_TIME')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(acceptedData?.centers?.length ?? 0) === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} align="center" sx={{ color: 'text.secondary' }}>
                        {t('LABEL.NO_DATA')}
                      </TableCell>
                    </TableRow>
                  )}
                  {acceptedData?.centers?.map((c) => (
                    <TableRow key={c.center_id}>
                      <TableCell>{c.center_name}</TableCell>
                      <TableCell>{fDateTime(c.accepted_at, 'd-M-yyyy, p')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
      </Dialog>

      {/* Publish confirmation dialog */}
      <Dialog open={publishOpen} onClose={() => setPublishOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: 'secondary.main', fontSize: 20, fontWeight: 700 }}>
          {t('LABEL.PUBLISH_AGREEMENT_VERSION', { version: `v${nextVersion}.0` })}
          <DialogCloseButton onClose={() => setPublishOpen(false)} />
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2, color: '#767676', fontSize: 14 }}>
            {t('LABEL.PUBLISH_AGREEMENT_DESC')}
          </Typography>
          <Stack component="ul" spacing={1} sx={{ pl: 2, m: 0, color: '#767676' }}>
            <li>
              <Typography sx={{ color: '#767676', fontSize: 14 }}>
                {t('LABEL.PUBLISH_AGREEMENT_BULLET_1')}
              </Typography>
            </li>
            <li>
              <Typography sx={{ color: '#767676', fontSize: 14 }}>
                {t('LABEL.PUBLISH_AGREEMENT_BULLET_2')}
              </Typography>
            </li>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            fullWidth
            variant="outlined"
            color="secondary"
            onClick={() => setPublishOpen(false)}
            sx={{ borderRadius: '24px', height: 47 }}
          >
            {t('BUTTON.CANCEL')}
          </Button>
          <LoadingButton
            fullWidth
            variant="contained"
            color="secondary"
            loading={isSubmitting}
            onClick={handlePublish}
            sx={{ borderRadius: '24px', height: 47 }}
          >
            {t('BUTTON.PUBLISH')}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </FormProvider>
  );
};

export default ContractCenterView;
