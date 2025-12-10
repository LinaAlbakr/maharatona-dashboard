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
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useTranslate } from 'src/locales';
import SharedTable from 'src/CustomSharedComponents/SharedTable/SharedTable';
import { deleteNeighborhood, editNeighborhoodStatus } from 'src/actions/cities-and-neighborhoods';

import Iconify from 'src/components/iconify';
import FormProvider from 'src/components/hook-form';
import { useSettingsContext } from 'src/components/settings';
import { ConfirmDialog } from 'src/components/custom-dialog';

import { ICenter } from 'src/types/centers';

import { NewNeighborhoodDialog } from './new-neighborhood-dialog';

type props = {
  neighborhoods: any[];
  count: number;
  cityId: string;
};

const NeighborhoodsView = ({ count, neighborhoods, cityId }: Readonly<props>) => {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();

  const { t } = useTranslate();
  const searchParams = useSearchParams();
  const router = useRouter();
  const confirmActivate = useBoolean();
  const confirmDeactivate = useBoolean();

  const [selectedNeighborhood, setSelectedNeighborhood] = useState<ICenter | undefined>();
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const pathname = usePathname();
  const confirmDelete = useBoolean();

  useEffect(() => {
    router.push(`${pathname}`);
  }, [pathname, router]);
  const currentLimit = Number(searchParams?.get('limit')) || 20;

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
    const res = await editNeighborhoodStatus(selectedNeighborhood);
    if (res?.error) {
      enqueueSnackbar(`${res?.error}`, { variant: 'error' });
    } else {
      enqueueSnackbar(t('MESSAGE.ACTIVATED_SUCCESSFULLY'), {
        variant: 'success',
      });
      confirmActivate.onFalse();
    }
  };
  const handleConfirmDeactivate = async () => {
    const res = await editNeighborhoodStatus(selectedNeighborhood);
    if (res?.error) {
      enqueueSnackbar(`${res?.error}`, { variant: 'error' });
    } else {
      enqueueSnackbar(t('MESSAGE.DEACTIVATED_SUCCESSFULLY'), {
        variant: 'success',
      });
      confirmDeactivate.onFalse();
    }
  };

  const handleconfirmDelete = async () => {
    console.log("selectedId",selectedId);
    const res = await deleteNeighborhood(selectedId);
    if (res?.error) {
      enqueueSnackbar(`${res?.error}`, { variant: 'error' });
    } else {
      enqueueSnackbar(t('MESSAGE.DELETED_SUCCESS'), {
        variant: 'success',
      });
    }
    confirmDelete.onFalse();
  };

  // Client-side filtering by search query
  const searchValue = (searchParams.get('search') || '').toString().trim().toLowerCase();
  const filteredNeighborhoods = searchValue
    ? (neighborhoods || []).filter((item: any) => {
        const ar = (item?.name_ar || '').toString().toLowerCase();
        const en = (item?.name_en || '').toString().toLowerCase();
        return ar.includes(searchValue) || en.includes(searchValue);
      })
    : neighborhoods;

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
            {t('BUTTON.ADD_NEIGHBORHOOD')}{' '}
          </Button>
        </Box>
        <SharedTable
          count={filteredNeighborhoods.length}
          data={filteredNeighborhoods}
          tableHead={TABLE_HEAD}
          disablePagination
          actions={[
            {
              sx: { color: 'error.dark' },
              label: t('LABEL.DELETE'),
              icon: 'mingcute:delete-fill',
              onClick: (item) => {
                setSelectedId(item.id || item._id);
                confirmDelete.onTrue();
              },
            },
            {
              sx: { color: 'info.dark' },

              label: t('LABEL.ACTIVATE'),
              icon: 'uim:process',
              onClick: (item: any) => {
                setSelectedNeighborhood(item);
                confirmActivate.onTrue();
              },
              hide: (row) => row.is_active === true,
            },
            {
              sx: { color: 'error.dark' },
              label: t('LABEL.DEACTIVATE'),
              icon: 'streamline:synchronize-disable-solid',
              onClick: (item: any) => {
                setSelectedNeighborhood(item);
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
      </Container>
      <ConfirmDialog
        open={confirmActivate.value}
        onClose={confirmActivate.onFalse}
        title={t('TITLE.ACTIVATE_NEIGHBORHOOD')}
        content={t('MESSAGE.CONFIRM_ACTIVATE_NEIGHBORHOOD')}
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
        title={t('TITLE.DEACTIVATE_NEIGHBORHOOD')}
        content={t('MESSAGE.CONFIRM_DEACTIVATE_NEIGHBORHOOD')}
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
      <ConfirmDialog
        open={confirmDelete.value}
        onClose={confirmDelete.onFalse}
        title={t('TITLE.DELETE_NEIGHBORHOOD')}
        content={t('MESSAGE.CONFIRM_DELETE_NEIGHBORHOOD')}
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
      {isFormDialogOpen && (
        <NewNeighborhoodDialog
          cityId={cityId}
          open={isFormDialogOpen}
          onClose={() => {
            setIsFormDialogOpen(false);
          }}
        />
      )}
    </>
  );
};

export default NeighborhoodsView;
