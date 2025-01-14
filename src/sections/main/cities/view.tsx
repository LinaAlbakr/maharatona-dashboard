'use client';

import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { useState, useEffect, useCallback } from 'react';
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
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';

import { useTranslate } from 'src/locales';
import { editCityStatus } from 'src/actions/cities-and-neighborhoods';
import SharedTable from 'src/CustomSharedComponents/SharedTable/SharedTable';

import Iconify from 'src/components/iconify';
import FormProvider from 'src/components/hook-form';
import { useSettingsContext } from 'src/components/settings';
import { ConfirmDialog } from 'src/components/custom-dialog';

import { ICenter } from 'src/types/centers';

import { NewCityDialog } from './new-city-dialog';

type props = {
  cities: any[];
  count: number;
};

const CitiesView = ({ count, cities }: Readonly<props>) => {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();

  const { t } = useTranslate();
  const searchParams = useSearchParams();
  const router = useRouter();
  const confirmActivate = useBoolean();
  const confirmDeactivate = useBoolean();

  const [selectedCity, setSelectedCity] = useState<ICenter | undefined>();
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    router.push(`${pathname}`);
  }, [pathname, router]);

  const TABLE_HEAD = [
    { id: 'name_ar', label: 'LABEL.NAME_AR' },
    { id: 'name_en', label: 'LABEL.NAME_EN' },
    { id: '', label: 'LABEL.SETTINGS' },
  ];

  const formDefaultValues = {
    name: '',
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

      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  const handleConfirmActivate = async () => {
    const res = await editCityStatus(selectedCity);
    if (res.statusCode === 200) {
      enqueueSnackbar(t('MESSAGE.ACTIVATED_SUCCESSFULLY'));
      confirmActivate.onFalse();
    } else {
      enqueueSnackbar(`${res.error}`, { variant: 'error' });
    }
  };
  const handleConfirmDeactivate = async () => {
    const res = await editCityStatus(selectedCity);
    if (res.statusCode === 200) {
      enqueueSnackbar(t('MESSAGE.DEACTIVATED_SUCCESSFULLY'));
      confirmDeactivate.onFalse();
    } else {
      enqueueSnackbar(`${res.error}`, { variant: 'error' });
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
            backgroundImage: `url(/assets/images/cities/cities.jpg)`,
            height: '400px',
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
          <Typography variant="h2" color="white">
            {t('LABEL.CITIES_AND_NEIGHBORHOODS')}
          </Typography>
          <Grid
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              px: 6,
              gap: 3,
            }}
          >
            <Card sx={{ p: 1, ml: 3, mb: 1, width: '50%' }}>
              <FormProvider methods={methods}>
                <TextField
                  sx={{ width: '100%' }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="mingcute:search-line" />
                      </InputAdornment>
                    ),
                  }}
                  placeholder={t('LABEL.SEARCH_BY_NAME')}
                  type="search"
                  onChange={(e) => createQueryString('search', e.target.value)}
                />
              </FormProvider>
            </Card>
          </Grid>
          <Button
            variant="contained"
            sx={{
              px: 8,
              py: 2,
              bgcolor: 'white',
              borderRadius: 4,
              color: 'primary.main',
              '&:hover': { bgcolor: 'primary.main', color: 'white' },
            }}
            onClick={() => {
              setIsFormDialogOpen(true);
            }}
          >
            {t('BUTTON.ADD_CITY')}
          </Button>
        </Box>
        <SharedTable
          count={count}
          data={cities}
          tableHead={TABLE_HEAD}
          actions={[
            {
              sx: { color: 'info.dark' },

              label: t('LABEL.SHOW_NEIGHBORHOODS'),
              icon: 'hugeicons:city-03',
              onClick: (item: any) => {
                router.push(`${paths.dashboard.citiesAndNeighborhoods}/${item.id}`);
              },
            },
            {
              sx: { color: 'info.dark' },

              label: t('LABEL.ACTIVATE'),
              icon: 'uim:process',
              onClick: (item: any) => {
                setSelectedCity(item);
                confirmActivate.onTrue();
              },
              hide: (row) => row.is_active === true,
            },
            {
              sx: { color: 'error.dark' },
              label: t('LABEL.DEACTIVATE'),
              icon: 'streamline:synchronize-disable-solid',
              onClick: (item: any) => {
                setSelectedCity(item);
                confirmDeactivate.onTrue();
              },
              hide: (row) => row.is_active === false,
            },
          ]}
          customRender={{
            name_ar: (item: any) => (
              <Box sx={{ color: item.is_active ? 'inherit' : 'red' }}>{item?.name_ar}</Box>
            ),
            name_en: (item: any) => (
              <Box sx={{ color: item.is_active ? 'inherit' : 'red' }}>{item?.name_en}</Box>
            ),
          }}
        />
      </Container>
      <ConfirmDialog
        open={confirmActivate.value}
        onClose={confirmActivate.onFalse}
        title={t('TITLE.ACTIVATE_CITY')}
        content={t('MESSAGE.CONFIRM_ACTIVATE_CITY')}
        action={
          <Button
            variant="contained"
            color="info"
            onClick={() => {
              handleConfirmActivate();
            }}
          >
            {t('BUTTON.ACTIVATE')}
          </Button>
        }
      />
      <ConfirmDialog
        open={confirmDeactivate.value}
        onClose={confirmDeactivate.onFalse}
        title={t('TITLE.DEACTIVATE_CITY')}
        content={t('MESSAGE.CONFIRM_DEACTIVATE_CITY')}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleConfirmDeactivate();
            }}
          >
            {t('BUTTON.DEACTIVATE')}
          </Button>
        }
      />
      {isFormDialogOpen && (
        <NewCityDialog
          open={isFormDialogOpen}
          onClose={() => {
            setIsFormDialogOpen(false);
          }}
        />
      )}
    </>
  );
};

export default CitiesView;
