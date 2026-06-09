import axiosInstance, { endpoints, getErrorMessage } from 'src/utils/axios';

import { buildFixedCourseFormMap } from './build-fixed-course-payload';
import { buildFlexibleCourseFormMap } from './build-flexible-course-payload';
import { appendFormDataFields } from './course-api-helpers';
import type { ProgramFormValues } from '../types';

function getCreatedCourseId(course: unknown): string | null {
  if (!course || typeof course !== 'object') return null;

  const rawId =
    (course as { _id?: unknown; id?: unknown })._id ?? (course as { id?: unknown }).id;

  if (typeof rawId === 'string' && rawId.trim()) return rawId;
  if (rawId == null) return null;

  return String(rawId);
}

function appendImages(formData: FormData, images: (File | string)[]) {
  images.forEach((image) => {
    if (image instanceof File) {
      formData.append('images', image);
    }
  });
}

export async function submitProgram(centerId: string, values: ProgramFormValues) {
  const isFlexible = values.bookingType === 'flexible';
  const formMap = isFlexible
    ? buildFlexibleCourseFormMap(values)
    : buildFixedCourseFormMap(values);

  const formData = new FormData();
  appendFormDataFields(formData, formMap);
  appendImages(formData, values.courseImages);

  const url = isFlexible
    ? endpoints.centers.createFlexibleCourse(centerId)
    : endpoints.centers.createCourse(centerId);

  try {
    const res = await axiosInstance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const course = res.data?.course;

    return {
      success: true as const,
      message: res.data?.message as string | undefined,
      course,
      courseId: getCreatedCourseId(course),
    };
  } catch (error) {
    return {
      success: false as const,
      error: getErrorMessage(error),
    };
  }
}
