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

type SubmitProgramOptions = {
  mode?: 'create' | 'edit';
  courseId?: string;
};

export async function submitProgram(
  centerId: string,
  values: ProgramFormValues,
  options: SubmitProgramOptions = {}
) {
  const isEdit = options.mode === 'edit' && Boolean(options.courseId);
  const isFlexible = values.bookingType === 'flexible';
  const formMap = isFlexible
    ? buildFlexibleCourseFormMap(values)
    : buildFixedCourseFormMap(values);

  const formData = new FormData();
  appendFormDataFields(formData, formMap);
  appendImages(formData, values.courseImages);

  const url = isEdit
    ? endpoints.centers.updateCourse(centerId, options.courseId!)
    : isFlexible
      ? endpoints.centers.createFlexibleCourse(centerId)
      : endpoints.centers.createCourse(centerId);

  try {
    const requestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    const res = isEdit
      ? await axiosInstance.put(url, formData, requestConfig)
      : await axiosInstance.post(url, formData, requestConfig);

    const course = res.data?.course;

    return {
      success: true as const,
      message: res.data?.message as string | undefined,
      course,
      courseId: getCreatedCourseId(course) ?? options.courseId ?? null,
    };
  } catch (error) {
    return {
      success: false as const,
      error: getErrorMessage(error),
    };
  }
}
