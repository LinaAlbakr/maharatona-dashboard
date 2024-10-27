'use client';
import { Box, Card, Container, Divider, Grid, Typography } from '@mui/material';
import Image from 'next/image';
import { useSettingsContext } from 'src/components/settings';
import { useTranslate } from 'src/locales';
import i18n from 'src/locales/i18n';
import { convertTime24to12 } from 'src/utils/format-time';

interface Props {
  CourseInfo?: any;
}
const CourseDetailsView = ({ CourseInfo }: Props) => {
  const settings = useSettingsContext();
  const { t } = useTranslate();

  return (
    <Container
      maxWidth={settings.themeStretch ? false : 'xl'}
      sx={{ margin: '0px !important', padding: '0px !important' }}
    >
      <Box
        sx={{
          backgroundImage: `url(/assets/images/courses/header.jpeg)`,
          height: '300px',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          p: 0,
          display: 'flex',
          paddingBlock: 6,
          alignItems: 'center',
          flexDirection: 'column',
          gap: 4,
          mb: 10,
          position: 'relative',
        }}
      >
        <Typography variant="h3" color="white">
          {t('LABEL.EDUCATIONAL_COURSES')}
        </Typography>
        <Image
          src={CourseInfo?.course_images[0]?.url || '/assets/images/centers/gray.jpeg'}
          width={150}
          height={150}
          alt="image"
          style={{
            borderRadius: '30px',
            position: 'absolute',
            bottom: '-50px',
          }}
        />
      </Box>
      <Card
        sx={{
          minHeight: '300px',
          py: 2,
          m: 0,
          px: 4,
          mb: 2,
        }}
      >
        <Typography variant="h5" color="secondary">
          {t('LABEL.ABOUT_COURSE')}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Typography variant="body1" color="primary" fontWeight={700}>
                {t('LABEL.COURSE_NAME')}
              </Typography>
              <Typography variant="body2" color="info.dark">
                {i18n.language === 'ar' ? CourseInfo?.name_ar || '-' : CourseInfo?.name_en || '-'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Typography variant="body1" color="primary" fontWeight={700}>
                {t('LABEL.COURSE_DESCRIPTION')}
              </Typography>
              <Typography variant="body2" color="info.dark">
                {i18n.language === 'ar'
                  ? CourseInfo?.description_ar || '-'
                  : CourseInfo?.description_en}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Typography variant="body1" color="primary" fontWeight={700}>
                {t('LABEL.START_IN')}
              </Typography>
              <Typography variant="body2" color="info.dark">
                {CourseInfo?.start_date || '-'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Typography variant="body1" color="primary" fontWeight={700}>
                {t('LABEL.FROM_HOURE')}
              </Typography>
              <Typography variant="body2" color="info.dark">
                {convertTime24to12(CourseInfo?.start_time) || '-'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Typography variant="body1" color="primary" fontWeight={700}>
                {t('LABEL.PRICE')}
              </Typography>
              <Typography variant="body2" color="info.dark">
                {Math.floor(CourseInfo?.price) + '  ' + t('LABEL.SAR') || '-'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Typography variant="body1" color="primary" fontWeight={700}>
                {t('LABEL.AGE_FROM')}
              </Typography>
              <Typography variant="body2" color="info.dark">
                {CourseInfo?.age_from || '-'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Typography variant="body1" color="primary" fontWeight={700}>
                {t('LABEL.NUMBER_OF_SEATS')}
              </Typography>
              <Typography variant="body2" color="info.dark">
                {CourseInfo?.number_of_users || 0}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Typography variant="body1" color="primary" fontWeight={700}>
                {t('LABEL.FIELD')}
              </Typography>
              <Typography variant="body2" color="info.dark">
                {i18n.language === 'ar'
                  ? CourseInfo?.field.name_ar || '-'
                  : CourseInfo?.field.name_en || '-'}
              </Typography>
            </Box>
            <Box
              sx={{ display: 'flex', flexDirection: 'column', gap: '4px', visibility: 'hidden' }}
            >
              <Typography variant="body1" color="primary" fontWeight={700}>
                {t('LABEL.DESCRIPTION_AR')}
              </Typography>
              <Typography variant="body2" color="info.dark">
                {CourseInfo?.description_en || '-'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Typography variant="body1" color="primary" fontWeight={700}>
                {t('LABEL.END_IN')}
              </Typography>
              <Typography variant="body2" color="info.dark">
                {CourseInfo?.end_date || '-'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Typography variant="body1" color="primary" fontWeight={700}>
                {t('LABEL.TO_HOURE')}
              </Typography>
              <Typography variant="body2" color="info.dark">
                {convertTime24to12(CourseInfo?.end_time) || '-'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Typography variant="body1" color="primary" fontWeight={700}>
                {t('LABEL.TOTAL_RATE')}
              </Typography>
              <Typography variant="body2" color="info.dark">
                {CourseInfo?.average_rate.slice(0, 3) || '-'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Typography variant="body1" color="primary" fontWeight={700}>
                {t('LABEL.AGE_TO')}
              </Typography>
              <Typography variant="body2" color="info.dark">
                {CourseInfo?.age_to || '-'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Typography variant="body1" color="primary" fontWeight={700}>
                {t('LABEL.NUMBER_OF_REMAINING_SEATS')}
              </Typography>
              <Typography variant="body2" color="info.dark">
                {CourseInfo?.seats || 0}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Card>
      <Card
        sx={{
          minHeight: '300px',
          py: 2,
          m: 0,
          px: 4,
        }}
      >
        <Typography variant="h5" color="secondary">
          {t('LABEL.IMAGES')}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-evenly',
            gap: 2,
            flexDirection: { md: 'row', sm: 'column' ,xs: 'column'},
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Image
              src={CourseInfo?.course_images[1]?.url || '/assets/images/centers/gray.jpeg'}
              width={250}
              height={250}
              alt="image"
              style={{
                borderRadius: '10px',
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Image
              src={CourseInfo?.course_images[2]?.url || '/assets/images/centers/gray.jpeg'}
              width={250}
              height={250}
              alt="image"
              style={{
                borderRadius: '10px',
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 1,
                height: 'fit-content',
              }}
            >
              <Image
                src={CourseInfo?.course_images[3]?.url || '/assets/images/centers/gray.jpeg'}
                width={120}
                height={120}
                alt="image"
                style={{
                  borderRadius: '10px',
                }}
              />
              <Image
                src={CourseInfo?.course_images[4]?.url || '/assets/images/centers/gray.jpeg'}
                width={120}
                height={120}
                alt="image"
                style={{
                  borderRadius: '10px',
                }}
              />
              <Image
                src={CourseInfo?.course_images[5]?.url || '/assets/images/centers/gray.jpeg'}
                width={120}
                height={120}
                alt="image"
                style={{
                  borderRadius: '10px',
                }}
              />
              <Image
                src={CourseInfo?.course_images[6]?.url || '/assets/images/centers/gray.jpeg'}
                width={120}
                height={120}
                alt="image"
                style={{
                  borderRadius: '10px',
                }}
              />
            </Box>
          </Box>
        </Box>
      </Card>
    </Container>
  );
};

export default CourseDetailsView;
