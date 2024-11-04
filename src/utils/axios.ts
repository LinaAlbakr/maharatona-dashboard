import Cookie from 'js-cookie';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

import { HOST_API } from 'src/config-global';

import { ACCESS_TOKEN } from '../auth/constants';
import { stat } from 'fs';

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
    'Accept-Language': Cookie.get('Language') ? Cookie.get('Language') : 'en',
    'Access-Control-Allow-Origin': '*',
    Accept: 'application/json',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
    Authorization: `Bearer ${Cookie.get(ACCESS_TOKEN)}`,
  },
});
axios.interceptors.request.use(
  (config) => {
    config.headers['Accept-Language'] = Cookie.get('Language');
    return config;
  },
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
      Authorization: `Bearer ${Cookie.get(ACCESS_TOKEN)}`,
      'Accept-Language': Cookie.get('Language') || 'en',
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
    login: '/auth/signin',
    register: '/auth/register',
  },
  home: {
    topCourses: '/admin-panel/top-courses',
    statistics: '/admin-panel/education-summary',
  },
  centers: {
    fetch: '/admin-panel/all-centers',
    cities: '/city-neighborhood/all-cities',
    neighborhoods: (cityId: string) => `/city-neighborhood/all-neighborhoods/${cityId}`,
    info: (centerId: string) => `/admin-panel/center/${centerId}`,
    courses: (centerId: string) => `/admin-panel/center/${centerId}/courses`,
    reports: (centerId: string) => `/admin-panel/center/${centerId}/reports`,
    reviews: (centerId: string) => `/admin-panel/center/${centerId}/reviews`,
    changeStatus: (centerId: string) => `/admin-panel/center/${centerId}/change-status`,
    deleteReview: (reviewId: string) => `/admin-panel/center-review/${reviewId}`,
  },
  courses: {
    fetch: '/admin-panel/all-courses',
    info: (courseId: string) => `/admin-panel/course/${courseId}`,
  },
  clients: {
    fetch: '/admin-panel/all-clients',
    cities: '/city-neighborhood/all-cities',
    fetchfields: '/admin-panel/all-fields',
    info: (clientId: string) => `/admin-panel/client/${clientId}`,
    changeStatus: (clientId: string) => `/admin-panel/client/${clientId}/change-status`,
    courses: (clientId: string) => `/admin-panel/client/${clientId}/courses`,
    children: (clientId: string) => `/admin-panel/client/${clientId}/children`,
  },
  notifications: {
    send: '/notification/send-to-users',
  },
  support: {
    calls_reasons: {
      fetch: '/admin-panel/all-call-us-reasons',
      delete_reason: (reasonId: string) => `/admin-panel/delete-call-us-reason/${reasonId}`,
      new: '/admin-panel/create-reason-call-us',
      edit: (reasonId: string) => `/admin-panel/update-call-us-reason/${reasonId}`,
    },
    technical_support: {
      fetch: '/admin-panel/all-call-us',
      details: (itemId: string) => `/admin-panel/call-us/${itemId}`,
    },
  },
  categories: {
    fetch: '/admin-panel/all-fields',
    deleteField: (reviewId: string) => `/admin-panel/center-review/${reviewId}`,
    new: `/admin-panel/create-field`,
    edit: (fieldId: string) => `/admin-panel/update-field/${fieldId}`,
  },
  coupons: {
    fetch: '/admin-panel/all-discount-code',
    deleteCoupon: (couponId: string) => `/admin-panel/delete-discount-code/${couponId}`,
    new: `/admin-panel/create-discount-code`,

  },
};
