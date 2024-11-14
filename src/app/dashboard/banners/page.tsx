import { fetchBanners } from 'src/actions/banners';
import BannersView from 'src/sections/main/banners/view';
import { Banner } from 'src/types/banners';

export const metadata = {
  title: 'Centers',
};

type props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

const Page = async ({ searchParams }: Readonly<props>) => {
  const page = typeof searchParams?.page === 'string' ? Number(searchParams?.page) : 1;
  const limit = typeof searchParams?.limit === 'string' ? Number(searchParams?.limit) : 5;
  const advertisement_name = typeof searchParams?.search === 'string' ? searchParams?.search : '';
  const advertisementType = typeof searchParams?.type === 'string' ? searchParams?.type : null;

  const centers = await fetchBanners({
    limit,
    page,
    filters: advertisement_name,
    type: advertisementType,
  });

  const filteredProducts: Banner[] = centers?.data;

  return <BannersView banners={filteredProducts} count={centers?.meta?.itemCount} />;
};

export default Page;
