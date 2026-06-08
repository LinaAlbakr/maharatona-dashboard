import AddProgramView from 'src/sections/main/centers/add-program/view';
import { fetchCenterInfo } from 'src/actions/centers';
import { fetchCategories } from 'src/actions/categories';

type IProps = {
  params: {
    centerId: string;
  };
};

const Page = async ({ params }: IProps) => {
  const [centerInfo, categoriesRes] = await Promise.all([
    fetchCenterInfo(params.centerId),
    fetchCategories({ limit: 200 }),
  ]);

  const categories = (categoriesRes?.data ?? []).map((category: any) => ({
    id: category.id || category._id,
    name: category.name || category.name_en || category.name_ar || '',
    name_ar: category.name_ar,
    name_en: category.name_en,
  }));

  return (
    <AddProgramView
      centerId={params.centerId}
      centerName={
        centerInfo?.name ||
        centerInfo?.name_en ||
        centerInfo?.name_ar ||
        centerInfo?.center_name ||
        ''
      }
      categories={categories}
    />
  );
};

export default Page;
