import { fetchCategories } from 'src/actions/categories';
import CategoriesView from 'src/sections/main/categories/view';
import { ICenter } from 'src/types/centers';

export const metadata = {
  title: 'Caterories',
};

type props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

const Page = async ({ searchParams }: Readonly<props>) => {
  const limit = typeof searchParams?.limit === 'string' ? Number(searchParams?.limit) : 20;
  const categories_name = typeof searchParams?.search === 'string' ? searchParams?.search : '';

  const categories = await fetchCategories({
    limit,
    filters: categories_name,
  });

  const filteredProducts: ICenter[] = Array.isArray(categories?.data) ? categories.data : [];

  return <CategoriesView categories={filteredProducts} count={filteredProducts.length} />;
};

export default Page;
