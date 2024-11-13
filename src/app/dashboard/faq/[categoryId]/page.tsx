import { fetchCategoryQuestions } from 'src/actions/faq';
import CategoryQuestionsView from 'src/sections/main/faq/category-questions/view';
import { CategoryQuestion } from 'src/types/faq';

type IProps = {
  params: {
    categoryId: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
};
const Page = async ({ params, searchParams }: IProps) => {
  const page = typeof searchParams?.page === 'string' ? Number(searchParams?.page) : 1;
  const limit = typeof searchParams?.limit === 'string' ? Number(searchParams?.limit) : 6;
  const filters = typeof searchParams?.search === 'string' ? searchParams?.search : '';

  const categoryQuestions = await fetchCategoryQuestions({
    page,
    limit,
    filters,
    categoryId: params.categoryId,
  });
  const filteredProducts: CategoryQuestion[] = categoryQuestions?.data;

  return (
    <CategoryQuestionsView
      questions={filteredProducts}
      count={categoryQuestions?.meta?.itemCount}
      categoryId={params.categoryId}
    />
  );
};

export default Page;
