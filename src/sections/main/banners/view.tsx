'use client';

import Container from '@mui/material/Container';
import { useTranslate } from 'src/locales';
import { useSettingsContext } from 'src/components/settings';
import { Box, Button, Card, Grid, InputAdornment, TextField, Typography } from '@mui/material';
import FormProvider from 'src/components/hook-form';
import { useCallback } from 'react';
import CutomAutocompleteView from 'src/components/AutoComplete/CutomAutocompleteView';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import SharedTable from 'src/CustomSharedComponents/SharedTable/SharedTable';
import { useBoolean } from 'src/hooks/use-boolean';
import { paths } from 'src/routes/paths';
import Iconify from 'src/components/iconify';
import { Banner } from 'src/types/banners';

type props = {
  banners: Banner[];
  count: number;
};

const types = [
  { name_en: 'Main page', name_ar: 'الصفحة الرئيسية', value: 'MAIN' },
  { name_en: 'Fields', name_ar: 'المجالات', value: 'FIELD' },
  { name_en: 'Both', name_ar: 'كلاهما', value: 'BOTH' },
];

const BannersView = ({ banners, count }: Readonly<props>) => {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();

  const { t } = useTranslate();
  const searchParams = useSearchParams();
  const router = useRouter();

  const TABLE_HEAD = [
    { id: 'name', label: 'LABEL.PACKAGE_NAME' },
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
                    placeholder={t('LABEL.SEARCH_CENTER')}
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
              onClick: (item) => {},
            },
          ]}
          customRender={{
            advertisementType: (item) =>
              item.advertisementType === 'FIELD'
                ? t(`LABEL.${item.advertisementType}S`)
                : t(`LABEL.${item.advertisementType}`),
            price: (item) => Math.floor(+item.price) + ' ' + t('LABEL.SAR'),
            duration: (item) => item.duration + ' ' + t('LABEL.WEEKS'),
          }}
        />
      </Container>
    </>
  );
};

export default BannersView;
