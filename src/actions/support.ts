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
  type?: null | string;
}
export const fetchCallsReasons = async ({
  limit = 50,
  filters = '',
}: IParams): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;

  try {
    const res = await axiosInstance.get(endpoints.support.calls_reasons.fetch, {
      params: {
        limit,
        by_name: filters,
      },
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    
    // Handle new response structure: data is now an array directly
    const reasonsData = Array.isArray(res?.data?.data) ? res.data.data : [];
    
    return {
      data: reasonsData,
    };
  } catch (error) {
    throw new Error(error);
  }
};

export const deleteReason = async (reasonId: string): Promise<any> => {
  try {
    const accessToken = cookies().get('access_token')?.value;
    const lang = cookies().get('Language')?.value;

    const res = await axiosInstance.delete(
      endpoints.support.calls_reasons.delete_reason(reasonId),
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    revalidatePath(`/dashboard/support/calls-reasons/`);
    return res.status;
  } catch (error) {
    return {
      error: getErrorMessage(error),
    };
  }
};

export const newReason = async (reqBody: any): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;
  try {
    await axiosInstance.post(endpoints.support.calls_reasons.new, reqBody, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    revalidatePath('/dashboard/support/calls-reasons/');
  } catch (error) {
    throw new Error(error);
  }
};

export const editReason = async (reqBody: any, reasonId: string): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;
  try {
    await axiosInstance.put(endpoints.support.calls_reasons.edit(reasonId), reqBody, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    revalidatePath('/dashboard/support/calls-reasons/');
  } catch (error) {
    throw new Error(error);
  }
};

export const fetchTechnicalSupportItems = async ({
  limit = 50,
  filters = '',
  type = null,
}: IParams): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;

  try {
    const res = await axiosInstance.get(endpoints.support.technical_support.fetch, {
      params: {
        limit,
        by_name: filters,
        callUsType: type,
      },
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    
    // Handle new response structure: data is now an array directly
    const supportData = Array.isArray(res?.data) ? res.data : [];
    
    return {
      data: supportData,
    };
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const fetchTechnicalSupportItemInfo = async (itemId: string): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;

  try {
    const res = await axiosInstance.get(endpoints.support.technical_support.details(itemId), {
      params: {},
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    // API now returns item directly, not under data
    return res?.data;
  } catch (error) {
    throw new Error(error);
  }
};
