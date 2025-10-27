import { fetchCategories } from 'src/actions/categories';
import { fetchCities } from 'src/actions/centers';
import { fetchClients } from 'src/actions/clients';
import ClientsView from 'src/sections/main/clients/view';
import { ICenter } from 'src/types/centers';
import { cookies } from 'next/headers';

type props = {
  searchParams: { [key: string]: string | string[] | undefined };
};
export const metadata = {
  title: 'Clients',
};


const Page = async ({ searchParams }: Readonly<props>) => {
  const page = typeof searchParams?.page === 'string' ? Number(searchParams?.page) : 1;
  const limit = typeof searchParams?.limit === 'string' ? Number(searchParams?.limit) : 5;
  const by_name = typeof searchParams?.search === 'string' ? searchParams?.search : '';
  const city_id = typeof searchParams?.city === 'string' ? searchParams?.city : '';
  const by_client_field_ids =
    typeof searchParams?.field === 'string' ? searchParams?.field : '';

  const clients = await fetchClients({
    page,
    limit,
    city_id,
    by_client_field_ids,
    by_name,
  });

  const cities = await fetchCities();
  const fieldsResponse = await fetchCategories({ page: 1, limit: 100, filters: '' });
  const lang = cookies().get('Language')?.value;
  
  // Transform fields to ITems format
  const fields = (fieldsResponse?.docs || []).map((field: any) => ({
    id: field._id,
    name: lang === 'ar' ? field.name_ar : field.name_en,
  }));

  const filteredProducts: ICenter[] = clients?.data;

  return (
    <ClientsView
      clients={filteredProducts}
      cities={cities}
      fields={fields}
      count={clients?.meta?.itemCount}
    />
  );
};

export default Page;
