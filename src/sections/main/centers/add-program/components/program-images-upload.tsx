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
import type { ProgramFormValues } from '../types';

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
                    width: 120,
                    height: 120,
                    borderRadius: '12px',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <Image alt="program" src={preview} sx={{ width: 1, height: 1 }} />
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
                width: 120,
                height: 120,
                borderRadius: '12px',
                border: (theme) => `1px dashed ${alpha(theme.palette.grey[500], 0.32)}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'text.secondary',
                bgcolor: 'grey.50',
              }}
            >
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
