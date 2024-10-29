import { fetchStatistics, fetchTopCourses } from 'src/actions/home';
import MainPage from 'src/sections/main/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard | Main',
};

type props = {
  searchParams: { [key: string]: string | string[] | undefined };
};
export default async function Page({ searchParams }: Readonly<props>) {
  const page = typeof searchParams?.page === 'string' ? Number(searchParams?.page) : 1;
  const limit = typeof searchParams?.limit === 'string' ? Number(searchParams?.limit) : 5;

  const courses = await fetchTopCourses({
    limit,
    page,
  });
  const statistics = await fetchStatistics();

  const filteredProducts: any[] = courses?.data;

  return (
    <MainPage courses={filteredProducts} count={courses?.meta?.itemCount} statistics={statistics} />
  );
}
