'use server';

/* eslint-disable consistent-return */

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { paths } from 'src/routes/paths';

import axiosInstance, { endpoints, getErrorMessage } from 'src/utils/axios';

interface IParams {
  page: number;
  limit: number;
  filters?: string;
  type?: string | null;
}
export const fetchCoupons = async ({
  page = 1,
  limit = 50,
  filters = '',
  type = null,
}: IParams): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;
  console.log(page, limit, filters, type);

  try {
    const res = await axiosInstance.get(endpoints.coupons.fetch, {
      params: {
        page,
        limit,
        by_name: filters,
        discountCreateType: type,
      },
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    console.log(res?.data);

    return res?.data;
  } catch (error) {
    console.log(error);

    throw new Error(error);
  }
};

export const deleteCoupon = async (couponId: string): Promise<any> => {
  try {
    const accessToken = cookies().get('access_token')?.value;
    const lang = cookies().get('Language')?.value;

    const res = await axiosInstance.delete(endpoints.centers.deleteReview(couponId), {
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
  revalidatePath(`/dashboard/coupons`);
};
