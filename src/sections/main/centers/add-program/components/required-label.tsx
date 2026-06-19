import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';

import { FIELD_LABEL_COLOR } from '../constants';

type Props = {
  children: React.ReactNode;
  required?: boolean;
  size?: 'default' | 'sm';
  sx?: SxProps<Theme>;
};

export default function RequiredLabel({
  children,
  required = false,
  size = 'default',
  sx,
}: Props) {
  return (
    <Typography
      component="label"
      sx={{
        mb: 1,
        display: 'block',
        fontSize: size === 'sm' ? 14 : 16,
        fontWeight: 500,
        color: FIELD_LABEL_COLOR,
        lineHeight: 1.4,
        ...sx,
      }}
    >
      {children}
      {required ? (
        <Box component="span" sx={{ color: 'error.main', ml: 0.25 }}>
          *
        </Box>
      ) : null}
    </Typography>
  );
}
