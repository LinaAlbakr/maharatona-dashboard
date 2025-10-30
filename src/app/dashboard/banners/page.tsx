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
    { name_en: 'Main page', name_ar: 'الصفحة الرئيسية', value: 'MAIN' },
    { name_en: 'Fields', name_ar: 'المجالات', value: 'FIELD' },
    { name_en: 'Both', name_ar: 'كلاهما', value: 'BOTH' },
  ];
  const centers = await fetchBanners({
    limit,
    page,
    filters: advertisement_name,
    type: advertisementType,
  });

  const docs = centers?.data?.docs ?? [];
  const filteredProducts: Banner[] = docs.map((p: any) => ({
    id: p?._id,
    name_ar: p?.name_ar ?? '',
    name_en: p?.name_en ?? '',
    description_ar: p?.desc_ar ?? '',
    description_en: p?.desc_en ?? '',
    description: p?.desc_en ?? '',
    image_cover: p?.imgae_cover ?? p?.image_cover ?? null,
    created_at: p?.createdAt ?? '',
    duration: Number(p?.duration ?? 0),
    price: Number(p?.price ?? 0),
    center_num: Array.isArray(p?.banners) ? p.banners.length : 0,
    advertisementType: p?.type ?? '',
    advertisement_status: p?.advertisement_status ?? '',
    order: Number(p?.order ?? 0),
  }));

  return (
    <BannersView banners={filteredProducts} count={centers?.data?.totalDocs ?? 0} fields={fields} />
  );
};

export default Page;
