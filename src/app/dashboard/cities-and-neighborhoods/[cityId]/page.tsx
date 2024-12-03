import { fetchNeighborhoods } from 'src/actions/cities-and-neighborhoods';
import { fetchClientChildren } from 'src/actions/clients';
import NeighborhoodsView from 'src/sections/main/neighborhoods/view';

export const metadata = {
  title: 'Neighborhoods',
};

type IProps = {
  params: {
    cityId: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
};
const Page = async ({ params, searchParams }: IProps) => {
  const page = typeof searchParams?.page === 'string' ? Number(searchParams?.page) : 1;
  const limit = typeof searchParams?.limit === 'string' ? Number(searchParams?.limit) : 6;
  const filters = typeof searchParams?.search === 'string' ? searchParams?.search : '';

  const neighborhoods = await fetchNeighborhoods({ page, limit, filters, cityId: params.cityId });

  return (
    <NeighborhoodsView neighborhoods={neighborhoods?.data} count={neighborhoods?.meta?.itemCount} cityId={params.cityId} />
  );
};

export default Page;
