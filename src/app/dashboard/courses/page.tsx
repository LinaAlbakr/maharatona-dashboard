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

  const courses = await fetchCourses({
    limit,
    filters: course_name,
  });

  const coursesData = Array.isArray(courses?.data) ? courses.data : [];
  const searchTerm = course_name.trim().toLowerCase();

  // Match program name (ar/en) OR center name — independent of UI language cookie,
  // so English program names are findable even when Language cookie is ar.
  const filteredProducts = coursesData.filter((course: any) => {
    if (!searchTerm) return true;

    const haystacks = [
      course?.name,
      course?.name_ar,
      course?.name_en,
      course?.center?.name,
    ]
      .filter((value) => value != null && String(value).trim() !== '')
      .map((value) => String(value).toLowerCase());

    return haystacks.some((value) => value.includes(searchTerm));
  });

  return <CoursesView courses={filteredProducts} count={filteredProducts.length} />;
};

export default Page;
