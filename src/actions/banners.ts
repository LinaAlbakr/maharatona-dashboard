'use server';

/* eslint-disable consistent-return */

import { cookies } from 'next/headers';
import { getCookie } from 'cookies-next';
import { revalidatePath } from 'next/cache';

import { paths } from 'src/routes/paths';

import axiosInstance, { endpoints, getErrorMessage } from 'src/utils/axios';

import { Banner } from 'src/types/banners';

interface IParams {
  page: number;
  limit: number;
  filters?: string;
  type?: string | null;
}
export const fetchBanners = async ({
  page = 1,
  limit = 50,
  filters = '',
  type = null,
}: IParams): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;

  try {
    const res = await axiosInstance.get(endpoints.banners.fetch, {
      params: {
        page,
        limit,
        search: filters,
        type,
      },
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });

    return res?.data;
  } catch (error) {
    throw new Error(error);
  }
};

export const fetchSingleBannder = async (id: string): Promise<any> => {
  try {
    const accessToken = getCookie('access_token', { cookies });
    const res = await axiosInstance.get(endpoints.banners.bannerDetails(id), {
      headers: {
        'Accept-Language': getCookie('Language', { cookies }),
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const p = res?.data?.data ?? {};
    // Map API package response to IBanner-like shape used by details view
    const mapped = {
      id: p?._id,
      name: p?.name_en ?? p?.name_ar ?? '',
      description: p?.desc_en ?? p?.desc_ar ?? '',
      image_cover: p?.imgae_cover ?? p?.image_cover ?? '',
      created_at: p?.createdAt ?? '',
      duration: Number(p?.duration ?? 0),
      price: Number(p?.price ?? 0),
      center_num: Array.isArray(p?.banners) ? p.banners.length : 0,
      advertisementType: p?.type ?? '',
    };
    // Map inner banners array to IBannerCenter-like items expected by the view
    const centers = Array.isArray(p?.banners)
      ? p.banners.map((b: any) => ({
          id: b?._id,
          is_active: Boolean(b?.is_active),
          path: b?.image ?? '',
          mediaType: b?.media_type ?? '',
          advertisementCenterType: b?.createdby_type ?? '',
          expires_at: b?.expires_at ?? '',
          created_at: p?.createdAt ?? '',
          center: {
            id: '',
            name: '',
            website: '',
            phone: '',
          },
          course: null,
        }))
      : [];
    return { data: mapped, centers };
  } catch (error) {
    return {
      error: getErrorMessage(error),
    };
  }
};
export const fetchSingleBannderCenters = async (
  id: string,
  page: number,
  limit: number
): Promise<any> => {
  try {
    const accessToken = getCookie('access_token', { cookies });
    const res = await axiosInstance.get(endpoints.banners.bannerCenters(id, page, limit), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Accept-Language': getCookie('Language', { cookies }),
      },
    });
    return res.data;
  } catch (error) {
    return {
      error: getErrorMessage(error),
    };
  }
};

export const newBanner = async (reqBody: FormData): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;
  try {
    // Remap form keys to API-required field names
    const payload = new FormData();
    const imageCover = reqBody.get('image_cover');
    if (imageCover instanceof File) {
      payload.append('file', imageCover);
    }
    const mappings: Record<string, string> = {
      name_en: 'name_en',
      name_ar: 'name_ar',
      duration: 'duration',
      order: 'order',
      price: 'price',
      advertisement_type: 'type',
      desc_ar: 'desc_ar',
      desc_en: 'desc_en',
      advertisement_status: 'advertisement_status',
    };
    Object.entries(mappings).forEach(([from, to]) => {
      const value = reqBody.get(from);
      if (value !== null && value !== undefined && value !== '') {
        payload.append(to, value as any);
      }
    });
    // Default status to Active if not provided
    if (!payload.get('advertisement_status')) {
      payload.append('advertisement_status', 'Active');
    }

    await axiosInstance.post(endpoints.banners.newBanner, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Accept-Language': lang,
        'Content-Type': 'multipart/form-data',
      },
    });
    revalidatePath(paths.dashboard.faq);
  } catch (error) {
    return {
      error: getErrorMessage(error),
    };
  }
};

export const editBanner = async (reqBody: FormData, bannerId: string): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;
  try {
    // Remap form keys to API-required field names
    const payload = new FormData();
    const imageCover = reqBody.get('image_cover');
    if (imageCover instanceof File) {
      payload.append('file', imageCover);
    }
    const mappings: Record<string, string> = {
      name_en: 'name_en',
      name_ar: 'name_ar',
      duration: 'duration',
      order: 'order',
      price: 'price',
      advertisement_type: 'type',
      description_ar: 'desc_ar',
      description_en: 'desc_en',
      advertisement_status: 'advertisement_status',
    };
    Object.entries(mappings).forEach(([from, to]) => {
      const value = reqBody.get(from);
      if (value !== null && value !== undefined && value !== '') {
        payload.append(to, value as any);
      }
    });

    await axiosInstance.put(endpoints.banners.editBanner(bannerId), payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Accept-Language': lang,
        'Content-Type': 'multipart/form-data',
      },
    });
    revalidatePath(paths.dashboard.banners);
  } catch (error) {
    return {
      error: getErrorMessage(error),
    };
  }
};

export const editCenterMediaStatus = async (center: any): Promise<any> => {
  try {
    const accessToken = cookies().get('access_token')?.value;
    await axiosInstance.put(
      endpoints.banners.changeCenterMediaStatus(center.id, !center.is_active),
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

export const fetchfields = async (): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;

  try {
    const res = await axiosInstance.get(endpoints.banners.fields, {
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    return res?.data.data;
  } catch (error) {
    throw new Error(error);
  }
};

export const addBanner = async (reqBody: FormData): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;
  try {
    await axiosInstance.post(endpoints.banners.addBanner, reqBody, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Accept-Language': lang,
        'Content-Type': 'multipart/form-data',
      },
    });
  } catch (error) {
    return {
      error: getErrorMessage(error),
    };
  }
};

export const deletebannerCenters = async (centerId: string): Promise<any> => {
  try {
    const accessToken = cookies().get('access_token')?.value;

    const res = await axiosInstance.delete(endpoints.banners.deletebannerCenters(centerId), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    revalidatePath(`/dashboard/banners`);
    return res?.status;
  } catch (error) {
    return {
      error: getErrorMessage(error),
    };
  }
};

export const editBannerStatus = async (banner: Banner): Promise<any> => {
  const reqBody = {
    advertisement_status: banner.advertisement_status === 'Active' ? 'Blocked' : 'Active',
  };
  try {
    const accessToken = cookies().get('access_token')?.value;
    const res = await axiosInstance.put(endpoints.banners.editBanner(banner.id), reqBody, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    revalidatePath(paths.dashboard.citiesAndNeighborhoods);
    return res.data;
  } catch (error) {
    return {
      error: getErrorMessage(error),
    };
  }
};

export const deleteBanner = async (bannerId: string): Promise<any> => {
  try {
    const accessToken = cookies().get('access_token')?.value;
    const lang = cookies().get('Language')?.value;

    await axiosInstance.delete(endpoints.banners.deleteBanner(bannerId), {
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
  revalidatePath(`/dashboard/banners/`);
};
