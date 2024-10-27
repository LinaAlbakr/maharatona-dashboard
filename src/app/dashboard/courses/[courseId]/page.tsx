import { fetchCourseInfo } from 'src/actions/courses';
import CourseDetailsView from 'src/sections/main/courses/course-details/view';

type IProps = {
  params: {
    courseId: string;
  };
};
const Page = async ({ params }: IProps) => {
  const CourseInfo = await fetchCourseInfo(params.courseId);

  return <CourseDetailsView CourseInfo={CourseInfo} />;
};

export default Page;
