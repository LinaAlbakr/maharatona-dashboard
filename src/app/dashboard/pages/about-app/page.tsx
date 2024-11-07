import { fetchStaticPage } from 'src/actions/static-pages';
import AboutAppView from 'src/sections/main/pages/about-us/about-app';

export const metadata = {
  title: 'About App',
};

const Page = async () => {
  const ABOUT_US_CENTER = await fetchStaticPage('ABOUT_US_CENTER');
  const ABOUT_US_CLIENT = await fetchStaticPage('ABOUT_US_CLIENT');

  return <AboutAppView aboutCenter={ABOUT_US_CENTER} aboutClient={ABOUT_US_CLIENT} />;
};

export default Page;
