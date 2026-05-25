import { Box, Button, IconButton, Rating, Typography } from '@mui/material';
import { useParams } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import React from 'react';
import { deleteRate } from 'src/actions/centers';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useBoolean } from 'src/hooks/use-boolean';
import { useTranslate } from 'src/locales';
import i18n from 'src/locales/i18n';

type props = {
  rate: any;
};
const RateItem = ({ rate }: props) => {
  const { t } = useTranslate();
  const params = useParams();
  const confirmDelete = useBoolean();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const reviewId = rate?.id ?? rate?._id;
  const clientName =
    rate?.client?.name ?? rate?.client?.username ?? '—';
  const commentText = rate?.comment_center ?? rate?.comment ?? '';
  const ratingValue = rate?.rate_center ?? rate?.rate ?? 0;
  const createdAt = rate?.created_at ?? rate?.createdAt;

  const handleConfirmDelete = async () => {
    if (!reviewId || !params?.centerId) {
      enqueueSnackbar('Unable to delete this review', { variant: 'error' });
      confirmDelete.onFalse();
      return;
    }

    setIsDeleting(true);
    const res = await deleteRate(reviewId, params.centerId);
    if (res?.error) {
      enqueueSnackbar(`${res?.error}`, { variant: 'error' });
    } else {
      enqueueSnackbar(t('MESSAGE.DELETED_SUCCESS'), {
        variant: 'success',
      });
    }
    setIsDeleting(false);
    confirmDelete.onFalse();
  };

  const formatReviewDate = (date: string | Date) => {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return '—';
    return new Intl.DateTimeFormat(i18n.language === 'ar' ? 'ar-SA' : 'en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(parsed);
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: 80,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="h6" color="info.dark" fontWeight={700}>
            {clientName}
          </Typography>
          <Typography variant="body1" color="info.dark">
            {commentText}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'start', alignItems: 'center', gap: 3 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'end',
              gap: 1,
            }}
          >
            <Rating value={ratingValue} precision={0.5} readOnly />
            <Typography variant="body1" color="info.dark">
              {createdAt ? formatReviewDate(createdAt) : '—'}
            </Typography>
          </Box>
          <IconButton
            onClick={confirmDelete.onTrue}
            disabled={isDeleting}
            aria-label={t('LABEL.DELETE')}
            sx={{
              p: 0,
              borderRadius: '8px',
              '&:hover': { bgcolor: 'transparent', opacity: 0.85 },
            }}
          >
            <Box
              component="img"
              src="/assets/icons/actions/Delete.svg"
              alt=""
              sx={{ width: 39, height: 39, display: 'block' }}
            />
          </IconButton>
        </Box>
      </Box>

      <ConfirmDialog
        open={confirmDelete.value}
        onClose={confirmDelete.onFalse}
        title={t('TITLE.DELETE_REVIEW')}
        content={t('MESSAGE.CONFIRM_DELETE_REVIEW')}
        action={
          <Button
            variant="contained"
            color="error"
            disabled={isDeleting}
            onClick={handleConfirmDelete}
          >
            {t('BUTTON.DELETE')}
          </Button>
        }
      />
    </>
  );
};

export default RateItem;
