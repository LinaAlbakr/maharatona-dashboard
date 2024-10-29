import { fetchCities } from 'src/actions/centers';
import { fetchClients, fetchfields } from 'src/actions/clients';
import ClientsView from 'src/sections/main/clients/view';
import { ICenter } from 'src/types/centers';

type props = {
  searchParams: { [key: string]: string | string[] | undefined };
};
export const metadata = {
  title: 'Clients',
};


const Page = async ({ searchParams }: Readonly<props>) => {
  const page = typeof searchParams?.page === 'string' ? Number(searchParams?.page) : 1;
  const limit = typeof searchParams?.limit === 'string' ? Number(searchParams?.limit) : 5;
  const city_id = typeof searchParams?.city === 'string' ? searchParams?.city : '';
  const by_client_field_ids =
    typeof searchParams?.field === 'string' ? searchParams?.field : '';

  const clients = await fetchClients({
    page,
    limit,
    city_id,
    by_client_field_ids,
  });

  const cities = await fetchCities();
  const fields = await fetchfields();

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
