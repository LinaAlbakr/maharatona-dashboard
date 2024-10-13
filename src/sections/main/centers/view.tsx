'use client';

import Container from '@mui/material/Container';
import { useTranslate } from 'src/locales';
import { useSettingsContext } from 'src/components/settings';
import { Box, Button, Card, Grid, TextField, Typography } from '@mui/material';
import FormProvider from 'src/components/hook-form';
import { useCallback, useMemo } from 'react';
import CutomAutocompleteView, { ITems } from 'src/components/AutoComplete/CutomAutocompleteView';
import { ICenter } from 'src/types/centers';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import SharedTable from 'src/CustomSharedComponents/SharedTable/SharedTable';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useBoolean } from 'src/hooks/use-boolean';
import { paths } from 'src/routes/paths';

type props = {
  centers: ICenter[];
  count: number;
  cities: ITems[];
  neighborhoods?: ITems[];
};

const CentersView = ({ cities, neighborhoods, count, centers }: Readonly<props>) => {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();

  const { t } = useTranslate();
  const searchParams = useSearchParams();
  const router = useRouter();
  const confirmBlock = useBoolean();

  const city = searchParams?.get('city');
  const neighborhood = searchParams?.get('neighborhood');

  const TABLE_HEAD = [
    { id: 'name', label: 'LABEL.CENTER_NAME' },
    { id: 'id', label: 'LABEL.CITY' },
    { id: 'neighborhood', label: 'LABEL.NEIGHBORHOOD' },
    { id: 'phone', label: 'LABEL.PHONE' },
    { id: 'number_of_courses', label: 'LABEL.NUMBER_OF_COURSES' },
    { id: 'number_of_registrants', label: 'LABEL.NUMBER_OF_REGISTRANTS' },
    { id: '', label: 'LABEL.SETTINGS' },
  ];

  const formDefaultValues = {
    name: '',
    city: { id: city },
    neighborhood: { id: neighborhood },
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
      if (name === 'city') {
        setValue('neighborhood', { id: '' });
        params?.delete('neighborhood');
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams, setValue]
  );

  const handleConfirmBlock = async () => {
    confirmBlock.onFalse();
  };

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Box
          sx={{
            backgroundImage: `url(/assets/images/centers/header.jpeg)`,
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
            {t('LABEL.EDUCATIONAL_CENTERS')}
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
            <Card sx={{ p: 3, ml: 3, mb: 1, flexGrow: 1 }}>
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
                    id="outlined-search"
                    label={t('LABEL.SEARCH_CENTER')}
                    type="search"
                    onChange={(e) => createQueryString('search', e.target.value)}
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
                  <CutomAutocompleteView
                    items={neighborhoods as unknown as ITems[]}
                    label={t('LABEL.NEIGHBORHOOD')}
                    placeholder={t('LABEL.NEIGHBORHOOD')}
                    name="neighborhoodId"
                    isDisabled={!neighborhoods || neighborhoods.length === 0}
                    onCustomChange={(selectedCityId: any) =>
                      createQueryString('neighborhood', selectedCityId?.id ?? '')
                    }
                  />
                </Box>
              </FormProvider>
            </Card>
          </Grid>
        </Box>
        <SharedTable
          count={count}
          data={centers}
          tableHead={TABLE_HEAD}
          actions={[
            {
              label: t('LABEL.VIEW'),
              icon: 'solar:pen-bold',
              onClick: (item) => {
                router.push(`${paths.dashboard.centers}/${item.id}`);
              },
            },
            {
              label: t('LABEL.BLOCK'),
              icon: 'lets-icons:view',
              onClick: (item: any) => {
                confirmBlock.onTrue();
              },
            },
            {
              label: t('LABEL.SEND_NOTIFICATION'),
              icon: 'mingcute:notification-fill',
              onClick: (item) => {},
            },
          ]}
          customRender={{
            neighborhood: (item: any) => item?.neighborhood.name,
            id: (item: any) => item?.neighborhood.city.name,
            phone: (item: any) => <Box style={{ direction: 'ltr' }}>{item?.phone}</Box>,
          }}
        />
      </Container>
      <ConfirmDialog
        open={confirmBlock.value}
        onClose={confirmBlock.onFalse}
        title={t('TITLE.BLOCK_CENTER')}
        content={t('MESSAGE.CONFIRM_BLOCK')}
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
    </>
  );
};

export default CentersView;
