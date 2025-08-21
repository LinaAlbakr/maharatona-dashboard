'use client';

import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { useState, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import Container from '@mui/material/Container';
import {Tab, Tabs, Box, Card, Grid, Button, TextField,  Typography,    InputAdornment} from '@mui/material';

import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';

import i18n from 'src/locales/i18n';
import { useTranslate } from 'src/locales';
import { deleteFaqCategory } from 'src/actions/faq';
import SharedTableFaq from 'src/CustomSharedComponents/SharedTableFaq/SharedTableFaq';

import Iconify from 'src/components/iconify';
import FormProvider from 'src/components/hook-form';
import { useSettingsContext } from 'src/components/settings';
import { ConfirmDialog } from 'src/components/custom-dialog';

import { FaqCategory } from 'src/types/faq';

import { NewEditFaqCategoryDialog } from './new-edit-faq-category-dialog';


export enum SubscriberType {
  client = 'client',
  center = 'center',
}

type props = {
  categories: FaqCategory[];
  categoriesCenter: FaqCategory[];
  count: number;
  meta: any;
  metaCenter: any;
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const FaqView = ({ count, categories, meta, categoriesCenter, metaCenter }: Readonly<props>) => {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();

  const { t } = useTranslate();
  const searchParams = useSearchParams();
  const router = useRouter();
  const confirmBlock = useBoolean();

  const [selectedId, setSelectedId] = useState<string | null>();
  const [selectedCategory, setSelectedCategory] = useState<FaqCategory | undefined>();
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [value, setValue] = useState<number>(0);

  const TABLE_HEAD = [
    { id: 'name_ar', label: 'LABEL.NAME' },
    { id: 'order', label: 'LABEL.ORDER' },
    { id: '', label: 'LABEL.SETTINGS' },
  ];

  const formDefaultValues = {
    name: '',
  };

  const pathname = usePathname();
  const methods = useForm({
    defaultValues: formDefaultValues,
  });

  const createQueryString = useCallback(
    (name: string, values: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (values) {
        params.set(name, values);
      } else {
        params.delete(name);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
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

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  function TabPanel({ children, value, index, ...other }: TabPanelProps) {
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 2 }}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }

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
            <Tabs value={value} onChange={handleChange} aria-label="basic tabs" sx={{
              borderRadius: '2rem',
              '& .MuiTabs-indicator': {
                height: '100%',
                backgroundColor: 'primary',
                borderRadius: '2rem',
              },
              backgroundColor: 'primary.contrastText',
            }}>
              <Tab label={t('LABEL.STUDENT')} sx={{
                color: 'primary.contrastText',
                position: 'relative',
                zIndex: 1,
                px: 4,
                m: '0 !important',
              }} />
              <Tab label={t('LABEL.CENTER')} sx={{
                color: 'primary.contrastText',
                position: 'relative',
                zIndex: 1,
                px: 4,
              }} />
            </Tabs>
          </Grid>
        </Box>
        <Box
          sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}
        >
          <Button
            variant="outlined"
            size='large'
            sx={{
              // px: 6,
              // py: 2,
              bgcolor: 'white',
              borderRadius: 1,
              color: 'primary.main',
              '&:hover': { bgcolor: 'primary.main', color: 'white' },
            }}
            onClick={() => {
              setIsFormDialogOpen(true);
            }}
          >
         {t('BUTTON.ADD_CATEGORY')}{' '}
          </Button>
        </Box>

        <TabPanel value={value} index={0}>
          <SharedTableFaq
            meta={meta}
            count={categories.length}
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
        </TabPanel>
        <TabPanel value={value} index={1}>
          <SharedTableFaq
            meta={metaCenter}
            count={categoriesCenter.length}
            data={categoriesCenter}
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
        </TabPanel>
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
          value={value}
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
