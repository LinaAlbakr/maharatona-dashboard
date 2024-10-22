import {
  fetchCenterCourses,
  fetchCenterInfo,
  fetchCenterReports,
  fetchCenterReviews,
} from 'src/actions/centers';
import CenterDetailsView from 'src/sections/main/centers/center-details/view';

type IProps = {
  params: {
    centerId: string;
  };
  searchParams: {
    tab: string | string[] | undefined;
    page: string | string[] | undefined;
    limit: string | string[] | undefined;
  };
};
const Page = async ({ params, searchParams }: IProps) => {
  const tab = typeof searchParams.tab === 'string' ? searchParams.tab : undefined;
  const page = typeof searchParams?.page === 'string' ? Number(searchParams?.page) : 1;
  const limit = typeof searchParams?.limit === 'string' ? Number(searchParams?.limit) : 6;
  const CenterInfo = await fetchCenterInfo(params.centerId);
  const CenterCourses = await fetchCenterCourses(page, limit, params.centerId);
  const CenterReviews = await fetchCenterReviews(page, limit, params.centerId);
  const CenterReports = await fetchCenterReports(params.centerId);

  return (
    <CenterDetailsView
      tab={tab}
      CenterInfo={CenterInfo}   
      CenterCourses={CenterCourses}
      CenterReviews={CenterReviews}
      CenterReports={CenterReports}
    />
  );
};

export default Page;
