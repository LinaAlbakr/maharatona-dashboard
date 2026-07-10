'use client';

import {
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';

import { useTranslate } from 'src/locales';

import { IBannerCenter } from 'src/types/banners';

import { BannerLocaleMediaDisplay } from './banner-locale-media-display';

interface Props {
  open: boolean;
  onClose: () => void;
  center?: IBannerCenter;
}

export function BannerCenterDialog({ open, onClose, center }: Props) {
  const { t } = useTranslate();

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={onClose}>
      <DialogTitle color="secondary" sx={{ pb: 2 }}>
        {center?.advertisementCenterType === 'Admin'
          ? t('LABEL.ADMIN')
          : center?.center?.name || center?.created_by?.name || '- - - -'}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ py: 1 }}>
          <BannerLocaleMediaDisplay
            banner={center}
            stackDirection="column"
            imageHeight={200}
            imageWidth="100%"
            videoHeight={300}
            videoMaxWidth={500}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button
          variant="contained"
          sx={{
            color: 'primary.common',
            bgcolor: 'white',
            border: '1px solid #DBE0E4',
            '&:hover': {
              bgcolor: '#DBE0E5',
              border: '1px solid #DBE0E4',
            },
          }}
          onClick={onClose}
        >
          {t('BUTTON.CANCEL')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
