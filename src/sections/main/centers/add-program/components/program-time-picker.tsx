'use client';

import { TimePicker } from '@mui/x-date-pickers';

import { ClockIcon } from './course-icons';
import { programFieldSx } from '../styles';
import { formatTimeForApi, parseApiTime } from '../utils/course-api-helpers';

type Props = {
  value: string | Date | null | undefined;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
};

export default function ProgramTimePicker({ value, onChange, error, helperText }: Props) {
  return (
    <TimePicker
      value={parseApiTime(value)}
      onChange={(date) => onChange(date ? formatTimeForApi(date) : '')}
      ampm
      format="h:mm a"
      slotProps={{
        textField: {
          fullWidth: true,
          placeholder: '00:00 AM',
          error,
          helperText,
          sx: programFieldSx,
        },
      }}
      slots={{
        openPickerIcon: ClockIcon,
      }}
    />
  );
}
