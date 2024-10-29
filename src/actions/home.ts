'use server';

/* eslint-disable consistent-return */

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { paths } from 'src/routes/paths';

import axiosInstance, { endpoints, getErrorMessage } from 'src/utils/axios';

interface IParams {
  page: number;
  limit: number;
}
export const fetchTopCourses = async ({ page = 1, limit = 50 }: IParams): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;

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
    throw new Error(error);
  }
};

export const fetchStatistics = async (): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;

  try {
    const res = await axiosInstance.get(endpoints.home.statistics, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res?.data;
  } catch (error) {
    throw new Error(error);
  }
};
