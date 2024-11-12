'use client';

import Container from '@mui/material/Container';
import { useTranslate } from 'src/locales';
import { useSettingsContext } from 'src/components/settings';
import { Box, Button, Card, Grid, InputAdornment, TextField, Typography } from '@mui/material';
import FormProvider from 'src/components/hook-form';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import SharedTable from 'src/CustomSharedComponents/SharedTable/SharedTable';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useBoolean } from 'src/hooks/use-boolean';
import { paths } from 'src/routes/paths';
import Iconify from 'src/components/iconify';
import { NewEditFaqCategoryDialog } from './new-edit-faq-category-dialog';
import i18n from 'src/locales/i18n';
import { deleteFaqCategory } from 'src/actions/faq';
import { FaqCategory } from 'src/types/faq';

type props = {
  categories: FaqCategory[];
  count: number;
};

const FaqView = ({ count, categories }: Readonly<props>) => {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();

  const { t } = useTranslate();
  const searchParams = useSearchParams();
  const router = useRouter();
  const confirmBlock = useBoolean();

  const [selectedId, setSelectedId] = useState<string | null>();
  const [selectedCategory, setSelectedCategory] = useState<FaqCategory | undefined>();
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);

  const TABLE_HEAD = [
    { id: 'name_ar', label: 'LABEL.NAME' },
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
      } else {
        params.delete(name);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams, setValue]
  );

  const handleConfirmDelete = async () => {
    if (selectedId) {
      const res = await deleteFaqCategory(selectedId);
      if (res === 200) {
        enqueueSnackbar(t('MESSAGE.DELETE_SUCCESSFULLY'));
      } else {
        enqueueSnackbar(`${res?.error}`, { variant: 'error' });
      }
    }

    confirmBlock.onFalse();
  };

  return (
    <>
      <Container
        maxWidth={settings.themeStretch ? false : 'xl'}
        sx={{ margin: '0px !important', padding: '0px !important' }}
      >
        <Box
          sx={{
            backgroundImage: `url(/assets/images/faq/faq.jpg)`,
            height: { sm: '300px', xs: '400px' },
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
            {t('LABEL.FAQ_CATEGORIES')}
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
              gap: 2,
            }}
          >
            <Card sx={{ p: 1, ml: 3, mb: 1, width: '50%' }}>
              <FormProvider methods={methods}>
                <TextField
                  fullWidth
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
              {t('BUTTON.ADD_CATEGORY')}{' '}
            </Button>
          </Grid>
        </Box>
        <SharedTable
          count={count}
          data={categories}
          tableHead={TABLE_HEAD}
          actions={[
            {
              sx: { color: 'info.dark' },
              label: t('LABEL.VIEW'),
              icon: 'lets-icons:view',
              onClick: (item) => {
                router.push(`${paths.dashboard.faq}/${item.id}`);
              },
            },
            {
              sx: { color: 'error.dark' },
              label: t('LABEL.DELETE'),
              icon: 'eva:trash-2-outline',
              onClick: (item: any) => {
                setSelectedId(item.id);
                confirmBlock.onTrue();
              },
            },
            {
              sx: { color: 'info.dark' },
              label: t('LABEL.EDIT'),
              icon: 'material-symbols:edit',
              onClick: (item) => {
                setSelectedCategory(item);
                setIsFormDialogOpen(true);
              },
            },
          ]}
          customRender={{
            name_ar: (item: any) => (i18n.language === 'ar' ? item?.name_ar : item?.name_en),
          }}
        />
      </Container>
      <ConfirmDialog
        open={confirmBlock.value}
        onClose={confirmBlock.onFalse}
        title={t('TITLE.DELETE_CATEGORY')}
        content={t('MESSAGE.CONFIRM_DELETE_CATEGORY')}
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
      {isFormDialogOpen && (
        <NewEditFaqCategoryDialog
          open={isFormDialogOpen}
          onClose={() => {
            setSelectedCategory(undefined);
            setIsFormDialogOpen(false);
          }}
          item={selectedCategory}
        />
      )}
    </>
  );
};

export default FaqView;
