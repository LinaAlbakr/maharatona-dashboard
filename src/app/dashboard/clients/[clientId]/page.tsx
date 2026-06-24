import { fetchCities, fetchClientInfo } from 'src/actions/clients';
import { fetchCategories } from 'src/actions/categories';
import ClientDetailsView from 'src/sections/main/clients/client-details/view';
import { cookies } from 'next/headers';

type IProps = {
  params: {
    clientId: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
};

const Page = async ({ params, searchParams }: IProps) => {
  const tab = typeof searchParams.tab === 'string' ? searchParams.tab : undefined;
  const lang = cookies().get('Language')?.value;

  const [ClientInfo, citiesData, categoriesRes] = await Promise.all([
    fetchClientInfo(params.clientId),
    fetchCities(),
    fetchCategories({ limit: 200 }),
  ]);

  const cities = (Array.isArray(citiesData) ? citiesData : []).map((city: any) => ({
    id: String(city._id ?? city.id ?? ''),
    name: lang === 'ar' ? city.name_ar : city.name_en,
  }));

  const fields = (categoriesRes?.data ?? []).map((field: any) => ({
    id: String(field._id ?? field.id ?? ''),
    name_en: field.name_en,
    name_ar: field.name_ar,
    name: field.name,
  }));

  const ClientCourses = {
    data: ClientInfo.courses,
    meta: {
      itemCount: ClientInfo?.enrolled_courses || 0,
    },
  };

  const ClientChildren = {
    data: ClientInfo?.child || [],
    meta: {
      itemCount: ClientInfo?.child?.length || 0,
    },
  };

  return (
    <ClientDetailsView
      tab={tab}
      ClientInfo={ClientInfo}
      ClientCourses={ClientCourses}
      ClientChildren={ClientChildren}
      cities={cities}
      fields={fields}
    />
  );
};

export default Page;
