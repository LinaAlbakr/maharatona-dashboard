'use client';

import { Box, Divider, Typography } from '@mui/material';
import Image from 'next/image';
import i18n from 'src/locales/i18n';
import { arabicDate, englishDate } from 'src/utils/format-time';
import BookingNotificationBlock from 'src/sections/main/notifications/booking-notification-block';
import { renderProgramDeletedMessage } from 'src/sections/main/notifications/program-deleted-message';

type props = {
  data?: any;
};

const NotificationItem = ({ data }: props) => {
  const isAr = i18n.language === 'ar';
  const title =
    (isAr ? data?.raw?.title_ar || data?.title_ar : data?.raw?.title_en || data?.title_en) ||
    data?.title ||
    '-';
  const message =
    (isAr ? data?.raw?.message_ar || data?.message_ar : data?.raw?.message_en || data?.message_en) ||
    data?.message ||
    '-';

  if (data?.notification_type === 'ADMIN_NEW_BOOKING') {
    return (
      <>
        <Box sx={{ px: 2, py: 1 }}>
          <BookingNotificationBlock data={data} variant="list" />
        </Box>
        <Divider sx={{ mx: 4, bgcolor: 'info.dark', borderBottomWidth: 1 }} />
      </>
    );
  }

  const messageContent =
    data?.notification_type === 'ADMIN_COURSE_DELETED'
      ? renderProgramDeletedMessage(String(message), isAr)
      : message;

  return (
    <>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 4,
        }}
      >
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Image
            src="/assets/images/home/notification.svg"
            alt="notification logo"
            width={40}
            height={40}
          />
          <Box>
            <Typography sx={{ color: '#3CB8BB', fontWeight: 700, fontSize: '14px', lineHeight: 1.3 }}>
              {title}
            </Typography>
            <Typography variant="body2" color="info.dark">
              {messageContent}
            </Typography>
          </Box>
        </Box>
        <Typography variant="body1" color="info.dark">
          {i18n.language === 'ar' ? arabicDate(data?.created_at) : englishDate(data?.created_at)}
        </Typography>
      </Box>
      <Divider sx={{ mx: 4, bgcolor: 'info.dark', borderBottomWidth: 1 }} />
    </>
  );
};

export default NotificationItem;
