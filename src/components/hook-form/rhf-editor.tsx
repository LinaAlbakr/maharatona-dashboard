import { useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import FormHelperText from '@mui/material/FormHelperText';

import { useTranslate } from 'src/locales';
import Editor, { EditorProps } from '../editor';

// ----------------------------------------------------------------------

interface Props extends EditorProps {
  name: string;
}

export default function RHFEditor({ name, helperText, ...other }: Props) {
  const {
    control,
    watch,
    setValue,
    formState: { isSubmitSuccessful },
  } = useFormContext();
const { i18n } = useTranslate();
const currentLang = { value: i18n.language }; // Assuming `i18n.language` holds the current language
  
const values = watch();

  useEffect(() => {
    if (values[name] === '<p><br></p>') {
      setValue(name, '', {
        shouldValidate: !isSubmitSuccessful,
      });
    }
  }, [isSubmitSuccessful, name, setValue, values]);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Editor
          id={name}
          value={field.value}
          sx={{
            '& .ql-editor': {
              // direction: name.includes('ar') ? 'rtl !important' : 'ltr !important',
              // textAlign: name.includes('ar') ? 'right !important' : 'left !important',
              minHeight: '200px',
            },
          }}
          
          onChange={field.onChange}
          error={!!error}
          helperText={
            (!!error || helperText) && (
              <FormHelperText error={!!error} sx={{ px: 2 }}>
                {error ? error?.message : helperText}
              </FormHelperText>
            )
          }
          {...other}
        />
      )}
    />
  );
}
