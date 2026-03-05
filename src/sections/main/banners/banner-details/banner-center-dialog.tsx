'use client';

import * as yup from 'yup';
import { toFormData } from 'axios';
import { useCallback, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Image from 'next/image';
import Player from 'next-video/player';
import { LoadingButton } from '@mui/lab';
import {
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Box,
  Typography,
} from '@mui/material';



import { useTranslate } from 'src/locales';

import { IBannerCenter } from 'src/types/banners';

interface Props {
  open: boolean;
  onClose: () => void;
  center?: IBannerCenter ;
}

export function BannerCenterDialog({ open, onClose, center }: Props) {
  const { t } = useTranslate();

  return (
    <Dialog fullWidth sx={{ maxHeight:center?.mediaType === "IMAGE" ? 450:'inherit'}} maxWidth="sm" open={open} onClose={onClose}>
      <DialogTitle color="secondary" sx={{ pb: 2 }}>
      {center?.center?.name || '- - - -'}
      </DialogTitle>

        <DialogContent style={{ height: '600px' }}>

          <Stack
            spacing={1}
            sx={{
              display: 'grid',
              alignItems: 'center',
              justifyContent:"center",

            }}
          >

             {
              center?.mediaType === "IMAGE" ? (

                <Image
                src={`${center?.path}` || '/assets/images/centers/gray.jpeg'}
                width={280}
                height={0}
                alt="image"
                style={{
                  height:'auto',
                  objectFit:"cover",
                  borderRadius: '10px',
                }}
              />
              ) :(
                <Stack
                spacing={1}
                sx={{
                  display: 'grid',
                  alignItems: 'center',
                  justifyContent:"center",

                }}
              >
               <Typography fontWeight="bold" color="secondary"  variant="subtitle2" sx={{ mb: 1 }}>
                {center?.course?.name || ' '}
              </Typography>
                <Player
                style={{height:300, width: '70vw', maxWidth:  500 , minWidth:280}}
                src={center?.path || 'a'}

              />
              </Stack>
              )
            }
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
