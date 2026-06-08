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

import RequiredLabel from './required-label';
import { FIELD_BORDER_COLOR } from '../constants';
import type { ProgramFormValues } from '../types';

const PREVIEW_WIDTH = 151;
const PREVIEW_HEIGHT = 87;
const CARD_BORDER_RADIUS = '18px';

export default function ProgramImagesUpload() {
  const { t } = useTranslate();
  const { control, setValue, watch } = useFormContext<ProgramFormValues>();
  const images = watch('courseImages');

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const next = [
        ...images,
        ...acceptedFiles.map((file) =>
          Object.assign(file, { preview: URL.createObjectURL(file) })
        ),
      ];
      setValue('courseImages', next, { shouldValidate: true });
    },
    [images, setValue]
  );

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] },
    multiple: true,
    onDrop,
  });

  const handleRemove = (index: number) => {
    const next = images.filter((_, i) => i !== index);
    setValue('courseImages', next, { shouldValidate: true });
  };

  return (
    <Controller
      name="courseImages"
      control={control}
      render={({ fieldState: { error } }) => (
        <Box>
          <RequiredLabel required>{t('ADD_PROGRAM.PROGRAM_PICTURES')}</RequiredLabel>
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
                    border: 'none',
                  }}
                >
                  <Image
                    alt="program"
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
                border: 'none',
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
              <Iconify icon="mingcute:add-line" width={28} sx={{ mb: 0.5, color: 'text.disabled' }} />
              <Typography variant="caption">{t('ADD_PROGRAM.ADD_MORE')}</Typography>
            </Box>
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
