'use client';

import { useEffect, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { useRouter } from 'next/navigation';

import i18n from 'src/locales/i18n';
import { useTranslate } from 'src/locales';
import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';

import AdditionalDetailsSection from './components/additional-details-section';
import BookingModelTabsReadonly from './components/booking-model-tabs-readonly';
import DetailField from './components/detail-field';
import DetailSectionCard from './components/detail-section-card';
import DiscountDetailsSection from './components/discount-details-section';
import FlexiblePackagesTable from './components/flexible-packages-table';
import FlexibleSlotDetailCard from './components/flexible-slot-detail-card';
import ProgramDetailHeader from './components/program-detail-header';
import ProgramPicturesGallery from './components/program-pictures-gallery';
import {
  detailGridSx,
  detailSubsectionTitleSx,
  freeTrialBadgeSx,
  questionsSubsectionTitleSx,
} from './styles';
import {
  formatDaysOff,
  getEnabledFlexibleModels,
  getFirstModelWithData,
  getPackagesForModel,
  getSlotsForModel,
  isFreeTrialOnlyProgram,
  modelHasDataOnCourse,
} from './flexible-utils';
import { formatProgramDate, getCourseImageUrls, getLocalizedText } from './utils';
import type { FlexibleBookingModelKey } from 'src/sections/main/centers/add-program/types';

type Props = {
  course: any;
};

export default function FlexibleProgramDetailsView({ course }: Props) {
  const settings = useSettingsContext();
  const router = useRouter();
  const { t } = useTranslate();
  const isArabic = i18n.language === 'ar';
  const courseId = String(course?.id ?? course?._id ?? '');

  const isFreeTrial = useMemo(() => isFreeTrialOnlyProgram(course), [course]);
  const filledModels = useMemo(() => getEnabledFlexibleModels(course), [course]);
  const [activeModel, setActiveModel] = useState<FlexibleBookingModelKey>(() =>
    getFirstModelWithData(course)
  );

  useEffect(() => {
    if (isFreeTrial) {
      setActiveModel('trial');
      return;
    }

    if (!modelHasDataOnCourse(course, activeModel)) {
      setActiveModel(getFirstModelWithData(course));
    }
  }, [course, activeModel, isFreeTrial]);

  const images = getCourseImageUrls(course?.course_images);
  const sessionModel: FlexibleBookingModelKey = isFreeTrial ? 'trial' : activeModel;
  const packages = isFreeTrial ? [] : getPackagesForModel(course, activeModel);
  const slots = getSlotsForModel(course, sessionModel);

  const questions = (course?.additional_questions || []).filter(
    (item: any) => item?.question_ar?.trim() || item?.question_en?.trim()
  );
  const materials = (course?.addOnMaterials || []).filter(
    (item: any) =>
      item?.name_ar?.trim() ||
      item?.name_en?.trim() ||
      item?.desc_ar?.trim() ||
      item?.desc_en?.trim() ||
      item?.price
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'} sx={{ py: { xs: 2, md: 3 } }}>
      <ProgramDetailHeader
        onEdit={
          courseId
            ? () => {
                router.push(paths.dashboard.courseEdit(courseId));
              }
            : undefined
        }
      />

      <DetailSectionCard title={t('PROGRAM_DETAILS.PROGRAM_SECTION')}>
        <ProgramPicturesGallery
          images={images}
          title={t('ADD_PROGRAM.PROGRAM_PICTURES')}
        />

        <Box sx={detailGridSx}>
          <DetailField
            label={t('PROGRAM_DETAILS.PROGRAM_NAME_AR')}
            value={course?.name_ar?.trim() || '-'}
          />
          <DetailField
            label={t('PROGRAM_DETAILS.PROGRAM_NAME_EN')}
            value={course?.name_en?.trim() || '-'}
          />
          <DetailField label={t('LABEL.START_DATE')} value={formatProgramDate(course?.start_date)} />
          <DetailField label={t('LABEL.END_DATE')} value={formatProgramDate(course?.end_date)} />
          <DetailField
            label={t('ADD_PROGRAM.DAYS_OFF')}
            value={formatDaysOff(course, t)}
          />
          <DetailField
            label={t('LABEL.CATEGORY')}
            value={getLocalizedText(
              isArabic,
              course?.field?.name_ar,
              course?.field?.name_en || course?.field?.name
            )}
          />
          <DetailField
            label={t('PROGRAM_DETAILS.PROGRAM_DESCRIPTION_AR')}
            fullWidth
            value={(course?.description_ar || course?.desc_ar)?.trim() || '-'}
          />
          <DetailField
            label={t('PROGRAM_DETAILS.PROGRAM_DESCRIPTION_EN')}
            fullWidth
            value={(course?.description_en || course?.desc_en)?.trim() || '-'}
          />
        </Box>
      </DetailSectionCard>

      <DetailSectionCard title={t('PROGRAM_DETAILS.SESSION_SECTION')}>
        {isFreeTrial ? (
          <Box sx={freeTrialBadgeSx}>{t('ADD_PROGRAM.FREE')}</Box>
        ) : (
          <BookingModelTabsReadonly
            activeModel={activeModel}
            filledModels={filledModels}
            onChange={setActiveModel}
          />
        )}

        {modelHasDataOnCourse(course, sessionModel) ? (
          <>
            {packages.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  sx={isFreeTrial ? detailSubsectionTitleSx : questionsSubsectionTitleSx}
                >
                  {t('PROGRAM_DETAILS.PACKAGES')}
                </Typography>
                <FlexiblePackagesTable packages={packages} isArabic={isArabic} course={course} />
              </Box>
            )}

            {slots.length > 0 && (
              <Box>
                <Typography
                  sx={isFreeTrial ? detailSubsectionTitleSx : questionsSubsectionTitleSx}
                >
                  {t('PROGRAM_DETAILS.SLOTS')}
                </Typography>
                {slots.map((slot: any, index: number) => (
                  <FlexibleSlotDetailCard
                    key={index}
                    modelKey={sessionModel}
                    slot={slot}
                    index={index}
                    isArabic={isArabic}
                    variant={isFreeTrial ? 'trial' : 'default'}
                    course={course}
                  />
                ))}
              </Box>
            )}
          </>
        ) : (
          <Typography sx={{ color: '#767676', fontSize: 14 }}>
            {t('PROGRAM_DETAILS.NO_MODEL_DATA')}
          </Typography>
        )}
      </DetailSectionCard>

      <AdditionalDetailsSection
        questions={questions}
        materials={materials}
        isArabic={isArabic}
        hideMaterials={isFreeTrial}
      />

      {!isFreeTrial ? <DiscountDetailsSection course={course} isArabic={isArabic} /> : null}
    </Container>
  );
}
