import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';

import { useTranslate } from 'src/locales';

import { FIELD_PLACEHOLDER_COLOR } from '../constants';
import RequiredLabel from './required-label';

type Props = {
  labelKey: string;
  required?: boolean;
  sx?: SxProps<Theme>;
};

export default function PriceVatLabel({ labelKey, required = false, sx }: Props) {
  const { t } = useTranslate();

  return (
    <RequiredLabel required={required} sx={sx}>
      {t(labelKey)}{' '}
      <Box
        component="span"
        sx={{
          fontSize: 13,
          fontWeight: 400,
          color: FIELD_PLACEHOLDER_COLOR,
        }}
      >
        {t('ADD_PROGRAM.VAT_IF_APPLICABLE')}
      </Box>
    </RequiredLabel>
  );
}
