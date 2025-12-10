'use server';

/* eslint-disable @typescript-eslint/default-param-last */

/* eslint-disable consistent-return */

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import axiosInstance, { endpoints, getErrorMessage } from 'src/utils/axios';

interface IParams {
  page: number;
  limit: number;
  city_id?: string;
  by_client_field_ids?: string;
  by_name?: string;

  sort?: 'order_by' | 'new';
}
export const fetchClients = async ({
  page = 1,
  limit = 50,
  city_id = '',
  by_client_field_ids = '',
  by_name = '',
}: IParams): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;
  try {
    const res = await axiosInstance.get(endpoints.clients.fetch, {
      params: {
        page,
        limit,
        by_city_id: city_id,
        by_client_field_ids: by_client_field_ids || null,
        by_name,
      },
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    
    // Handle new response structure
    const responseData = res?.data;
    
    // Check if response has docs array (new paginated structure) or direct data array
    let clientsData: any[] = [];
    let itemCount = 0;
    let currentPage = page;
    let totalPages = 1;
    
    if (responseData?.data?.docs) {
      // New paginated structure with docs array
      clientsData = responseData.data.docs || [];
      itemCount = responseData.data.totalDocs || 0;
      currentPage = responseData.data.page || page;
      totalPages = responseData.data.totalPages || 1;
    } else if (Array.isArray(responseData?.data)) {
      // Direct array structure
      clientsData = responseData.data;
      itemCount = responseData?.pagination?.totalItems || clientsData.length;
      currentPage = responseData?.pagination?.currentPage || page;
      totalPages = responseData?.pagination?.totalPages || 1;
    } else if (Array.isArray(responseData)) {
      // Response is directly an array
      clientsData = responseData;
      itemCount = responseData.length;
      currentPage = page;
      totalPages = 1;
    }
    
    // Transform the response to match the expected structure
    return {
      data: clientsData,
      pagination: responseData?.pagination || responseData?.data || {},
      meta: {
        itemCount,
        currentPage,
        totalPages,
      },
    };
  } catch (error) {
    console.error('Failed to fetch clients:', error);
    throw new Error(getErrorMessage(error));
  }
};

export const fetchCities = async (): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;

  try {
    const res = await axiosInstance.get(endpoints.centers.cities, {
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    // Handle new response structure: data is now an array directly
    return Array.isArray(res?.data?.data) ? res.data.data : [];
  } catch (error) {
    console.error('Failed to fetch cities:', error);
    throw new Error(getErrorMessage(error));
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

export const fetchClientInfo = async (clientId: string): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;

  try {
    const res = await axiosInstance.get(endpoints.clients.info(clientId), {
      params: {},
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    
    // Handle new response structure with data wrapper
    return res?.data?.data || res?.data;
  } catch (error) {
    console.error('Failed to fetch client info:', error);
    throw new Error(getErrorMessage(error));
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

export const fetchClientCourses = async (page = 1, limit = 50, clientId: string): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;

  try {
    const res = await axiosInstance.get(endpoints.clients.courses(clientId), {
      params: { page, limit },
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    return res?.data;
  } catch (error) {
    throw new Error(error);
  }
};
export const fetchClientChildren = async (
  page = 1,
  limit = 50,
  by_name: string,
  clientId: string
): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;

  try {
    const res = await axiosInstance.get(endpoints.clients.children(clientId), {
      params: { page, limit, by_name },
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    return res?.data;
  } catch (error) {
    throw new Error(error);
  }
};

export const deleteClient = async (id: string): Promise<any> => {
  try {
    const accessToken = cookies().get('access_token')?.value;
    const lang = cookies().get('Language')?.value;

    await axiosInstance.delete(endpoints.clients.delete(id), {
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
  revalidatePath(`/dashboard/clients/`);
};
