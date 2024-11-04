import { fetchTechnicalSupportItems } from 'src/actions/support';
import TechnicalSupportView from 'src/sections/main/support/technical-support/view';

export const metadata = {
  title: 'Technical Support',
};

type props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

const Page = async ({ searchParams }: Readonly<props>) => {
  const page = typeof searchParams?.page === 'string' ? Number(searchParams?.page) : 1;
  const limit = typeof searchParams?.limit === 'string' ? Number(searchParams?.limit) : 5;
  const reason_name = typeof searchParams?.search === 'string' ? searchParams?.search : '';
  const type = typeof searchParams?.type === 'string' ? searchParams?.type : null;

  const items = await fetchTechnicalSupportItems({
    limit,
    page,
    filters: reason_name,
    type,
  });

  const filteredReasons: any[] = items?.data;

  return <TechnicalSupportView items={filteredReasons} count={items?.meta?.itemCount} />;
};

export default Page;
