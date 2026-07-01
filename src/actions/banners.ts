'use server';

/* eslint-disable consistent-return */

import { cookies } from 'next/headers';
import { getCookie } from 'cookies-next';
import { revalidatePath } from 'next/cache';

import { paths } from 'src/routes/paths';

import axiosInstance, { endpoints, getErrorMessage } from 'src/utils/axios';

import { Banner } from 'src/types/banners';

/** Server actions run in Node — avoid `instanceof File` (not always defined). */
function appendFormUploadFile(
  payload: FormData,
  value: FormDataEntryValue | null,
  fieldName = 'file'
) {
  if (!value || typeof value === 'string') return;
  payload.append(fieldName, value);
}

interface IParams {
  page?: number; // Optional, kept for backward compatibility
  limit: number;
  filters?: string;
  type?: string | null;
}
export const fetchBanners = async ({
  limit = 50,
  filters = '',
  type = null,
}: IParams): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;

  try {
    const res = await axiosInstance.get(endpoints.banners.fetch, {
      params: {
        limit,
        search: filters,
        type,
      },
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });

    // Handle new response structure: data is now an array directly
    const packagesData = Array.isArray(res?.data?.data) ? res.data.data : [];
    const normalized = packagesData.map((p: any) => ({
      ...p,
      id: p._id || p.id,
    }));

    return { data: normalized, message: res?.data?.message };
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
      name_ar: p?.name_ar ?? '',
      name_en: p?.name_en ?? '',
      description: p?.desc_en ?? p?.desc_ar ?? '',
      description_ar: p?.desc_ar ?? '',
      description_en: p?.desc_en ?? '',
      image_cover: p?.imgae_cover ?? p?.image_cover ?? '',
      created_at: p?.createdAt ?? '',
      duration: Number(p?.duration ?? 0),
      price: Number(p?.price ?? 0),
      center_num: Array.isArray(p?.center) ? p.center.length : 0,
      advertisementType: p?.type ?? '',
    };
    // Map inner banners array to IBannerCenter-like items expected by the view
    const banners = Array.isArray(p?.banners)
      ? p.banners.map((b: any) => ({
        id: b?._id,
        is_active: Boolean(b?.is_active),
        path_ar: b?.image_ar ?? b?.image ?? '',
        path_en: b?.image_en ?? b?.image ?? '',
        path: b?.image_en ?? b?.image ?? '',
        mediaTypeAr: b?.media_type_ar ?? b?.media_type ?? '',
        mediaTypeEn: b?.media_type_en ?? b?.media_type ?? '',
        mediaType: b?.media_type_en ?? b?.media_type ?? '',
        advertisementCenterType: b?.createdby_type ?? '',
        expires_at: b?.expires_at ?? '',
        subscription_date: b?.subscription_date ?? '',
        created_at: p?.createdAt ?? '',
        created_by: {
          id: b?.createdby_type === 'Center' ? b?.created_by?.id : '',
          name: b?.createdby_type === 'Center' ? b?.created_by?.name : '',
          website: b?.createdby_type === 'Center' ? b?.created_by?.website : '',
          phone: b?.createdby_type === 'Center' ? b?.created_by?.phone : '',
        },
      }))
      : [];
    return { data: mapped, banners };
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
    appendFormUploadFile(payload, reqBody.get('image_cover'));
    const mappings: Record<string, string> = {
      name_en: 'name_en',
      name_ar: 'name_ar',
      duration: 'duration',
      order: 'order',
      price: 'price',
      advertisement_type: 'type',
      desc_ar: 'desc_ar',
      desc_en: 'desc_en',
    };
    Object.entries(mappings).forEach(([from, to]) => {
      const value = reqBody.get(from);
      if (value !== null && value !== undefined && value !== '') {
        payload.append(to, value as any);
      }
    });
    // New packages are always created inactive
    payload.set('advertisement_status', 'Blocked');

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
    appendFormUploadFile(payload, reqBody.get('image_cover'));
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
  const reqBody = {
    is_active: center.is_active === true ? false : true,
  };
  try {
    const accessToken = cookies().get('access_token')?.value;
    const res = await axiosInstance.put(endpoints.banners.toggleBanner(center.id), reqBody, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    revalidatePath(paths.dashboard.banners);
    return res.data;
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

export const fetchfieldsName = async (): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;

  try {
    const res = await axiosInstance.get(endpoints.banners.fieldsName, {
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
    // The API expects the package id in the URL as /admin/create-banner/:packageId
    const packageId = reqBody.get('advertisement_id');

    if (!packageId) {
      return {
        error: 'Package id (advertisement_id) is required',
      };
    }

    // Backend expects file_ar + file_en (separate Arabic / English media)
    const payload = new FormData();

    appendFormUploadFile(payload, reqBody.get('media_ar'), 'file_ar');
    appendFormUploadFile(payload, reqBody.get('media_en'), 'file_en');

    // Forward text fields exactly as backend expects in req.body
    const fieldId = reqBody.get('field_id');
    if (fieldId) {
      payload.append('field_id', fieldId as any);
    }

    const mediaTypeAr = reqBody.get('mediaTypeAr');
    if (mediaTypeAr) {
      payload.append('mediaTypeAr', mediaTypeAr as any);
      payload.append('media_type_ar', mediaTypeAr as any);
    }

    const mediaTypeEn = reqBody.get('mediaTypeEn');
    if (mediaTypeEn) {
      payload.append('mediaTypeEn', mediaTypeEn as any);
      payload.append('media_type_en', mediaTypeEn as any);
    }

    await axiosInstance.post(endpoints.banners.addBanner(String(packageId)), payload, {
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
    const res = await axiosInstance.patch(endpoints.banners.togglePackage(banner.id), reqBody, {
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