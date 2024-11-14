import { fetchSingleBannder, fetchSingleBannderCenters } from 'src/actions/banners';
import SingleBannerView from 'src/sections/main/banners/banner-details/view';

export const metadata = {
  title: 'Banner',
};

type IProps = {
  params: {
    bannerId: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
};
const Page = async ({ params, searchParams }: IProps) => {
  const page = typeof searchParams?.page === 'string' ? Number(searchParams?.page) : 1;
  const limit = typeof searchParams?.limit === 'string' ? Number(searchParams?.limit) : 5;

  const bannerDetails = await fetchSingleBannder(params.bannerId);
  const bannerCenters = await fetchSingleBannderCenters(params.bannerId, page, limit);
  return (
    <SingleBannerView centers={bannerCenters?.data} banner={bannerDetails?.data} count={bannerCenters?.meta?.itemCount} />
  );
};

export default Page;
