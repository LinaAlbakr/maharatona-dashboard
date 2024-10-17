'use client';

import { Container, Pagination, Stack } from '@mui/material';
import React, { useCallback, useEffect } from 'react';
import { useSettingsContext } from 'src/components/settings';
import { useTranslate } from 'src/locales';
import CourseCard from '../components/course-card';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
type Props = {
  CenterCourses: any;
};
const Courses = ({ CenterCourses }: Props) => {
  const { t } = useTranslate();
  const settings = useSettingsContext();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const count = (count: number) => {
    if (count / 6 > 1) {
      return Math.ceil(count / 6);
    } else return 1;
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
    <Container maxWidth={settings.themeStretch ? false : 'xl'} sx={{ margin: '0px !important', padding: '0px !important' }}>
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
        {CenterCourses.data.map((course: any) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </Stack>
      <Pagination
        sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}
        count={count(CenterCourses.meta.itemCount)}
        page={Number(searchParams.get('page')) || 1}
        color="secondary"
        onChange={handleChange}
      />
    </Container>
  );
};

export default Courses;
