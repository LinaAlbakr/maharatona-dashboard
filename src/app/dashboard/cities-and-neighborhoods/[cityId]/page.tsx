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
  const limit = typeof searchParams?.limit === 'string' ? Number(searchParams?.limit) : 20;
  const filters = typeof searchParams?.search === 'string' ? searchParams?.search : '';

  const neighborhoods = await fetchNeighborhoods({ limit, filters, cityId: params.cityId });

  return (
    <NeighborhoodsView
      neighborhoods={Array.isArray(neighborhoods?.data) ? neighborhoods.data : []}
      count={Array.isArray(neighborhoods?.data) ? neighborhoods.data.length : 0}
      cityId={params.cityId}
    />
  );
};

export default Page;
