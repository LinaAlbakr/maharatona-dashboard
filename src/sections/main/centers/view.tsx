'use client';

import Container from '@mui/material/Container';
import { useTranslate } from 'src/locales';
import { useSettingsContext } from 'src/components/settings';
import { Box, Button, Card, Grid, InputAdornment, TextField, Typography } from '@mui/material';
import FormProvider from 'src/components/hook-form';
import { useCallback, useEffect, useState } from 'react';
import CutomAutocompleteView, { ITems } from 'src/components/AutoComplete/CutomAutocompleteView';
import { ICenter } from 'src/types/centers';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import SharedTable from 'src/CustomSharedComponents/SharedTable/SharedTable';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useBoolean } from 'src/hooks/use-boolean';
import { paths } from 'src/routes/paths';
import SendNotification from './center-details/components/send-notification';
import { changeCenterStatus, clearWallet } from 'src/actions/centers';
import Iconify from 'src/components/iconify';

type props = {
  centers: ICenter[];
  count: number;
  cities: ITems[];
  neighborhoods?: ITems[];
};

const CentersView = ({ cities, neighborhoods, count, centers }: Readonly<props>) => {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();

  const { t } = useTranslate();
  const searchParams = useSearchParams();
  const router = useRouter();
  const confirmBlock = useBoolean();
  const confirmUnblock = useBoolean();
  const confirmClearWallet = useBoolean();
  const [selectedId, setSelectedId] = useState<string | null>();
  const [showSendNotification, setShowSendNotification] = useState<boolean | undefined>(false);
  const [selectedCenter, setSelectedCenter] = useState<ICenter | undefined>();

  useEffect(() => {
    router.push(`${pathname}`);
  }, []);
  const city = searchParams?.get('city');
  const neighborhood = searchParams?.get('neighborhood');

  const TABLE_HEAD = [
    { id: 'name', label: 'LABEL.CENTER_NAME' },
    { id: 'id', label: 'LABEL.CITY' },
    { id: 'neighborhood', label: 'LABEL.NEIGHBORHOOD' },
    { id: 'phone', label: 'LABEL.PHONE' },
    { id: 'number_of_courses', label: 'LABEL.NUMBER_OF_COURSES' },
    { id: 'number_of_registrants', label: 'LABEL.NUMBER_OF_REGISTRANTS' },
    { id: 'walletBalance', label: 'LABEL.WALLET_BALANCE' },
    { id: '', label: 'LABEL.SETTINGS' },
  ];

  const formDefaultValues = {
    name: '',
    city: { id: city },
    neighborhood: { id: neighborhood },
  };

  const pathname = usePathname();
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
        setValue('neighborhood', { id: '' });
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
        enqueueSnackbar(t('MESSAGE.BLOCK_SUCCESSFULLY'));
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
        enqueueSnackbar(t('MESSAGE.UNBLOCK_SUCCESSFULLY'));
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
                    onCustomChange={(selectedCountryId: any) =>
                      createQueryString('city', selectedCountryId?.id ?? '')
                    }
                  />
                  <CutomAutocompleteView
                    items={neighborhoods as unknown as ITems[]}
                    label={t('LABEL.NEIGHBORHOOD')}
                    placeholder={t('LABEL.NEIGHBORHOOD')}
                    name="neighborhoodId"
                    isDisabled={!neighborhoods || neighborhoods.length === 0}
                    onCustomChange={(selectedCityId: any) =>
                      createQueryString('neighborhood', selectedCityId?.id ?? '')
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
              sx: { color: 'error.dark' },
              label: t('LABEL.BLOCK'),
              icon: 'ic:outline-block',
              onClick: (item: any) => {
                setSelectedId(item.id);
                confirmBlock.onTrue();
              },
              hide: (center) => center.userStatus === 'BlockedClient',
            },
            {
              sx: { color: 'info.dark' },
              label: t('LABEL.UNBLOCK'),
              icon: 'gg:unblock',
              onClick: (item: any) => {
                setSelectedId(item.id);
                confirmUnblock.onTrue();
              },
              hide: (center) => center.userStatus === 'ActiveClient',
            },
            {
              sx: { color: 'info.dark' },
              label: t('LABEL.CLEAR_WALLET'),
              icon: 'mingcute:wallet-fill',
              onClick: (item) => {
                setSelectedId(item.id);
                confirmClearWallet.onTrue();
              },
              // hide: (center) => center.walletBalance <= 0,
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
          ]}
          customRender={{
            name: (item: any) => (
              <Box sx={{ color: item?.userStatus === 'BlockedClient' ? 'red' : 'inherit' }}>
                {item?.name}
              </Box>
            ),
            neighborhood: (item: any) => (
              <Box sx={{ color: item?.userStatus === 'BlockedClient' ? 'red' : 'inherit' }}>
                {item?.neighborhood.name}
              </Box>
            ),
            id: (item: any) => (
              <Box sx={{ color: item?.userStatus === 'BlockedClient' ? 'red' : 'inherit' }}>
                {item?.neighborhood.city.name}
              </Box>
            ),
            phone: (item: any) => (
              <Box
                style={{
                  direction: 'ltr',
                  color: item?.userStatus === 'BlockedClient' ? 'red' : 'inherit',
                }}
              >
                {item?.phone}
              </Box>
            ),
            number_of_registrants: (item: any) => (
              <Box
                style={{
                  color: item?.userStatus === 'BlockedClient' ? 'red' : 'inherit',
                }}
              >
                {item?.number_of_registrants}
              </Box>
            ),
            number_of_courses: (item: any) => (
              <Box
                style={{
                  color: item?.userStatus === 'BlockedClient' ? 'red' : 'inherit',
                }}
              >
                {item?.number_of_courses}
              </Box>
            ),
            walletBalance: (item: any) => (
              <Box
                style={{
                  color: item?.userStatus === 'BlockedClient' ? 'red' : 'inherit',
                }}
              >
                {Math.ceil(item?.walletBalance)}
              </Box>
            ),
          }}
        />
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
    </>
  );
};

export default CentersView;
