'use client';

import TextField from '@mui/material/TextField';
import type { ControllerRenderProps, FieldError } from 'react-hook-form';

import { useTranslate } from 'src/locales';

import { programFieldSx } from '../styles';

const digitsOnly = (value: unknown) => String(value ?? '').replace(/\D/g, '');

type NumericTextFieldProps = {
  field: Pick<ControllerRenderProps, 'name' | 'value' | 'onChange' | 'onBlur' | 'ref'>;
  error?: FieldError;
  placeholder?: string;
};

export default function NumericTextField({ field, error, placeholder }: NumericTextFieldProps) {
  const { t } = useTranslate();

  return (
    <TextField
      fullWidth
      name={field.name}
      inputRef={field.ref}
      value={digitsOnly(field.value)}
      onBlur={field.onBlur}
      onChange={(event) => field.onChange(digitsOnly(event.target.value))}
      inputMode="numeric"
      placeholder={placeholder}
      error={!!error}
      helperText={error ? t(String(error.message)) : undefined}
      sx={programFieldSx}
    />
  );
}
