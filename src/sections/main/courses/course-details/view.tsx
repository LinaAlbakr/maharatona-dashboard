'use client';

import FixedProgramDetailsView from './fixed-program-details';
import FlexibleProgramDetailsView from './flexible-program-details';
import { isFixedCourse } from './utils';

interface Props {
  CourseInfo?: any;
}

const CourseDetailsView = ({ CourseInfo }: Props) => {
  const course = CourseInfo?.data ?? CourseInfo;

  if (isFixedCourse(course)) {
    return <FixedProgramDetailsView course={course} />;
  }

  return <FlexibleProgramDetailsView course={course} />;
};

export default CourseDetailsView;
