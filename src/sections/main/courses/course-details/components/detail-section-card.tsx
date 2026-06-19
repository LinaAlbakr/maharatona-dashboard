'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { detailCardSx, detailSectionTitleSx } from '../styles';

type Props = {
  title: string;
  children: React.ReactNode;
};

export default function DetailSectionCard({ title, children }: Props) {
  return (
    <Box sx={{ mb: 2.5 }}>
      <Typography sx={detailSectionTitleSx}>{title}</Typography>
      <Box sx={{ ...detailCardSx, mb: 0 }}>{children}</Box>
    </Box>
  );
}
