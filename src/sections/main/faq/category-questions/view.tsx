'use client';

import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { useState, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import Container from '@mui/material/Container';
import { Box, Card, Grid, Button, TextField, Typography, InputAdornment } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import i18n from 'src/locales/i18n';
import { useTranslate } from 'src/locales';
import { deleteQuestion } from 'src/actions/faq';
import SharedTable from 'src/CustomSharedComponents/SharedTable/SharedTable';

import Iconify from 'src/components/iconify';
import FormProvider from 'src/components/hook-form';
import { useSettingsContext } from 'src/components/settings';
import { ConfirmDialog } from 'src/components/custom-dialog';

import { CategoryQuestion } from 'src/types/faq';

import { NewEditQuestionDialog } from './new-edit-question-dialog';

type props = {
  count: number;
  questions: CategoryQuestion[];
  categoryId: string;
};

const CategoryQuestionsView = ({ count, questions, categoryId }: Readonly<props>) => {
  const settings = useSettingsContext();
  const { t } = useTranslate();
  const searchParams = useSearchParams();
  const router = useRouter();
  const confirmDelete = useBoolean();
  const { enqueueSnackbar } = useSnackbar();
  const [selectedQuestion, setSelectedQuestion] = useState<CategoryQuestion | undefined>();
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);

  const TABLE_HEAD = [
    { id: 'question_ar', label: 'LABEL.QUESTION_NAME' },
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
    [pathname, router, searchParams]
  );

  const handleConfirmDelete = async () => {
    if (selectedId) {
      const res = await deleteQuestion(selectedId);
      if (res?.error) {
        enqueueSnackbar(`${res?.error}`, { variant: 'error' });
      } else {
        enqueueSnackbar(t('MESSAGE.DELETE_SUCCESSFULLY'));
        confirmDelete.onFalse();
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
            backgroundImage: `url(/assets/images/faq/faq.jpg)`,
            height: '300px',

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
            {t('LABEL.FAQ')}
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
            <Card sx={{ p: 1, ml: 3, mb: 1, width: '50%' }} className="text-[125px]">
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
              {t('BUTTON.ADD_QUESTION')}{' '}
            </Button>
          </Grid>
        </Box>
        <SharedTable
          count={count}
          data={questions}
          tableHead={TABLE_HEAD}
          actions={[
            {
              sx: { color: 'error.dark' },
              label: t('LABEL.DELETE'),
              icon: 'ic:outline-block',
              onClick: (item: any) => {
                setSelectedId(item.id);
                confirmDelete.onTrue();
              },
            },
            {
              sx: { color: 'info.dark' },
              label: t('LABEL.EDIT'),
              icon: 'material-symbols:edit',
              onClick: (item) => {
                setSelectedQuestion(item);
                setIsFormDialogOpen(true);
              },
            },
          ]}
          customRender={{
            question_ar: (item: any) =>
              i18n.language === 'ar' ? item?.question_ar : item?.question_en,
          }}
        />
      </Container>
      <ConfirmDialog
        open={confirmDelete.value}
        onClose={confirmDelete.onFalse}
        title={t('TITLE.DELETE_QUESTION')}
        content={t('MESSAGE.CONFIRM_DELETE_QUESTION')}
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
        <NewEditQuestionDialog
          open={isFormDialogOpen}
          onClose={() => {
            setSelectedQuestion(undefined);
            setIsFormDialogOpen(false);
          }}
          item={selectedQuestion}
          categoryId={categoryId}
        />
      )}
    </>
  );
};

export default CategoryQuestionsView;
