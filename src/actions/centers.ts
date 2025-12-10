'use server';

/* eslint-disable consistent-return */

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { paths } from 'src/routes/paths';

import axiosInstance, { endpoints, getErrorMessage } from 'src/utils/axios';
import { getCookie } from 'cookies-next';
import { ITems } from 'src/components/AutoComplete/CutomAutocompleteView';

interface IParams {
  page?: number; // Optional, not used anymore but kept for backward compatibility
  limit: number;
  filters?: string;
  city_id?: string;
  neighborhood_id?: string;

  sort?: 'order_by' | 'new';
}
// interface ITems {
//   id: string;
//   name: string;
//   _id?: string;
//   name_ar?: string;
//   name_en?: string;
// }
export const  fetchCenters = async ({
  limit = 50,
  filters = '',
  city_id = '',
  neighborhood_id = '',
}: IParams): Promise<any> => {
  const accessToken = getCookie('access_token', { cookies });
  const lang = getCookie('Language', { cookies });

  try {
    const params: any = {
      limit,
    };
    
    // Only add filter parameters if they have values
    if (filters) {
      params.by_name = filters;
    }
    if (city_id) {
      params.by_city_id = city_id;
    }
    if (neighborhood_id) {
      params.by_neighborhood_id = neighborhood_id;
    }
    
    // console.log('fetchCenters params:', params);
    
    const res = await axiosInstance.get(endpoints.centers.fetch, {
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
      params,
    });
    
    // Handle new response structure: data is now an array directly
    const responseData = res?.data;
    const centersData = Array.isArray(responseData?.data) ? responseData.data : [];
    
    // Normalize data: map _id → id
    const normalizedCenters = centersData.map((center: any) => ({
      ...center,
      id: center._id || center.id,
    }));
    
    return {
      data: normalizedCenters,
      message: responseData?.message,
    };
  } catch (error) {
    console.error('fetchCenters error:', error);
    throw new Error(getErrorMessage(error));
  }
};

export const fetchCities = async (): Promise<ITems[]> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;

  try {
    const res = await axiosInstance.get(endpoints.centers.cities, {
      headers: { 
        Authorization: `Bearer ${accessToken}`, 
        'Accept-Language': lang 
      },
    });

    // Handle new response structure: data is now an array directly
    const citiesData = Array.isArray(res.data?.data) ? res.data.data : [];

    // Normalize data: map _id → id, and choose name based on language
    const cities = citiesData.map((city: any) => ({
      id: city._id,
      name: lang === 'ar' ? city.name_ar : city.name_en,
      // or if you want to keep both: name_ar, name_en — adjust ITems accordingly
    }));

    return cities;
  } catch (error) {
    console.error('Failed to fetch cities:', error);
    throw new Error('Failed to fetch cities');
  }
};
export const fetchCityNeighborhoods = async ({ cityId }: { cityId: string }): Promise<ITems[]> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;

  try {
    const res = await axiosInstance.get(`/admin/get-neighbourhood-by-city/${cityId}`, {
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    
    // Normalize data to ITems format
    const neighborhoods = res.data.data.docs.map((neighborhood: any) => ({
      id: neighborhood._id,
      name: lang === 'ar' ? neighborhood.name_ar : neighborhood.name_en,
    }));

    return neighborhoods;
  } catch (error) {
    console.error('Failed to fetch neighborhoods:', error);
    throw new Error(getErrorMessage(error));
  }
};

export const fetchCenterInfo = async (centerId: string): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;

  try {
    const res = await axiosInstance.get(endpoints.centers.info(centerId), {
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    // Return the nested `data` object
    return res?.data?.data; // ✅ This is critical
    console.log("deta2",res);
  } catch (error) {
    console.error('Error fetching center info:', error);
    throw new Error('Failed to fetch center information');
  }
};
export const fetchCenterCourses = async (page = 1, limit = 6, centerId = ''): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;

  try {
    const res = await axiosInstance.get(endpoints.centers.courses(centerId), {
      params: { page, limit },
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    return res?.data;
  } catch (error) {
    throw new Error(error);
  }
};
export const fetchCenterReports = async (centerId: string): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;

  try {
    const res = await axiosInstance.get(endpoints.centers.reports(centerId), {
      params: {},
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    return res?.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
export const fetchCenterReviews = async (page = 1, limit = 50, centerId = ''): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;

  try {
    const res = await axiosInstance.get(endpoints.centers.reviews(centerId), {
      params: { page, limit },
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    return res?.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export async function changeCenterStatus(centerId: string, reqBody: any): Promise<any> {
  const accessToken = cookies().get('access_token')?.value;
  try {
    const res = await axiosInstance.patch(endpoints.centers.changeStatus(centerId), reqBody, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    revalidatePath('/dashboard/centers/');
    return res?.status;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export const deleteRate = async (rateId: string, centerId: any): Promise<any> => {
  try {
    const accessToken = cookies().get('access_token')?.value;
    const lang = cookies().get('Language')?.value;

    const res = await axiosInstance.delete(endpoints.centers.deleteReview(rateId), {
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
  revalidatePath(`/dashboard/centers/${centerId}/?tab=reports`);
};

export const clearWallet = async (centerId: any): Promise<any> => {
  try {
    const accessToken = cookies().get('access_token')?.value;
    const lang = cookies().get('Language')?.value;
    const res = await axiosInstance.put(
      endpoints.centers.clearWallet(centerId),
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Accept-Language': lang,
        },
      }
    );
    revalidatePath(`/dashboard/centers/`);
  } catch (error) {
    return {
      error: getErrorMessage(error),
    };
  }
};

export const deleteCenter = async (id: string): Promise<any> => {
  try {
    const accessToken = cookies().get('access_token')?.value;
    const lang = cookies().get('Language')?.value;

    await axiosInstance.delete(endpoints.centers.deleteCenter(id), {
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
  revalidatePath(`/dashboard/centers/`);
};
