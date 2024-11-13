import { fetchStaticPage } from 'src/actions/static-pages';
import HomeScreenView from 'src/sections/main/pages/home-screen';

export const metadata = {
  title: 'Home Screen',
};

const Page = async () => {
  const HOME_SCREEN = await fetchStaticPage('HOME_SCREEN');

  return <HomeScreenView HomeScreen={HOME_SCREEN} />;
};

export default Page;
