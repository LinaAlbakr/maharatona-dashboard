import { fetchCourses } from 'src/actions/courses';
import CoursesView from 'src/sections/main/courses/view';
import { cookies } from 'next/headers';

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
  const lang = cookies().get('Language')?.value || 'en';
  
  // Apply client-side filtering as fallback if backend doesn't filter
  const filteredProducts = coursesData.filter((course: any) => {
    if (!course_name) return true;
    
    const searchTerm = course_name.toLowerCase();
    const courseName = course?.name || 
      (lang === 'ar' ? course?.name_ar : course?.name_en) || 
      course?.name_ar || 
      course?.name_en || 
      '';
    
    return courseName.toLowerCase().includes(searchTerm);
  });

  return <CoursesView courses={filteredProducts} count={filteredProducts.length} />;
};

export default Page;
