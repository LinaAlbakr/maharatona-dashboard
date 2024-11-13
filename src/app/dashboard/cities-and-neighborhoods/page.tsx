import { fetchCities } from 'src/actions/cities-and-neighborhoods';
import CategoriesView from 'src/sections/main/categories/view';
import CitiesView from 'src/sections/main/cities-and-neighborhoods/view';
import { ICenter } from 'src/types/centers';

export const metadata = {
  title: 'Cities',
};

type props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

const Page = async ({ searchParams }: Readonly<props>) => {
  const page = typeof searchParams?.page === 'string' ? Number(searchParams?.page) : 1;
  const limit = typeof searchParams?.limit === 'string' ? Number(searchParams?.limit) : 5;
  const city_name = typeof searchParams?.search === 'string' ? searchParams?.search : '';

  const centers = await fetchCities({
    limit,
    page,
    filters: city_name,
  });

  const filteredProducts: ICenter[] = centers?.data;

  return <CitiesView cities={filteredProducts} count={centers?.meta?.itemCount} />;
};

export default Page;
