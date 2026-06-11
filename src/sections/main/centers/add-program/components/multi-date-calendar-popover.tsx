'use client';

import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import { DateCalendar } from '@mui/x-date-pickers';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import { isSameDay } from 'date-fns';

import { useTranslate } from 'src/locales';

import { PROGRAM_TEAL } from '../constants';
import { programDatePickerDaySlotProps } from '../styles';
import {
  type DaysOffRestrictions,
  isDateDisabledByDaysOff,
} from '../utils/days-off-restrictions';

type Props = {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onConfirm: (dates: Date[]) => void;
  daysOffRestrictions?: DaysOffRestrictions;
};

function MultiSelectDay(
  props: PickersDayProps<Date> & {
    selectedDates: Date[];
    onToggle: (date: Date) => void;
    daysOffRestrictions?: DaysOffRestrictions;
  }
) {
  const { selectedDates, onToggle, daysOffRestrictions, day, outsideCurrentMonth, ...other } = props;
  const selected = selectedDates.some((date) => isSameDay(date, day));
  const blockedByDaysOff =
    daysOffRestrictions && isDateDisabledByDaysOff(day, daysOffRestrictions);
  const isDisabled = Boolean(other.disabled || blockedByDaysOff);

  return (
    <PickersDay
      {...other}
      day={day}
      outsideCurrentMonth={outsideCurrentMonth}
      selected={selected && !isDisabled}
      disabled={isDisabled}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!outsideCurrentMonth && !isDisabled) {
          onToggle(day);
        }
      }}
      sx={{
        ...programDatePickerDaySlotProps.sx,
        ...(isDisabled
          ? {
              opacity: 0.38,
              pointerEvents: 'none',
            }
          : {}),
        ...(selected && !isDisabled
          ? {
              bgcolor: `${PROGRAM_TEAL} !important`,
              color: 'common.white !important',
            }
          : {}),
      }}
    />
  );
}

export default function MultiDateCalendarPopover({
  open,
  anchorEl,
  onClose,
  onConfirm,
  daysOffRestrictions,
}: Props) {
  const { t } = useTranslate();
  const [pendingDates, setPendingDates] = useState<Date[]>([]);

  useEffect(() => {
    if (open) {
      setPendingDates([]);
    }
  }, [open]);

  const toggleDate = (date: Date) => {
    setPendingDates((current) => {
      const exists = current.some((item) => isSameDay(item, date));
      if (exists) {
        return current.filter((item) => !isSameDay(item, date));
      }
      return [...current, date];
    });
  };

  const handleCancel = () => {
    onClose();
  };

  const handleDone = () => {
    if (pendingDates.length > 0) {
      onConfirm(pendingDates);
    }
    onClose();
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      PaperProps={{ sx: { mt: 0.5, p: 1 } }}
    >
      <DateCalendar<Date>
        onChange={() => undefined}
        slots={{
          day: (dayProps: PickersDayProps<Date>) => (
            <MultiSelectDay
              {...dayProps}
              selectedDates={pendingDates}
              onToggle={toggleDate}
              daysOffRestrictions={daysOffRestrictions}
            />
          ),
        }}
      />

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 1,
          px: 1,
          pb: 0.5,
        }}
      >
        <Button
          size="small"
          variant="outlined"
          onClick={handleCancel}
          sx={{
            borderRadius: '20px',
            px: 2,
            borderColor: PROGRAM_TEAL,
            color: PROGRAM_TEAL,
            '&:hover': {
              borderColor: PROGRAM_TEAL,
              bgcolor: 'rgba(58, 176, 173, 0.04)',
            },
          }}
        >
          {t('BUTTON.CANCEL')}
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={handleDone}
          disabled={pendingDates.length === 0}
          sx={{
            borderRadius: '20px',
            px: 2,
            bgcolor: PROGRAM_TEAL,
            '&:hover': { bgcolor: PROGRAM_TEAL },
          }}
        >
          {t('ADD_PROGRAM.DONE')}
        </Button>
      </Box>
    </Popover>
  );
}
