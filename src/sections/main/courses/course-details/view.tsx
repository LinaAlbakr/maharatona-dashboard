'use client';

import FixedProgramDetailsView from './fixed-program-details';
import LegacyCourseDetailsView from './legacy-course-details';
import { isFixedCourse } from './utils';

interface Props {
  CourseInfo?: any;
}

const CourseDetailsView = ({ CourseInfo }: Props) => {
  const course = CourseInfo?.data ?? CourseInfo;

  if (isFixedCourse(course)) {
    return <FixedProgramDetailsView course={course} />;
  }

  return <LegacyCourseDetailsView course={course} />;
};

export default CourseDetailsView;
