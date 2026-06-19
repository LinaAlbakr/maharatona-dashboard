'use client';

import { Container, Pagination, Stack } from '@mui/material';
import React, { useCallback } from 'react';
import { useSettingsContext } from 'src/components/settings';
import CourseCard from '../components/course-card';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
type Props = {
  CenterCourses: any;
};
const PAGE_SIZE = 6;

const Courses = ({ CenterCourses }: Props) => {
  const settings = useSettingsContext();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const currentPage = Number(searchParams.get('page')) || 1;
  const allCourses = CenterCourses?.data ?? [];
  const paginatedCourses = allCourses.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  const pageCount = (total: number) => {
    if (total <= 0) return 1;
    return Math.max(1, Math.ceil(total / PAGE_SIZE));
  };
  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    createQueryString(value);
  };
  
  const createQueryString = useCallback(
    (value: number) => {
      if (value) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', String(value));
        router.push(`${pathname}?${params.toString()}`);
      } else {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', String(1));
        router.push(`${pathname}?${params.toString()}`);
      }
    },
    [pathname, router, searchParams]
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'} sx={{ margin: '0px !important', padding: { xs: '5px !important', sm: '0px !important' }}}>
      <Stack
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            lg: 'repeat(3, 1fr)',
            md: 'repeat(2, 1fr)',
            xs: '1fr',
          },
          justifyContent: 'center',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {paginatedCourses.map((course: any) => (
          <CourseCard key={course._id ?? course.id} course={course} />
        ))}
      </Stack>
      <Pagination
        sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}
        count={pageCount(CenterCourses?.meta?.itemCount ?? allCourses.length)}
        page={currentPage}
        color="secondary"
        onChange={handleChange}
      />
    </Container>
  );
};

export default Courses;
