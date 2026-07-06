'use client';

import Player from 'next-video/player';

import { Box, Stack, Typography } from '@mui/material';

import { useTranslate } from 'src/locales';

import {
  getBannerLocaleMediaPair,
  type BannerMediaSource,
} from '../utils/pick-banner-locale-media';

type LocaleMedia = { path: string; mediaType: 'IMAGE' | 'VIDEO' };

type Props = {
  banner?: BannerMediaSource;
  imageHeight?: number;
  imageWidth?: number | string;
  videoHeight?: number;
  videoMaxWidth?: number;
  stackDirection?: 'row' | 'column';
};

const PLACEHOLDER = '/assets/images/centers/gray.jpeg';

function renderLocaleMedia(
  item: LocaleMedia,
  label: string,
  opts: {
    imageHeight: number;
    imageWidth: number | string;
    videoHeight: number;
    videoMaxWidth: number;
  }
) {
  return (
    <Stack key={label} spacing={1} sx={{ minWidth: 0 }}>
      <Typography fontWeight="bold" color="primary.dark" variant="subtitle2">
        {label}
      </Typography>
      {item.mediaType === 'VIDEO' ? (
        <Box sx={{ maxWidth: opts.videoMaxWidth, width: '100%' }}>
          <Player
            style={{
              height: opts.videoHeight,
              width: '100%',
              borderRadius: 8,
            }}
            src={item.path || PLACEHOLDER}
          />
        </Box>
      ) : (
        <Box
          component="img"
          alt={label}
          src={item.path || PLACEHOLDER}
          sx={{
            height: opts.imageHeight,
            width: opts.imageWidth,
            maxWidth: '100%',
            objectFit: 'cover',
            borderRadius: 1,
          }}
        />
      )}
    </Stack>
  );
}

export function BannerLocaleMediaDisplay({
  banner,
  imageHeight = 100,
  imageWidth = 200,
  videoHeight = 180,
  videoMaxWidth = 320,
  stackDirection = 'row',
}: Props) {
  const { t } = useTranslate();
  const { ar, en } = getBannerLocaleMediaPair(banner);
  const mediaOpts = { imageHeight, imageWidth, videoHeight, videoMaxWidth };

  return (
    <Stack
      direction={{ xs: 'column', sm: stackDirection }}
      spacing={3}
      sx={{ width: '100%' }}
    >
      {renderLocaleMedia(en, t('LABEL.ENGLISH'), mediaOpts)}
      {renderLocaleMedia(ar, t('LABEL.ARABIC'), mediaOpts)}
    </Stack>
  );
}
