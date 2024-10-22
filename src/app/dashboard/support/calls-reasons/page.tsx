// import { fetchCallsReasons } from 'src/actions/support';

import { fetchCallsReasons } from "src/actions/support";
import CallsReasonsView from "src/sections/main/support/calls-reasons/view";

type props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

const Page = async ({ searchParams }: Readonly<props>) => {
  const page = typeof searchParams?.page === 'string' ? Number(searchParams?.page) : 1;
  const limit = typeof searchParams?.limit === 'string' ? Number(searchParams?.limit) : 5;
  const reason_name = typeof searchParams?.search === 'string' ? searchParams?.search : '';

  const reasons = await fetchCallsReasons({
    limit,
    page,
    filters: reason_name,
  });

  const filteredReasons: any[] = reasons?.data;

  return <CallsReasonsView reasons={filteredReasons} count={reasons?.meta?.itemCount} />;
};

export default Page;
