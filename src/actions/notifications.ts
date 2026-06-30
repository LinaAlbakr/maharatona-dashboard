'use server';

/* eslint-disable consistent-return */

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getCookie } from 'cookies-next';

import { paths } from 'src/routes/paths';

import axiosInstance, { endpoints, getErrorMessage } from 'src/utils/axios';

interface IParams {
  page: number;
  limit: number;
  filters?: string;
  city_id?: string;
  neighborhood_id?: string;

  sort?: 'order_by' | 'new';
}

export async function sendMessage(reqBody: any): Promise<any> {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;
  try {
    const res = await axiosInstance.post(`${endpoints.notifications.send}`, reqBody, {
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },

    });
    return res?.status;
  } catch (error) {
    throw new Error(error);
  }
}

export async function sendMessageToCenter(reqBody: any): Promise<any> {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;
  try {
    const res = await axiosInstance.post(`${endpoints.notifications.sendToCenter}`, reqBody, {
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    return res.data;
  } catch (error) {
    return {
      error: getErrorMessage(error),
    };
  }
}

export async function sendMessageToClient(reqBody: any): Promise<any> {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;
  try {
    const res = await axiosInstance.post(`${endpoints.notifications.sendToClient}`, reqBody, {
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    return res.data;
  } catch (error) {
    return {
      error: getErrorMessage(error),
    };
  }
}

export async function sendMessageToAllCenters(reqBody: any): Promise<any> {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;
  try {
    const res = await axiosInstance.post(`${endpoints.notifications.sendToAllCenters}`, reqBody, {
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    return res.data;
  } catch (error) {
    return {
      error: getErrorMessage(error),
    };
  }
}

export async function sendMessageToAllClients(reqBody: any): Promise<any> {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;
  try {
    const res = await axiosInstance.post(`${endpoints.notifications.sendToAllClients}`, reqBody, {
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    return res.data;
  } catch (error) {
    return {
      error: getErrorMessage(error),
    };
  }
}

export async function fetchBookingNotificationExpand(notificationId: string): Promise<any | null> {
  const accessToken = getCookie('access_token', { cookies }) as string | undefined;
  const lang = (getCookie('Language', { cookies }) as string | undefined) ?? 'en';
  if (!notificationId?.trim() || !accessToken) {
    return null;
  }
  try {
    const res = await axiosInstance.get(endpoints.home.bookingNotificationExpand(notificationId), {
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    return res?.data?.data ?? null;
  } catch {
    return null;
  }
}

export async function fetchMergedBookingExpands(notificationIds: string[]): Promise<any | null> {
  const uniq = [...new Set(notificationIds.map((s) => String(s).trim()).filter(Boolean))];
  if (!uniq.length) return null;
  if (uniq.length === 1) return fetchBookingNotificationExpand(uniq[0]!);
  const accessToken = getCookie('access_token', { cookies }) as string | undefined;
  const lang = (getCookie('Language', { cookies }) as string | undefined) ?? 'en';
  if (!accessToken) return null;
  const rows = await Promise.all(
    uniq.map(async (id) => {
      try {
        const res = await axiosInstance.get(endpoints.home.bookingNotificationExpand(id), {
          headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
        });
        return res?.data?.data ?? null;
      } catch {
        return null;
      }
    })
  );
  const ok = rows.filter((r) => r != null && typeof r === 'object') as any[];
  if (!ok.length) return null;
  if (ok.length === 1) return ok[0];
  const rawItems = ok.flatMap((r) => (Array.isArray(r.booking_items) ? r.booking_items : []));

  /** Same order accidentally expanded twice, or duplicate notifications — drop identical lines. */
  const dedupeMergedBookingItems = (items: any[]): any[] => {
    const seen = new Set<string>();
    const out: any[] = [];
    for (const it of items) {
      const name = String(it?.child_name ?? '')
        .trim()
        .toLowerCase();
      const fe = String(it?.flexible_label_en ?? '').trim();
      const fa = String(it?.flexible_label_ar ?? '').trim();
      const time = String(it?.time ?? '').trim();
      const dur = String(it?.duration ?? '').trim();
      const sc = String(it?.sessions_count ?? '');
      const sess0 = String(it?.booked_sessions?.[0]?.date_en ?? it?.booked_sessions?.[0]?.date_ar ?? '');
      const key = `${name}|${fe}|${fa}|${time}|${dur}|${sc}|${sess0}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(it);
    }
    return out;
  };

  const booking_items = dedupeMergedBookingItems(rawItems);
  const placeholder = (name: unknown) => {
    const t = String(name ?? '')
      .trim()
      .replace(/^the\s+client\s+/i, '');
    return !t || /^parent$/i.test(t) || /^client$/i.test(t);
  };
  const parentFromRows =
    ok.map((r) => r.parent).find((p) => p?.name && !placeholder(p.name)) ?? ok[0].parent;
  const phone =
    ok.map((r) => r.parent?.phone).find((ph) => ph != null && String(ph).trim() !== '') ??
    parentFromRows?.phone;
  return {
    ...ok[0],
    booking_items,
    parent: parentFromRows
      ? { ...parentFromRows, phone: phone ?? parentFromRows.phone }
      : ok[0].parent,
  };
}