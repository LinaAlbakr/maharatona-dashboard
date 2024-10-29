'use client';
import { useTranslate } from 'src/locales';
import { Box, Typography } from '@mui/material';

import Image from 'next/image';

type props = {
  statistics: any;
};

const Statistics = ({ statistics }: Readonly<props>) => {
  const { t } = useTranslate();
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr', md: '1fr 1fr 1fr' },
        paddingInline: 4,
        gap: 2,
        mb: 4,
      }}
    >
      <Box
        sx={{
          display: 'flex ',
          borderRadius: '10px',
          bgcolor: '#D5F3E6',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body1" color="#004B50">
            {t('LABEL.CLIENTS_NUMBER')}
          </Typography>
          <Typography variant="h3" color="#004B50" fontWeight={700}>
            {statistics?.clients}
          </Typography>
        </Box>
        <Image src="/assets/images/home/clients.svg" alt="image" width={50} height={50} />
      </Box>
      <Box
        sx={{
          display: 'flex ',
          borderRadius: '10px',
          bgcolor: '#FFF3D7',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body1" color="#7A4100">
            {t('LABEL.CLIENTS_WHO_BOOKED_COURSES')}
          </Typography>
          <Typography variant="h4" color="#7A4100" sx={{ textOverflow: 'truncate' }}>
            {statistics?.clientsAndCourses}
          </Typography>
        </Box>
        <Image src="/assets/images/home/booked.svg" alt="image" width={50} height={50} />
      </Box>
      <Box
        sx={{
          display: 'flex ',
          borderRadius: '10px',
          bgcolor: '#FDD9F7',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body1" color="#7A0068">
            {t('LABEL.CENTERS_NUMBER')}
          </Typography>
          <Typography variant="h4" color="#7A0068">
            {statistics?.centers}
          </Typography>
        </Box>
        <Image src="/assets/images/home/centers.svg" alt="image" width={50} height={50} />
      </Box>
    </Box>
  );
};

export default Statistics;
