'use client';

import Container from '@mui/material/Container';
import { useTranslate } from 'src/locales';
import { useSettingsContext } from 'src/components/settings';
import { Box, Button, Card, Grid, InputAdornment, TextField, Typography, Select, MenuItem, FormControl } from '@mui/material';
import FormProvider from 'src/components/hook-form';
import { useCallback, useEffect,  useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import SharedTable from 'src/CustomSharedComponents/SharedTable/SharedTable';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useBoolean } from 'src/hooks/use-boolean';
import { deleteReason } from 'src/actions/support';
import Iconify from 'src/components/iconify';
import { NewEditReasonDialog } from './new-edit-reason-dialog';

type props = {
  reasons: any[];
  count: number;
};

const CallsReasonsView = ({ count, reasons }: Readonly<props>) => {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();

  const { t } = useTranslate();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const confirmDelete = useBoolean();
  const [selectedId, setSelectedId] = useState<string | null>();
  const [selectedReason, setSelectedReason] = useState<any | undefined>();
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  useEffect(() => {
    router.push(`${pathname}`);
  }, [pathname, router]);
  const currentLimit = Number(searchParams?.get('limit')) || 20;

  const TABLE_HEAD = [
    { id: 'name_ar', label: 'LABEL.ARABIC' },
    { id: 'name_en', label: 'LABEL.ENGLISH' },
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
    [pathname, router, searchParams, setValue]
  );

  // Client-side filtering by search query
  const searchValue = (searchParams.get('search') || '').toString().trim().toLowerCase();
  const filteredReasons = searchValue
    ? (reasons || []).filter((item: any) => {
        const ar = (item?.name_ar || '').toString().toLowerCase();
        const en = (item?.name_en || '').toString().toLowerCase();
        return ar.includes(searchValue) || en.includes(searchValue);
      })
    : reasons;

  const handleConfirmDelete = async () => {
    if (selectedId) {
      const res = await deleteReason(selectedId);
      if (res === 200) {
        enqueueSnackbar(t('MESSAGE.DELETE_SUCCESSFULLY'));
      } else {
        enqueueSnackbar(`${res?.error}`, { variant: 'error' });
      }
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
            backgroundImage: `url(/assets/images/support/calls-reason-header.jpeg)`,
            height: '400px',
            width: '100%',
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
            {t('LABEL.CALLS_REASONS')}
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
              gap: 4,
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
              {t('BUTTON.ADD_REASON')}{' '}
            </Button>
          </Grid>
        </Box>
        <SharedTable
          count={filteredReasons.length}
          data={filteredReasons}
          tableHead={TABLE_HEAD}
          disablePagination
          actions={[
            {
              sx: { color: 'error.main' },
              label: t('LABEL.DELETE'),
              icon: 'material-symbols:delete',
              onClick: (item) => {
                setSelectedId(item.id);
                confirmDelete.onTrue();
              },
            },
            {
              sx: { color: 'info.dark' },
              label: t('LABEL.EDIT'),
              icon: 'material-symbols:edit',
              onClick: (item) => {
                setSelectedReason(item);
                setIsFormDialogOpen(true);
              },
            },
          ]}
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
        open={confirmDelete.value}
        onClose={confirmDelete.onFalse}
        title={t('TITLE.DELETE_REASON')}
        content={t('MESSAGE.CONFIRM_DELETE_REASON')}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleConfirmDelete();
            }}
          >
            {t('BUTTON.DELETE')}
          </Button>
        }
      />
      {isFormDialogOpen ? (
        <NewEditReasonDialog
          open={isFormDialogOpen}
          onClose={() => {
            setSelectedReason(null);
            setIsFormDialogOpen(false);
          }}
          reason={selectedReason}
        />
      ) : null}
    </>
  );
};

export default CallsReasonsView;
