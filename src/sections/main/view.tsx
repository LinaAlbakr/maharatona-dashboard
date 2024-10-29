'use client';

import Container from '@mui/material/Container';
import { useSettingsContext } from 'src/components/settings';
import Statistics from './home/statistics';
import TopCoursesTableView from './home/top-corses';

// ----------------------------------------------------------------------
type props = {
  statistics: any;
  courses: any[];
  count: number;
};

export default function MainPage({ statistics, courses, count }: Readonly<props>) {
  const settings = useSettingsContext();
  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Statistics statistics={statistics} />
      <TopCoursesTableView count={count} courses={courses} />
    </Container>
  );
}
