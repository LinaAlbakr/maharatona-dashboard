'use server';

/* eslint-disable consistent-return */

import { cookies } from 'next/headers';
import { getCookie } from 'cookies-next';

import axiosInstance, { endpoints } from 'src/utils/axios';

export const fetchPriceProfit = async (): Promise<any> => {
  const accessToken = getCookie('access_token', { cookies });
  const lang = getCookie('Language', { cookies });

  try {
    const res = await axiosInstance.get(endpoints.home.priceProfit, {
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    return res?.data;
  } catch (error) {
    console.log(error);
    // throw new Error(error);
  }
};

interface IParams {
  page?: number;
  limit?: number;
  notifications_page?: number;
  notifications_limit?: number;
  notification_type?: string | null;
  select_date?: string | null;
}
export const fetchTopCourses = async ({ page = 1, limit = 50 }: IParams): Promise<any> => {
  const accessToken = getCookie('access_token', { cookies });
  const lang = getCookie('Language', { cookies });

  try {
    const res = await axiosInstance.get(endpoints.home.topCourses, {
      params: {
        page,
        limit,
      },
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    return res?.data;
  } catch (error) {
    console.error(error);
    return error;
  }
};

// export const fetchStatistics = async (): Promise<any> => {
//   const accessToken = cookies().get('access_token')?.value;

//   try {
//     const res = await axiosInstance.get(endpoints.home.statistics, {
//       headers: { Authorization: `Bearer ${accessToken}` },
//     });
//     return res?.data;
//   } catch (error) {
//     throw new Error(error);
//   }
// };

// export const fetchNotifications = async ({
//   notifications_page = 1,
//   notifications_limit = 50,
//   notification_type = null,
//   select_date = null,
// }: IParams): Promise<any> => {
//   const accessToken = getCookie('access_token', { cookies });
//   const lang = getCookie('Language', { cookies });

//   try {
//     const res = await axiosInstance.get(endpoints.home.notifications, {
//       params: {
//         page: notifications_page,
//         limit: notifications_limit,
//         notification_type,
//         select_date,
//       },
//       headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
//     });
//     return res?.data;
//   } catch (error) {
//     throw new Error(error);
//   }
// };

// src/actions/home.ts (or wherever this lives)
export const fetchStatistics = async (): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;

  // ✅ Safe fallback structure matching your UI expectations
  const fallback = {
    clients: 0,
    clientsAndCourses: 0,
    centers: 0,
  };

  if (!accessToken) {
    console.warn('No access token — returning dummy statistics');
    return fallback;
  }

  try {
    const res = await axiosInstance.get(endpoints.home.statistics, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    // Optional: validate shape
    const data = res?.data;
    if (!data || typeof data !== 'object') {
      console.warn('Invalid statistics response format');
      return fallback;
    }

    // Ensure expected fields exist
    return {
      clients: data.clients ?? 0,
      clientsAndCourses: data.clientsAndCourses ?? 0,
      centers: data.centers ?? 0,
    };
  } catch (error: any) {
    console.error('Failed to fetch statistics:', error);
    return fallback; // ✅ Never throw — return safe dummy
  }
};
export const fetchNotifications = async ({
  notifications_page = 1,
  notifications_limit = 50,
  notification_type = null,
  select_date = null,
}: IParams): Promise<any> => {
  const accessToken = getCookie('access_token', { cookies });
  const lang = getCookie('Language', { cookies });

  // ✅ Safe fallback structure
  const fallback = {
    data: [],
    meta: {
      total: 0,
      page: notifications_page,
      limit: notifications_limit,
      totalPages: 0,
    },
    success: true,
  };

  if (!accessToken) {
    console.warn('No access token — returning empty notifications');
    return fallback;
  }

  try {
    const res = await axiosInstance.get(endpoints.home.notifications, {
      params: {
        page: notifications_page,
        limit: notifications_limit,
        notification_type,
        select_date,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Accept-Language': lang,
      },
    });

    // Optional: validate response shape
    if (!res?.data || typeof res.data !== 'object') {
      console.warn('Invalid notifications response format');
      return fallback;
    }

    return res.data;
  } catch (error: any) {
    // ✅ Log real error for debugging
    console.error('Failed to fetch notifications:', error);

    // ✅ Return safe fallback instead of throwing
    return fallback;
  }
};