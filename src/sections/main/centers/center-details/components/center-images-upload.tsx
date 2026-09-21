'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Controller, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { alpha } from '@mui/material/styles';

import { useTranslate } from 'src/locales';

import Iconify from 'src/components/iconify';
import Image from 'src/components/image';

import {
  FIELD_BORDER_COLOR,
  FIELD_LABEL_COLOR,
} from '../../add-program/constants';

const PREVIEW_WIDTH = 120;
const PREVIEW_HEIGHT = 120;
const CARD_BORDER_RADIUS = '18px';
const MAX_CENTER_IMAGES = 10;

type Props = {
  name?: string;
  label?: string;
};

export default function CenterImagesUpload({
  name = 'center_images',
  label,
}: Props) {
  const { t } = useTranslate();
  const { control, setValue, watch } = useFormContext();
  const images: (File | string)[] = watch(name) || [];

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const remaining = Math.max(0, MAX_CENTER_IMAGES - images.length);
      if (remaining <= 0) return;

      const next = [
        ...images,
        ...acceptedFiles.slice(0, remaining).map((file) =>
          Object.assign(file, { preview: URL.createObjectURL(file) })
        ),
      ];
      setValue(name, next, { shouldValidate: true, shouldDirty: true });
    },
    [images, name, setValue]
  );

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] },
    multiple: true,
    onDrop,
  });

  const handleRemove = (index: number) => {
    const next = images.filter((_, i) => i !== index);
    setValue(name, next, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ fieldState: { error } }) => (
        <Box>
          <Typography
            variant="body2"
            sx={{ fontSize: 13, color: FIELD_LABEL_COLOR, mb: 1 }}
          >
            {label || t('LABEL.CENTER_IMAGES')}
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={2}>
            {images.map((file, index) => {
              const preview =
                typeof file === 'string'
                  ? file
                  : (file as File & { preview?: string }).preview || '';

              return (
                <Box
                  key={`${preview}-${index}`}
                  sx={{
                    width: PREVIEW_WIDTH,
                    height: PREVIEW_HEIGHT,
                    borderRadius: CARD_BORDER_RADIUS,
                    overflow: 'hidden',
                    position: 'relative',
                    flexShrink: 0,
                  }}
                >
                  <Image
                    alt="center"
                    src={preview}
                    disabledEffect
                    sx={{
                      width: 1,
                      height: 1,
                      display: 'block',
                      borderRadius: CARD_BORDER_RADIUS,
                      '& .component-image-wrapper, & img': {
                        borderRadius: CARD_BORDER_RADIUS,
                      },
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleRemove(index)}
                    sx={{
                      position: 'absolute',
                      top: 6,
                      right: 6,
                      bgcolor: (theme) => alpha(theme.palette.grey[900], 0.55),
                      color: 'common.white',
                      '&:hover': {
                        bgcolor: (theme) => alpha(theme.palette.grey[900], 0.75),
                      },
                    }}
                  >
                    <Iconify icon="mingcute:close-line" width={14} />
                  </IconButton>
                </Box>
              );
            })}

            {images.length < MAX_CENTER_IMAGES ? (
              <Box
                {...getRootProps()}
                sx={{
                  width: PREVIEW_WIDTH,
                  height: PREVIEW_HEIGHT,
                  borderRadius: CARD_BORDER_RADIUS,
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'text.secondary',
                  bgcolor: 'background.paper',
                  flexShrink: 0,
                }}
              >
                <Box
                  component="svg"
                  viewBox={`0 0 ${PREVIEW_WIDTH} ${PREVIEW_HEIGHT}`}
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                  }}
                >
                  <rect
                    x="1"
                    y="1"
                    width={PREVIEW_WIDTH - 2}
                    height={PREVIEW_HEIGHT - 2}
                    rx="18"
                    ry="18"
                    fill="none"
                    stroke={FIELD_BORDER_COLOR}
                    strokeWidth="1.5"
                    strokeDasharray="1.5 5"
                    strokeLinecap="round"
                  />
                </Box>
                <input {...getInputProps()} />
                <Iconify
                  icon="mingcute:add-line"
                  width={28}
                  sx={{ mb: 0.5, color: 'text.disabled' }}
                />
                <Typography variant="caption">{t('ADD_PROGRAM.ADD_MORE')}</Typography>
              </Box>
            ) : null}
          </Stack>
          {error ? (
            <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
              {t(String(error.message))}
            </Typography>
          ) : null}
        </Box>
      )}
    />
  );
}
