import { fetchSingleBannder } from 'src/actions/banners';
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
  const bannerDetails = await fetchSingleBannder(params.bannerId);
  return (
    <SingleBannerView data={bannerDetails} banner={bannerDetails?.data} count={bannerDetails?.centers?.length || 0} />
  );
};

export default Page;
