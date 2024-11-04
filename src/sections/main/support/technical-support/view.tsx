'use client';

import Container from '@mui/material/Container';
import { useTranslate } from 'src/locales';
import { useSettingsContext } from 'src/components/settings';
import { Box, Card, Grid, InputAdornment, TextField, Typography } from '@mui/material';
import FormProvider from 'src/components/hook-form';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import SharedTable from 'src/CustomSharedComponents/SharedTable/SharedTable';
import Iconify from 'src/components/iconify';
import CutomAutocompleteView from 'src/components/AutoComplete/CutomAutocompleteView';
import i18n from 'src/locales/i18n';
import { arabicDate, englishDate } from 'src/utils/format-time';

type props = {
  items: any[];
  count: number;
};

export const types = [
  { name_en: 'CLIENT', name_ar: 'عميل', value: 'CLIENT' },
  { name_en: 'CENTER', name_ar: 'مركز', value: 'CENTER' },
];
const TechnicalSupportView = ({ count, items }: Readonly<props>) => {
  const settings = useSettingsContext();
  console.log(items);

  const { t } = useTranslate();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    router.push(`${pathname}`);
  }, []);

  const TABLE_HEAD = [
    { id: 'userName', label: 'LABEL.NAME' },
    { id: 'email', label: 'LABEL.EMAIL' },
    { id: 'created_at', label: 'LABEL.DATE' },
    { id: 'callUsType', label: 'LABEL.TYPE' },
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

  return (
    <>
      <Container
        maxWidth={settings.themeStretch ? false : 'xl'}
        sx={{ margin: '0px !important', padding: '0px !important' }}
      >
        <Box
          sx={{
            backgroundImage: `url(/assets/images/support/technical-support.jpg)`,
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
          <Typography variant="h2" color="white">
            {t('LABEL.TECHNICAL_SUPPORT')}
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
            <Card
              sx={{
                p: 1,
                ml: 3,
                mb: 1,
                width: {
                  xs: '100%',
                  sm: '100%',
                  md: '80%',
                },
              }}
            >
              <FormProvider methods={methods}>
                <Box
                  rowGap={1}
                  columnGap={2}
                  display="grid"
                  gridTemplateColumns={{
                    xs: 'repeat(2 1fr)',
                    sm: 'repeat(2, 1fr)',
                  }}
                >
                  {' '}
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
                    onCustomChange={(selectedType: any) =>
                      createQueryString('type', selectedType?.value ?? '')
                    }
                  />
                </Box>
              </FormProvider>
            </Card>
          </Grid>
        </Box>
        <SharedTable
          count={count}
          data={items}
          tableHead={TABLE_HEAD}
          actions={[
            {
              sx: { color: 'info.dark' },
              label: t('LABEL.VIEW'),
              icon: 'mdi:eye',
              onClick: (item) => {
                router.push(`/dashboard/support/technical-support/${item?.id}`);
              },
            },
          ]}
          customRender={{
            callUsType: (item) => t(`LABEL.` + item?.callUsType),
            created_at: (item) =>
              i18n.language === 'ar' ? arabicDate(item?.created_at) : englishDate(item?.created_at),
          }}
        />
      </Container>
    </>
  );
};

export default TechnicalSupportView;
