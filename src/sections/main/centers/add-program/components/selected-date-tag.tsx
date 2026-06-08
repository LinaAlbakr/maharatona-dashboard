'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { format } from 'date-fns';

import { FIELD_LABEL_COLOR } from '../constants';

type Props = {
  date: Date;
  onRemove: () => void;
};

export default function SelectedDateTag({ date, onRemove }: Props) {
  const parts = [format(date, 'dd'), format(date, 'MM'), format(date, 'dd')];

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        px: 1.25,
        py: 0.75,
        borderRadius: '999px',
        bgcolor: 'rgba(60, 184, 187, 0.18)',
        maxWidth: '100%',
      }}
    >
      {parts.map((part, index) => (
        <Box
          key={`${part}-${index}`}
          sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            bgcolor: 'common.white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            fontWeight: 600,
            color: FIELD_LABEL_COLOR,
            flexShrink: 0,
          }}
        >
          {part}
        </Box>
      ))}

      <Typography
        sx={{
          fontSize: 14,
          fontWeight: 500,
          color: FIELD_LABEL_COLOR,
          ml: 0.25,
          whiteSpace: 'nowrap',
        }}
      >
        {format(date, 'MMM, yyyy')}
      </Typography>

      <Box
        component="button"
        type="button"
        aria-label="Remove date"
        onClick={onRemove}
        sx={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          bgcolor: 'error.main',
          color: 'common.white',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: 16,
          fontWeight: 700,
          lineHeight: 1,
          flexShrink: 0,
          ml: 0.5,
          p: 0,
          '&:hover': {
            bgcolor: 'error.dark',
          },
        }}
      >
        ×
      </Box>
    </Box>
  );
}
