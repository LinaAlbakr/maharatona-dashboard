import { fetchContractOverview } from 'src/actions/contract';
import ContractPageView from 'src/sections/main/pages/contract-page/contarct-page';

export const metadata = {
  title: 'Contract Page',
};

const Page = async () => {
  const contractOverview = await fetchContractOverview('CONTRACT_PAGE_CENTER');

  return <ContractPageView contractOverview={contractOverview} />;
};

export default Page;
