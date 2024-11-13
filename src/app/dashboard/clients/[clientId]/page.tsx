import { fetchClientChildren, fetchClientCourses, fetchClientInfo } from 'src/actions/clients';
import ClientDetailsView from 'src/sections/main/clients/client-details/view';

type IProps = {
  params: {
    clientId: string;
  };
  searchParams: { [key: string]: string | string[] | undefined }
};
const Page = async ({ params, searchParams }: IProps) => {
  const tab = typeof searchParams.tab === 'string' ? searchParams.tab : undefined;
  const page = typeof searchParams?.page === 'string' ? Number(searchParams?.page) : 1;
  const limit = typeof searchParams?.limit === 'string' ? Number(searchParams?.limit) : 6;
  const child_name = typeof searchParams?.search === 'string' ? searchParams?.search : '';

  const ClientInfo = await fetchClientInfo(params.clientId);
  const ClientCourses = await fetchClientCourses(page, limit, params.clientId);
  const ClientChildren = await fetchClientChildren(page, limit, child_name, params.clientId);

  return (
    <ClientDetailsView
      tab={tab}
      ClientInfo={ClientInfo}
      ClientCourses={ClientCourses}
      ClientChildren={ClientChildren}
    />
  );
};

export default Page;
