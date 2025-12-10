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
  const limit = typeof searchParams?.limit === 'string' ? Number(searchParams?.limit) : 20;
  const coupon_name = typeof searchParams?.search === 'string' ? searchParams?.search : '';
  const type = typeof searchParams?.type === 'string' ? searchParams?.type : null;

  // Fetch coupons with limit
  const coupons = await fetchCoupons({
    limit,
    filters: coupon_name,
    type,
  });

  // Handle new response structure: data is now an array directly
  const docs = Array.isArray(coupons?.data) ? coupons.data : [];

  // Map and normalize the coupons
  const mappedCoupons = docs.map((c: any) => ({
    ...c,
    id: c?._id || c?.id,
    code: c?.code ?? '',
    start_date: c?.start_date ?? '',
    end_date: c?.end_date ?? '',
    discount: Number(c?.discount ?? 0),
    discountType: c?.discount_type ?? '',
    discountCreateType: c?.discount_create_type ?? c?.discountCreateType ?? '',
    times_Used: Number(c?.times_used ?? 0),
    is_active: Boolean(c?.is_active),
  }));

  // Apply client-side filtering as fallback
  const filteredProducts = mappedCoupons.filter((coupon: any) => {
    // Filter by search term (coupon code)
    const matchesSearch = !coupon_name || coupon_name.trim() === '' ||
      String(coupon?.code || '').toLowerCase().includes(coupon_name.toLowerCase());
    
    // Filter by type
    let matchesType = true;
    if (type && type.trim() !== '' && type !== 'null' && type !== 'undefined') {
      const couponTypeValue = 
        coupon?.discount_create_type ||
        coupon?.discountCreateType ||
        '';
      
      const couponType = String(couponTypeValue).toUpperCase().trim();
      const filterType = type.toUpperCase().trim();
      
      matchesType = couponType === filterType && couponType !== '';
    }
    
    return matchesSearch && matchesType;
  });


  return <CouponsView coupons={filteredProducts} count={filteredProducts.length} />;
};

export default Page;
