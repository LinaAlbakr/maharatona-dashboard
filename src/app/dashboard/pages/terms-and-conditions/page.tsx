import { fetchStaticPage } from 'src/actions/static-pages';
import PrivacyPolicyView from 'src/sections/main/pages/privacy-policy';
import TermsAndConditionsView from 'src/sections/main/pages/term-and-conditions';

export const metadata = {
  title: 'Terms And Conditions',
};

const Page = async () => {
  const TERMS_AND_CONDITIONS_STUDENT = await fetchStaticPage('TERMS_AND_CONDITIONS_STUDENT');
  const TERMS_AND_CONDITIONS_CENTER = await fetchStaticPage('TERMS_AND_CONDITIONS_CENTER');

  return <TermsAndConditionsView termsAndConditionsStudent={TERMS_AND_CONDITIONS_STUDENT} termsAndConditionsCenter={TERMS_AND_CONDITIONS_CENTER} />;
};

export default Page;
