import { fetchCategoryQuestions, fetchFaqCategories, fetchFaqCategoriesCenter } from 'src/actions/faq';
import CategoryQuestionsView from 'src/sections/main/faq/category-questions/view';
import { CategoryQuestion } from 'src/types/faq';

type IProps = {
  params: {
    categoryId: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
};
const Page = async ({ params, searchParams }: IProps) => {
  const limit = typeof searchParams?.limit === 'string' ? Number(searchParams?.limit) : 20;
  const filters = typeof searchParams?.search === 'string' ? searchParams?.search : '';

  const categoryQuestions = await fetchCategoryQuestions({
    limit,
    filters,
    categoryId: params.categoryId,
  });

  const studentCategoryRes = await fetchFaqCategories({
    limit: 1,
    categoryId: params.categoryId,
  });
  const centerCategoryRes = await fetchFaqCategoriesCenter({
    limit: 1,
    categoryId: params.categoryId,
  });

  const selectedCategory =
    (Array.isArray(studentCategoryRes?.data) ? studentCategoryRes.data[0] : undefined) ||
    (Array.isArray(centerCategoryRes?.data) ? centerCategoryRes.data[0] : undefined);

  const filteredProducts: CategoryQuestion[] = Array.isArray(categoryQuestions?.data) ? categoryQuestions.data : [];
  
  return (
    <CategoryQuestionsView
      questions={filteredProducts}
      count={filteredProducts.length}
      categoryId={params.categoryId}
      categoryNameAr={selectedCategory?.name_ar || ''}
      categoryNameEn={selectedCategory?.name_en || ''}
    />
  );
};

export default Page;
