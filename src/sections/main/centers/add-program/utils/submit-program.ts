import axiosInstance, { endpoints, getErrorMessage } from 'src/utils/axios';

import { buildFixedCourseFormMap } from './build-fixed-course-payload';
import { buildFlexibleCourseFormMap } from './build-flexible-course-payload';
import { appendFormDataFields } from './course-api-helpers';
import type { ProgramFormValues } from '../types';

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

    return {
      success: true as const,
      message: res.data?.message as string | undefined,
      course: res.data?.course ?? res.data?.images,
    };
  } catch (error) {
    return {
      success: false as const,
      error: getErrorMessage(error),
    };
  }
}
