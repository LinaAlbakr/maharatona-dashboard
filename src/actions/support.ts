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
}
export const fetchCallsReasons = async ({
  page = 1,
  limit = 50,
  filters = '',
}: IParams): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;

  try {
    const res = await axiosInstance.get(endpoints.support.calls_reasons.fetch, {
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
    console.log(error);
    throw new Error(error);
  }
};

export const editReason = async (reqBody: any, reasonId: string): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;
  try {
    await axiosInstance.patch(endpoints.support.calls_reasons.edit(reasonId), reqBody, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    revalidatePath('/dashboard/support/calls-reasons/');
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};
