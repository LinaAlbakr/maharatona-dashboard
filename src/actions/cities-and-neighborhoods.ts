import { cities } from './../_mock/map/cities';
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
  cityId?: string;
}
export const fetchCities = async ({
  page = 1,
  limit = 50,
  filters = '',
}: IParams): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;

  try {
    const res = await axiosInstance.get(endpoints.citiesAndNeighborhoods.fetchCities, {
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

export const editCityStatus = async (city: any): Promise<any> => {
  try {
    const accessToken = cookies().get('access_token')?.value;
    const res = await axiosInstance.put(
      endpoints.citiesAndNeighborhoods.changeCityStatus(city.id, !city.is_active),
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    revalidatePath(paths.dashboard.citiesAndNeighborhoods);
    return res.data;
  } catch (error) {
    return {
      error: getErrorMessage(error),
    };
  }
};

export const fetchNeighborhoods = async ({
  page = 1,
  limit = 50,
  filters = '',
  cityId = '',
}: IParams): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;

  try {
    const res = await axiosInstance.get(
      endpoints.citiesAndNeighborhoods.fetchNeighborhoods(cityId),
      {
        params: {
          page,
          limit,
          by_name: filters,
          cityId,
        },
        headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
      }
    );
    return res?.data;
  } catch (error) {
    throw new Error(error);
  }
};

export const editNeighborhoodStatus = async (neighborhood: any): Promise<any> => {
  try {
    const accessToken = cookies().get('access_token')?.value;
    const res = await axiosInstance.put(
      endpoints.citiesAndNeighborhoods.changeNeighborhoodStatus(
        neighborhood.id,
        !neighborhood.is_active
      ),
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    revalidatePath(paths.dashboard.citiesAndNeighborhoods);
  } catch (error) {
    return {
      error: getErrorMessage(error),
    };
  }
};

export const newCity = async (reqBody: any): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;
  try {
    const res = await axiosInstance.post(endpoints.citiesAndNeighborhoods.newCity, reqBody, {
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
  revalidatePath('/dashboard/cities-and-neighborhoods//');
};

