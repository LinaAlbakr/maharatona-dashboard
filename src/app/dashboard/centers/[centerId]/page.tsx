import { fetchCenterInfo, fetchCenterReports, fetchCities } from 'src/actions/centers';
import { fetchCategories } from 'src/actions/categories';
import CenterDetailsView from 'src/sections/main/centers/center-details/view';

type IProps = {
  params: {
    centerId: string;
  };
  searchParams: { [key: string]: string | string[] | undefined }
};
const Page = async ({ params, searchParams }: IProps) => {
  const tab = typeof searchParams.tab === 'string' ? searchParams.tab : undefined;
  const [CenterInfo, CenterReports, cities, categoriesRes] = await Promise.all([
    fetchCenterInfo(params.centerId),
    fetchCenterReports(params.centerId),
    fetchCities(),
    fetchCategories({ limit: 200 }),
  ]);
  const fields = (categoriesRes?.data ?? []).map((category: any) => ({
    id: String(category.id || category._id || ''),
    name_en: category.name_en,
    name_ar: category.name_ar,
    name: category.name,
  }));
  // Derive courses from CenterInfo per new API
  const CenterCourses = {
    data: CenterInfo?.courses || [],
    meta: { itemCount: CenterInfo?.total_courses || (CenterInfo?.courses?.length || 0) },
  };

  return (
    <CenterDetailsView
      tab={tab}
      CenterInfo={CenterInfo}
      CenterCourses={CenterCourses}
      CenterReports={CenterReports}
      cities={cities}
      fields={fields}
    />
  );
};

export default Page;
