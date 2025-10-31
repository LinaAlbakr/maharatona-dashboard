'use server';

/* eslint-disable consistent-return */

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import axiosInstance, { endpoints, getErrorMessage } from 'src/utils/axios';

interface IParams {
  page: number;
  limit: number;
  filters?: string;
}
export const fetchCategories = async ({
  page = 1,
  limit = 50,
  filters = '',
}: IParams): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;

  try {
    const res = await axiosInstance.get(endpoints.categories.fetch, {
      params: {
        page,
        limit,
        by_name: filters,
      },
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    
    // Handle the new response structure where docs and pagination are at top level
    return {
      docs: res?.data?.docs || [],
      totalDocs: res?.data?.totalDocs || 0,
      page: res?.data?.page || page,
      limit: res?.data?.limit || limit,
      totalPages: res?.data?.totalPages || 1,
    };
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    throw new Error(getErrorMessage(error));
  }
};

export const editFieldStatus = async (field: any): Promise<any> => {
  try {
    const accessToken = cookies().get('access_token')?.value;
    const fieldId = field?.id || field?._id;
    
    if (!fieldId) {
      return {
        error: 'Field ID is required',
      };
    }
    
    const res = await axiosInstance.patch(
      
      endpoints.categories.edit(fieldId),
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    revalidatePath(`/dashboard/categories/`);
    return res.data || { statusCode: 200 };
  } catch (error) {
    return {
      error: getErrorMessage(error),
    };
  }
};

export const newCategoriey = async (reqBody: FormData): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  try {
    const res = await axiosInstance.post(endpoints.categories.new, reqBody, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    // Return the data from token field in response
    return res.data.token;
  } catch (error) {
    console.error('Failed to create category:', error);
    throw new Error(getErrorMessage(error));
  }
};

export const editCategoriey = async (reqBody: FormData, id: string): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  
  // Debug logging
  console.log('Edit category request:', {
    id,
    endpoint: endpoints.categories.edit(id),
    hasAccessToken: !!accessToken,
    formDataKeys: Array.from(reqBody.keys()),
  });
  
  try {
    const res = await axiosInstance.put(endpoints.categories.edit(id), reqBody, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('Edit category response:', res.data);
    
    // Return the data from token field in response (if present) or the whole response
    revalidatePath(`/dashboard/categories`);
    return res.data.token || res.data;
  } catch (error: any) {
    console.error('Failed to update category:', error);
    console.error('Error response:', error?.response?.data);
    console.error('Error status:', error?.response?.status);
    
    // Extract more detailed error information
    let errorMessage = 'Failed to update category';
    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error?.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    throw new Error(errorMessage);
  }
};

export const deleteCategory = async (categoryId: string): Promise<any> => {
  console.log('Deleting category:', categoryId);
  try {
    const accessToken = cookies().get('access_token')?.value;
    const lang = cookies().get('Language')?.value;

    await axiosInstance.delete(endpoints.categories.deleteCategory(categoryId), {
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
  revalidatePath(`/dashboard/categories/`);
};
