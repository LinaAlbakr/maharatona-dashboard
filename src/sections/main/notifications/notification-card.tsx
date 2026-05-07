'use client';

import { alpha, Box, Paper, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import i18n from 'src/locales/i18n';
import { arabicDate, englishDate } from 'src/utils/format-time';
import BookingNotificationBlock from './booking-notification-block';

type Props = {
  data: any;
};

const prettifyType = (type: string) =>
  type
    ? type
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : '';

const readActualType = (data: any) =>
  data?.actual_type ??
  data?.booking_type ??
  data?.raw?.booking_model ??
  data?.raw?.booking_type ??
  data?.raw?.type ??
  data?.notification_type;

const readCourseName = (data: any) => {
  const pick = (...values: any[]) => values.find((v) => v !== undefined && v !== null && v !== '');
  return pick(
    data?.course_name,
    data?.raw?.course?.name_en,
    data?.raw?.course?.name_ar,
    data?.raw?.course_name
  );
};

const readCenterName = (data: any) =>
  data?.center_name ||
  data?.raw?.center_name ||
  data?.raw?.center?.name ||
  data?.raw?.booking?.center_name;

const pickLocalizedText = (data: any, kind: 'title' | 'message') => {
  const isAr = i18n.language === 'ar';
  const fromRaw = isAr
    ? data?.raw?.[`${kind}_ar`] || data?.raw?.[`${kind}_en`]
    : data?.raw?.[`${kind}_en`] || data?.raw?.[`${kind}_ar`];
  const fromTop = isAr
    ? data?.[`${kind}_ar`] || data?.[`${kind}_en`]
    : data?.[`${kind}_en`] || data?.[`${kind}_ar`];
  return fromRaw || fromTop || data?.[kind] || '-';
};

/** Course booking (new order) — Figma fixed vs flexible; everything else unchanged. */
const isAdminNewBooking = (data: any) => data?.notification_type === 'ADMIN_NEW_BOOKING';
const isAdminNewCenter = (data: any) => data?.notification_type === 'ADMIN_NEW_CENTER';
const isAdminNewCourse = (data: any) => data?.notification_type === 'ADMIN_NEW_COURSE';
const isCenterCreatedCourse = (data: any) => {
  const msg = String(data?.message ?? data?.raw?.message_en ?? '').trim();
  return /\bhas created a new course\s*:/i.test(msg);
};
const isSimpleLineNotification = (data: any) =>
  isAdminNewCenter(data) || isAdminNewCourse(data) || isCenterCreatedCourse(data);

const formatEnglishTimeLtr = (value: any) => {
  const d = value ? new Date(value) : null;
  if (!d || Number.isNaN(d.getTime())) return '';
  const h24 = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 || 12;
  // Wrap with LRM to keep number-first order inside RTL pages.
  return `\u200E${h12}:${minutes} ${ampm}\u200E`;
};

export default function NotificationCard({ data }: Readonly<Props>) {
  const formattedDate =
    i18n.language === 'ar' ? arabicDate(data?.created_at) : englishDate(data?.created_at);
  const formattedTime = formatEnglishTimeLtr(data?.created_at);

  if (isAdminNewBooking(data)) {
    return <BookingNotificationBlock data={data} variant="page" />;
  }

  const actualType = readActualType(data);
  const courseName = readCourseName(data);
  const centerName = readCenterName(data);
  const localizedTitle = pickLocalizedText(data, 'title');
  const localizedMessage = pickLocalizedText(data, 'message');

  return (
    <Paper
      sx={{
        p: { xs: 1.5, md: 2.25 },
        borderRadius: 2.5,
        backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.9),
        border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
          }}
        >
          <Image
            src="/assets/icons/notification/notificationIcon.png"
            alt="notification"
            width={22}
            height={22}
          />
        </Box>

        <Stack spacing={1.25} sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1} flexWrap="wrap">
            <Typography variant="subtitle1" color="secondary.main" sx={{ fontWeight: 700 }}>
              {localizedTitle}
            </Typography>
            <Typography
              variant="body2"
              color="info.dark"
              dir="ltr"
              sx={{ fontWeight: 500, whiteSpace: 'nowrap', direction: 'ltr', unicodeBidi: 'isolate' }}
            >
              {formattedTime}
            </Typography>
          </Stack>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={isSimpleLineNotification(data) ? { wordBreak: 'break-word', mb: 0 } : { wordBreak: 'break-word' }}
          >
            {localizedMessage}
          </Typography>

          {!isSimpleLineNotification(data) ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                gap: 1,
              }}
            >
              <Paper variant="outlined" sx={{ px: 1, py: 0.75, borderRadius: 1.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Type
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {prettifyType(actualType || data?.notification_type || '') || '-'}
                </Typography>
              </Paper>
              <Paper variant="outlined" sx={{ px: 1, py: 0.75, borderRadius: 1.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Date
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formattedDate}
                </Typography>
              </Paper>
              <Paper variant="outlined" sx={{ px: 1, py: 0.75, borderRadius: 1.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Course
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {courseName || '-'}
                </Typography>
              </Paper>
              <Paper variant="outlined" sx={{ px: 1, py: 0.75, borderRadius: 1.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Center
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {centerName || '-'}
                </Typography>
              </Paper>
            </Box>
          ) : null}
        </Stack>
      </Stack>
    </Paper>
  );
}
