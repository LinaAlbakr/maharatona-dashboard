import BannerDetailsView from 'src/sections/main/banners/banner-details/view';

type IProps = {
  params: {
    bannerId: string;
  };
};
const Page = async ({ params }: IProps) => {
  console.log(params.bannerId);

  return <BannerDetailsView />;
};

export default Page;
