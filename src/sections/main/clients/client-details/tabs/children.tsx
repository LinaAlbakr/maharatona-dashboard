'use client';

import Container from '@mui/material/Container';
import { useTranslate } from 'src/locales';
import { useSettingsContext } from 'src/components/settings';
import { Box, Card, Grid, InputAdornment, TextField, Typography } from '@mui/material';
import FormProvider from 'src/components/hook-form';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import SharedTable from 'src/CustomSharedComponents/SharedTable/SharedTable';
import Iconify from 'src/components/iconify';

type props = {
  ClientChildren: any;
};

const Children = ({ ClientChildren }: Readonly<props>) => {
  const settings = useSettingsContext();
  const { t } = useTranslate();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    router.push(`${pathname}/?tab=children`);
  }, []);

  const TABLE_HEAD = [
    { id: 'name', label: 'LABEL.NAME' },
    { id: 'age', label: 'LABEL.AGE' },
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
      } else {
        params.delete(name);
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams, setValue]
  );

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'sm'}>
        <Card sx={{ p: 2 }}>
          <FormProvider methods={methods}>
            <TextField
              sx={{ width: '100%', mb: 2 }}
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
          <SharedTable
            count={ClientChildren?.meta?.itemCount}
            data={ClientChildren?.data}
            tableHead={TABLE_HEAD}
          />
        </Card>
      </Container>
    </>
  );
};

export default Children;
