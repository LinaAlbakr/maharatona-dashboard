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
  categoryId?: string;
}
export const fetchFaqCategories = async ({
  limit = 50,
  filters = '',
  categoryId,
}: IParams): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;

  try {
    const res = await axiosInstance.get(endpoints.faq.fetchFaqCategoriesStudent, {
      params: {
        limit,
        by_name: filters,
        faq_category_id: categoryId,
      },
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    // Handle new response structure: data is now an array directly
    const categoriesData = Array.isArray(res?.data?.data) ? res.data.data : [];
    const normalized = categoriesData.map((c: any) => ({
      ...c,
      id: c._id || c.id,
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

export const fetchFaqCategoriesCenter = async ({
  limit = 50,
  filters = '',
  categoryId,
}: IParams): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;

  try {
    const res = await axiosInstance.get(endpoints.faq.fetchFaqCategoriesCenter, {
      params: {
        limit,
        by_name: filters,
        faq_category_id: categoryId,
      },
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    const categoriesData = Array.isArray(res?.data?.data) ? res.data.data : [];
    const normalized = categoriesData.map((c: any) => ({
      ...c,
      id: c._id || c.id,
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

export const deleteFaqCategory = async (categoryId: string): Promise<any> => {
  try {
    const accessToken = cookies().get('access_token')?.value;

    const res = await axiosInstance.delete(endpoints.faq.deleteCategory(categoryId), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    revalidatePath(paths.dashboard.faq);
    return res.status;
  } catch (error) {
    return {
      error: getErrorMessage(error),
    };
  }
};

export const newFaqCategory = async (reqBody: any): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;

  try {
    await axiosInstance.post(endpoints.faq.newCategory, reqBody, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    revalidatePath(paths.dashboard.faq);
  } catch (error) {
    return {
      error: getErrorMessage(error),
    };
  }
};

export const editFaqCategory = async (reqBody: any, categoryId: string): Promise<any> => {
  console.log("categoryId",categoryId);
  console.log("reqBody",reqBody);
  console.log("endpoints.faq.editCategory(categoryId)",endpoints.faq.editCategory(categoryId));
  const accessToken = cookies().get('access_token')?.value;
  try {
    await axiosInstance.put(endpoints.faq.editCategory(categoryId), reqBody, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    revalidatePath(paths.dashboard.faq);
  } catch (error) {
    return {
      error: getErrorMessage(error),
    };
  }
};

export const fetchCategoryQuestions = async ({
  limit = 50,
  categoryId,
  filters = '',
}: IParams): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;
  try {
    const res = await axiosInstance.get(endpoints.faq.fetchQuestions, {
      params: {
        limit,
        by_name: filters,
        faq_category_id: categoryId,
      },
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    
    // Handle new response structure: data is now an array directly
    const questionsData = Array.isArray(res?.data?.data) ? res.data.data : [];
    
    return {
      data: questionsData,
      message: res?.data?.message,
    };
  } catch (error) {
    return {
      data: [],
      error: getErrorMessage(error),
    };
  }
};

export const newQuestion = async (reqBody: any): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;
  try {
    await axiosInstance.post(endpoints.faq.newQuestion, reqBody, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Accept-Language': lang,
      },
    });
    revalidatePath(paths.dashboard.faq);
  } catch (error) {
    return {
      error: getErrorMessage(error),
    };
  }
};

export const editQuestion = async (reqBody: any, questionId: string): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;
  try {
    await axiosInstance.put(endpoints.faq.editQuestion(questionId), reqBody, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Accept-Language': lang,
      },
    });
    revalidatePath(`${paths.dashboard.faq}/${reqBody.faq_category_id}`);
  } catch (error) {
    return {
      error: getErrorMessage(error),
    };
  }
};

export const deleteQuestion = async (questionId: string): Promise<any> => {
  try {
    const accessToken = cookies().get('access_token')?.value;
    const lang = cookies().get('Language')?.value;

    await axiosInstance.delete(endpoints.faq.deleteQuestion(questionId), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Accept-Language': lang,
      },
    });
    revalidatePath(paths.dashboard.faq);
  } catch (error) {
    return {
      error: getErrorMessage(error),
    };
  }
};
