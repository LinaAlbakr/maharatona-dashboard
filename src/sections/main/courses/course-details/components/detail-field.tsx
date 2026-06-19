'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { detailLabelSx, detailValueSx } from '../styles';

type Props = {
  label: string;
  value?: React.ReactNode;
  fullWidth?: boolean;
};

export default function DetailField({ label, value, fullWidth }: Props) {
  return (
    <Box sx={{ gridColumn: fullWidth ? '1 / -1' : undefined }}>
      <Typography sx={detailLabelSx}>{label}</Typography>
      <Typography sx={detailValueSx} component="div">
        {value ?? '-'}
      </Typography>
    </Box>
  );
}
