'use server';

/* eslint-disable consistent-return */

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { paths } from 'src/routes/paths';

import axiosInstance, { endpoints, getErrorMessage } from 'src/utils/axios';

interface IParams {
  page?: number; // Optional, kept for backward compatibility
  limit: number;
  filters?: string;
  cityId?: string;
}
export const fetchCities = async ({
  limit = 50,
  filters = '',
}: IParams): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;

  try {
    const res = await axiosInstance.get(endpoints.citiesAndNeighborhoods.fetchCities, {
      params: {
        limit,
        by_name: filters,
      },
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    
    // Handle new response structure: data is now an array directly
    const citiesData = Array.isArray(res?.data?.data) ? res.data.data : [];

    const normalized = citiesData.map((city: any) => ({
      ...city,
      id: city._id || city.id,
    }));
    
    return {
      data: normalized,
      message: res?.data?.message,
    };
  } catch (error) {
    console.error('Failed to fetch cities:', error);
    throw new Error(getErrorMessage(error));
  }
};

export const editCityStatus = async (city: any): Promise<any> => {
  try {
    const accessToken = cookies().get('access_token')?.value;
    const cityId = city?.id || city?._id;
    
    if (!cityId) {
      return {
        error: 'City ID is required',
      };
    }
    
    const res = await axiosInstance.patch(
      endpoints.citiesAndNeighborhoods.changeCityStatus(cityId),
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    revalidatePath(paths.dashboard.citiesAndNeighborhoods);
    return res.data || { statusCode: 200 };
  } catch (error) {
    return {
      error: getErrorMessage(error),
    };
  }
};

export const fetchNeighborhoods = async ({
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
          limit,
          by_name: filters,
        },
        headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
      }
    );
    const neighborhoodsData = Array.isArray(res?.data?.data) ? res.data.data : [];
    const normalized = neighborhoodsData.map((n: any) => ({
      ...n,
      id: n._id || n.id,
    }));
    return {
      data: normalized,
      message: res?.data?.message,
    };
  } catch (error) {
    return {
      data: [],
      error: getErrorMessage(error),
    };
  }
};

export const editNeighborhoodStatus = async (neighborhood: any): Promise<any> => {
  try {
    const accessToken = cookies().get('access_token')?.value;
    const neighborhoodId = neighborhood?.id || neighborhood?._id;
    
    if (!neighborhoodId) {
      return {
        error: 'Neighborhood ID is required',
      };
    }
    
    const res = await axiosInstance.patch(
      endpoints.citiesAndNeighborhoods.changeNeighborhoodStatus(neighborhoodId),
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    revalidatePath(paths.dashboard.citiesAndNeighborhoods);
    return res.data || { statusCode: 200 };
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
    await axiosInstance.post(endpoints.citiesAndNeighborhoods.newCity, reqBody, {
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
  revalidatePath('/dashboard/cities-and-neighborhoods/');
};
export const NewNeighborhood = async (reqBody: any): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;
  try {
    await axiosInstance.post(endpoints.citiesAndNeighborhoods.newNeighborhood, reqBody, {
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
  revalidatePath('/dashboard/cities-and-neighborhoods/');
};

export const deleteCity = async (cityId: string): Promise<any> => {
  try {
    const accessToken = cookies().get('access_token')?.value;
    const lang = cookies().get('Language')?.value;

    await axiosInstance.delete(endpoints.citiesAndNeighborhoods.deleteCity(cityId), {
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
  revalidatePath(`/dashboard/cities-and-neighborhoods/`);
};

export const deleteNeighborhood = async (neighborhoodId: string): Promise<any> => {
  try {
    const accessToken = cookies().get('access_token')?.value;
    const lang = cookies().get('Language')?.value;

    await axiosInstance.delete(endpoints.citiesAndNeighborhoods.deleteNeighborhood(neighborhoodId), {
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
  revalidatePath(`/dashboard/cities-and-neighborhoods/`);
};
