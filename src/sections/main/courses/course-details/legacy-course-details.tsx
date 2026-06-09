'use client';

import Image from 'next/image';

import { Box, Card, Divider, Container, Typography } from '@mui/material';

import { convertTime24to12, fDate } from 'src/utils/format-time';

import i18n from 'src/locales/i18n';
import { useTranslate } from 'src/locales';

import { useSettingsContext } from 'src/components/settings';

import { getDiscountedPrice } from './utils';

interface Props {
  course: any;
}

export default function LegacyCourseDetailsView({ course }: Props) {
  const settings = useSettingsContext();
  const { t } = useTranslate();
  const discountedPrice = getDiscountedPrice(course);

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
          src={course?.course_images?.[0]?.url || '/assets/images/centers/gray.jpeg'}
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
      <Card sx={{ minHeight: '300px', py: 2, m: 0, px: 4, mb: 2 }}>
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
                {i18n.language === 'ar' ? course?.name_ar || '-' : course?.name_en || '-'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Typography variant="body1" color="primary" fontWeight={700}>
                {t('LABEL.COURSE_DESCRIPTION')}
              </Typography>
              <Typography variant="body2" color="info.dark">
                {i18n.language === 'ar'
                  ? course?.description_ar || '-'
                  : course?.description_en}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Typography variant="body1" color="primary" fontWeight={700}>
                {t('LABEL.START_IN')}
              </Typography>
              <Typography variant="body2" color="info.dark">
                {course?.start_date ? fDate(course.start_date, 'yyyy-MM-dd') : '-'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Typography variant="body1" color="primary" fontWeight={700}>
                {t('LABEL.FROM_HOURE')}
              </Typography>
              <Typography variant="body2" color="info.dark">
                {(() => {
                  const v = course?.start_time as string | undefined;
                  if (!v) return '-';
                  return /am|pm/i.test(v) ? v : convertTime24to12(v);
                })()}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Typography variant="body1" color="primary" fontWeight={700}>
                {t('LABEL.PRICE')}
              </Typography>
              <Typography variant="body2" color="info.dark">
                <Image src="/assets/images/sar-logo.svg" alt="sar logo" height={20} width={20} />{' '}
                {Math.floor(course?.price)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Typography variant="body1" color="primary" fontWeight={700}>
                {t('LABEL.DISCOUNTED_PRICE')}
              </Typography>
              <Typography variant="body2" color="info.dark">
                {discountedPrice != null ? (
                  <>
                    <Image src="/assets/images/sar-logo.svg" alt="sar logo" height={20} width={20} />{' '}
                    {Math.floor(discountedPrice)}
                  </>
                ) : (
                  '-'
                )}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Typography variant="body1" color="primary" fontWeight={700}>
                {t('LABEL.AGE_FROM')}
              </Typography>
              <Typography variant="body2" color="info.dark">
                {course?.age_from || '-'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Typography variant="body1" color="primary" fontWeight={700}>
                {t('LABEL.NUMBER_OF_SEATS')}
              </Typography>
              <Typography variant="body2" color="info.dark">
                {course?.number_of_users || 0}
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
                  ? course?.field?.name_ar || '-'
                  : course?.field?.name_en || '-'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Typography variant="body1" color="primary" fontWeight={700}>
                {t('LABEL.END_IN')}
              </Typography>
              <Typography variant="body2" color="info.dark">
                {course?.end_date ? fDate(course.end_date, 'yyyy-MM-dd') : '-'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Typography variant="body1" color="primary" fontWeight={700}>
                {t('LABEL.TO_HOURE')}
              </Typography>
              <Typography variant="body2" color="info.dark">
                {(() => {
                  const v = course?.end_time as string | undefined;
                  if (!v) return '-';
                  return /am|pm/i.test(v) ? v : convertTime24to12(v);
                })()}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Typography variant="body1" color="primary" fontWeight={700}>
                {t('LABEL.TOTAL_RATE')}
              </Typography>
              <Typography variant="body2" color="info.dark">
                {course?.average_rate ? String(course.average_rate).slice(0, 3) : '-'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Typography variant="body1" color="primary" fontWeight={700}>
                {t('LABEL.AGE_TO')}
              </Typography>
              <Typography variant="body2" color="info.dark">
                {course?.age_to || '-'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Typography variant="body1" color="primary" fontWeight={700}>
                {t('LABEL.NUMBER_OF_REMAINING_SEATS')}
              </Typography>
              <Typography variant="body2" color="info.dark">
                {course?.seats || 0}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Card>
    </Container>
  );
}
