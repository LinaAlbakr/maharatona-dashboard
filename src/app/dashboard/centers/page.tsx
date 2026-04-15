import { fetchCenters, fetchCities, fetchCityNeighborhoods } from 'src/actions/centers';
import CentersView from 'src/sections/main/centers/view';
import { ICenter } from 'src/types/centers';


export const metadata = {
  title: 'Centers',
};


type props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

const Page = async ({ searchParams }: Readonly<props>) => {
  const limit = typeof searchParams?.limit === 'string' ? Number(searchParams?.limit) : 20;
  const center_name = typeof searchParams?.search === 'string' ? searchParams?.search : '';
  const city_id = typeof searchParams?.city === 'string' ? searchParams?.city : '';
  const neighborhood_id = typeof searchParams?.neighborhood === 'string' ? searchParams?.neighborhood : '';


  const centers = await fetchCenters({
    limit,
    filters: center_name,
    city_id,
    neighborhood_id,
  });

  const cities = await fetchCities();
  // Find the city name from the cityId
  const selectedCity = cities.find((city) => city.id === city_id);
  const neighborhoods = city_id ? await fetchCityNeighborhoods({ cityId: city_id }) : [];

  // Ensure centers.data is an array before mapping
  const centersData = Array.isArray(centers?.data) ? centers.data : [];
  const normalizedCenters: ICenter[] = centersData.map((center: any) => {
    let neighborhood;

    if (center.neighborhood) {
      if (typeof center.neighborhood === 'string') {
        neighborhood = {
          id: '',
          name: center.neighborhood,
          city: {
            id: '',
            name: typeof center.city === 'string' ? center.city : center.city?.name || '',
          },
        };
      } else {
        neighborhood = center.neighborhood;
      }
    } else {
      neighborhood = {
        id: '',
        name: '',
        city: {
          id: '',
          name: '',
        },
      };
    }

    return {
      ...center,
      id: center.id || center._id,
      phone: center.phone || '',
      user_id: center.user_id || center.userId || '',
      is_active: center.is_active !== false,
      userStatus: center.userStatus || center.status || 'ActiveClient',
      walletBalance: center.wallet_balance || center.wallet_balance || 0,
      number_of_courses: center.total_courses || center.total_courses || 0,
      number_of_registrants: center.total_registrants || center.total_registrants || 0,
      neighborhood,
    };
  });

  // Resolve selected city/neighborhood names from IDs for client-side filtering fallback
  const selectedCityName = city_id ? selectedCity?.name ?? '' : '';
  const selectedNeighborhoodName = neighborhood_id
    ? (neighborhoods.find((n) => n.id === neighborhood_id)?.name ?? '')
    : '';

  // Apply client-side filters to ensure UI behaves even if backend ignores params
  const filteredProducts = (normalizedCenters || []).filter((center) => {
    const matchesName = center_name
      ? String(center.name || '')
        .toLowerCase()
        .includes(String(center_name).toLowerCase())
      : true;

    const matchesCity = selectedCityName
      ? String(center.neighborhood?.city?.name || '') === selectedCityName
      : true;

    const matchesNeighborhood = selectedNeighborhoodName
      ? String(center.neighborhood?.name || '') === selectedNeighborhoodName
      : true;

    return matchesName && matchesCity && matchesNeighborhood;
  });

  return (
    <CentersView
      centers={filteredProducts}
      cities={cities}
      neighborhoods={neighborhoods}
      count={filteredProducts.length}
    />
  );
};

export default Page;
