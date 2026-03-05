
import { fetchCallsReasons } from 'src/actions/support';
import CallsReasonsView from 'src/sections/main/support/calls-reasons/view';

export const metadata = {
  title: 'Reasons for contacting',
};

type props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

const Page = async ({ searchParams }: Readonly<props>) => {
  const limit = typeof searchParams?.limit === 'string' ? Number(searchParams?.limit) : 20;
  const reason_name = typeof searchParams?.search === 'string' ? searchParams?.search : '';

  const reasons = await fetchCallsReasons({
    limit,
    filters: reason_name,
  });

  const reasonsData = Array.isArray(reasons?.data) ? reasons.data : [];
  const filteredReasons: any[] = reasonsData.map((r: any) => ({
    id: r?._id,
    ...r,
  }));

  return <CallsReasonsView reasons={filteredReasons} count={filteredReasons.length} />;
};

export default Page;
