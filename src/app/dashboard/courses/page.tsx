import { fetchCourses } from 'src/actions/courses';
import CoursesView from 'src/sections/main/courses/view';

export const metadata = {
  title: 'Programs',
};

type props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

const Page = async ({ searchParams }: Readonly<props>) => {
  const limit = typeof searchParams?.limit === 'string' ? Number(searchParams?.limit) : 20;
  const course_name = typeof searchParams?.search === 'string' ? searchParams?.search : '';

  // Backend already filters by program name (ar/en) and center name — do not
  // re-filter client-side (that dropped English matches when UI language was Arabic).
  const courses = await fetchCourses({
    limit,
    filters: course_name,
  });

  const coursesData = Array.isArray(courses?.data) ? courses.data : [];

  return <CoursesView courses={coursesData} count={coursesData.length} />;
};

export default Page;
