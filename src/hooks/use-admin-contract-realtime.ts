'use client';

import Cookie from 'js-cookie';
import { io, Socket } from 'socket.io-client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { HOST_API } from 'src/config-global';
import { ACCESS_TOKEN } from 'src/auth/constants';

export const ADMIN_CONTRACT_ACCEPTANCE = 'admin_contract_acceptance';

export type ContractAcceptancePayload = {
  versionId?: string;
  version?: number;
  staticPageType?: string;
  accepted_centers?: number;
  total_centers?: number;
  centerId?: string;
  accepted_at?: string;
};

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

type Options = {
  onAcceptance?: (payload: ContractAcceptancePayload) => void;
};

/** Refresh agreement page when a center accepts the latest contract from mobile. */
export const useAdminContractRealtimeRefresh = (options?: Options) => {
  const router = useRouter();
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onAcceptanceRef = useRef(options?.onAcceptance);

  useEffect(() => {
    onAcceptanceRef.current = options?.onAcceptance;
  }, [options?.onAcceptance]);

  useEffect(() => {
    const token = Cookie.get(ACCESS_TOKEN);
    const socketBaseUrl = resolveSocketBaseUrl();
    if (!token || !socketBaseUrl) {
      return;
    }

    const socket: Socket = io(socketBaseUrl, {
      transports: ['websocket', 'polling'],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: Infinity,
      timeout: 10000,
    });

    const scheduleRefresh = (payload?: ContractAcceptancePayload) => {
      onAcceptanceRef.current?.(payload ?? {});
      if (refreshTimerRef.current) return;
      refreshTimerRef.current = setTimeout(() => {
        router.refresh();
        refreshTimerRef.current = null;
      }, 350);
    };

    socket.on(ADMIN_CONTRACT_ACCEPTANCE, scheduleRefresh);

    return () => {
      socket.off(ADMIN_CONTRACT_ACCEPTANCE, scheduleRefresh);
      socket.disconnect();
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [router]);
};
