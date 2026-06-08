'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import { useTranslate } from 'src/locales';

import { programOutlinedButtonSx, programPrimaryButtonSx } from '../styles';

type Props = {
  showPrevious?: boolean;
  nextLabel?: string;
  onPrevious?: () => void;
  onNext: () => void;
  isSubmitting?: boolean;
};

export default function FormActions({
  showPrevious = false,
  nextLabel,
  onPrevious,
  onNext,
  isSubmitting = false,
}: Props) {
  const { t } = useTranslate();

  if (!showPrevious) {
    return (
      <Button
        fullWidth
        variant="contained"
        onClick={onNext}
        disabled={isSubmitting}
        sx={{ ...programPrimaryButtonSx, mt: 3 }}
      >
        {nextLabel || t('ADD_PROGRAM.NEXT')}
      </Button>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
        gap: 2,
        mt: 3,
      }}
    >
      <Button variant="outlined" onClick={onPrevious} sx={programOutlinedButtonSx}>
        {t('ADD_PROGRAM.PREVIOUS')}
      </Button>
      <Button variant="contained" onClick={onNext} disabled={isSubmitting} sx={programPrimaryButtonSx}>
        {nextLabel || t('ADD_PROGRAM.NEXT')}
      </Button>
    </Box>
  );
}
