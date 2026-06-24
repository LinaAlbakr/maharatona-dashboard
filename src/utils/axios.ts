import { getCookie } from 'cookies-next';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

import { HOST_API } from 'src/config-global';

import { ACCESS_TOKEN } from '../auth/constants';

export interface Params {
  page: number;
  limit: number;
  status?: string;
  filters?: string;
  created_at?: string;
  headers?: { access_token: string };
}
const axiosInstance: AxiosInstance = axios.create({
  baseURL: HOST_API,
  headers: {
    'Content-Type': 'application/json',
    /*     'Accept-Language':lang,
     */ 'Access-Control-Allow-Origin': '*',
    Accept: 'application/json',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
  },
});
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getCookie(ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
//
function normalizeAxiosError(error: unknown): Error {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as unknown;

    if (data && typeof data === 'object' && data !== null && 'message' in data) {
      const m = (data as { message?: unknown }).message;
      if (m !== undefined && m !== null) {
        const text = typeof m === 'string' ? m : JSON.stringify(m);
        return new Error(text);
      }
    }
    if (typeof data === 'string' && data.trim()) {
      return new Error(data);
    }
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return new Error(
        `Cannot reach API (${HOST_API}). Use the backend URL (not the Next dev server), e.g. http://localhost:5000/api — ${error.code}`
      );
    }
    if (status) {
      return new Error(
        error.message
          ? `${error.message} (HTTP ${status})`
          : `Request failed with HTTP ${status}`
      );
    }
    if (error.message) {
      return new Error(error.message);
    }
  }
  if (error instanceof Error) {
    return error;
  }
  return new Error(typeof error === 'string' ? error : 'Something went wrong');
}

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(normalizeAxiosError(error))
);

export default axiosInstance;

export const baseUrl = HOST_API;

export const fetcher = async ({ url, config }: { url: string; config?: AxiosRequestConfig }) => {
  // Use axiosInstance directly instead of creating a new instance
  const response = await axiosInstance.get(url, {
    ...config,
    headers: {
      Authorization: `Bearer ${getCookie(ACCESS_TOKEN)}`,
      /*       'Accept-Language': lang,
       */
    },
  });

  return response.data;
};
/** Normalize API error bodies (axios interceptor rejects with `response.data`). */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (error && typeof error === 'object') {
    const obj = error as Record<string, unknown>;
    if (typeof obj.message === 'string' && obj.message.trim()) {
      return obj.message;
    }
    if ('message' in obj && obj.message != null) {
      return String(obj.message);
    }
    // e.g. admin auth middleware: `{ error: "User not authorized..." }`
    if (typeof obj.error === 'string' && obj.error.trim()) {
      return obj.error;
    }
    if (obj.error && typeof obj.error === 'object' && obj.error !== null && 'message' in obj.error) {
      return String((obj.error as { message: unknown }).message);
    }
    if (obj.data && typeof obj.data === 'object' && obj.data !== null) {
      const nested = obj.data as Record<string, unknown>;
      if (typeof nested.message === 'string' && nested.message.trim()) {
        return nested.message;
      }
    }
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Something went wrong';
};

export const endpoints = {
  auth: {
    me: '/auth/me',
    login: 'admin/auth/login',
    register: '/auth/register',
    forgot: `/auth/send-password-reset-otp`,
    verify: `/auth/verify-otp-and-reset-password`,
    updateLanguage: '/admin/auth/update-language',
  },
  maintenance: {
    set: '/admin/maintenance',
  },
  home: {
    priceProfit: '/admin-panel/get-price-profit',
    topCourses: '/admin/get-top-courses',
    statistics: '/admin-panel/education-summary',
    notifications: '/admin/get-all-notifications',
    bookingNotificationExpand: (notificationId: string) =>
      `admin/notification/${notificationId}/booking-expand`,
    totalClients: '/admin/get-total-clients',
    totalCenters: '/admin/get-total-centers',
    enrolledClientsCount: '/admin/get-enrolled-clients-count',
    totalBookingsCount: '/admin/get-total-bookings-count',
  },
  centers: {
    fetch: '/admin/get-all-centers',
    centerNames: '/admin/get-all-center-names',
    cities: '/admin/get-all-cities',
    neighborhoods: '/admin/get-all-neighbourhoods',
    info: (centerId: string) => `/admin/get-center-details/${centerId}`,
    courses: (centerId: string) => `/admin-panel/center/${centerId}/courses`,
    reports: (centerId: string) => `/admin/reports/${centerId}`,
    reviews: (centerId: string) => `/admin-panel/center/${centerId}/reviews`,
    changeStatus: (centerId: string) => `/admin/deactivate-center/${centerId}`,
    deleteReview: (centerId: string, reviewId: string) =>
      `/admin/delete-center-review/${centerId}/${reviewId}`,
    clearWallet: (centerId: string) => `/admin-panel/clearing-the-center-wallet/${centerId}`,
    deleteCenter: (centerId: string) => `/admin/delete-center/${centerId}`,
    updateCenter: (centerId: string) => `/admin/update-center/${centerId}`,
    createCourse: (centerId: string) => `/admin/center/${centerId}/create-course`,
    createFlexibleCourse: (centerId: string) =>
      `/admin/center/${centerId}/create-flexible-course`,
    updateCourse: (centerId: string, courseId: string) =>
      `/admin/center/${centerId}/update-course/${courseId}`,
  },
  courses: {
    fetch: '/admin/get-all-courses',
    percentage: () => `/admin-panel/update-price-profit`,
    info: (courseId: string) => `/admin/get-course-details/${courseId}`,
    deleteCourse: (courseId: string) => `/admin/delete-course/${courseId}`,
    editStatus: (courseId: string) => `/admin/toggle-course-status/${courseId}`,
    enrollmentStatus: (courseId: string) => `/admin/course-enrollment-status/${courseId}`,
  },
  clients: {
    fetch: '/admin/get-all-clients',
    cities: '/city-neighborhood/all-cities',
    fetchfields: '/admin-panel/all-fields',
    info: (clientId: string) => `/admin/get-client-details/${clientId}`,
    changeStatus: (clientId: string) => `/admin/deactivate-client/${clientId}`,
    courses: (clientId: string) => `/admin-panel/client/${clientId}/courses`,
    children: (clientId: string) => `/admin-panel/client/${clientId}/children`,
    delete: (clientId: string) => `/admin/delete-client/${clientId}`,
    updateClient: (clientId: string) => `/admin/update-client/${clientId}`,
  },
  notifications: {
    send: '/notification/send-to-users',
    sendToCenter: '/admin/send-notification-center',
    sendToClient: '/admin/send-notification-client',
  },
  profile: {
    changePhone: `/admin/auth/change-phone-number`,
  },
  support: {
    contact_reasons: {
      fetch: '/admin/get-all-calls-reasons',
      delete_reason: (reasonId: string) => `/admin/delete-calls-reason/${reasonId}`,
      new: '/admin/add-calls-reason',
      edit: (reasonId: string) => `/admin/update-calls-reason/${reasonId}`,
    },
    technical_support: {
      fetch: '/client/get-all-technical-support',
      details: (itemId: string) => `/client/get-technical-support-details/${itemId}`,
    },
  },
  categories: {
    fetch: '/admin/get-all-fields',
    deleteField: (reviewId: string) => `/admin-panel/center-review/${reviewId}`,
    new: `/admin/create-field`,
    edit: (fieldId: string) => `/admin/deactivate-field/${fieldId}`,
    editfield: (fieldId: string) => `/admin/update-field/${fieldId}`,
    deleteCategory: (categoryId: string) => `/admin/delete-field/${categoryId}`,
  },
  coupons: {
    fetch: '/admin/get-all-coupons',
    deleteCoupon: (couponId: string) => `/admin/delete-coupon/${couponId}`,
    new: `/admin/create-coupon`,
  },
  staticPage: {
    fetch: (type: string) => `/admin/get-static-page-by-type/${type}`,
    create: '/admin/create-static-page',
    edit: (id: string) => `/admin/update-static-page/${id}`,
  },
  faq: {
    fetchFaqCategoriesStudent: '/admin/get-all-faq-categories',
    fetchFaqCategoriesCenter: '/admin/get-all-faq-categories',
    newCategory: '/admin/create-faq-category',
    editCategory: (categoryId: string) => `/admin/update-faq-category/${categoryId}`,
    deleteCategory: (categoryId: string) => `/admin/delete-faq-category/${categoryId}`,
    fetchQuestions: '/admin/get-all-faq-items',
    newQuestion: '/admin/create-faq-item',
    editQuestion: (questionId: string) => `/admin/update-faq-item/${questionId}`,
    deleteQuestion: (questionId: string) => `/admin/delete-faq-item/${questionId}`,
  },
  citiesAndNeighborhoods: {
    fetchCities: '/admin/get-all-cities',
    changeCityStatus: (cityId: string) => `/admin/toggle-city-status/${cityId}`,
    fetchNeighborhoods: (cityId: string) => `/admin/get-neighbourhood-by-city/${cityId}`,
    changeNeighborhoodStatus: (neighborhoodId: string) =>
      `/admin/deactivate-neighbourhood/${neighborhoodId}`,
    newCity: '/admin/create-city',
    newNeighborhood: '/admin/create-neighbourhood',
    deleteCity: (cityId: string) => `/admin/delete-city/${cityId}`,
    deleteNeighborhood: (id: string) => `admin/delete-neighbourhood/${id}`,
  },
  banners: {
    fetch: '/admin/get-all-packages',
    bannerDetails: (id: string) => `/admin/package/${id}`,
    bannerCenters: (id: string, page: number, limit: number) =>
      `/admin-panel/all-advertisements-center/${id}?page=${page}&limit=${limit}`,
    newBanner: `/admin/create-package`,
    editBanner: (bannerId: string) => `/admin/update-package/${bannerId}`,
    togglePackage: (id: string) => `/admin/toggle-package/${id}`,
    toggleBanner: (id: string) => `/admin/toggle-banner/${id}`,
    changeCenterMediaStatus: (centerId: string, centerStatus: boolean) =>
      `/admin-panel/update-activation-advertisement-center/${centerId}/${centerStatus}`,
    fields: '/field/all-fields',
    fieldsName: '/admin/get-all-fields-names',
    // Create a banner (advertisement) under a specific package
    // POST /admin/create-banner/:packageId
    addBanner: (packageId: string) => `/admin/create-banner/${packageId}`,
    deletebannerCenters: (bannerId: string) =>
      `/admin/delete-banner/${bannerId}`,
    deleteBanner: (bannerId: string) => `/admin/delete-package/${bannerId}`,
  },
  payouts: {
    create: '/admin/create-payout',
    fetch: '/admin/get-all-payouts',
    delete: (payoutId: string) => `/admin/delete-payout/${payoutId}`,
  },
  invoices: {
    fetch: '/client/get-invoices',
  },
};
