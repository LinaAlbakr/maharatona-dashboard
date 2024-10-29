'use client';

import Container from '@mui/material/Container';
import { useTranslate } from 'src/locales';
import { useSettingsContext } from 'src/components/settings';
import { Box, Button, Card, Grid, InputAdornment, TextField, Typography } from '@mui/material';
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
  const confirmDelete = useBoolean();
  const [selectedId, setSelectedId] = useState<string | null>();
  const [selectedReason, setSelectedReason] = useState<any | undefined>();
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  useEffect(() => {
    router.push(`${pathname}`);
  }, []);

  const TABLE_HEAD = [
    { id: 'name_ar', label: 'LABEL.CENTER_NAME' },
    { id: 'name_en', label: 'LABEL.CITY' },
    { id: '', label: 'LABEL.SETTINGS' },
  ];

  const formDefaultValues = {
    name: '',
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

      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams, setValue]
  );

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
          count={count}
          data={reasons}
          tableHead={TABLE_HEAD}
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
