/** Turquoise “open” state for enrollment toggles (courses table + flexible modal). */
export const enrollmentTurquoiseSwitchSx = {
  /** Avoid clipping the thumb when parent uses overflow: hidden (e.g. dialogs, tables). */
  overflow: 'visible',
  '& .MuiSwitch-switchBase': {
    overflow: 'visible',
  },
  '& .MuiSwitch-track': {
    overflow: 'visible',
  },
  '& .MuiSwitch-switchBase.Mui-checked': {
    color: '#ffffff',
    '&:hover': {
      backgroundColor: 'rgba(46, 196, 182, 0.18)',
    },
  },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
    backgroundColor: '#2EC4B6',
    opacity: 1,
  },
} as const;

export type FlexibleBookingModelKey =
  | 'trial'
  | 'minutes'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly';

export const FLEX_MODEL_ROWS: {
  key: FlexibleBookingModelKey;
  slotField:
    | 'trialSlots'
    | 'minutesSlots'
    | 'hourlySlots'
    | 'dailySlots'
    | 'weeklySlots'
    | 'monthlySlots';
  labelKey: string;
}[] = [
  { key: 'trial', slotField: 'trialSlots', labelKey: 'LABEL.BOOKING_MODEL_TRIAL' },
  { key: 'minutes', slotField: 'minutesSlots', labelKey: 'LABEL.BOOKING_MODEL_MINUTES' },
  { key: 'hourly', slotField: 'hourlySlots', labelKey: 'LABEL.BOOKING_MODEL_HOURLY' },
  { key: 'daily', slotField: 'dailySlots', labelKey: 'LABEL.BOOKING_MODEL_DAILY' },
  { key: 'weekly', slotField: 'weeklySlots', labelKey: 'LABEL.BOOKING_MODEL_WEEKLY' },
  { key: 'monthly', slotField: 'monthlySlots', labelKey: 'LABEL.BOOKING_MODEL_MONTHLY' },
];
