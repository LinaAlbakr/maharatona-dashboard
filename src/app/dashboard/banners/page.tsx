import { fetchfields, fetchBanners } from 'src/actions/banners';

import BannersView from 'src/sections/main/banners/view';

import { Banner } from 'src/types/banners';

export const metadata = {
  title: 'Banners',
};

type props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

const Page = async ({ searchParams }: Readonly<props>) => {
  const page = typeof searchParams?.page === 'string' ? Number(searchParams?.page) : 1;
  const limit = typeof searchParams?.limit === 'string' ? Number(searchParams?.limit) : 5;
  const advertisement_name = typeof searchParams?.search === 'string' ? searchParams?.search : '';
  const advertisementType = typeof searchParams?.type === 'string' ? searchParams?.type : null;
  // const fields = await fetchfields();
  const fields = [
    { id: '1', name: 'Mathematics', name_en: 'Mathematics', avatar: '/assets/icons/fields/math.svg', color: '#4F46E5' },
    { id: '2', name: 'Science', name_en: 'Science', avatar: '/assets/icons/fields/science.svg', color: '#10B981' },
    { id: '3', name: 'Languages', name_en: 'Languages', avatar: '/assets/icons/fields/language.svg', color: '#F59E0B' },
    { id: '4', name: 'Arts', name_en: 'Arts', avatar: '/assets/icons/fields/arts.svg', color: '#EC4899' },
  ];
  const centers = await fetchBanners({
    limit,
    page,
    filters: advertisement_name,
    type: advertisementType,
  });

  const filteredProducts: Banner[] = centers?.data;

  return (
    <BannersView banners={filteredProducts} count={centers?.meta?.itemCount} fields={fields} />
  );
};

export default Page;
