import { fetchClientInfo } from 'src/actions/clients';
import ClientDetailsView from 'src/sections/main/clients/client-details/view';

type IProps = {
  params: {
    clientId: string;
  };
  searchParams: {
    tab: string | string[] | undefined;
    page: string | string[] | undefined;
    limit: string | string[] | undefined;
  };
};
const Page = async ({ params, searchParams }: IProps) => {
  const tab = typeof searchParams.tab === 'string' ? searchParams.tab : undefined;
  const page = typeof searchParams?.page === 'string' ? Number(searchParams?.page) : 1;
  const limit = typeof searchParams?.limit === 'string' ? Number(searchParams?.limit) : 6;
  const CenterInfo = await fetchClientInfo(params.clientId);

  return <ClientDetailsView tab={tab} CenterInfo={CenterInfo} />;
};

export default Page;
