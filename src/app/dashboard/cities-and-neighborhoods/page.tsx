import { fetchCities } from 'src/actions/cities-and-neighborhoods';
import CategoriesView from 'src/sections/main/categories/view';
import CitiesView from 'src/sections/main/cities/view';
import { ICenter } from 'src/types/centers';

export const metadata = {
  title: 'Cities',
};

type props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

const Page = async ({ searchParams }: Readonly<props>) => {
  const limit = typeof searchParams?.limit === 'string' ? Number(searchParams?.limit) : 20;
  const city_name = typeof searchParams?.search === 'string' ? searchParams?.search : '';

  const centers = await fetchCities({
    limit,
    filters: city_name,
  });

  const filteredProducts: ICenter[] = (Array.isArray(centers?.data) ? centers.data : []).map(
    (c: any) => ({
      ...c,
      id: c?.id || c?._id,
    })
  );

  return <CitiesView cities={filteredProducts} count={filteredProducts.length} />;
};

export default Page;
