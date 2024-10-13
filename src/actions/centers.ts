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
  city_id?: string;
  neighborhood_id?: string;

  sort?: 'order_by' | 'new';
}
export const fetchCenters = async ({
  page = 1,
  limit = 50,
  filters = '',
  city_id = '',
  neighborhood_id = '',
}: IParams): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;

  try {
    const res = await axiosInstance.get(endpoints.centers.fetch, {
      params: {
        page,
        limit,
        by_name: filters,
        by_city_id: city_id,
        by_neighborhood_id: neighborhood_id,
      },
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    return res?.data;
  } catch (error) {
    throw new Error(error);
  }
};

export const fetchCities = async (): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;

  try {
    const res = await axiosInstance.get(endpoints.centers.cities, {
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    return res?.data.data;
  } catch (error) {
    throw new Error(error);
  }
};
export const fetchCityNeighborhoods = async ({ cityId }: { cityId: string }): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;

  try {
    const res = await axiosInstance.get(endpoints.centers.neighborhoods(cityId), {
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    return res?.data.data;
  } catch (error) {
    throw new Error(error);
  }
};
