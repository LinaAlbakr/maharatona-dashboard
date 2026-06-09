import { notFound } from 'next/navigation';

import { fetchCategories } from 'src/actions/categories';
import { fetchCenterInfo } from 'src/actions/centers';
import { fetchCourseInfo } from 'src/actions/courses';
import AddProgramView from 'src/sections/main/centers/add-program/view';
import { mapCourseToProgramFormValues } from 'src/sections/main/centers/add-program/utils/map-course-to-form-values';

export const metadata = {
  title: 'Edit Program',
};

type IProps = {
  params: {
    courseId: string;
  };
};

const Page = async ({ params }: IProps) => {
  const courseRes = await fetchCourseInfo(params.courseId);
  const course = courseRes?.data ?? courseRes;

  if (!course?.id && !course?._id) {
    notFound();
  }

  const centerId = String(course.center_id?._id ?? course.center_id ?? '').trim();
  if (!centerId) {
    notFound();
  }

  const [centerInfo, categoriesRes] = await Promise.all([
    fetchCenterInfo(centerId),
    fetchCategories({ limit: 200 }),
  ]);

  const categories = (categoriesRes?.data ?? []).map((category: any) => ({
    id: category.id || category._id,
    name: category.name || category.name_en || category.name_ar || '',
    name_ar: category.name_ar,
    name_en: category.name_en,
  }));

  const initialValues = mapCourseToProgramFormValues(course);

  return (
    <AddProgramView
      mode="edit"
      courseId={params.courseId}
      centerId={centerId}
      centerName={
        centerInfo?.name ||
        centerInfo?.name_en ||
        centerInfo?.name_ar ||
        centerInfo?.center_name ||
        ''
      }
      categories={categories}
      initialValues={initialValues}
    />
  );
};

export default Page;
