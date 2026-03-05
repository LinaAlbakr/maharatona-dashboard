import { fetchClientInfo } from 'src/actions/clients';
import ClientDetailsView from 'src/sections/main/clients/client-details/view';

type IProps = {
  params: {
    clientId: string;
  };
  searchParams: { [key: string]: string | string[] | undefined }
};
const Page = async ({ params, searchParams }: IProps) => {
  const tab = typeof searchParams.tab === 'string' ? searchParams.tab : undefined;

  const ClientInfo = await fetchClientInfo(params.clientId);

  // Transform the client info data to match expected structure for courses and children
  const ClientCourses = {
    data: ClientInfo.courses, // No courses data in the response, but we can add it if needed
    meta: {
      itemCount: ClientInfo?.enrolled_courses || 0,
    },
  };

  const ClientChildren = {
    data: ClientInfo?.child || [],
    meta: {
      itemCount: ClientInfo?.child.length || 0,
    },
  };

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
