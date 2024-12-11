import { useState, useEffect, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Dialog, { DialogProps } from '@mui/material/Dialog';

import * as yup from 'yup';
import Iconify from 'src/components/iconify';
import { Upload } from 'src/components/upload';
import { Controller, useForm } from 'react-hook-form';
import { LoadingButton } from '@mui/lab';
import FormProvider, { RHFSelect, RHFUploadAvatar } from 'src/components/hook-form';
import { useTranslate } from 'src/locales';
import { toFormData } from 'axios';
import { useSnackbar } from 'notistack';
import { yupResolver } from '@hookform/resolvers/yup';
import { Field } from 'src/types/banners';
import { Box, MenuItem, Typography } from '@mui/material';
import { addBanner } from 'src/actions/banners';

// ----------------------------------------------------------------------

interface Props extends DialogProps {
  open: boolean;
  onClose: VoidFunction;
  fields: Field[];
  id: string | undefined;
  isMain: boolean;
}

type FormValues = {
  media: FileList;
};
export default function FileManagerNewFolderDialog({ open, onClose, fields, id, isMain }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslate();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileChange = (files: FileList | null, onChange: (files: FileList) => void) => {
    if (files) {
      const fileArray = Array.from(files);
      setSelectedFiles(fileArray);
      onChange(files); // Update the field value in the form
    }
  };
  const methods = useForm({
    resolver: yupResolver(
      yup.object().shape({
        media: yup.mixed<any>().nullable().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
        field: yup
          .string()
          .nullable()
          .when([], () => {
            if (!isMain) {
              return yup.string().required(t('LABEL.THIS_FIELD_IS_REQUIRED'));
            }
            return yup.string().nullable();
          }),
      })
    ),
    defaultValues: {
      media: null,
      field: '',
    },
  });
  const {
    setValue,
    handleSubmit,
    watch,
    control,
    reset,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    const reqBody = {
      advertisement_id: id,
      field_id: data.field,
      media: data.media[0],
      mediaType: data.media[0].type === 'video/mp4' ? 'VIDEO' : 'IMAGE',
    };
    const formData = new FormData();
    toFormData(reqBody, formData);

    const res = await addBanner(formData);

    if (res?.error) {
      enqueueSnackbar(`${res?.error}`, { variant: 'error' });
    } else {
      enqueueSnackbar(t('MESSAGE.BANNER_ADDED_SUCCESSFULLY'));
      setSelectedFiles([]);
      reset();
      onClose();
    }
  });

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <DialogTitle sx={{ color: 'secondary.main' }}>{t('LABEL.ADD_BANNER')}</DialogTitle>
      <DialogContent dividers sx={{ pt: 1, pb: 0, border: 'none' }}>
        <FormProvider methods={methods} onSubmit={onSubmit}>
          <DialogContent>
            <Stack
              spacing={1}
              sx={{
                display: 'grid',
                gridTemplateColumns: { sm: ' 1fr', md: ' 1fr 1fr' },
                alignItems: 'center',
              }}
            >
              <Controller
                name="media"
                control={control}
                rules={{
                  required: 'Please upload a file.',
                  validate: (value) => {
                    if (!value || value.length === 0) return 'File is required.';
                    const validTypes = ['image/jpeg', 'image/png', 'video/mp4'];
                    for (let i = 0; i < value.length; i++) {
                      if (!validTypes.includes(value[i].type)) {
                        return 'Only JPG, PNG, or MP4 files are allowed.';
                      }
                    }
                    return true;
                  },
                }}
                render={({ field, fieldState }) => (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      padding: '16px',

                      borderRadius: '8px',
                      maxWidth: '400px',
                      width: '100%',
                    }}
                  >
                    <Button
                      variant="contained"
                      component="label"
                      sx={{
                        backgroundColor: '#007BFF',
                        px: 2,
                        py: 1.7,
                        color: '#fff',
                        '&:hover': {
                          backgroundColor: '#0056b3',
                        },
                      }}
                    >
                      {t('LABEL.UPLOAD_FILE')}{' '}
                      <input
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        hidden
                        onChange={(e) => handleFileChange(e.target.files, field.onChange)}
                      />
                    </Button>
                    {fieldState.error && (
                      <Typography color="error" variant="body2">
                        {fieldState.error.message}
                      </Typography>
                    )}
                    {selectedFiles.length > 0 && (
                      <Box sx={{ position: 'absolute', bottom: '50px' }}>
                        {selectedFiles.map((file, index) => (
                          <Typography
                            key={index}
                            sx={{
                              padding: '8px',
                              border: '1px solid #ccc',
                              borderRadius: '4px',
                              backgroundColor: '#f9f9f9',
                              fontSize: '14px',
                            }}
                          >
                            {file.name}
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </Box>
                )}
              />
              <RHFSelect name="field" label={`${t('LABEL.FIELD')}`}>
                {fields.map((field: Field, index: number) => (
                  <MenuItem key={index} value={field.id}>
                    {field.name}
                  </MenuItem>
                ))}
              </RHFSelect>
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
              onClick={() => {
                setSelectedFiles([]);
                reset();
                onClose();
              }}
              disabled={isSubmitting}
            >
              {t('BUTTON.CANCEL')}
            </Button>
            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              {t('BUTTON.SAVE')}
            </LoadingButton>
          </DialogActions>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
