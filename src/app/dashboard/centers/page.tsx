import { fetchCenters, fetchCities, fetchCityNeighborhoods } from 'src/actions/centers';
import CentersView from 'src/sections/main/centers/view';
import { ICenter } from 'src/types/centers';

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
  const neighborhoods = city_id ? await fetchCityNeighborhoods({ cityId: city_id }) : [];

  const filteredProducts: ICenter[] = centers?.data;

  return (
    <CentersView
      centers={filteredProducts}
      cities={cities}
      neighborhoods={neighborhoods}
      count={centers?.meta?.itemCount}
    />
  );
};

export default Page;
