'use client';

import Cookie from 'js-cookie';
import { io, Socket } from 'socket.io-client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { HOST_API } from 'src/config-global';
import { ACCESS_TOKEN } from 'src/auth/constants';

const ADMIN_BOOKING_NOTIFICATION_CREATED = 'admin_booking_notification_created';

const resolveSocketBaseUrl = () => {
  const raw = String(HOST_API || '').trim();
  if (!raw) return '';
  try {
    const u = new URL(raw);
    return `${u.protocol}//${u.host}`;
  } catch {
    return raw.replace(/\/api\/?$/i, '');
  }
};

/** Listen for booking-notification socket events and refresh current route. */
export const useAdminBookingRealtimeRefresh = () => {
  const router = useRouter();
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const token = Cookie.get(ACCESS_TOKEN);
    const socketBaseUrl = resolveSocketBaseUrl();
    if (!token || !socketBaseUrl) return;

    const socket: Socket = io(socketBaseUrl, {
      transports: ['websocket', 'polling'],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: Infinity,
      timeout: 10000,
    });

    const scheduleRefresh = () => {
      if (refreshTimerRef.current) return;
      refreshTimerRef.current = setTimeout(() => {
        router.refresh();
        refreshTimerRef.current = null;
      }, 350);
    };

    socket.on(ADMIN_BOOKING_NOTIFICATION_CREATED, scheduleRefresh);

    return () => {
      socket.off(ADMIN_BOOKING_NOTIFICATION_CREATED, scheduleRefresh);
      socket.disconnect();
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [router]);
};

