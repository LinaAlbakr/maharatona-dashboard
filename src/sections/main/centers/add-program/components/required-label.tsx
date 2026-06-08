import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { FIELD_LABEL_COLOR } from '../constants';

type Props = {
  children: React.ReactNode;
  required?: boolean;
};

export default function RequiredLabel({ children, required = false }: Props) {
  return (
    <Typography
      component="label"
      sx={{
        mb: 1,
        display: 'block',
        fontSize: 16,
        fontWeight: 500,
        color: FIELD_LABEL_COLOR,
        lineHeight: 1.4,
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
