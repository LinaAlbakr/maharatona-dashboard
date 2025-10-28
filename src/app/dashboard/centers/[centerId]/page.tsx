import { fetchCenterInfo } from 'src/actions/centers';
import CenterDetailsView from 'src/sections/main/centers/center-details/view';

type IProps = {
  params: {
    centerId: string;
  };
  searchParams:{ [key: string]: string | string[] | undefined }
};
const Page = async ({ params, searchParams }: IProps) => {
  const tab = typeof searchParams.tab === 'string' ? searchParams.tab : undefined;
  const CenterInfo = await fetchCenterInfo(params.centerId);

  // Derive courses from CenterInfo per new API
  const CenterCourses = {
    data: CenterInfo?.courses || [],
    meta: { itemCount: CenterInfo?.total_courses || (CenterInfo?.courses?.length || 0) },
  };

  return (
    <CenterDetailsView tab={tab} CenterInfo={CenterInfo} CenterCourses={CenterCourses} />
  );
};

export default Page;
