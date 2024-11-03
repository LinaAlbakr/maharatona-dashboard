import { fetchCoupons } from 'src/actions/coupons';
import CouponsView from 'src/sections/main/coupons/view';
import { ICenter } from 'src/types/centers';

export const metadata = {
  title: 'Coupons',
};

type props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

const Page = async ({ searchParams }: Readonly<props>) => {
  const page = typeof searchParams?.page === 'string' ? Number(searchParams?.page) : 1;
  const limit = typeof searchParams?.limit === 'string' ? Number(searchParams?.limit) : 5;
  const coupon_name = typeof searchParams?.search === 'string' ? searchParams?.search : '';
  const type = typeof searchParams?.type === 'string' ? searchParams?.type : null;

  const coupons = await fetchCoupons({
    limit,
    page,
    filters: coupon_name,
    type
  });

  const filteredProducts: ICenter[] = coupons?.data;

  return <CouponsView coupons={filteredProducts} count={coupons?.meta?.itemCount} />;
};

export default Page;
