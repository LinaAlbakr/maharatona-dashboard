'use server';

/* eslint-disable consistent-return */

import { cookies } from 'next/headers';


import axiosInstance, { endpoints, getErrorMessage } from 'src/utils/axios';

interface IParams {
  page: number;
  limit: number;
  filters?: string;
}
export const fetchCourses = async ({
  page = 1,
  limit = 50,
  filters = '',
}: IParams): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;

  try {
    const res = await axiosInstance.get(endpoints.courses.fetch, {
      params: {
        page,
        limit,
        by_name: filters,

      },
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    return res?.data;
  } catch (error) {
    throw new Error(error);
  }
};

