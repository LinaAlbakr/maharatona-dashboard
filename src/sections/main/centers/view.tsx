'use client';

import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import Container from '@mui/material/Container';
import { Box, Card, Grid, Button, TextField, Typography, InputAdornment, Select, MenuItem, FormControl } from '@mui/material';

import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';

import { useTranslate } from 'src/locales';
import SharedTable from 'src/CustomSharedComponents/SharedTable/SharedTable';
import { clearWallet, deleteCenter, changeCenterStatus } from 'src/actions/centers';

import Iconify from 'src/components/iconify';
import FormProvider from 'src/components/hook-form';
import { useSettingsContext } from 'src/components/settings';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CutomAutocompleteView, { ITems } from 'src/components/AutoComplete/CutomAutocompleteView';

import { ICenter } from 'src/types/centers';

import SendNotification from './center-details/components/send-notification';
import { useTranslation } from 'react-i18next';
import { useAdminEntityListsRealtimeRefresh } from 'src/hooks/use-admin-entity-lists-realtime';
import { fAmount } from 'src/utils/format-number';

type props = {
  centers: ICenter[];
  count: number;
  cities: ITems[];
  neighborhoods?: ITems[];
};

/** Inactive / “blocked” centers have `is_active === false` (matches admin deactivate toggle). */
const isCenterInactive = (row: Pick<ICenter, 'is_active'>) => row.is_active === false;
/** Text color for blocked center cells only (no row background). */
const BLOCKED_CENTER_TEXT_COLOR = '#C97A1A';

const CentersView = ({ cities, neighborhoods, count, centers }: Readonly<props>) => {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();

  const { t } = useTranslate();
  const searchParams = useSearchParams();
  const router = useRouter();
  const confirmBlock = useBoolean();
  const confirmUnblock = useBoolean();
  const confirmDelete = useBoolean();
  const confirmClearWallet = useBoolean();
  const [selectedId, setSelectedId] = useState<string>('');
  const [showSendNotification, setShowSendNotification] = useState<boolean | undefined>(false);
  const [showSendToAll, setShowSendToAll] = useState<boolean>(false);
  const [selectedCenter, setSelectedCenter] = useState<ICenter | undefined>();
  const pathname = usePathname();
  const { i18n } = useTranslation();
  useAdminEntityListsRealtimeRefresh();

  useEffect(() => {
    router.push(`${pathname}`);
  }, [pathname, router]);
  const city = searchParams?.get('city');
  const neighborhood = searchParams?.get('neighborhood');
  const currentLimit = Number(searchParams?.get('limit')) || 20;

  const TABLE_HEAD = [
    { id: 'name', label: 'LABEL.CENTER_NAME' },
    { id: 'id', label: 'LABEL.CITY' },
    { id: 'neighborhood', label: 'LABEL.NEIGHBORHOOD' },
    { id: 'phone', label: 'LABEL.PHONE' },
    { id: 'number_of_courses', label: 'LABEL.NUMBER_OF_COURSES' },
    { id: 'number_of_registrants', label: 'LABEL.NUMBER_OF_REGISTRANTS' },
    { id: 'walletBalance', label: 'LABEL.NEXT_PAYOUT' },
    { id: '', label: 'LABEL.SETTINGS' },
  ];

  const formDefaultValues = {
    name: '',
    cityId: { id: city },
    neighborhoodId: { id: neighborhood },
  };

  const methods = useForm({
    defaultValues: formDefaultValues,
  });
  const { setValue } = methods;

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set(name, value);
        localStorage.setItem(name, value);
      } else {
        params.delete(name);
      }
      if (name === 'city') {
        setValue('neighborhoodId', { id: '' });
        localStorage.setItem('neighborhood', '');
        params?.delete('neighborhood');
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams, setValue]
  );

  const handleConfirmBlock = async () => {
    if (selectedId) {
      const res = await changeCenterStatus(selectedId, { userStatus: 'BlockedClient' });
      if (res === 200) {
        enqueueSnackbar('Center blocked successfully');
      } else {
        enqueueSnackbar(`${res?.error}`, { variant: 'error' });
      }
    }

    confirmBlock.onFalse();
  };
  const handleConfirmUnblock = async () => {
    if (selectedId) {
      const res = await changeCenterStatus(selectedId, { userStatus: 'ActiveClient' });
      if (res === 200) {
        enqueueSnackbar('Center unblocked successfully');
      } else {
        enqueueSnackbar(`${res?.error}`, { variant: 'error' });
      }
    }
    confirmUnblock.onFalse();
  };
  const handleConfirmClearWallet = async () => {
    const res = await clearWallet(selectedId);
    if (res?.error) {
      enqueueSnackbar(`${res?.error}`, { variant: 'error' });
    } else {
      enqueueSnackbar(t('MESSAGE.WALLET_CLEARED_SUCCESSFULLY'));
      confirmClearWallet.onFalse();
    }
  };
  const handleconfirmDelete = async () => {
    const res = await deleteCenter(selectedId);
    if (res?.error) {
      enqueueSnackbar(`${res?.error}`, { variant: 'error' });
    } else {
      enqueueSnackbar(t('MESSAGE.CENTER_DELETED_SUCCESSFULLY'), {
        variant: 'success',
      });
    }
    confirmDelete.onFalse();
  };
  return (
    <>
      <Container
        maxWidth={settings.themeStretch ? false : 'xl'}
        sx={{ margin: '0px !important', padding: '0px !important' }}
      >
        <Box
          sx={{
            backgroundImage: `url(/assets/images/centers/header.jpeg)`,
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
          }}
        >
          <Typography variant="h3" color="white">
            {t('LABEL.EDUCATIONAL_CENTERS')}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:notification-fill" />}
            onClick={() => setShowSendToAll(true)}
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
            {t('BUTTON.SEND_TO_ALL_CENTERS')}
          </Button>
          <Grid
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              px: 6,
            }}
          >
            <Card sx={{ p: 1, ml: 3, mb: 1, flexGrow: 1 }}>
              <FormProvider methods={methods}>
                <Box
                  rowGap={1}
                  columnGap={2}
                  display="grid"
                  gridTemplateColumns={{
                    xs: 'repeat(3 1fr)',
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
                    placeholder={t('LABEL.SEARCH_CENTER')}
                    type="search"
                    onChange={(e) => createQueryString('search', e.target.value)}
                  />

                  <CutomAutocompleteView
                    items={cities as ITems[]}
                    label={t('LABEL.CITY')}
                    placeholder={t('LABEL.CITY')}
                    name="cityId"
                    onCustomChange={(selectedCity: ITems | null) =>
                      createQueryString('city', selectedCity?.id ?? '')
                    }
                  />
                  <CutomAutocompleteView
                    items={neighborhoods as unknown as ITems[]}
                    label={t('LABEL.NEIGHBORHOOD')}
                    placeholder={t('LABEL.NEIGHBORHOOD')}
                    name="neighborhoodId"
                    isDisabled={!neighborhoods || neighborhoods.length === 0}
                    onCustomChange={(selectedNeighborhood: ITems | null) =>
                      createQueryString('neighborhood', selectedNeighborhood?.id ?? '')
                    }
                  />
                </Box>
              </FormProvider>
            </Card>
          </Grid>
        </Box>
        <SharedTable
          count={count}
          data={centers}
          tableHead={TABLE_HEAD}
          disablePagination
          actions={[
            {
              sx: { color: 'info.dark' },
              label: t('LABEL.VIEW'),
              icon: 'lets-icons:view',
              onClick: (item) => {
                router.push(`${paths.dashboard.centers}/${item.id}`);
              },
            },
            {
              sx: { color: 'info.dark' },
              label: t('LABEL.ADD_PROGRAM'),
              icon: 'mingcute:add-line',
              onClick: (item) => {
                router.push(paths.dashboard.centerAddProgram(item.id));
              },
            },
            {
              sx: { color: 'info.dark' },
              label: t('LABEL.SEND_NOTIFICATION'),
              icon: 'mingcute:notification-fill',
              onClick: (item) => {
                setShowSendNotification(true);
                setSelectedCenter(item);
              },
            },
            {
              sx: { color: 'error.dark' },
              label: t('LABEL.BLOCK'),
              icon: 'ic:outline-block',
              onClick: (item: any) => {
                setSelectedId(item.id);
                confirmBlock.onTrue();
              },
              hide: (center) => isCenterInactive(center),
            },
            {
              sx: { color: 'info.dark' },
              label: t('LABEL.UNBLOCK'),
              icon: 'gg:unblock',
              onClick: (item: any) => {
                setSelectedId(item.id);
                confirmUnblock.onTrue();
              },
              hide: (center) => !isCenterInactive(center),
            },
            // {
            //   sx: { color: 'info.dark' },
            //   label: t('LABEL.CLEAR_WALLET'),
            //   icon: 'mingcute:wallet-fill',
            //   onClick: (item) => {
            //     setSelectedId(item.id);
            //     confirmClearWallet.onTrue();
            //   },
            //   hide: (center) => center.walletBalance <= 0,
            // },
            {
              sx: { color: 'error.dark' },
              label: t('LABEL.DELETE'),
              icon: 'material-symbols:delete-outline-rounded',
              onClick: (item: any) => {
                setSelectedId(item.id);
                confirmDelete.onTrue();
              },
              dividerBefore: true,
            },
          ]}
          customRender={{
            name: (item: any) => (
              <Box sx={{ color: isCenterInactive(item) ? BLOCKED_CENTER_TEXT_COLOR : 'inherit' }}>
                {item?.name}
              </Box>
            ),
            neighborhood: (item: any) => (
              <Box sx={{ color: isCenterInactive(item) ? BLOCKED_CENTER_TEXT_COLOR : 'inherit' }}>
                {typeof item?.neighborhood === 'string'
                  ? item?.neighborhood
                  : (i18n.language === 'ar'
                    ? (item?.neighborhood?.name_ar || item?.neighborhood?.name)
                    : (item?.neighborhood?.name_en || item?.neighborhood?.name)) || '-'}
              </Box>
            ),
            id: (item: any) => (
              <Box sx={{ color: isCenterInactive(item) ? BLOCKED_CENTER_TEXT_COLOR : 'inherit' }}>
                {typeof item?.city === 'string'
                  ? item?.city
                  : (i18n.language === 'ar'
                    ? (item?.city?.name_ar || item?.city?.name)
                    : (item?.city?.name_en || item?.city?.name)) || '-'}
              </Box>
            ),
            phone: (item: any) => (
              <Box
                sx={{
                  direction: 'ltr',
                  color: isCenterInactive(item) ? BLOCKED_CENTER_TEXT_COLOR : 'inherit',
                }}
              >
                {item?.phone}
              </Box>
            ),
            number_of_registrants: (item: any) => (
              <Box sx={{ color: isCenterInactive(item) ? BLOCKED_CENTER_TEXT_COLOR : 'inherit' }}>
                {item?.number_of_registrants}
              </Box>
            ),
            number_of_courses: (item: any) => (
              <Box sx={{ color: isCenterInactive(item) ? BLOCKED_CENTER_TEXT_COLOR : 'inherit' }}>
                {item?.number_of_courses}
              </Box>
            ),
            walletBalance: (item: any) => (
              <Box sx={{ color: isCenterInactive(item) ? BLOCKED_CENTER_TEXT_COLOR : 'inherit' }}>
                {fAmount(item?.walletBalance ?? 0)}
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
      </Container>
      <ConfirmDialog
        open={confirmBlock.value}
        onClose={confirmBlock.onFalse}
        title={t('TITLE.BLOCK_CENTER')}
        content={t('MESSAGE.CONFIRM_BLOCK')}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleConfirmBlock();
            }}
          >
            {t('BUTTON.BLOCK')}
          </Button>
        }
      />
      <ConfirmDialog
        open={confirmUnblock.value}
        onClose={confirmUnblock.onFalse}
        title={t('TITLE.UNBLOCK_CENTER')}
        content={t('MESSAGE.CONFIRM_UNBLOCK')}
        action={
          <Button
            variant="contained"
            color="info"
            onClick={() => {
              handleConfirmUnblock();
            }}
          >
            {t('BUTTON.UNBLOCK')}
          </Button>
        }
      />
      <ConfirmDialog
        open={confirmClearWallet.value}
        onClose={confirmClearWallet.onFalse}
        title={t('TITLE.CLEAR_WALLET')}
        content={t('MESSAGE.CONFIRM_CLEAR_WALLET')}
        action={
          <Button variant="contained" color="error" onClick={() => handleConfirmClearWallet()}>
            {t('BUTTON.CLEAR')}
          </Button>
        }
      />
      <ConfirmDialog
        open={confirmDelete.value}
        onClose={confirmDelete.onFalse}
        title={t('TITLE.DELETE_CENTER')}
        content={t('MESSAGE.CONFIRM_DELETE_CENTER')}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleconfirmDelete();
            }}
          >
            {t('BUTTON.DELETE')}
          </Button>
        }
      />
      {showSendNotification && (
        <SendNotification
          open={showSendNotification}
          onClose={() => {
            setShowSendNotification(false);
            // setSelectedEmail(undefined);
          }}
          selectedCenter={selectedCenter}
        />
      )}
      {showSendToAll && (
        <SendNotification
          open={showSendToAll}
          onClose={() => setShowSendToAll(false)}
          selectedCenter={undefined}
          sendToAll
        />
      )}
    </>
  );
};

export default CentersView;
