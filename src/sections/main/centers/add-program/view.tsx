'use client';

import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { useTranslate } from 'src/locales';

import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';

type Props = {
  centerId: string;
  centerName: string;
};

const AddProgramView = ({ centerId, centerName }: Props) => {
  const settings = useSettingsContext();
  const router = useRouter();
  const { t } = useTranslate();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Box sx={{ py: 4 }}>
        <Button
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          onClick={() => router.push(paths.dashboard.centers)}
          sx={{ mb: 3 }}
        >
          {t('LABEL.EDUCATIONAL_CENTERS')}
        </Button>

        <Typography variant="h4" sx={{ mb: 1 }}>
          {t('LABEL.ADD_PROGRAM')}
        </Typography>
        {centerName ? (
          <Typography variant="body1" color="text.secondary">
            {centerName}
          </Typography>
        ) : null}
      </Box>
    </Container>
  );
};

export default AddProgramView;
