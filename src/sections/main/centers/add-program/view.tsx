'use client';

import Container from '@mui/material/Container';

import { useSettingsContext } from 'src/components/settings';

import ProgramWizard from './program-wizard';
import type { CategoryOption } from './types';

type Props = {
  centerId: string;
  centerName: string;
  categories: CategoryOption[];
};

const AddProgramView = ({ centerId, centerName, categories }: Props) => {
  const settings = useSettingsContext();

  return (
    <Container
      maxWidth={settings.themeStretch ? false : 'lg'}
      sx={{ py: { xs: 3, md: 4 } }}
    >
      <ProgramWizard
        centerId={centerId}
        centerName={centerName}
        categories={categories}
      />
    </Container>
  );
};

export default AddProgramView;
