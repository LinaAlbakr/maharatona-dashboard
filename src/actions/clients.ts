'use server';

/* eslint-disable consistent-return */

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { paths } from 'src/routes/paths';

import axiosInstance, { endpoints, getErrorMessage } from 'src/utils/axios';

interface IParams {
  page: number;
  limit: number;
  city_id?: string;
  by_client_field_ids?: string;

  sort?: 'order_by' | 'new';
}
export const fetchClients = async ({
  page = 1,
  limit = 50,
  city_id = '',
  by_client_field_ids = '',
}: IParams): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;
  try {
    const res = await axiosInstance.get(endpoints.clients.fetch, {
      params: {
        page,
        limit,
        by_city_id: city_id,

        by_client_field_ids: by_client_field_ids ? by_client_field_ids : null,
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
export const fetchfields = async (): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;

  try {
    const res = await axiosInstance.get(endpoints.clients.fetchfields, {
      params: {
        page: 1,
        limit: 100,
      },
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    return res?.data.data;
  } catch (error) {
    throw new Error(error);
  }
};

export const fetchClientInfo = async (centerId: string): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;

  try {
    const res = await axiosInstance.get(endpoints.clients.info(centerId), {
      params: {},
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    return res?.data;
  } catch (error) {
    throw new Error(error);
  }
};

export async function changeClientStatus(clientId: string, reqBody: any): Promise<any> {
  const accessToken = cookies().get('access_token')?.value;
  try {
    const res = await axiosInstance.patch(endpoints.clients.changeStatus(clientId), reqBody, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    revalidatePath('/dashboard/clients/');
    return res?.status;
  } catch (error) {
    throw new Error(error);
  }
}

export const fetchClientCourses = async (page = 1, limit = 50, centerId: string): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;

  try {
    const res = await axiosInstance.get(endpoints.clients.courses(centerId), {
      params: { page, limit },
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    return res?.data;
  } catch (error) {
    throw new Error(error);
  }
};
