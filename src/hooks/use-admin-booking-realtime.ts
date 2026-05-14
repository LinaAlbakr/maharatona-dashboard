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
    if (!token || !socketBaseUrl) {
      console.log('[rt-notify][client] socket init skipped', {
        hasToken: !!token,
        socketBaseUrl: socketBaseUrl || null,
      });
      return;
    }

    const socket: Socket = io(socketBaseUrl, {
      transports: ['websocket', 'polling'],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: Infinity,
      timeout: 10000,
    });
    console.log('[rt-notify][client] socket connecting', { socketBaseUrl });

    const scheduleRefresh = (payload?: any) => {
      console.log('[rt-notify][client] booking event received', {
        event: ADMIN_BOOKING_NOTIFICATION_CREATED,
        payload: payload ?? null,
      });
      if (refreshTimerRef.current) return;
      refreshTimerRef.current = setTimeout(() => {
        console.log('[rt-notify][client] router.refresh triggered');
        router.refresh();
        refreshTimerRef.current = null;
      }, 350);
    };

    socket.on('connect', () => {
      console.log('[rt-notify][client] socket connected', { socketId: socket.id });
    });
    socket.on('connect_error', (error: Error) => {
      console.log('[rt-notify][client] socket connect_error', { message: error?.message });
    });
    socket.on('disconnect', (reason: string) => {
      console.log('[rt-notify][client] socket disconnected', { reason });
    });
    socket.on(ADMIN_BOOKING_NOTIFICATION_CREATED, scheduleRefresh);

    return () => {
      socket.off(ADMIN_BOOKING_NOTIFICATION_CREATED, scheduleRefresh);
      socket.off('connect');
      socket.off('connect_error');
      socket.off('disconnect');
      socket.disconnect();
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      console.log('[rt-notify][client] socket cleanup complete');
    };
  }, [router]);
};

