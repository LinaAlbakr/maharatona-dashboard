'use server';

/* eslint-disable consistent-return */

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { paths } from 'src/routes/paths';

import axiosInstance, { endpoints, getErrorMessage } from 'src/utils/axios';

interface IParams {
  page?: number; // Optional, not used anymore but kept for backward compatibility
  limit: number;
  filters?: string;
  type?: string | null;
}
export const fetchCoupons = async ({
  limit = 50,
  filters = '',
  type = null,
}: IParams): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;
  try {
    const res = await axiosInstance.get(endpoints.coupons.fetch, {
      params: {
        limit,
        search: filters,
        discount_create_type: type,
      },
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    
    // Handle new response structure: data is now an array directly
    const couponsData = Array.isArray(res?.data?.data) ? res.data.data : [];
    
    return {
      data: couponsData,
      message: res?.data?.message,
    };
  } catch (error) {
    throw new Error(error);
  }
};

export const deleteCoupon = async (couponId: string): Promise<any> => {
  try {
    const accessToken = cookies().get('access_token')?.value;

    const res = await axiosInstance.delete(endpoints.coupons.deleteCoupon(couponId), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    revalidatePath(`/dashboard/coupons`);
    return res?.status;
  } catch (error) {
    return {
      error: getErrorMessage(error),
    };
  }
};

export const newCoupon = async (reqBody: any): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;
  try {
    const res = await axiosInstance.post(endpoints.coupons.new, reqBody, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Accept-Language': lang,
      },
    });
  } catch (error) {
    return {
      error: getErrorMessage(error),
    };
  }
  revalidatePath('/dashboard/coupons/');
};
