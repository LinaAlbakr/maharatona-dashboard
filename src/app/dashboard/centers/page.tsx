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
  const neighborhoods = city_id && selectedCity ? await fetchCityNeighborhoods({ cityName: selectedCity.name }) : [];

  const filteredProducts: ICenter[] = centers?.data?.map((center: any) => ({
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

  return (
    <CentersView
      centers={filteredProducts}
      cities={cities}
      neighborhoods={neighborhoods}
      count={centers?.pagination?.totalItems}
    />
  );
};

export default Page;
