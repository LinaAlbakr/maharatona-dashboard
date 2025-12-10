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
  const limit = typeof searchParams?.limit === 'string' ? Number(searchParams?.limit) : 20;
  const category_name = typeof searchParams?.search === 'string' ? searchParams?.search : '';
 

  const categories = await fetchFaqCategories({
    limit,
    filters: category_name,
  });


   const categoriesCenter = await fetchFaqCategoriesCenter({
    limit,
    filters: category_name,
  });

  const filteredProducts: FaqCategory[] = (Array.isArray(categories?.data) ? categories.data : []).map((c: any) => ({
    id: c?._id,
    ...c,
  }));
  const filteredProductsCenter: FaqCategory[] = (Array.isArray(categoriesCenter?.data) ? categoriesCenter.data : []).map((c: any) => ({
    id: c?._id,
    ...c,
  }));

  return <FaqView categories={filteredProducts} categoriesCenter={filteredProductsCenter} count={filteredProducts.length} />;
};

export default Page;
