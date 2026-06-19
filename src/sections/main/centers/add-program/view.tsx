'use client';

import Container from '@mui/material/Container';

import { useSettingsContext } from 'src/components/settings';

import ProgramWizard from './program-wizard';
import type { CategoryOption } from './types';

type Props = {
  mode?: 'create' | 'edit';
  courseId?: string;
  centerId: string;
  centerName: string;
  categories: CategoryOption[];
  initialCourse?: Record<string, unknown>;
};

const AddProgramView = ({
  mode = 'create',
  courseId,
  centerId,
  centerName,
  categories,
  initialCourse,
}: Props) => {
  const settings = useSettingsContext();

  return (
    <Container
      maxWidth={settings.themeStretch ? false : 'lg'}
      sx={{ py: { xs: 3, md: 4 } }}
    >
      <ProgramWizard
        mode={mode}
        courseId={courseId}
        centerId={centerId}
        centerName={centerName}
        categories={categories}
        initialCourse={initialCourse}
      />
    </Container>
  );
};

export default AddProgramView;
