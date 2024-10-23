import { fetchCourses } from 'src/actions/courses';
import CoursesView from 'src/sections/main/courses/view';

type props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

const Page = async ({ searchParams }: Readonly<props>) => {
  const page = typeof searchParams?.page === 'string' ? Number(searchParams?.page) : 1;
  const limit = typeof searchParams?.limit === 'string' ? Number(searchParams?.limit) : 5;
  const course_name = typeof searchParams?.search === 'string' ? searchParams?.search : '';

  const courses = await fetchCourses({
    limit,
    page,
    filters: course_name,
  });

  const filteredProducts: any[] = courses?.data;

  return <CoursesView courses={filteredProducts} count={courses?.meta?.itemCount} />;
};

export default Page;
