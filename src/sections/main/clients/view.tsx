'use client';

import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import Container from '@mui/material/Container';
import { Box, Card, Grid, Button, TextField, Typography, InputAdornment } from '@mui/material';

import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';

import { useTranslate } from 'src/locales';
import { deleteClient, changeClientStatus } from 'src/actions/clients';
import SharedTable from 'src/CustomSharedComponents/SharedTable/SharedTable';

import Iconify from 'src/components/iconify';
import FormProvider from 'src/components/hook-form';
import { useSettingsContext } from 'src/components/settings';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CutomAutocompleteView, { ITems } from 'src/components/AutoComplete/CutomAutocompleteView';

import { ICenter } from 'src/types/centers';

import SendNotification from './client-details/components/send-notification';

type props = {
  clients: any[];
  count: number;
  cities: ITems[];
  fields?: ITems[];
};

const ClientsView = ({ cities, fields, count, clients }: Readonly<props>) => {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();

  const { t } = useTranslate();
  const searchParams = useSearchParams();
  const router = useRouter();
  const confirmBlock = useBoolean();
  const confirmUnblock = useBoolean();
  const confirmDelete = useBoolean();
  const [selectedId, setSelectedId] = useState<string >("");
  const [showSendNotification, setShowSendNotification] = useState<boolean | undefined>(false);
  const [selectedCenter, setSelectedCenter] = useState<ICenter | undefined>();
  const pathname = usePathname();

  useEffect(() => {
    router.push(`${pathname}`);
  }, [pathname, router]);
  const city = searchParams?.get('city');
  const field = searchParams?.get('field');

  const TABLE_HEAD = [
    { id: 'name', label: 'LABEL.CLIENT_NAME' },
    { id: 'id', label: 'LABEL.CITY' },
    { id: 'neighborhood', label: 'LABEL.NEIGHBORHOOD' },
    { id: 'children', label: 'LABEL.NUMBER_OF_CHILDREN' },
    { id: 'phone', label: 'LABEL.PHONE' },
    { id: 'email', label: 'LABEL.EMAIL' },
    { id: '', label: 'LABEL.SETTINGS' },
  ];

  const formDefaultValues = {
    name: '',
    city: { id: city },
    field: { id: field },
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
        setValue('field', { id: '' });
        localStorage.setItem('neighborhood', '');
        params?.delete('neighborhood');
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams, setValue]
  );

  const handleConfirmBlock = async () => {
    if (selectedId) {
      const res = await changeClientStatus(selectedId, { userStatus: 'BlockedClient' });
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
      const res = await changeClientStatus(selectedId, { userStatus: 'ActiveClient' });
      if (res === 200) {
        enqueueSnackbar(t('MESSAGE.UNBLOCK_SUCCESSFULLY'));
      } else {
        enqueueSnackbar(`${res?.error}`, { variant: 'error' });
      }
    }
    confirmUnblock.onFalse();
  };
    const handleconfirmDelete = async () => {
      const res = await deleteClient(selectedId);
      if (res?.error) {
        enqueueSnackbar(`${res?.error}`, { variant: 'error' });
      } else {
        enqueueSnackbar(t('MESSAGE.DELETED_SUCCESS'), {
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
            backgroundImage: `url(/assets/images/clients/children.jpeg)`,
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
            {t('LABEL.CLIENTS')}
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
                    placeholder={t('LABEL.SEARCH_BY_CLIENT')}
                    type="search"
                    onChange={(e) => createQueryString('search', e.target.value)}
                  />
                  <CutomAutocompleteView
                    items={fields as unknown as ITems[]}
                    label={t('LABEL.FEILDS')}
                    placeholder={t('LABEL.FEILDS')}
                    name="fieldId"
                    isDisabled={!fields || fields.length === 0}
                    onCustomChange={(selectedCityId: any) =>
                      createQueryString('field', selectedCityId?.id ?? '')
                    }
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
                </Box>
              </FormProvider>
            </Card>
          </Grid>
        </Box>
        <SharedTable
          count={count}
          data={clients}
          tableHead={TABLE_HEAD}
          actions={[
            {
              sx: { color: 'info.dark' },
              label: t('LABEL.VIEW'),
              icon: 'lets-icons:view',
              onClick: (item) => {
                router.push(`${paths.dashboard.clients}/${item.id}`);
              },
            },
            {
              sx: { color: 'error.dark' },
              label: t('LABEL.DELETE'),
              icon: 'material-symbols:delete-outline-rounded',
              onClick: (item: any) => {
                setSelectedId(item.id);
                confirmDelete.onTrue();
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
              label: t('LABEL.SEND_NOTIFICATION'),
              icon: 'mingcute:notification-fill',
              onClick: (item) => {
                setShowSendNotification(true);
                setSelectedCenter(item);
              },
            },
          ]}
          customRender={{
            email: (item: any) => (
              <Box sx={{ color: item?.userStatus === 'BlockedClient' ? 'red' : 'inherit' }}>
                {item?.email}
              </Box>
            ),
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
                  color: item?.userStatus === 'BlockedClient' ? 'red' : 'inherit',
                  direction: 'ltr',
                }}
              >
                {item?.phone}
              </Box>
            ),
            children: (item: any) => (
              <Box
                style={{
                  color: item?.userStatus === 'BlockedClient' ? 'red' : 'inherit',
                }}
              >
                {item?.children} {t('TABLE.CHILDREN')}
              </Box>
            ),
          }}
        />
      </Container>
      <ConfirmDialog
        open={confirmBlock.value}
        onClose={confirmBlock.onFalse}
        title={t('TITLE.BLOCK_CLIENT')}
        content={t('MESSAGE.CONFIRM_BLOCK_CLIENT')}
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
        title={t('TITLE.UNBLOCK_CLIENT')}
        content={t('MESSAGE.CONFIRM_UNBLOCK_CLIENT')}
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
        open={confirmDelete.value}
        onClose={confirmDelete.onFalse}
        title={t('TITLE.DELETE_CLIENT')}
        content={t('MESSAGE.CONFIRM_DELETE_CLIENT')}
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
    </>
  );
};

export default ClientsView;
