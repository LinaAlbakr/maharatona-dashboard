'use server';

/* eslint-disable consistent-return */

import { cookies } from 'next/headers';

import axiosInstance, { endpoints, getErrorMessage } from 'src/utils/axios';
import {
  ContractOverview,
  ContractVersion,
  AcceptedCentersResponse,
} from 'src/types/static-pages';

export const fetchContractOverview = async (type: string): Promise<ContractOverview> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;

  try {
    const res = await axiosInstance.get(endpoints.contract.overview(type), {
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    return res?.data?.data as ContractOverview;
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('[fetchContractOverview] error:', message);
    return {
      static_page_type: type,
      total_centers: 0,
      current: null,
      history: [],
    };
  }
};

export const publishContractVersion = async (
  type: string,
  data: { content_ar: string; content_en: string }
): Promise<{ data?: ContractVersion; error?: string }> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;

  try {
    const res = await axiosInstance.post(endpoints.contract.publish(type), data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Accept-Language': lang,
        'Content-Type': 'application/json',
      },
    });
    return { data: res?.data?.data as ContractVersion };
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
};

export const fetchAcceptedCenters = async (
  versionId: string
): Promise<AcceptedCentersResponse | null> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;

  try {
    const res = await axiosInstance.get(endpoints.contract.acceptedCenters(versionId), {
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    return res?.data?.data as AcceptedCentersResponse;
  } catch (error) {
    console.error('[fetchAcceptedCenters] error:', getErrorMessage(error));
    return null;
  }
};
