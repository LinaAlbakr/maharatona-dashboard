import { fetchCities } from 'src/actions/centers';
import { fetchClients } from 'src/actions/clients';
import ClientsView from 'src/sections/main/clients/view';
import { ICenter } from 'src/types/centers';

type props = {
  searchParams: { [key: string]: string | string[] | undefined };
};
export const metadata = {
  title: 'Clients',
};


const Page = async ({ searchParams }: Readonly<props>) => {
  const limit = typeof searchParams?.limit === 'string' ? Number(searchParams?.limit) : 20;
  const by_name = typeof searchParams?.search === 'string' ? searchParams?.search : '';
  const city_id = typeof searchParams?.city === 'string' ? searchParams?.city : '';

  const clients = await fetchClients({
    limit,
    city_id,
    by_name,
  });

  const cities = await fetchCities();

  // Transform clients data to map _id to id for UI compatibility
  const clientsData = Array.isArray(clients?.data) ? clients.data : [];
  const filteredProducts: ICenter[] = clientsData.map((client: any) => ({
    ...client,
    id: client._id || client.id,
  }));

  return (
    <ClientsView
      clients={filteredProducts}
      cities={cities}
      count={filteredProducts.length}
    />
  );
};

export default Page;
