'use server';

import { revalidatePath } from 'next/cache';
/* eslint-disable consistent-return */

import { cookies } from 'next/headers';

import axiosInstance, { endpoints, getErrorMessage } from 'src/utils/axios';

interface IParams {
  page: number;
  limit: number;
  filters?: string;
}
export const fetchCourses = async ({
  page = 1,
  limit = 50,
  filters = '',
}: IParams): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;

  try {
    const res = await axiosInstance.get(endpoints.courses.fetch, {
      params: {
        page,
        limit,
        by_name: filters,
      },
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    // Transform the new API response structure to match the expected format
    const responseData = res?.data;
    if (responseData?.data) {
      // Normalize course objects to match expected format
      const normalizedDocs = (responseData.data.docs || []).map((course: any) => {
        // Determine name based on language
        const courseName = lang === 'ar' ? course.name_ar : course.name_en;
        
        return {
          ...course,
          id: course._id || course.id,
          name: courseName || course.name_ar || course.name_en || course.name,
          students: course.clients || course.students || [],
          seats: course.seats_left !== undefined && course.seats_left !== null ? course.seats_left : course.seats,
        };
      });

      return {
        data: normalizedDocs,
        meta: {
          itemCount: responseData.data.totalDocs || 0,
          page: responseData.data.page || page,
          limit: responseData.data.limit || limit,
          totalPages: responseData.data.totalPages || 1,
          hasNextPage: responseData.data.hasNextPage || false,
          hasPrevPage: responseData.data.hasPrevPage || false,
        },
        message: responseData.message,
      };
    }
    return responseData;
  } catch (error) {
    throw new Error(error);
  }
};

export const fetchCourseInfo = async (courseId: string): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;

  try {
    const res = await axiosInstance.get(endpoints.courses.info(courseId), {
      params: {},
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    const responseData = res?.data;

    // Normalize to match CourseDetailsView expectations
    if (responseData?.data) {
      const c = responseData.data;
      const normalized = {
        ...c,
        id: c._id || c.id,
        name: lang === 'ar' ? (c.name_ar || c.name) : (c.name_en || c.name),
        description_ar: c.description_ar || c.desc_ar || c.descAR,
        description_en: c.description_en || c.desc_en || c.descEN,
        students: c.clients || c.students || [],
        number_of_users: Array.isArray(c.clients) ? c.clients.length : (c.number_of_users || 0),
        seats: (c.seats_left !== undefined && c.seats_left !== null) ? c.seats_left : c.seats,
        field: c.field || c.field_id || {},
        course_images: Array.isArray(c.course_images)
          ? c.course_images.map((img: any) => (typeof img === 'string' ? { url: img } : img))
          : [],
      };
      return { data: normalized, message: responseData.message };
    }

    return responseData;
  } catch (error) {
    throw new Error(error);
  }
};

export const editPercentage = async (data: any): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;

  try {
    const res = await axiosInstance.patch(endpoints.courses.percentage(), data, {
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    return res?.data;
  } catch (error) {
    throw new Error(error);
  }
};

export const deleteCousre = async (courseId: string): Promise<any> => {
  try {
    const accessToken = cookies().get('access_token')?.value;
    const lang = cookies().get('Language')?.value;

    await axiosInstance.delete(endpoints.courses.deleteCourse(courseId), {
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

export const editCourseStatus = async (course: any): Promise<any> => {
  try {
    const accessToken = cookies().get('access_token')?.value;
    const lang = cookies().get('Language')?.value;
    const courseId = course.id || course._id;
    const res = await axiosInstance.patch(
      endpoints.courses.editStatus(courseId),
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Accept-Language': lang,
        },
      }
    );
    revalidatePath(`/dashboard/courses/`);
    return res.data;
  } catch (error) {
    return {
      error: getErrorMessage(error),
    };
  }
};
