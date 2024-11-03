'use client';

import Container from '@mui/material/Container';
import { useTranslate } from 'src/locales';
import { useSettingsContext } from 'src/components/settings';
import { Box, Button, Card, Grid, InputAdornment, TextField, Typography } from '@mui/material';
import FormProvider from 'src/components/hook-form';
import { useCallback, useEffect, useState } from 'react';
import CutomAutocompleteView from 'src/components/AutoComplete/CutomAutocompleteView';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import SharedTable from 'src/CustomSharedComponents/SharedTable/SharedTable';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useBoolean } from 'src/hooks/use-boolean';
import Iconify from 'src/components/iconify';
import i18n from 'src/locales/i18n';
import { arabicDate, englishDate } from 'src/utils/format-time';
import { deleteCoupon } from 'src/actions/coupons';
import { NewCouponDialog } from './new-coupon-dialog';

type props = {
  coupons: any[];
  count: number;
};

export const types = [
  { name_en: 'ADMIN', name_ar: 'ادمن', value: 'ADMIN' },
  { name_en: 'CENTER', name_ar: 'مركز', value: 'CENTER' },
];

const CouponsView = ({ count, coupons }: Readonly<props>) => {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();

  const { t } = useTranslate();
  const searchParams = useSearchParams();
  const router = useRouter();
  const confirmDelete = useBoolean();
  const [selectedId, setSelectedId] = useState<string | null>();
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);

  useEffect(() => {
    router.push(`${pathname}`);
  }, []);
  const type = searchParams?.get('type');
  const TABLE_HEAD = [
    { id: 'code', label: 'LABEL.COUPON' },
    { id: 'start_date', label: 'LABEL.START_DATE' },
    { id: 'end_date', label: 'LABEL.END_DATE' },
    { id: 'discount', label: 'LABEL.DISCOUNT_AMOUNT' },
    { id: 'discountType', label: 'LABEL.DISCOUNT_TYPE' },
    { id: 'discountCreateType', label: 'LABEL.TYPE' },
    { id: 'times_Used', label: 'LABEL.NUMBER_OF_USAGES' },
    { id: '', label: 'LABEL.SETTINGS' },
  ];

  const formDefaultValues = {
    name: '',
    type: { id: type },
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

  const handleconfirmDelete = async () => {
    if (selectedId) {
      const res = await deleteCoupon(selectedId);
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
            backgroundImage: `url(/assets/images/coupons/header.jpg)`,
            height: '500px',
            backgroundSize: '100% 100%',
            backgroundPosition: 'center',
            p: 0,
            boxShadow: 'inset 0 0 0 2000px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            paddingBlock: 6,
            alignItems: 'center',
            flexDirection: 'column',
          }}
        >
          <Typography variant="h2" color="white">
            {t('LABEL.COUPONS')}
          </Typography>
          <Grid
            sx={{
              width: '80%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              px: 6,
            }}
          >
            <Card sx={{ p: 1, ml: 3, mb: 1, flexGrow: 1 }}>
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
                  <TextField
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Iconify icon="mingcute:search-line" />
                        </InputAdornment>
                      ),
                    }}
                    placeholder={t('LABEL.SEARCH_BY_COUPON_NAME')}
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
            {t('BUTTON.ADD_COUPON')}{' '}
          </Button>
        </Box>
        <SharedTable
          count={count}
          data={coupons}
          tableHead={TABLE_HEAD}
          actions={[
            {
              sx: { color: 'error.dark' },
              label: t('LABEL.DELETE'),
              icon: 'eva:trash-2-outline',
              onClick: (item: any) => {
                setSelectedId(item.id);
                confirmDelete.onTrue();
              },
            },
          ]}
          customRender={{
            start_date: (item: any) =>
              i18n.language === 'ar' ? arabicDate(item?.start_date) : englishDate(item?.start_date),
            end_date: (item: any) =>
              i18n.language === 'ar' ? arabicDate(item?.end_date) : englishDate(item?.end_date),
            discount: (item: any) => Math.floor(item?.discount),
            discountType: (item: any) => t('LABEL.' + item?.discountType.toUpperCase()),
            discountCreateType: (item: any) => t('LABEL.' + item?.discountCreateType.toUpperCase()),
            times_Used: (item: any) => item?.times_Used + ' ' + t('LABEL.TIME'),
          }}
        />
      </Container>
      <ConfirmDialog
        open={confirmDelete.value}
        onClose={confirmDelete.onFalse}
        title={t('TITLE.DELETE_COUPON')}
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
      {isFormDialogOpen ? (
        <NewCouponDialog
          open={isFormDialogOpen}
          onClose={() => {
            setIsFormDialogOpen(false);
          }}
        />
      ) : null}
    </>
  );
};

export default CouponsView;
