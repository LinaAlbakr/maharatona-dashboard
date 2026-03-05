'use server';

/* eslint-disable consistent-return */

import { cookies } from 'next/headers';


import axiosInstance, { endpoints, getErrorMessage } from 'src/utils/axios';

export const fetchStaticPage = async (type: string): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;

  try {
    const url = endpoints.staticPage.fetch(type);
    const headers = { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang } as const;
    const res = await axiosInstance.get(url, {
      headers,
    });
    
    // New API returns { data: { ...page } }
    const payload = res?.data?.data || {};
    // Normalize id for downstream editors
    return { ...payload, id: payload?.id ?? payload?._id };
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('[fetchStaticPage] error raw:', error);
    console.error('[fetchStaticPage] error message:', message);
    // If the backend replies with not-found, don't crash the page; return a safe default
    if (typeof message === 'string' && message.toLowerCase().includes('not found')) {
      console.warn('[fetchStaticPage] returning empty static page for type:', type);
      return {
        id: '',
        static_page_type: type,
        content_ar: '',
        content_en: '',
        image: '',
        created_at: '',
        updated_at: '',
      };
    }
    throw new Error(message);
  }
};

export const createStaticPage = async (
  data: FormData | Record<string, any>
): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  try {
    const isFormData = typeof (data as any).forEach === 'function' && typeof (data as any).get === 'function';
    
    const res = await axiosInstance.post(endpoints.staticPage.create, data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' }),
      },
    });
    
    return res?.data;
  } catch (error: any) {
    console.error('[createStaticPage] error:', error);
    throw new Error(getErrorMessage(error));
  }
};

export const editStaticPage = async (
  pageId: string,
  data: FormData | Record<string, any>
): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  try {
    const isFormData = typeof (data as any).forEach === 'function' && typeof (data as any).get === 'function';

    const res = await axiosInstance.put(endpoints.staticPage.edit(pageId), data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' }),
      },
    });
    return res?.data;
  } catch (error: any) {
    console.error('[editStaticPage] error:', error);
    throw new Error(getErrorMessage(error));
  }
};
