'use client';

import Cookie from 'js-cookie';
import { io, Socket } from 'socket.io-client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { HOST_API } from 'src/config-global';
import { ACCESS_TOKEN } from 'src/auth/constants';

const ADMIN_CENTER_CREATED = 'admin_center_created';
const ADMIN_CLIENT_CREATED = 'admin_client_created';
const ADMIN_COURSE_CREATED = 'admin_course_created';

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

/** Auto-refresh entity list pages on create events (centers/clients/courses). */
export const useAdminEntityListsRealtimeRefresh = () => {
  const router = useRouter();
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const token = Cookie.get(ACCESS_TOKEN);
    const socketBaseUrl = resolveSocketBaseUrl();
    if (!token || !socketBaseUrl) {
      console.log('[rt-entity][client] socket init skipped', {
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
    console.log('[rt-entity][client] socket connecting', { socketBaseUrl });

    const scheduleRefresh = (eventName: string, payload?: any) => {
      console.log('[rt-entity][client] realtime event received', {
        event: eventName,
        payload: payload ?? null,
      });
      if (refreshTimerRef.current) return;
      refreshTimerRef.current = setTimeout(() => {
        console.log('[rt-entity][client] router.refresh triggered');
        router.refresh();
        refreshTimerRef.current = null;
      }, 400);
    };

    const onCenterCreated = (payload?: any) => scheduleRefresh(ADMIN_CENTER_CREATED, payload);
    const onClientCreated = (payload?: any) => scheduleRefresh(ADMIN_CLIENT_CREATED, payload);
    const onCourseCreated = (payload?: any) => scheduleRefresh(ADMIN_COURSE_CREATED, payload);

    socket.on('connect', () => {
      console.log('[rt-entity][client] socket connected', { socketId: socket.id });
    });
    socket.on('connect_error', (error: Error) => {
      console.log('[rt-entity][client] socket connect_error', { message: error?.message });
    });
    socket.on('disconnect', (reason: string) => {
      console.log('[rt-entity][client] socket disconnected', { reason });
    });

    socket.on(ADMIN_CENTER_CREATED, onCenterCreated);
    socket.on(ADMIN_CLIENT_CREATED, onClientCreated);
    socket.on(ADMIN_COURSE_CREATED, onCourseCreated);

    return () => {
      socket.off(ADMIN_CENTER_CREATED, onCenterCreated);
      socket.off(ADMIN_CLIENT_CREATED, onClientCreated);
      socket.off(ADMIN_COURSE_CREATED, onCourseCreated);
      socket.off('connect');
      socket.off('connect_error');
      socket.off('disconnect');
      socket.disconnect();
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      console.log('[rt-entity][client] socket cleanup complete');
    };
  }, [router]);
};

