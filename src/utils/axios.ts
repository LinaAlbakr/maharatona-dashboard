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
    Authorization: `Bearer ${getCookie(ACCESS_TOKEN)}`,
  },
});
axiosInstance.interceptors.request.use(
  (config) =>
    /*     config.headers['Accept-Language'] = lang;
     */ config,
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
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
export const getErrorMessage = (error: unknown): string => {
  let message: string;
  if (error instanceof Error) {
    // eslint-disable-next-line prefer-destructuring
    message = error.message;
  } else if (error && typeof error === 'object' && 'message' in error) {
    message = String(error.message);
  } else if (typeof error === 'string') {
    message = error;
  } else {
    message = 'Something went wrong';
  }
  return message;
};

export const endpoints = {
  auth: {
    me: '/auth/me',
    login: 'admin/auth/login',
    register: '/auth/register',
    forgot: `/auth/send-password-reset-otp`,
    verify: `/auth/verify-otp-and-reset-password`,
  },
  home: {
    priceProfit: '/admin-panel/get-price-profit',
    topCourses: '/admin-panel/top-courses',
    statistics: '/admin-panel/education-summary',
    notifications: '/admin-panel/all-notification',
  },
  centers: {
    fetch: '/admin/get-all-centers',
    cities: '/admin/get-all-cities',
    neighborhoods: '/admin/get-all-neighbourhoods',
    info: (centerId: string) => `/admin/get-center-details/${centerId}`,
    courses: (centerId: string) => `/admin-panel/center/${centerId}/courses`,
    reports: (centerId: string) => `/admin-panel/center/${centerId}/reports`,
    reviews: (centerId: string) => `/admin-panel/center/${centerId}/reviews`,
    changeStatus: (centerId: string) => `/admin-panel/center/${centerId}/change-status`,
    deleteReview: (reviewId: string) => `/admin-panel/center-review/${reviewId}`,
    clearWallet: (centerId: string) => `/admin-panel/clearing-the-center-wallet/${centerId}`,
    deleteCenter: (centerId: string) => `/admin-panel/center/${centerId}`,
  },
  courses: {
    fetch: '/admin-panel/all-courses',
    percentage: () => `/admin-panel/update-price-profit`,
    info: (courseId: string) => `/admin-panel/course/${courseId}`,
    deleteCourse: (courseId: string) => `/admin-panel/delete-course/${courseId}`,
    editStatus: (courseId: string) => `/admin-panel/update-course/${courseId}`,
  },
  clients: {
    fetch: '/admin/get-all-clients',
    cities: '/city-neighborhood/all-cities',
    fetchfields: '/admin-panel/all-fields',
    info: (clientId: string) => `/admin/get-client-details/${clientId}`,
    changeStatus: (clientId: string) => `/admin-panel/client/${clientId}/change-status`,
    courses: (clientId: string) => `/admin-panel/client/${clientId}/courses`,
    children: (clientId: string) => `/admin-panel/client/${clientId}/children`,
    delete: (clientId: string) => `/admin-panel/client/${clientId}`,
  },
  notifications: {
    send: '/notification/send-to-users',
  },
  profile: {
    changePhone: `/auth/update-phone-or-email`,
  },
  support: {
    calls_reasons: {
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
    fetch: '/center/get-all-fields',
    deleteField: (reviewId: string) => `/admin-panel/center-review/${reviewId}`,
    new: `/admin/create-field`,
    edit: (fieldId: string) => `/admin/update-field/${fieldId}`,
    deleteCategory: (categoryId: string) => `/admin/delete-field/${categoryId}`,
  },
  coupons: {
    fetch: '/admin-panel/all-discount-code',
    deleteCoupon: (couponId: string) => `/admin-panel/delete-discount-code/${couponId}`,
    new: `/admin-panel/create-discount-code`,
  },
  staticPage: {
    fetch: (type: string) => `/admin/get-static-page-by-type/${type}`,
    create: '/admin/create-static-page',
    edit: (id: string) => `/admin/update-static-page/${id}`,
  },
  faq: {
    fetchFaqCategoriesStudent: '/admin/get-all-faq-items',
    fetchFaqCategoriesCenter: '/admin/get-all-faq-items',
    newCategory: '/admin/create-faq-category',
    editCategory: (categoryId: string) => `/admin/update-faq-category/${categoryId}`,
    deleteCategory: (categoryId: string) => `/admin-panel/delete-faq-category/${categoryId}`,
    fetchQuestions: '/admin/get-all-faq-items',
    newQuestion: '/admin/create-faq-item',
    editQuestion: (questionId: string) => `/admin/update-faq-item/${questionId}`,
    deleteQuestion: (questionId: string) => `/admin-panel/faq-item/${questionId}`,
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
    fetch: '/admin-panel/all-advertisements',
    bannerDetails: (id: string) => `/admin-panel/single-advertisement/${id}`,
    bannerCenters: (id: string, page: number, limit: number) =>
      `/admin-panel/all-advertisements-center/${id}?page=${page}&limit=${limit}`,
    newBanner: `/admin-panel/center-buy-advertisement`,
    editBanner: (bannerId: string) => `/admin-panel/update-advertisement/${bannerId}`,
    changeCenterMediaStatus: (centerId: string, centerStatus: boolean) =>
      `/admin-panel/update-activation-advertisement-center/${centerId}/${centerStatus}`,
    fields: '/field/all-fields',
    addBanner: '/admin-panel/admin-buy-advertisement',
    deletebannerCenters: (bannerId: string) =>
      `/admin-panel/delete-advertisement-center/${bannerId}`,
    deleteBanner: (bannerId: string) => `/admin-panel/delete-advertisement/${bannerId}`,
  },
};
