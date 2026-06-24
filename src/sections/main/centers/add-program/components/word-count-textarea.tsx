'use client';

import { Controller, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'src/locales';

import RequiredLabel from './required-label';
import { MAX_DESCRIPTION_WORDS } from '../constants';
import { programFieldSx } from '../styles';
import { countWords } from '../validation';

type Props = {
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  labelSx?: object;
};

export default function WordCountTextarea({
  name,
  label,
  required = false,
  placeholder,
  labelSx,
}: Props) {
  const { t } = useTranslate();
  const { control, watch } = useFormContext();
  const value = watch(name) || '';
  const wordCount = countWords(value);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <RequiredLabel required={required} sx={labelSx}>
          {label}
        </RequiredLabel>
        <Typography variant="caption" color="text.secondary">
          {t('ADD_PROGRAM.MAX_WORDS', { count: MAX_DESCRIPTION_WORDS })}
        </Typography>
      </Box>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            fullWidth
            multiline
            minRows={4}
            placeholder={placeholder || t('ADD_PROGRAM.ENTER_DESCRIPTION')}
            error={!!error || wordCount > MAX_DESCRIPTION_WORDS}
            helperText={
              error?.message
                ? t(String(error.message))
                : wordCount > MAX_DESCRIPTION_WORDS
                  ? t('ADD_PROGRAM.MAX_WORDS_EXCEEDED')
                  : undefined
            }
            sx={programFieldSx}
          />
        )}
      />
      <Typography
        variant="caption"
        color={wordCount > MAX_DESCRIPTION_WORDS ? 'error' : 'text.secondary'}
        sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}
      >
        {wordCount}/{MAX_DESCRIPTION_WORDS}
      </Typography>
    </Box>
  );
}
