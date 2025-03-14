'use client';

import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { enqueueSnackbar } from 'notistack';
import { useState, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import Container from '@mui/material/Container';
import { Box, Card, Grid, Button, TextField, Typography, InputAdornment } from '@mui/material';

import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';

import i18n from 'src/locales/i18n';
import { useTranslate } from 'src/locales';
import { deleteBanner, editBannerStatus } from 'src/actions/banners';
import SharedTable from 'src/CustomSharedComponents/SharedTable/SharedTable';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import FormProvider from 'src/components/hook-form';
import { useSettingsContext } from 'src/components/settings';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CutomAutocompleteView from 'src/components/AutoComplete/CutomAutocompleteView';

import { Field, Banner } from 'src/types/banners';

import FileManagerNewFolderDialog from './add-banner';
import { NewEditBannerDialog } from './new-edit-banner-dialog';

type props = {
  banners: Banner[];
  count: number;
  fields: Field[];
};

const types = [
  { name_en: 'Main page', name_ar: 'الصفحة الرئيسية', value: 'MAIN' },
  { name_en: 'Fields', name_ar: 'المجالات', value: 'FIELD' },
  { name_en: 'Both', name_ar: 'كلاهما', value: 'BOTH' },
];

const BannersView = ({ banners, count, fields }: Readonly<props>) => {
  const settings = useSettingsContext();
  const { t } = useTranslate();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | undefined>();
  const [selectedId, setSelectedId] = useState<string>('');
  const upload = useBoolean();
  const confirmActivate = useBoolean();
  const confirmDeactivate = useBoolean();
  const confirmDelete = useBoolean();

  const TABLE_HEAD = [
    { id: 'name_ar', label: 'LABEL.PACKAGE_NAME' },
    { id: 'advertisementType', label: 'LABEL.TYPE' },
    { id: 'duration', label: 'LABEL.DURATION' },
    { id: 'price', label: 'LABEL.PRICE' },
    { id: 'center_num', label: 'LABEL.NUMBER_OF_CENTERS' },
    { id: 'advertisement_status', label: 'LABEL.STATUS' },
    { id: '', label: 'LABEL.SETTINGS' },
  ];

  const formDefaultValues = {
    name: '',
    type: '',
  };

  const pathname = usePathname();
  const methods = useForm({
    defaultValues: formDefaultValues,
  });

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );
  const handleConfirmActivate = async () => {
    if (selectedBanner) {
      const res = await editBannerStatus(selectedBanner);
      if (res.statusCode === 200) {
        enqueueSnackbar(t('MESSAGE.ACTIVATED_SUCCESSFULLY'));
        confirmActivate.onFalse();
      } else {
        enqueueSnackbar(`${res.error}`, { variant: 'error' });
      }
    }
  };
  const handleConfirmDeactivate = async () => {
    if (selectedBanner) {
      const res = await editBannerStatus(selectedBanner);
      if (res.statusCode === 200) {
        enqueueSnackbar(t('MESSAGE.DEACTIVATED_SUCCESSFULLY'));
        confirmDeactivate.onFalse();
      } else {
        enqueueSnackbar(`${res.error}`, { variant: 'error' });
      }
    }
  };

  const handleconfirmDelete = async () => {
    const res = await deleteBanner(selectedId);
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
            backgroundImage: `url(/assets/images/banners/banners.jpg)`,
            height: '400px',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            p: 0,
            boxShadow: 'inset 0 0 0 2000px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            paddingBlock: 8,
            alignItems: 'center',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Typography variant="h2" color="white">
            {t('LABEL.PACKAGES_BANNERS')}
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
            <Card sx={{ p: 1, ml: 3, mb: 1, width: '50%' }}>
              <FormProvider methods={methods}>
                <Box
                  rowGap={1}
                  columnGap={2}
                  display="grid"
                  gridTemplateColumns={{
                    sm: 'repeat(1, 1fr)',
                    md: 'repeat(2, 1fr)',
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
                    placeholder={t('LABEL.SEARCH_BY_NAME')}
                    type="search"
                    onChange={(e) => createQueryString('search', e.target.value)}
                  />

                  <CutomAutocompleteView
                    items={types as any[]}
                    label={t('LABEL.TYPE')}
                    placeholder={t('LABEL.TYPE')}
                    name="type"
                    onCustomChange={(selectedtype: any) =>
                      createQueryString('type', selectedtype?.value ?? '')
                    }
                  />
                </Box>
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
            {t('BUTTON.ADD_PACKAGES')}
          </Button>
        </Box>
        <SharedTable
          count={count}
          data={banners}
          tableHead={TABLE_HEAD}
          actions={[
            {
              sx: { color: 'info.dark' },
              label: t('LABEL.VIEW'),
              icon: 'lets-icons:view',
              onClick: (item) => {
                router.push(`${paths.dashboard.banners}/${item.id}`);
              },
            },
            {
              sx: { color: 'info.dark' },
              label: t('LABEL.EDIT'),
              icon: 'solar:pen-new-square-outline',
              onClick: (item) => {
                setIsFormDialogOpen(true);
                setSelectedBanner(item);
              },
            },
            {
              sx: { color: 'info.dark' },
              label: t('LABEL.ADD_BANNER'),
              icon: 'mingcute:plus-fill',
              onClick: (item) => {
                setSelectedBanner(item);
                upload.onTrue();
              },
            },
            {
              sx: { color: 'error.dark' },
              label: t('LABEL.DELETE'),
              icon: 'mingcute:delete-fill',
              onClick: (item) => {
                setSelectedId(item.id);
                confirmDelete.onTrue();
              },
            },
            {
              sx: { color: 'info.dark' },

              label: t('LABEL.ACTIVATE'),
              icon: 'uim:process',
              onClick: (item: any) => {
                setSelectedBanner(item);
                confirmActivate.onTrue();
              },
              hide: (row) => row.advertisement_status === 'Active',
            },
            {
              sx: { color: 'error.dark' },
              label: t('LABEL.DEACTIVATE'),
              icon: 'streamline:synchronize-disable-solid',
              onClick: (item: any) => {
                setSelectedBanner(item);
                confirmDeactivate.onTrue();
              },
              hide: (row) => row.advertisement_status === 'Blocked',
            },
          ]}
          customRender={{
            advertisementType: (item) =>
              item.advertisementType === 'FIELD'
                ? t(`LABEL.${item.advertisementType}S`)
                : t(`LABEL.${item.advertisementType}`),
            price: (item) => (
              <>
                {Math.floor(+item.price)}{' '}
                <Image src="/assets/images/sar-logo.svg" alt="sar logo" height={20} width={20} />
              </>
            ),
            duration: (item) => `${item.duration} ${t('LABEL.DAY')}`,
            name_ar: (item) => (i18n.language === 'ar' ? item.name_ar : item.name_en),
            advertisement_status: (row: any) => (
              <Label
                variant="soft"
                color={
                  (row.advertisement_status === 'Active' && 'success') ||
                  (row.advertisement_status === 'Blocked' && 'error') ||
                  'error'
                }
              >
                {row.advertisement_status === 'Active' ? t('LABEL.ACTIVE') : t('LABEL.BLOCKED')}
              </Label>
            ),
          }}
        />
      </Container>
      {isFormDialogOpen && (
        <NewEditBannerDialog
          open={isFormDialogOpen}
          onClose={() => {
            setIsFormDialogOpen(false);
            setSelectedBanner(undefined);
          }}
          banner={selectedBanner}
        />
      )}
      <FileManagerNewFolderDialog
        open={upload.value}
        onClose={upload.onFalse}
        fields={fields}
        id={selectedBanner?.id}
        isMain={selectedBanner?.advertisementType === 'MAIN'}
      />
      <ConfirmDialog
        open={confirmActivate.value}
        onClose={confirmActivate.onFalse}
        title={t('TITLE.ACTIVATE_BANNER')}
        content={t('MESSAGE.CONFIRM_ACTIVATE_BANNER')}
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
        title={t('TITLE.DEACTIVATE_BANNER')}
        content={t('MESSAGE.CONFIRM_DEACTIVATE_BANNER')}
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
        title={t('TITLE.DELETE_BANNER')}
        content={t('MESSAGE.CONFIRM_DELETE_BANNER')}
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
    </>
  );
};

export default BannersView;
