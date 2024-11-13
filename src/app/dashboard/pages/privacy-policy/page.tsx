import { fetchStaticPage } from 'src/actions/static-pages';
import PrivacyPolicyView from 'src/sections/main/pages/privacy-policy';

export const metadata = {
  title: 'Privacy Policy',
};

const Page = async () => {
  const PRIVACY_POLICY = await fetchStaticPage('PRIVACY_POLICY');

  return <PrivacyPolicyView privacyPolicy={PRIVACY_POLICY} />;
};

export default Page;
