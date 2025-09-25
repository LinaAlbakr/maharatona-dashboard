import { fetchStaticPage } from 'src/actions/static-pages';
import ContractPageView from 'src/sections/main/pages/contract-page/contarct-page';

export const metadata = {
  title: 'Contract Page',
};

const Page = async () => {
  const CONTRACT_PAGE_CENTER = await fetchStaticPage('CONTRACT_PAGE_CENTER');

  return <ContractPageView contractCenter={CONTRACT_PAGE_CENTER} />;
};

export default Page;
