import { fetchStaticPage } from 'src/actions/static-pages';
import PrivacyPolicyView from 'src/sections/main/pages/privacy-policy';
import TermsAndConditionsView from 'src/sections/main/pages/term-and-conditions';

export const metadata = {
  title: 'Terms And Conditions',
};

const Page = async () => {
  const TERMS_AND_CONDITIONS = await fetchStaticPage('TERMS_AND_CONDITIONS');

  return <TermsAndConditionsView termsAndConditions={TERMS_AND_CONDITIONS} />;
};

export default Page;
