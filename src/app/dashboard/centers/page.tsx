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
  const page = typeof searchParams?.page === 'string' ? Number(searchParams?.page) : 1;
  const limit = typeof searchParams?.limit === 'string' ? Number(searchParams?.limit) : 5;
  const center_name = typeof searchParams?.search === 'string' ? searchParams?.search : '';
  const city_id = typeof searchParams?.city === 'string' ? searchParams?.city : '';
  const neighborhood_id = typeof searchParams?.neighborhood === 'string' ? searchParams?.neighborhood : '';

  // console.log('Centers page params:', { page, limit, center_name, city_id, neighborhood_id });

  const centers = await fetchCenters({
    limit,
    page,
    filters: center_name,
    city_id,
    neighborhood_id,
  });

  const cities = await fetchCities();
  // Find the city name from the cityId
  const selectedCity = cities.find((city) => city.id === city_id);
  const neighborhoods = city_id ? await fetchCityNeighborhoods({ cityId: city_id }) : [];

  // console.log('Centers data:', { centersCount: centers?.data?.length, citiesCount: cities.length, neighborhoodsCount: neighborhoods.length });

  // Ensure centers.data is an array before mapping
  const centersData = Array.isArray(centers?.data) ? centers.data : [];
  const normalizedCenters: ICenter[] = centersData.map((center: any) => ({
    ...center,
    id: center.id || center._id,
    phone: center.phone || '',
    user_id: center.user_id || center.userId || '',
    userStatus: center.userStatus || center.status || 'ActiveClient',
    walletBalance: center.walletBalance || center.wallet_balance || 0,
    number_of_courses: center.number_of_courses || center.numberOfCourses || 0,
    number_of_registrants: center.number_of_registrants || center.numberOfRegistrants || 0,
    neighborhood: center.neighborhood
      ? typeof center.neighborhood === 'string'
        ? {
            id: '',
            name: center.neighborhood,
            city: {
              id: '',
              name: typeof center.city === 'string' ? center.city : center.city?.name || '',
            },
          }
        : center.neighborhood
      : {
          id: '',
          name: '',
          city: {
            id: '',
            name: '',
          },
        },
  }));

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
      count={centers?.meta?.itemCount || filteredProducts.length}
    />
  );
};

export default Page;
