import AddProgramView from 'src/sections/main/centers/add-program/view';
import { fetchCenterInfo } from 'src/actions/centers';

type IProps = {
  params: {
    centerId: string;
  };
};

const Page = async ({ params }: IProps) => {
  const centerInfo = await fetchCenterInfo(params.centerId);

  return <AddProgramView centerId={params.centerId} centerName={centerInfo?.name ?? ''} />;
};

export default Page;
