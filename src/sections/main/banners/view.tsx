'use client';

import Container from '@mui/material/Container';
import { useTranslate } from 'src/locales';
import { useSettingsContext } from 'src/components/settings';
import { Box, Button, Card, Grid, InputAdornment, TextField, Typography } from '@mui/material';
import FormProvider from 'src/components/hook-form';
import { useCallback, useState } from 'react';
import CutomAutocompleteView from 'src/components/AutoComplete/CutomAutocompleteView';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import SharedTable from 'src/CustomSharedComponents/SharedTable/SharedTable';
import { useBoolean } from 'src/hooks/use-boolean';
import { paths } from 'src/routes/paths';
import Iconify from 'src/components/iconify';
import { Banner, Field } from 'src/types/banners';
import i18n from 'src/locales/i18n';
import { NewEditBannerDialog } from './new-edit-banner-dialog';
import FileManagerNewFolderDialog from './add-banner';

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
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslate();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | undefined>();
  const upload = useBoolean();
  const TABLE_HEAD = [
    { id: 'name_ar', label: 'LABEL.PACKAGE_NAME' },
    { id: 'advertisementType', label: 'LABEL.TYPE' },
    { id: 'duration', label: 'LABEL.DURATION' },
    { id: 'price', label: 'LABEL.PRICE' },
    { id: 'center_num', label: 'LABEL.NUMBER_OF_CENTERS' },
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
  const { setValue } = methods;

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
    [pathname, router, searchParams, setValue]
  );

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
            {t('LABEL.BANNERS')}
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
            {t('BUTTON.ADD_BANNER')}
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
              // hide: (item) => item?.advertisementType === 'MAIN',
            },
          ]}
          customRender={{
            advertisementType: (item) =>
              item.advertisementType === 'FIELD'
                ? t(`LABEL.${item.advertisementType}S`)
                : t(`LABEL.${item.advertisementType}`),
            price: (item) => Math.floor(+item.price) + ' ' + t('LABEL.SAR'),
            duration: (item) => item.duration + ' ' + t('LABEL.WEEKS'),
            name_ar: (item) => (i18n.language === 'ar' ? item.name_ar : item.name_en),
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
    </>
  );
};

export default BannersView;
