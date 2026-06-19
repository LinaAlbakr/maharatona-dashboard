'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { format } from 'date-fns';

import { FIELD_LABEL_COLOR } from '../constants';
import type { DateDisplayGroup } from '../utils/custom-dates';

type Props = {
  group: DateDisplayGroup;
  weekLabel?: string;
  onRemove: () => void;
};

export default function SelectedDateGroupTag({ group, weekLabel, onRemove }: Props) {
  const monthYear = format(group.dates[0], weekLabel ? 'MMMM, yyyy' : 'MMM, yyyy');

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
        flexWrap: 'wrap',
      }}
    >
      {weekLabel ? (
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 600,
            color: FIELD_LABEL_COLOR,
            whiteSpace: 'nowrap',
          }}
        >
          {weekLabel}:
        </Typography>
      ) : null}

      {group.dates.map((date) => (
        <Box
          key={date.toISOString()}
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
          {format(date, 'dd')}
        </Box>
      ))}

      <Typography
        sx={{
          fontSize: 14,
          fontWeight: 500,
          color: FIELD_LABEL_COLOR,
          whiteSpace: 'nowrap',
        }}
      >
        {monthYear}
      </Typography>

      <Box
        component="button"
        type="button"
        aria-label="Remove dates"
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
          ml: 0.25,
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
