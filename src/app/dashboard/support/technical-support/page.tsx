import { fetchTechnicalSupportItems } from 'src/actions/support';
import TechnicalSupportView from 'src/sections/main/support/technical-support/view';

export const metadata = {
  title: 'Technical Support',
};

type props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

const Page = async ({ searchParams }: Readonly<props>) => {
  const limit = typeof searchParams?.limit === 'string' ? Number(searchParams?.limit) : 20;
  const reason_name = typeof searchParams?.search === 'string' ? searchParams?.search : '';
  const type = typeof searchParams?.type === 'string' ? searchParams?.type : null;

  const items = await fetchTechnicalSupportItems({
    limit,
    filters: reason_name,
    type,
  });
  const filteredReasons: any[] = Array.isArray(items?.data) ? items.data : [];
  return <TechnicalSupportView items={filteredReasons} count={filteredReasons.length} />;
};

export default Page;
