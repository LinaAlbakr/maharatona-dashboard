'use server';

/* eslint-disable consistent-return */

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { paths } from 'src/routes/paths';

import axiosInstance, { endpoints, getErrorMessage } from 'src/utils/axios';
import { StaticPageReqBody } from 'src/types/static-pages';

export const fetchStaticPage = async (type: string): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;

  try {
    const url = endpoints.staticPage.fetch(type);
    const headers = { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang } as const;
    console.log('[fetchStaticPage] type:', type);
    console.log('[fetchStaticPage] url:', url);
    console.log('[fetchStaticPage] headers:', { hasAuth: !!accessToken, lang });
    
    const res = await axiosInstance.get(url, {
      headers,
    });
    
    console.log('[fetchStaticPage] response.data:', res?.data);
    // New API returns { data: { ...page } }
    return res?.data?.data;
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

export const editStaticPage = async (data: FormData): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  try {
    const res = await axiosInstance.patch(endpoints.staticPage.edit, data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return res?.data;
  } catch (error: any) {
    console.log('error', error);
    throw new Error(error);
  }
};
