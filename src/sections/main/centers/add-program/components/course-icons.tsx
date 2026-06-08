'use client';

import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';

const COURSE_ICONS = {
  calendar: '/assets/icons/course/calendar.svg',
  clock: '/assets/icons/course/clock.svg',
  delete: '/assets/icons/course/delete.svg',
  riyal: '/assets/icons/course/Riyal.svg',
} as const;

type IconProps = {
  sx?: SxProps<Theme>;
};

export function CalendarIcon({ sx }: IconProps) {
  return (
    <Box
      component="img"
      src={COURSE_ICONS.calendar}
      alt=""
      sx={{ width: 18, height: 19, display: 'block', flexShrink: 0, ...sx }}
    />
  );
}

export function ClockIcon({ sx }: IconProps) {
  return (
    <Box
      component="img"
      src={COURSE_ICONS.clock}
      alt=""
      sx={{ width: 20, height: 20, display: 'block', flexShrink: 0, ...sx }}
    />
  );
}

export function DeleteIcon({ sx }: IconProps) {
  return (
    <Box
      component="img"
      src={COURSE_ICONS.delete}
      alt=""
      sx={{ width: 17, height: 21, display: 'block', flexShrink: 0, ...sx }}
    />
  );
}

export function RiyalIcon({ sx }: IconProps) {
  return (
    <Box
      component="img"
      src={COURSE_ICONS.riyal}
      alt=""
      sx={{ width: 11, height: 13, display: 'block', flexShrink: 0, ...sx }}
    />
  );
}
