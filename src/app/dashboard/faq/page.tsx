import { fetchFaqCategories, fetchFaqCategoriesCenter } from 'src/actions/faq';
import FaqView from 'src/sections/main/faq/view';
import { FaqCategory } from 'src/types/faq';

export const metadata = {
  title: 'Faq',
};

type props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

const Page = async ({ searchParams }: Readonly<props>) => {
  const page = typeof searchParams?.page === 'string' ? Number(searchParams?.page) : 1;
  const limit = typeof searchParams?.limit === 'string' ? Number(searchParams?.limit) : 100;
  const category_name = typeof searchParams?.search === 'string' ? searchParams?.search : '';
 

  const categories = await fetchFaqCategories({
    limit,
    page,
    filters: category_name,
  });


   const categoriesCenter = await fetchFaqCategoriesCenter({
    limit,
    page,
    filters: category_name,
  });

  const filteredProducts: FaqCategory[] = categories?.data;
  const filteredProductsCenter: FaqCategory[] = categoriesCenter?.data;

  return <FaqView categories={filteredProducts} categoriesCenter={filteredProductsCenter} metaCenter={categoriesCenter?.meta} meta={categories?.meta} count={categories?.meta?.itemCount} />;
};

export default Page;
