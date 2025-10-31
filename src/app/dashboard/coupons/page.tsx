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
console.log("coupons",coupons);
  const docs = coupons?.data?.docs ?? [];
  console.log("docs",docs);
  const filteredProducts: any[] = docs.map((c: any) => ({
    id: c?._id,
    code: c?.code ?? '',
    start_date: c?.start_date ?? '',
    end_date: c?.end_date ?? '',
    discount: Number(c?.discount ?? 0),
    discountType: c?.discount_type ?? '',
    discountCreateType: c?.discount_create_type ?? '',
    times_Used: Number(c?.times_used ?? 0),
    is_active: Boolean(c?.is_active),
  }));

  return <CouponsView coupons={filteredProducts} count={coupons?.data?.totalDocs ?? 0} />;
};

export default Page;
