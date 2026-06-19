'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'src/locales';

import { editProgramButtonSx } from '../styles';

type Props = {
  onEdit?: () => void;
};

export default function ProgramDetailHeader({ onEdit }: Props) {
  const { t } = useTranslate();

  return (
    <Box
      sx={{
        backgroundImage: 'url(/assets/images/courses/header.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: { xs: 0, md: '16px' },
        minHeight: { xs: 200, md: 240 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2.5,
        mb: 3,
        py: 4,
      }}
    >
      <Typography
        variant="h3"
        sx={{
          color: 'common.white',
          fontWeight: 700,
          fontSize: { xs: 28, md: 36 },
          textAlign: 'center',
        }}
      >
        {t('PROGRAM_DETAILS.TITLE')}
      </Typography>
      <Button variant="outlined" sx={editProgramButtonSx} onClick={onEdit}>
        {t('PROGRAM_DETAILS.EDIT_PROGRAM')}
      </Button>
    </Box>
  );
}
