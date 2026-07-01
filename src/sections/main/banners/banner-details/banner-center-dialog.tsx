'use client';

import Image from 'next/image';
import Player from 'next-video/player';
import {
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Typography,
} from '@mui/material';

import { useTranslate } from 'src/locales';

import { IBannerCenter } from 'src/types/banners';

import {
  pickBannerLocaleMedia,
} from '../utils/pick-banner-locale-media';

interface Props {
  open: boolean;
  onClose: () => void;
  center?: IBannerCenter;
}

export function BannerCenterDialog({ open, onClose, center }: Props) {
  const { t, i18n } = useTranslate();
  const { path, mediaType } = pickBannerLocaleMedia(center, i18n.language);
  const isImage = mediaType === 'IMAGE';

  return (
    <Dialog
      fullWidth
      sx={{ maxHeight: isImage ? 450 : 'inherit' }}
      maxWidth="sm"
      open={open}
      onClose={onClose}
    >
      <DialogTitle color="secondary" sx={{ pb: 2 }}>
        {center?.advertisementCenterType === 'Admin'
          ? t('LABEL.ADMIN')
          : center?.center?.name || center?.created_by?.name || '- - - -'}
      </DialogTitle>

      <DialogContent style={{ height: '600px' }}>
        <Stack spacing={2} sx={{ alignItems: 'center', justifyContent: 'center' }}>
          {isImage ? (
            <Image
              src={path || '/assets/images/centers/gray.jpeg'}
              width={280}
              height={0}
              alt="banner"
              style={{
                height: 'auto',
                objectFit: 'cover',
                borderRadius: '10px',
              }}
            />
          ) : (
            <Stack spacing={1} sx={{ alignItems: 'center', justifyContent: 'center' }}>
              <Typography fontWeight="bold" color="secondary" variant="subtitle2" sx={{ mb: 1 }}>
                {center?.course?.name || ' '}
              </Typography>
              <Player
                style={{ height: 300, width: '70vw', maxWidth: 500, minWidth: 280 }}
                src={path || 'a'}
              />
            </Stack>
          )}
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
