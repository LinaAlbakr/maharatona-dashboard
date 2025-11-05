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

  // When filtering client-side, fetch ALL coupons (or a large number) to ensure we have data to filter
  // Don't rely on backend filtering as it might return empty results
  const fetchLimit = (coupon_name || type) ? 1000 : limit;

  // Don't pass type to backend if we're doing client-side filtering
  // Fetch all coupons and filter client-side
  const coupons = await fetchCoupons({
    limit: fetchLimit,
    page: 1,
    filters: '', // Don't filter by name on backend, do it client-side
    type: null // Don't filter by type on backend, do it client-side
  });

  // Handle different response structures
  let docs = [];
  if (coupons?.data?.docs) {
    docs = coupons.data.docs;
  } else if (Array.isArray(coupons?.data)) {
    docs = coupons.data;
  } else if (Array.isArray(coupons)) {
    docs = coupons;
  }

  // Map and normalize the coupons - keep all original properties for filtering
  const mappedCoupons = docs.map((c: any) => ({
    ...c, // Keep all original properties (important for filtering)
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

  // Apply client-side filtering
  const filteredProducts = mappedCoupons.filter((coupon: any) => {
    // Filter by search term (coupon code)
    const matchesSearch = !coupon_name || coupon_name.trim() === '' ||
      String(coupon?.code || '').toLowerCase().includes(coupon_name.toLowerCase());
    
    // Filter by type - check ALL possible property names and locations
    let matchesType = true;
    if (type && type.trim() !== '' && type !== 'null' && type !== 'undefined') {
      // Get the type value from the original coupon object (before mapping)
      // Check multiple possible property names and variations
      const rawCoupon = docs.find((d: any) => (d?._id || d?.id) === coupon?.id) || coupon;
      
      const couponTypeValue = 
        rawCoupon?.discount_create_type ||
        rawCoupon?.discountCreateType ||
        coupon?.discount_create_type ||
        coupon?.discountCreateType ||
        rawCoupon?.type ||
        coupon?.type ||
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
