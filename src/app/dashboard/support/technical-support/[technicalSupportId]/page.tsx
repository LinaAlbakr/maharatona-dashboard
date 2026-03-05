import { fetchTechnicalSupportItemInfo } from 'src/actions/support';
import TechnicalSupportDetailsView from 'src/sections/main/support/technical-support/technical-support-details/view';

type IProps = {
  params: {
    technicalSupportId: string;
  };
};
const Page = async ({ params }: IProps) => {
  const ItemInfo = await fetchTechnicalSupportItemInfo(params.technicalSupportId);

  return <TechnicalSupportDetailsView ItemInfo={ItemInfo} />;
};

export default Page;
