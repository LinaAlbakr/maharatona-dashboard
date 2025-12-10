'use server';

/* eslint-disable consistent-return */

import { cookies } from 'next/headers';
import { getCookie } from 'cookies-next';

import axiosInstance, { endpoints } from 'src/utils/axios';

// Import endpoints.courses to use fetchCourses endpoint

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
    // Use fetchCourses endpoint instead of topCourses
    const res = await axiosInstance.get(endpoints.courses.fetch, {
      params: {
        page,
        limit,
      },
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    
    // Transform the new API response structure to match the expected format
    const responseData = res?.data;
    if (responseData?.data) {
      // Normalize course objects to match expected format
      const normalizedDocs = (responseData.data.docs || []).map((course: any) => {
        // Determine name based on language
        const courseName = lang === 'ar' ? course.name_ar : course.name_en;
        
        return {
          ...course,
          id: course._id || course.id,
          name: courseName || course.name_ar || course.name_en || course.name,
          logo_url: Array.isArray(course.course_images) && course.course_images.length > 0 
            ? course.course_images[0] 
            : '',
          number_of_users: Array.isArray(course.clients) ? course.clients.length : 0,
          students: course.clients || course.students || [],
          seats: course.seats_left !== undefined && course.seats_left !== null ? course.seats_left : course.seats,
        };
      });

      return {
        data: normalizedDocs,
        meta: {
          itemCount: responseData.data.totalDocs || 0,
          page: responseData.data.page || page,
          limit: responseData.data.limit || limit,
          totalPages: responseData.data.totalPages || 1,
          hasNextPage: responseData.data.hasNextPage || false,
          hasPrevPage: responseData.data.hasPrevPage || false,
        },
        message: responseData.message,
      };
    }
    return responseData;
  } catch (error) {
    console.error(error);
    return { data: [], meta: { itemCount: 0 } };
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
    const [clientsRes, centersRes, enrolledClientsRes] = await Promise.all([
      axiosInstance.get(endpoints.home.totalClients, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      axiosInstance.get(endpoints.home.totalCenters, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      axiosInstance.get(endpoints.home.enrolledClientsCount, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    ]);

    const clientsTotal = clientsRes?.data?.data?.total ?? 0;
    const centersTotal = centersRes?.data?.data?.total ?? 0;
    const enrolledClientsTotal = enrolledClientsRes?.data?.data?.total ?? 0;

    return {
      clients: clientsTotal,
      clientsAndCourses: enrolledClientsTotal,
      centers: centersTotal,
    };
  } catch (error: any) {
    console.error('Failed to fetch totals:', error);
    return fallback;
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
      itemCount: 0,
      page: notifications_page,
      limit: notifications_limit,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
    },
    message: '',
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

    const response = res?.data;
    const payload = response?.data;

    if (!payload || !Array.isArray(payload.docs)) {
      console.warn('Invalid notifications response format');
      return fallback;
    }

    const mappedDocs = payload.docs.map((doc: any) => ({
      id: doc._id || doc.id,
      notification_type: doc.notification_type,
      is_read: doc.is_read,
      title:
        lang === 'ar'
          ? doc.title_ar || doc.title_en || ''
          : doc.title_en || doc.title_ar || '',
      message:
        lang === 'ar'
          ? doc.message_ar || doc.message_en || ''
          : doc.message_en || doc.message_ar || '',
      created_at: doc.createdAt || doc.created_at,
    }));

    return {
      data: mappedDocs,
      meta: {
        itemCount: payload.totalDocs ?? mappedDocs.length,
        page: payload.page ?? notifications_page,
        limit: payload.limit ?? notifications_limit,
        totalPages: payload.totalPages ?? 0,
        hasNextPage: payload.hasNextPage ?? false,
        hasPrevPage: payload.hasPrevPage ?? false,
      },
      message: response?.message ?? '',
      success: true,
    };
  } catch (error: any) {
    // ✅ Log real error for debugging
    console.error('Failed to fetch notifications:', error);

    // ✅ Return safe fallback instead of throwing
    return fallback;
  }
};