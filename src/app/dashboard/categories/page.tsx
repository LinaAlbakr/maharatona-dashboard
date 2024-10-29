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
  const page = typeof searchParams?.page === 'string' ? Number(searchParams?.page) : 1;
  const limit = typeof searchParams?.limit === 'string' ? Number(searchParams?.limit) : 5;
  const categories_name = typeof searchParams?.search === 'string' ? searchParams?.search : '';

  const centers = await fetchCategories({
    limit,
    page,
    filters: categories_name,
  });

  const filteredProducts: ICenter[] = centers?.data;

  return <CategoriesView categories={filteredProducts} count={centers?.meta?.itemCount} />;
};

export default Page;
